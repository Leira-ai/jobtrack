import { describe, expect, it, vi } from "vitest";
import { withRetry } from "./retry";

describe("withRetry", () => {
  it("retries transient failures with bounded attempts", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValue("ok");
    await expect(
      withRetry(operation, { attempts: 2, delayMs: 0 }),
    ).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
