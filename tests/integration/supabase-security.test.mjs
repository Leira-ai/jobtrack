import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const authOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};
const emails = {
  a: "jobtrack-integration-a@example.invalid",
  b: "jobtrack-integration-b@example.invalid",
};
const password = "Local-only-integration-2026";

function localEnvironment() {
  const output = execFileSync(
    process.platform === "win32" ? "supabase.exe" : "supabase",
    ["status", "--workdir", root, "--output", "env"],
    { encoding: "utf8" },
  );
  const values = {};
  for (const line of output.split(/\r?\n/)) {
    const match = /^([A-Z_]+)="(.*)"$/.exec(line);
    if (match) values[match[1]] = match[2];
  }
  for (const key of ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY"]) {
    assert.ok(values[key], `supabase status did not return ${key}`);
  }
  const hostname = new URL(values.API_URL).hostname;
  assert.ok(
    hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1",
    `integration tests refuse non-local Supabase URL: ${values.API_URL}`,
  );
  return values;
}

function client(url, key) {
  return createClient(url, key, authOptions);
}

async function removePriorUsers(admin) {
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  assert.ifError(error);
  for (const user of data.users.filter((entry) =>
    Object.values(emails).includes(entry.email),
  )) {
    const result = await admin.auth.admin.deleteUser(user.id);
    assert.ifError(result.error);
  }
}

async function createUser(admin, apiUrl, anonKey, email, label) {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: label },
  });
  assert.ifError(created.error);
  const userClient = client(apiUrl, anonKey);
  const signedIn = await userClient.auth.signInWithPassword({
    email,
    password,
  });
  assert.ifError(signedIn.error);
  assert.equal(signedIn.data.user.id, created.data.user.id);
  return { client: userClient, id: created.data.user.id };
}

async function insertRow(db, table, values) {
  const result = await db.from(table).insert(values).select().single();
  assert.ifError(result.error);
  return result.data;
}

async function expectHidden(db, table, id) {
  const result = await db.from(table).select("*").eq("id", id);
  assert.ifError(result.error);
  assert.equal(result.data.length, 0, `${table} exposed another owner's row`);
}

async function expectBlocked(
  promise,
  messagePattern = /row-level security|foreign key|violates/i,
) {
  const result = await promise;
  assert.ok(result.error, "operation unexpectedly succeeded");
  assert.match(result.error.message, messagePattern);
}

async function expectNoRows(promise, label) {
  const result = await promise;
  assert.ifError(result.error);
  assert.equal(result.data.length, 0, `${label} affected another owner's row`);
}

async function createOwnedGraph(db, userId, marker) {
  const company = await insertRow(db, "companies", {
    name: `${marker} Company`,
    notes: "created",
  });
  const application = await insertRow(db, "applications", {
    company_id: company.id,
    role_title: `${marker} Engineer`,
  });
  const contact = await insertRow(db, "contacts", {
    application_id: application.id,
    name: `${marker} Contact`,
  });
  const interview = await insertRow(db, "interviews", {
    application_id: application.id,
    starts_at: "2030-01-02T09:00:00.000Z",
    ends_at: "2030-01-02T10:00:00.000Z",
  });
  const event = await insertRow(db, "calendar_events", {
    application_id: application.id,
    title: `${marker} Event`,
    starts_at: "2030-01-03T09:00:00.000Z",
    ends_at: "2030-01-03T10:00:00.000Z",
  });
  const task = await insertRow(db, "tasks", {
    application_id: application.id,
    title: `${marker} Task`,
  });
  const storagePath = `${userId}/${randomUUID()}/${marker.toLowerCase()}.pdf`;
  const document = await insertRow(db, "documents", {
    application_id: application.id,
    name: `${marker} Resume`,
    file_name: `${marker.toLowerCase()}.pdf`,
    storage_path: storagePath,
    mime_type: "application/pdf",
    size_bytes: 5,
  });
  const link = await insertRow(db, "document_applications", {
    document_id: document.id,
    application_id: application.id,
  });
  const activity = await insertRow(db, "activities", {
    application_id: application.id,
    contact_id: contact.id,
    interview_id: interview.id,
    title: `${marker} Activity`,
  });
  const reminder = await insertRow(db, "reminders", {
    event_id: event.id,
    remind_at: "2030-01-03T08:00:00.000Z",
  });
  return {
    company,
    application,
    contact,
    interview,
    event,
    task,
    document,
    link,
    activity,
    reminder,
  };
}

