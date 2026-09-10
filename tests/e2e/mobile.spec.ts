import { expect, test } from "@playwright/test";
import { authenticate } from "../support/auth";

test("375px landing-to-dashboard navigation remains usable", async ({
  context,
  page,
}) => {
  await authenticate(context);
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: /Kelola setiap peluang/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Buka menu" }).click();
  const mobileNav = page.getByRole("navigation", { name: "Navigasi seluler" });
  await expect(mobileNav).toBeVisible();
  await mobileNav.getByRole("link", { name: "Fitur" }).click();
  await expect(page).toHaveURL(/#fitur$/);

  await page.getByRole("link", { name: "Lihat demo langsung" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: /Selamat datang kembali/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Buka navigasi" }).click();
  const dashboardNav = page.getByRole("navigation", { name: "Navigasi utama" });
  await expect(dashboardNav).toBeVisible();
  await dashboardNav.getByRole("link", { name: "Tugas" }).click();

  await expect(page).toHaveURL(/\/dashboard\/tugas$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Tugas" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Tugas baru" })).toBeVisible();
});
