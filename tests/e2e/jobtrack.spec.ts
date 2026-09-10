import { expect, test, type Page } from "@playwright/test";
import { authenticate } from "../support/auth";

const application = {
  company: "Cakrawala Digital",
  role: "Accessibility Engineer",
  location: "Bandung",
  source: "Referral",
};

async function resetDemoData(page: Page) {
  await page.goto("/dashboard/lamaran");
  await page.getByRole("button", { name: "Pulihkan demo" }).click();
  await expect(
    page.getByRole("region", { name: "Ringkasan lamaran" }),
  ).toContainText("17");
}

test.beforeEach(async ({ context }) => {
  await authenticate(context);
});

test("landing demo opens the dashboard workspace", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Kelola setiap peluang/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Lihat demo langsung" }).click();

  await expect(page).toHaveURL(/\/dashboard\?demo=true$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Selamat datang kembali/ }),
  ).toBeVisible();
  await expect(page.getByText("Mode demo", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navigasi utama" }),
  ).toBeVisible();
});

test("creates an application, moves it accessibly, and verifies its detail timeline", async ({
  page,
}) => {
  await resetDemoData(page);
  await page.getByRole("button", { name: "Tambah lamaran" }).click();

  const dialog = page.getByRole("dialog", { name: "Tambah lamaran" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel(/Perusahaan/).fill(application.company);
  await dialog.getByLabel(/Posisi/).fill(application.role);
  await dialog.getByLabel(/Lokasi/).fill(application.location);
  await dialog.getByLabel(/Sumber/).fill(application.source);
  await dialog.getByLabel("Status").selectOption("applied");
  await dialog.getByLabel("Sistem kerja").selectOption("remote");
  await dialog
    .getByRole("button", { name: "Tambah lamaran", exact: true })
    .click();

  await expect(page.getByText("Lamaran ditambahkan")).toBeVisible();
  await page.getByRole("button", { name: "Tabel" }).click();
  const row = page.getByRole("row").filter({ hasText: application.company });
  await expect(row).toContainText(application.role);

  const status = row.getByRole("combobox", {
    name: `Pindahkan ${application.role} ke status`,
  });
  await status.selectOption("interview");
  await expect(page.getByText("Dipindahkan ke Interview")).toBeVisible();
  await expect(status).toHaveValue("interview");

  const detailLink = row.getByRole("link", { name: application.role });
  const detailUrl = await detailLink.getAttribute("href");
  expect(detailUrl).toMatch(/^\/dashboard\/lamaran\/app-/);
  await page.goto(detailUrl!);
  await expect(page).toHaveURL(/\/dashboard\/lamaran\/app-/);
  await expect(
    page.getByRole("heading", { level: 1, name: application.role }),
  ).toBeVisible();
  await expect(page.getByLabel("Perbarui status")).toHaveValue("interview");
  const timeline = page
    .getByRole("heading", { name: "Riwayat status" })
    .locator("..");
  await expect(timeline).toContainText("Dilamar → Interview");
  await expect(timeline).toContainText("Dipindahkan dari papan lamaran");
});

test("creates and completes a task", async ({ page }) => {
  await page.goto("/dashboard/tugas?demo=true");
  await page.getByRole("button", { name: "Tugas baru" }).click();

  await expect(
    page.getByRole("heading", { name: "Buat tugas baru" }),
  ).toBeVisible();
  await page.getByLabel("Judul tugas").fill("Kirim portofolio aksesibilitas");
  await page.getByLabel("Prioritas").selectOption("high");
  await page.getByRole("textbox", { name: "Tenggat" }).fill("2026-09-20");
  await page.getByRole("button", { name: "Simpan tugas" }).click();

  await expect(page.getByRole("status")).toContainText(
    "Tugas baru ditambahkan",
  );
  const task = page
    .getByRole("article")
    .filter({ hasText: "Kirim portofolio aksesibilitas" });
  await expect(task).toContainText("Tinggi");
  await task
    .getByRole("button", { name: "Selesaikan Kirim portofolio aksesibilitas" })
    .click();
  await expect(page.getByRole("status")).toContainText("Tugas diselesaikan");
  await expect(task.getByText("Kirim portofolio aksesibilitas")).toHaveClass(
    /line-through/,
  );
});

test("creates a calendar event and exports the current demo calendar", async ({
  page,
}) => {
  await page.goto("/dashboard/kalender?demo=true");
  await page.getByRole("button", { name: "Agenda baru" }).click();
  const form = page.getByRole("form", { name: "Buat agenda baru" });
  await form.getByLabel("Judul agenda").fill("Wawancara produk");
  await form.getByLabel("Jenis").selectOption("interview");
  await form.getByLabel("Tanggal").fill("2026-09-21");
  await form.getByRole("textbox", { name: "Mulai" }).fill("09:00");
  await form.getByRole("textbox", { name: "Selesai" }).fill("10:00");
  await form.getByLabel("Lokasi").fill("Google Meet");
  await form.getByRole("button", { name: "Simpan agenda" }).click();
  await expect(page.getByRole("status")).toContainText("Agenda ditambahkan");
  await page.getByRole("button", { name: /21 Wawancara produk/ }).click();
  await expect(
    page.getByRole("heading", { name: "Wawancara produk" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Google Calendar/ }),
  ).toHaveAttribute("href", /calendar\.google\.com/);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unduh .ics" }).click();
  await expect((await download).suggestedFilename()).toBe(
    "jobtrack-agenda.ics",
  );
});
