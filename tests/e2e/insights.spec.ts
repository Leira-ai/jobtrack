import { expect, test } from "@playwright/test";
import { authenticate } from "../support/auth";

test.beforeEach(async ({ context, page }) => {
  await authenticate(context);
  await page.addInitScript(() => window.localStorage.clear());
});

test("calendar exposes the selected interview and supports month navigation", async ({
  page,
}) => {
  await page.goto("/dashboard/kalender");
  await expect(
    page.getByRole("heading", { level: 1, name: "Kalender" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Kamis, 10 September/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Nusantara Labs technical interview",
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Bulan berikutnya" }).click();
  await expect(
    page.getByRole("heading", { name: /Oktober 2026/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hari ini" }).click();
  await expect(
    page.getByRole("heading", { name: /September 2026/i }),
  ).toBeVisible();
});

test("sample CV analysis produces an explainable score", async ({ page }) => {
  await page.goto("/dashboard/analisis-cv");
  await expect(page.getByLabel("Isi CV")).toBeEmpty();
  await expect(page.getByLabel("Deskripsi pekerjaan")).toBeEmpty();
  await page.getByRole("button", { name: "Gunakan contoh fiktif" }).click();
  await expect(page.getByLabel("Isi CV")).toContainText("Frontend Engineer");
  await expect(page.getByLabel("Deskripsi pekerjaan")).toContainText(
    "Frontend Engineer",
  );
  await expect(
    page.getByRole("button", { name: "Analisis sekarang" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Analisis sekarang" }).click();

  await expect(page.getByText("Skor kecocokan CV")).toBeVisible();
  await expect(page.getByLabel(/Skor \d+ dari 100/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Rincian skor" }),
  ).toBeVisible();
  await expect(page.getByText("Kecocokan keahlian")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Istilah cocok" }),
  ).toBeVisible();
});

test("statistics filters update the visible metrics", async ({ page }) => {
  await page.goto("/dashboard/statistik");
  const sentCard = page
    .getByText("Lamaran dikirim", { exact: true })
    .locator("..");
  await expect(sentCard).toContainText("23");

  await page.getByLabel("Sumber").selectOption({ label: "Referral" });
  await expect(sentCard).toContainText("4");
  await expect(
    page.locator("span").filter({ hasText: /^Referral$/ }),
  ).toBeVisible();
  await page.getByLabel("Periode").selectOption("3");
  await expect(page.getByLabel("Periode")).toHaveValue("3");
});