test(
  "local RLS and private Storage isolate two authenticated owners",
  { timeout: 120_000 },
  async () => {
    const env = localEnvironment();
    const admin = client(env.API_URL, env.SERVICE_ROLE_KEY);
    await removePriorUsers(admin);
    const a = await createUser(
      admin,
      env.API_URL,
      env.ANON_KEY,
      emails.a,
      "Integration A",
    );
    const b = await createUser(
      admin,
      env.API_URL,
      env.ANON_KEY,
      emails.b,
      "Integration B",
    );
    const pathsToClean = [];

    try {
      const profileA = await a.client.from("profiles").select("*").single();
      assert.ifError(profileA.error);
      assert.equal(profileA.data.id, a.id);
      const profileBHidden = await a.client
        .from("profiles")
        .select("*")
        .eq("id", b.id);
      assert.ifError(profileBHidden.error);
      assert.equal(profileBHidden.data.length, 0);
      const profileUpdated = await a.client
        .from("profiles")
        .update({ display_name: "Integration A Updated" })
        .eq("id", a.id)
        .select()
        .single();
      assert.ifError(profileUpdated.error);
      await expectNoRows(
        a.client
          .from("profiles")
          .update({ display_name: "stolen" })
          .eq("id", b.id)
          .select(),
        "profiles update",
      );
      await expectBlocked(
        a.client.from("profiles").update({ id: b.id }).eq("id", a.id),
        /row-level security|duplicate key|foreign key/i,
      );

      const rowsA = await createOwnedGraph(a.client, a.id, "A");
      const rowsB = await createOwnedGraph(b.client, b.id, "B");
      const tables = [
        ["companies", "company", { notes: "updated" }],
        ["applications", "application", { notes: "updated" }],
        ["contacts", "contact", { notes: "updated" }],
        ["interviews", "interview", { notes: "updated" }],
        ["calendar_events", "event", { description: "updated" }],
        ["tasks", "task", { description: "updated" }],
        ["documents", "document", { extracted_text: "updated" }],
        ["activities", "activity", { body: "updated" }],
        ["reminders", "reminder", { read_at: "2030-01-03T08:30:00.000Z" }],
      ];

      for (const [table, key, ownChanges] of tables) {
        await expectHidden(a.client, table, rowsB[key].id);
        const own = await a.client
          .from(table)
          .select("id")
          .eq("id", rowsA[key].id)
          .single();
        assert.ifError(own.error);
        const updated = await a.client
          .from(table)
          .update(ownChanges)
          .eq("id", rowsA[key].id)
          .select("id")
          .single();
        assert.ifError(updated.error);
        await expectNoRows(
          a.client
            .from(table)
            .update({ user_id: a.id })
            .eq("id", rowsB[key].id)
            .select(),
          `${table} update`,
        );
        await expectNoRows(
          a.client.from(table).delete().eq("id", rowsB[key].id).select(),
          `${table} delete`,
        );
        await expectBlocked(
          a.client
            .from(table)
            .update({ user_id: b.id })
            .eq("id", rowsA[key].id),
        );
      }

      const ownLink = await a.client
        .from("document_applications")
        .select("*")
        .eq("document_id", rowsA.document.id)
        .single();
      assert.ifError(ownLink.error);
      const otherLink = await a.client
        .from("document_applications")
        .select("*")
        .eq("document_id", rowsB.document.id);
      assert.ifError(otherLink.error);
      assert.equal(otherLink.data.length, 0);
      await expectNoRows(
        a.client
          .from("document_applications")
          .delete()
          .eq("document_id", rowsB.document.id)
          .select(),
        "document_applications delete",
      );

      const crossParentInserts = [
        a.client.from("applications").insert({
          company_id: rowsB.company.id,
          role_title: "Cross company",
        }),
        a.client.from("contacts").insert({
          application_id: rowsB.application.id,
          name: "Cross contact",
        }),
        a.client.from("interviews").insert({
          application_id: rowsB.application.id,
          starts_at: "2030-02-01T09:00:00Z",
        }),
        a.client.from("calendar_events").insert({
          application_id: rowsB.application.id,
          title: "Cross event",
          starts_at: "2030-02-01T09:00:00Z",
          ends_at: "2030-02-01T10:00:00Z",
        }),
        a.client.from("tasks").insert({
          application_id: rowsB.application.id,
          title: "Cross task",
        }),
        a.client.from("documents").insert({
          application_id: rowsB.application.id,
          name: "Cross document",
          file_name: "cross.pdf",
          storage_path: `${a.id}/${randomUUID()}/cross.pdf`,
        }),
        a.client.from("activities").insert({
          application_id: rowsB.application.id,
          title: "Cross activity",
        }),
        a.client.from("reminders").insert({
          event_id: rowsB.event.id,
          remind_at: "2030-02-01T08:00:00Z",
        }),
        a.client.from("document_applications").insert({
          document_id: rowsA.document.id,
          application_id: rowsB.application.id,
        }),
        a.client.from("document_applications").insert({
          document_id: rowsB.document.id,
          application_id: rowsA.application.id,
        }),
      ];
      for (const insert of crossParentInserts) await expectBlocked(insert);

      const historyA = await a.client
        .from("application_status_history")
        .select("*")
        .eq("application_id", rowsA.application.id);
      assert.ifError(historyA.error);
      assert.equal(historyA.data.length, 1);
      const historyB = await a.client
        .from("application_status_history")
        .select("*")
        .eq("application_id", rowsB.application.id);
      assert.ifError(historyB.error);
      assert.equal(historyB.data.length, 0);

      await expectBlocked(
        a.client.from("application_status_history").insert({
          user_id: a.id,
          application_id: rowsA.application.id,
          to_status: "applied",
        }),
      );
      await expectNoRows(
        a.client
          .from("application_status_history")
          .update({ note: "tampered" })
          .eq("id", historyA.data[0].id)
          .select(),
        "history update",
      );
      await expectNoRows(
        a.client
          .from("application_status_history")
          .delete()
          .eq("id", historyA.data[0].id)
          .select(),
        "history delete",
      );

      const statusChanged = await a.client.rpc("change_application_status", {
        application_id: rowsA.application.id,
        new_status: "interview",
        change_note: "owner transition",
      });
      assert.ifError(statusChanged.error);
      assert.equal(statusChanged.data.status, "interview");
      const transition = await a.client
        .from("application_status_history")
        .select("from_status,to_status,note")
        .eq("application_id", rowsA.application.id)
        .eq("to_status", "interview")
        .single();
      assert.ifError(transition.error);
      assert.deepEqual(transition.data, {
        from_status: "saved",
        to_status: "interview",
        note: "owner transition",
      });
      await expectBlocked(
        a.client.rpc("change_application_status", {
          application_id: rowsB.application.id,
          new_status: "offer",
          change_note: "cross-owner",
        }),
        /not found|access denied/i,
      );

      const archived = await a.client.rpc("set_application_archived", {
        application_id: rowsA.application.id,
        archived: true,
      });
      assert.ifError(archived.error);
      assert.ok(archived.data.archived_at);
      await expectBlocked(
        a.client.rpc("set_application_archived", {
          application_id: rowsB.application.id,
          archived: true,
        }),
        /not found|access denied/i,
      );

      const storageA = `${a.id}/${randomUUID()}/private.pdf`;
      const storageB = `${b.id}/${randomUUID()}/private.pdf`;
      pathsToClean.push([a.client, storageA], [b.client, storageB]);
      const uploadedA = await a.client.storage
        .from("documents")
        .upload(storageA, new Blob(["A-data"], { type: "application/pdf" }));
      assert.ifError(uploadedA.error);
      const uploadedB = await b.client.storage
        .from("documents")
        .upload(storageB, new Blob(["B-data"], { type: "application/pdf" }));
      assert.ifError(uploadedB.error);

      const ownList = await a.client.storage
        .from("documents")
        .list(storageA.slice(0, storageA.lastIndexOf("/")), {
          search: "private.pdf",
        });
      assert.ifError(ownList.error);
      assert.equal(ownList.data.length, 1);
      const crossList = await a.client.storage.from("documents").list(b.id);
      assert.ifError(crossList.error);
      assert.equal(crossList.data.length, 0);
      const ownDownload = await a.client.storage
        .from("documents")
        .download(storageA);
      assert.ifError(ownDownload.error);
      assert.equal(await ownDownload.data.text(), "A-data");
      const crossDownload = await a.client.storage
        .from("documents")
        .download(storageB);
      assert.ok(crossDownload.error);
      const signed = await a.client.storage
        .from("documents")
        .createSignedUrl(storageA, 60);
      assert.ifError(signed.error);
      const signedResponse = await fetch(signed.data.signedUrl);
      assert.equal(signedResponse.status, 200);
      assert.equal(await signedResponse.text(), "A-data");
      const crossSigned = await a.client.storage
        .from("documents")
        .createSignedUrl(storageB, 60);
      assert.ok(crossSigned.error);

      const updatedObject = await a.client.storage
        .from("documents")
        .update(storageA, new Blob(["A-new"], { type: "application/pdf" }), {
          upsert: true,
        });
      assert.ifError(updatedObject.error);
      const updatedDownload = await a.client.storage
        .from("documents")
        .download(storageA);
      assert.ifError(updatedDownload.error);
      assert.equal(await updatedDownload.data.text(), "A-new");
      const crossUpdate = await a.client.storage
        .from("documents")
        .update(storageB, new Blob(["stolen"], { type: "application/pdf" }), {
          upsert: true,
        });
      assert.ok(crossUpdate.error);
      const crossRemove = await a.client.storage
        .from("documents")
        .remove([storageB]);
      assert.ifError(crossRemove.error);
      assert.equal(crossRemove.data.length, 0);
      const bStillDownloads = await b.client.storage
        .from("documents")
        .download(storageB);
      assert.ifError(bStillDownloads.error);
      assert.equal(await bStillDownloads.data.text(), "B-data");

      const wrongPrefix = await a.client.storage
        .from("documents")
        .upload(
          `${b.id}/${randomUUID()}/denied.pdf`,
          new Blob(["denied"], { type: "application/pdf" }),
        );
      assert.ok(wrongPrefix.error);
      const invalidMime = await a.client.storage
        .from("documents")
        .upload(
          `${a.id}/${randomUUID()}/denied.png`,
          new Blob(["png"], { type: "image/png" }),
        );
      assert.ok(invalidMime.error);
      assert.match(invalidMime.error.message, /mime|type|allowed/i);
      const oversized = await a.client.storage.from("documents").upload(
        `${a.id}/${randomUUID()}/too-large.pdf`,
        new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], {
          type: "application/pdf",
        }),
      );
      assert.ok(oversized.error);
      assert.match(oversized.error.message, /size|large|limit/i);

      const removedA = await a.client.storage
        .from("documents")
        .remove([storageA]);
      assert.ifError(removedA.error);
      pathsToClean.splice(
        pathsToClean.findIndex(([, value]) => value === storageA),
        1,
      );
      const removedDocumentLink = await a.client
        .from("document_applications")
        .delete()
        .eq("document_id", rowsA.document.id)
        .select();
      assert.ifError(removedDocumentLink.error);
      assert.equal(removedDocumentLink.data.length, 1);
      const deletedCompany = await a.client
        .from("companies")
        .delete()
        .eq("id", rowsA.company.id)
        .select();
      assert.ifError(deletedCompany.error);
      assert.equal(deletedCompany.data.length, 1);
      const companyGone = await a.client
        .from("companies")
        .select("id")
        .eq("id", rowsA.company.id);
      assert.ifError(companyGone.error);
      assert.equal(companyGone.data.length, 0);
    } finally {
      for (const [owner, objectPath] of pathsToClean) {
        await owner.storage.from("documents").remove([objectPath]);
      }
      await a.client.auth.signOut();
      await b.client.auth.signOut();
      await removePriorUsers(admin);
    }
  },
);
