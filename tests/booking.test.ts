import { describe, it, expect } from "vitest";
import { sanitizeStr, isEmail, createRateLimiter, isBot, clientIp } from "@/lib/booking";

describe("sanitizeStr", () => {
  it("trims and truncates", () => {
    expect(sanitizeStr("  hello  ")).toBe("hello");
    expect(sanitizeStr("a".repeat(300), 200)).toHaveLength(200);
  });
  it("rejects non-strings (injection-shaped payloads become empty)", () => {
    expect(sanitizeStr(42)).toBe("");
    expect(sanitizeStr({ $gt: "" })).toBe("");
    expect(sanitizeStr(null)).toBe("");
    expect(sanitizeStr(undefined)).toBe("");
  });
});

describe("isEmail", () => {
  it("accepts plain addresses, rejects junk", () => {
    expect(isEmail("a@b.co")).toBe(true);
    expect(isEmail("name+tag@sub.domain.io")).toBe(true);
    expect(isEmail("469-246-7217")).toBe(false);
    expect(isEmail("a@b")).toBe(false);
    expect(isEmail("a b@c.com")).toBe(false);
  });
});

describe("createRateLimiter", () => {
  it("allows up to the limit, then blocks, then slides the window", () => {
    let t = 0;
    const limited = createRateLimiter({ limit: 3, windowMs: 1000, now: () => t });
    expect(limited("ip1")).toBe(false);
    expect(limited("ip1")).toBe(false);
    expect(limited("ip1")).toBe(false);
    expect(limited("ip1")).toBe(true);          // 4th within window → blocked
    expect(limited("ip2")).toBe(false);          // other keys unaffected
    t = 1001;                                    // window slides
    expect(limited("ip1")).toBe(false);
  });
  it("evicts everything past maxKeys instead of growing unbounded", () => {
    const limited = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
    limited("a"); limited("b"); limited("c");    // triggers the cap-clear
    expect(limited("a")).toBe(false);            // map was cleared → allowed again
  });
});

describe("honeypot + ip", () => {
  it("flags any filled website field as a bot", () => {
    expect(isBot({ website: "http://spam" })).toBe(true);
    expect(isBot({ website: "  " })).toBe(false);
    expect(isBot({})).toBe(false);
  });
  it("takes the first forwarded-for hop", () => {
    expect(clientIp("1.2.3.4, 10.0.0.1")).toBe("1.2.3.4");
    expect(clientIp(null)).toBe("unknown");
  });
});
