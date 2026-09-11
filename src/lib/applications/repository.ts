import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type {
  ApplicationPatch,
  ApplicationStatus,
  JobApplication,
  NewApplication,
} from "@/types";
import {
  mapApplicationRecord,
  toApplicationInsert,
  toApplicationUpdate,
  type ApplicationRecord,
} from "./mapper";

export type ApplicationsSupabase = SupabaseClient<Database>;

const applicationSelect = `
  *,
  companies ( name ),
  application_status_history ( * ),
  activities ( * )
`;

const message = (error: { readonly message: string } | null): string =>
  error?.message ?? "Operasi lamaran gagal";

export class ApplicationsRepository {
  constructor(private readonly supabase: ApplicationsSupabase) {}

  async list(): Promise<readonly JobApplication[]> {
    const { data, error } = await this.supabase
      .from("applications")
      .select(applicationSelect)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(message(error));
    return ((data ?? []) as unknown as ApplicationRecord[]).map(
      mapApplicationRecord,
    );
  }

  async create(input: NewApplication): Promise<JobApplication> {
    const companyId = await this.findOrCreateCompany(input.company);
    const { data, error } = await this.supabase
      .from("applications")
      .insert(toApplicationInsert(input, companyId))
      .select("id")
      .single();
    if (error || !data) throw new Error(message(error));
    return this.getById(data.id);
  }

  async update(id: string, patch: ApplicationPatch): Promise<JobApplication> {
    const companyId = patch.company
      ? await this.findOrCreateCompany(patch.company)
      : undefined;
    const applicationUpdate = toApplicationUpdate(patch, companyId);
    const hasApplicationUpdate = Object.keys(applicationUpdate).length > 0;
    if (hasApplicationUpdate) {
      const { error } = await this.supabase
        .from("applications")
        .update(applicationUpdate)
        .eq("id", id);
      if (error) throw new Error(message(error));
    }
    if (patch.status) {
      return this.changeStatus(id, patch.status, "Detail lamaran diperbarui");
    }
    return this.getById(id);
  }

  async changeStatus(
    id: string,
    status: ApplicationStatus,
    reason?: string,
  ): Promise<JobApplication> {
    const { error } = await this.supabase.rpc("change_application_status", {
      application_id: id,
      new_status: status,
      change_note: reason ?? null,
    });
    if (error) throw new Error(message(error));
    return this.getById(id);
  }

  async setArchived(id: string, archived: boolean): Promise<JobApplication> {
    const { error } = await this.supabase.rpc("set_application_archived", {
      application_id: id,
      archived,
    });
    if (error) throw new Error(message(error));
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("applications")
      .delete()
      .eq("id", id);
    if (error) throw new Error(message(error));
  }

  async addNote(applicationId: string, content: string): Promise<void> {
    const normalized = this.noteContent(content);
    const { error } = await this.supabase.from("activities").insert({
      application_id: applicationId,
      activity_type: "note",
      title: normalized.slice(0, 200),
      body: normalized,
    });
    if (error) throw new Error(message(error));
  }

  async updateNote(
    applicationId: string,
    noteId: string,
    content: string,
  ): Promise<void> {
    const normalized = this.noteContent(content);
    const { error } = await this.supabase
      .from("activities")
      .update({ title: normalized.slice(0, 200), body: normalized })
      .eq("id", noteId)
      .eq("application_id", applicationId)
      .eq("activity_type", "note");
    if (error) throw new Error(message(error));
  }

  async deleteNote(applicationId: string, noteId: string): Promise<void> {
    const { error } = await this.supabase
      .from("activities")
      .delete()
      .eq("id", noteId)
      .eq("application_id", applicationId)
      .eq("activity_type", "note");
    if (error) throw new Error(message(error));
  }

  private async getById(id: string): Promise<JobApplication> {
    const { data, error } = await this.supabase
      .from("applications")
      .select(applicationSelect)
      .eq("id", id)
      .single();
    if (error || !data) throw new Error(message(error));
    return mapApplicationRecord(data as unknown as ApplicationRecord);
  }

  private async findOrCreateCompany(name: string): Promise<string> {
    const normalized = name.trim();
    const { data: existing, error: findError } = await this.supabase
      .from("companies")
      .select("id")
      .ilike("name", normalized)
      .limit(1)
      .maybeSingle();
    if (findError) throw new Error(message(findError));
    if (existing) return existing.id;

    const { data: created, error: createError } = await this.supabase
      .from("companies")
      .insert({ name: normalized })
      .select("id")
      .single();
    if (createError || !created) {
      const { data: retryExisting } = await this.supabase
        .from("companies")
        .select("id")
        .ilike("name", normalized)
        .limit(1)
        .maybeSingle();
      if (retryExisting) return retryExisting.id;
      throw new Error(message(createError));
    }
    return created.id;
  }

  private noteContent(content: string): string {
    const normalized = content.trim();
    if (!normalized) throw new Error("Catatan tidak boleh kosong");
    return normalized;
  }
}
