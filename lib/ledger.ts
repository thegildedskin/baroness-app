// Royal Ledger — token issuance behind the Kingdom's ledger UI.
// (SPEC_blockchain_token_ledger.) This is the backend seam: a provider
// interface plus a mock *custodial* implementation that mirrors the on-chain
// shape (ERC-721-compatible metadata, silent custodial wallets, per-series mint
// numbers, optimistic tx refs) WITHOUT touching a real chain yet.
//
// To go live, implement `LedgerProvider` against an embedded-wallet provider +
// a low-fee L2 and swap it in `getLedger()`. The UI, the data contract, and the
// courtly copy ("minted into the royal record") stay exactly the same.
//
// Constraints honored here:
//  • users never see seed phrases/gas — wallets are custodial + silent
//  • only cosmetics/provenance are tokenized (gems stay an off-chain balance)
//  • tiers are computed off-chain (see lib/achievements / profile), never on-chain
//  • metadata is ERC-721/1155-standard so external export is possible later

export type MintKind = "court-look" | "livery" | "garment" | "trophy" | "design-provenance";

// The exact per-item shape the ledger UI renders.
export type LedgerRecord = {
  id: string;
  tokenId: string;
  kind: MintKind;
  name: string;
  series: string;
  mintNumber: number;
  totalMinted: number;
  owner: string;        // custodial wallet address (never shown as a seed)
  ownerUserId: string;
  mintedAt: string;     // ISO
  txRef: string;        // chain tx hash (mock here)
  tier: string;         // off-chain Royal tier at mint time
  image?: string;
  metadata: Erc721Metadata;
};

export type Erc721Metadata = {
  name: string;
  description: string;
  image?: string;
  external_url?: string;
  attributes: { trait_type: string; value: string | number }[];
};

export type MintInput = {
  kind: MintKind;
  name: string;
  series: string;
  ownerUserId: string;
  tier?: string;
  image?: string;
  designHash?: string; // for design-provenance mints
  attributes?: { trait_type: string; value: string | number }[];
};

export interface LedgerProvider {
  /** Silently create/fetch the user's custodial wallet address. */
  walletFor(userId: string): Promise<string>;
  mint(input: MintInput): Promise<LedgerRecord>;
  list(ownerUserId?: string): Promise<LedgerRecord[]>;
  get(id: string): Promise<LedgerRecord | null>;
  /** In-app transfer only at launch (external marketplace is a later phase). */
  transfer(id: string, toUserId: string): Promise<LedgerRecord | null>;
}

// ---------------------------------------------------------------------------
// Mock custodial provider (dev / pre-chain). Swap for a real one in getLedger().
// ---------------------------------------------------------------------------
const records = new Map<string, LedgerRecord>();
const seriesCount = new Map<string, number>();

function hex(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}
const deterministicAddress = (userId: string) => {
  // stable pseudo-address per user; a real provider returns the wallet address
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0;
  return "0x" + h.toString(16).padStart(8, "0") + hex(32);
};

const mockProvider: LedgerProvider = {
  async walletFor(userId) {
    return deterministicAddress(userId);
  },

  async mint(input) {
    const n = (seriesCount.get(input.series) || 0) + 1;
    seriesCount.set(input.series, n);
    const owner = await this.walletFor(input.ownerUserId);
    const id = `${input.series}-${n}`;
    const tier = input.tier || "Guest";
    const metadata: Erc721Metadata = {
      name: input.name,
      description: `Minted into the royal record of Baroness Tattoo — ${input.series} No. ${n}.`,
      image: input.image,
      external_url: `https://baronesstattoo.com/kingdom/ledger/${id}`,
      attributes: [
        { trait_type: "Series", value: input.series },
        { trait_type: "Kind", value: input.kind },
        { trait_type: "Mint Number", value: n },
        { trait_type: "Tier at Mint", value: tier },
        ...(input.designHash ? [{ trait_type: "Design Hash", value: input.designHash }] : []),
        ...(input.attributes || []),
      ],
    };
    const rec: LedgerRecord = {
      id,
      tokenId: String(BigInt("0x" + hex(12))),
      kind: input.kind,
      name: input.name,
      series: input.series,
      mintNumber: n,
      totalMinted: n,
      owner,
      ownerUserId: input.ownerUserId,
      mintedAt: new Date().toISOString(),
      txRef: "0x" + hex(64), // optimistic; a real L2 confirms < 5s
      tier,
      image: input.image,
      metadata,
    };
    records.set(id, rec);
    // keep totalMinted in sync across the whole series
    for (const r of records.values()) if (r.series === rec.series) r.totalMinted = n;
    return rec;
  },

  async list(ownerUserId) {
    const all = [...records.values()].sort((a, b) => (a.mintedAt < b.mintedAt ? 1 : -1));
    return ownerUserId ? all.filter((r) => r.ownerUserId === ownerUserId) : all;
  },

  async get(id) {
    return records.get(id) || null;
  },

  async transfer(id, toUserId) {
    const rec = records.get(id);
    if (!rec) return null;
    rec.ownerUserId = toUserId;
    rec.owner = await this.walletFor(toUserId);
    return rec;
  },
};

/** Returns the active ledger provider. Swap the mock for a real chain impl here. */
export function getLedger(): LedgerProvider {
  return mockProvider;
}
