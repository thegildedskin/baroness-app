import { describe, it, expect } from "vitest";
import { getLedger } from "@/lib/ledger";

describe("royal ledger (mock provider)", () => {
  it("mints a record with every UI-contract field + ERC-721 metadata", async () => {
    const rec = await getLedger().mint({ kind: "livery", name: "Gothic Noir", series: "Test Livery", ownerUserId: "u1", tier: "Royal" });
    for (const k of ["name", "series", "mintNumber", "totalMinted", "owner", "ownerUserId", "mintedAt", "txRef", "tier"]) {
      expect(rec).toHaveProperty(k);
    }
    expect(rec.txRef).toMatch(/^0x[0-9a-f]{64}$/);
    expect(rec.metadata.attributes.some((a) => a.trait_type === "Series")).toBe(true);
  });

  it("increments mint numbers within a series and lists by owner", async () => {
    const l = getLedger();
    const a = await l.mint({ kind: "trophy", name: "A", series: "Series X", ownerUserId: "owner-a" });
    const b = await l.mint({ kind: "trophy", name: "B", series: "Series X", ownerUserId: "owner-b" });
    expect(b.mintNumber).toBe(a.mintNumber + 1);
    const mine = await l.list("owner-a");
    expect(mine.every((r) => r.ownerUserId === "owner-a")).toBe(true);
  });

  it("transfers ownership", async () => {
    const l = getLedger();
    const rec = await l.mint({ kind: "garment", name: "Cloak", series: "Series Y", ownerUserId: "seller" });
    const moved = await l.transfer(rec.id, "buyer");
    expect(moved?.ownerUserId).toBe("buyer");
  });
});
