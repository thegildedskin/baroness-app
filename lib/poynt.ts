// GoDaddy Payments / POS (Poynt Cloud API) — SERVER ONLY.
// Auth: self-signed RS256 JWT (application private key) exchanged at /token.
// Docs: https://docs.poynt.com/api-reference/  (base https://services.poynt.net)
// Credentials: POYNT_PRIVATE_KEY env var (PEM) + application/business ids from site_settings.

import { createPrivateKey, createSign, randomUUID } from "node:crypto";

const BASE = "https://services.poynt.net";

export type PoyntConfig = { applicationId: string; businessId: string; privateKeyPem: string };

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function selfSignedJwt(cfg: PoyntConfig): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: cfg.applicationId,
    sub: cfg.applicationId,
    aud: BASE,
    iat: now,
    exp: now + 300,
    jti: randomUUID(),
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const key = createPrivateKey(cfg.privateKeyPem);
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const signature = signer.sign(key);
  return `${signingInput}.${b64url(signature)}`;
}

let cachedToken: { token: string; expires: number } | null = null;

export async function getAccessToken(cfg: PoyntConfig): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now() + 30_000) return cachedToken.token;
  const assertion = selfSignedJwt(cfg);
  const res = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "api-version": "1.2" },
    body: new URLSearchParams({
      grantType: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Poynt token exchange failed (${res.status}). Check application ID and POYNT_PRIVATE_KEY.`);
  const data = (await res.json()) as { accessToken?: string; expiresIn?: number };
  if (!data.accessToken) throw new Error("Poynt token exchange returned no accessToken.");
  cachedToken = { token: data.accessToken, expires: Date.now() + (data.expiresIn ?? 900) * 1000 };
  return cachedToken.token;
}

async function poyntGet<T>(cfg: PoyntConfig, path: string): Promise<T> {
  const token = await getAccessToken(cfg);
  const res = await fetch(`${BASE}${path}`, {
    headers: { authorization: `Bearer ${token}`, "api-version": "1.2" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Poynt ${path} failed (${res.status}).`);
  return (await res.json()) as T;
}

// ---- typed slices of the Poynt payloads (fields we display) ----
export type PoyntOrder = {
  id?: string;
  createdAt?: string;
  amounts?: { netTotal?: number; currency?: string };
  statuses?: { status?: string; fulfillmentStatus?: string };
  items?: { name?: string; quantity?: number }[];
};
export type PoyntTransaction = {
  id?: string;
  createdAt?: string;
  action?: string;
  status?: string;
  amounts?: { transactionAmount?: number; currency?: string };
  fundingSource?: { type?: string };
};
export type PoyntProduct = {
  id?: string; name?: string; price?: { amount?: number; currency?: string }; sku?: string; status?: string;
};
export type PoyntCustomer = {
  id?: number; firstName?: string; lastName?: string;
  emails?: Record<string, { emailAddress?: string }>;
  createdAt?: string;
};

export async function fetchOrders(cfg: PoyntConfig, limit = 25): Promise<PoyntOrder[]> {
  const data = await poyntGet<{ orders?: PoyntOrder[] }>(cfg, `/businesses/${cfg.businessId}/orders?limit=${limit}`);
  return data.orders ?? [];
}
export async function fetchTransactions(cfg: PoyntConfig, limit = 50): Promise<PoyntTransaction[]> {
  const data = await poyntGet<{ transactions?: PoyntTransaction[] }>(cfg, `/businesses/${cfg.businessId}/transactions?limit=${limit}`);
  return data.transactions ?? [];
}
export async function fetchProducts(cfg: PoyntConfig, limit = 100): Promise<PoyntProduct[]> {
  const data = await poyntGet<{ products?: PoyntProduct[] }>(cfg, `/businesses/${cfg.businessId}/products?limit=${limit}`);
  return data.products ?? [];
}
export async function fetchCustomers(cfg: PoyntConfig, limit = 50): Promise<PoyntCustomer[]> {
  const data = await poyntGet<{ customers?: PoyntCustomer[] }>(cfg, `/businesses/${cfg.businessId}/customers?limit=${limit}`);
  return data.customers ?? [];
}
