// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { NewApplication } from "../../types";
import { ApplicationForm } from "./application-form";

afterEach(cleanup);

describe("ApplicationForm", () => {
  it("exposes accessible validation errors for required fields", async () => {
    const user = userEvent.setup();
    render(
      <ApplicationForm onCancel={() => undefined} onSubmit={() => undefined} />,
    );

    await user.click(screen.getByRole("button", { name: "Tambah lamaran" }));

    expect(await screen.findByText("Nama perusahaan wajib diisi")).toBeTruthy();
    expect(screen.getByText("Posisi wajib diisi")).toBeTruthy();
    expect(screen.getByText("Lokasi wajib diisi")).toBeTruthy();
    expect(screen.getByText("Sumber wajib diisi")).toBeTruthy();
  });

  it("rejects invalid contact and salary values", async () => {
    const user = userEvent.setup();
    render(
      <ApplicationForm onCancel={() => undefined} onSubmit={() => undefined} />,
    );

    await user.type(screen.getByLabelText("Email kontak"), "email-salah");
    await user.type(screen.getByLabelText("Minimum"), "-1");
    await user.type(screen.getByLabelText("Maksimum"), "-2");
    await user.click(screen.getByRole("button", { name: "Tambah lamaran" }));

    expect(
      await screen.findByText("Masukkan alamat email yang valid"),
    ).toBeTruthy();
    expect(screen.getAllByText("Masukkan angka positif")).toHaveLength(2);
  });

  it("submits normalized, typed application data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ApplicationForm onCancel={() => undefined} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Perusahaan/), "Example Labs");
    await user.type(screen.getByLabelText(/Posisi/), "Frontend Engineer");
    await user.type(screen.getByLabelText(/Lokasi/), "Jakarta");
    await user.type(screen.getByLabelText(/Sumber/), "Referensi");
    await user.type(
      screen.getByPlaceholderText("React, Fintech, Senior"),
      "React, TypeScript",
    );
    await user.selectOptions(screen.getByLabelText("Sistem kerja"), "remote");
    await user.click(screen.getByRole("button", { name: "Tambah lamaran" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submitted = onSubmit.mock.calls[0]?.[0] as NewApplication | undefined;
    expect(submitted?.company).toBe("Example Labs");
    expect(submitted?.workMode).toBe("remote");
    expect(submitted?.status).toBe("saved");
    expect(submitted?.tags).toEqual(["React", "TypeScript"]);
  });
});
