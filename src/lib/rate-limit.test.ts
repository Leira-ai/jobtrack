import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, clearRateLimitBuckets } from "./rate-limit";

afterEach(clearRateLimitBuckets);

describe("rate limit", () => {
  it("allows requests up to limit then blocks", () => {
    expect(checkRateLimit("ip", 2).allowed).toBe(true);
    expect(checkRateLimit("ip", 2).allowed).toBe(true);
    expect(checkRateLimit("ip", 2).allowed).toBe(false);
    expect(checkRateLimit("ip", 2).remaining).toBe(0);
  });
});
