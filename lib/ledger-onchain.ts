// On-chain Royal Ledger — the integration seam for real token issuance.
// (SPEC_blockchain_token_ledger.) This file defines the two vendor-facing
// interfaces and an adapter that turns them into a LedgerProvider, so plugging in
// a real embedded-wallet SDK + low-fee L2 is a drop-in with no UI/API changes.
//
// It is NOT wired in by default — `getLedger()` in lib/ledger.ts returns the mock
// until you implement `WalletVendor` + `ChainClient` against real services and
// return `createOnchainLedger(...)`. Everything below is the contract to fill in.
//
// Constraints (from the spec) baked into the shape:
//   • custodial/embedded wallets — users never see seed phrases or gas
//   • only cosmetics/provenance are tokenized (gems stay off-chain)
//   • tiers are computed off-chain — never passed to the chain
//   • ERC-721/1155-standard metadata so external export stays possible

import type { LedgerProvider, LedgerRecord, MintInput, Erc721Metadata } from "@/lib/ledger";

/** An embedded-wallet provider (e.g. Privy, Web3Auth, Magic, or a managed keystore). */
export interface WalletVendor {
  /** Silently create-or-fetch the user's custodial wallet address. No seed phrase surfaced. */
  walletFor(userId: string): Promise<string>;
}

/** A minimal chain client for a low-fee L2 (mint must cost < $0.01 and confirm < 5s). */
export interface ChainClient {
  /** Upload metadata (e.g. to IPFS/Arweave) and return its tokenURI. */
  storeMetadata(metadata: Erc721Metadata): Promise<string>;
  /** Mint one token of `tokenURI` to `toAddress`. Returns tx hash + on-chain token id. */
  mint(toAddress: string, tokenURI: string): Promise<{ txHash: string; tokenId: string }>;
  /** In-app transfer (external marketplace is a later phase). */
  transfer(tokenId: string, toAddress: string): Promise<{ txHash: string }>;
}

/**
 * A persistence port for the ledger rows the UI reads. On-chain events are the
 * source of truth; this mirrors them into a queryable store (a DB table or an
 * indexer) so `list()`/`get()` stay fast. Implement over Supabase, etc.
 */
export interface LedgerStore {
  save(record: LedgerRecord): Promise<void>;
  list(ownerUserId?: string): Promise<LedgerRecord[]>;
  get(id: string): Promise<LedgerRecord | null>;
  nextMintNumber(series: string): Promise<number>;
  setOwner(id: string, ownerUserId: string, ownerAddress: string): Promise<LedgerRecord | null>;
}

/** Builds ERC-721 metadata identical to the mock provider's shape. */
function buildMetadata(input: MintInput, mintNumber: number, tier: string): Erc721Metadata {
  return {
    name: input.name,
    description: `Minted into the royal record of Baroness Tattoo — ${input.series} No. ${mintNumber}.`,
    image: input.image,
    attributes: [
      { trait_type: "Series", value: input.series },
      { trait_type: "Kind", value: input.kind },
      { trait_type: "Mint Number", value: mintNumber },
      { trait_type: "Tier at Mint", value: tier },
      ...(input.designHash ? [{ trait_type: "Design Hash", value: input.designHash }] : []),
      ...(input.attributes || []),
    ],
  };
}

/**
 * Compose a real LedgerProvider from a wallet vendor, a chain client, and a store.
 *
 *   // lib/ledger.ts (when you're ready):
 *   import { createOnchainLedger } from "./ledger-onchain";
 *   export function getLedger() {
 *     if (process.env.LEDGER_PROVIDER === "onchain")
 *       return createOnchainLedger({ wallet, chain, store });
 *     return mockProvider;
 *   }
 */
export function createOnchainLedger(deps: { wallet: WalletVendor; chain: ChainClient; store: LedgerStore }): LedgerProvider {
  const { wallet, chain, store } = deps;
  return {
    walletFor: (userId) => wallet.walletFor(userId),

    async mint(input) {
      const owner = await wallet.walletFor(input.ownerUserId);
      const mintNumber = await store.nextMintNumber(input.series);
      const tier = input.tier || "Guest"; // computed off-chain, recorded as metadata only
      const metadata = buildMetadata(input, mintNumber, tier);
      const tokenURI = await chain.storeMetadata(metadata);
      const { txHash, tokenId } = await chain.mint(owner, tokenURI);
      const record: LedgerRecord = {
        id: `${input.series}-${mintNumber}`,
        tokenId,
        kind: input.kind,
        name: input.name,
        series: input.series,
        mintNumber,
        totalMinted: mintNumber,
        owner,
        ownerUserId: input.ownerUserId,
        mintedAt: new Date().toISOString(),
        txRef: txHash,
        tier,
        image: input.image,
        metadata,
      };
      await store.save(record);
      return record;
    },

    list: (ownerUserId) => store.list(ownerUserId),
    get: (id) => store.get(id),

    async transfer(id, toUserId) {
      const rec = await store.get(id);
      if (!rec) return null;
      const toAddress = await wallet.walletFor(toUserId);
      await chain.transfer(rec.tokenId, toAddress);
      return store.setOwner(id, toUserId, toAddress);
    },
  };
}
