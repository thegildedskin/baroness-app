"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MktSetting } from "./MarketingTab";

type Order = { id?: string; createdAt?: string; amounts?: { netTotal?: number; currency?: string }; statuses?: { status?: string; fulfillmentStatus?: string }; items?: { name?: string; quantity?: number }[] };
type Txn = { id?: string; createdAt?: string; action?: string; status?: string; amounts?: { transactionAmount?: number }; fundingSource?: { type?: string } };
type Product = { id?: string; name?: string; price?: { amount?: number }; sku?: string; status?: string };
type Customer = { id?: number; firstName?: string; lastName?: string; emails?: Record<string, { emailAddress?: string }>; createdAt?: string };
type Summary = {
  configured: boolean; error?: string;
  orders?: Order[]; transactions?: Txn[]; products?: Product[]; customers?: Customer[];
  dailySales?: { date: string; cents: number }[];
};

const DEEP_LINKS: [string, string][] = [
  ["GoDaddy dashboard", "godaddy_dashboard_url"],
  ["Orders", "godaddy_orders_url"],
  ["Products", "godaddy_products_url"],
  ["Payouts", "godaddy_payouts_url"],
  ["Invoices", "godaddy_invoices_url"],
  ["Marketing", "godaddy_marketing_url"],
];

const usd = (cents?: number) => cents == null ? "—" : `$${(cents / 100).toFixed(2)}`;

export default function CommerceTab({ settings }: { settings: MktSetting[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [appId, setAppId] = useState(settings.find((s) => s.key === "poynt_application_id")?.value ?? "");
  const [bizId, setBizId] = useState(settings.find((s) => s.key === "poynt_business_id")?.value ?? "");
  const [view, setView] = useState<"sales" | "orders" | "products" | "customers">("sales");

  const linkFor = (key: string) => settings.find((s) => s.key === key)?.value || "";

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/commerce/summary");
      setSummary((await res.json()) as Summary);
    } catch {
      setSummary({ configured: false, error: "Could not reach the commerce API." });
    }
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function saveCreds() {
    setStatus("Saving…");
    const { error } = await supabase.from("site_settings").upsert([
      { key: "poynt_application_id", value: appId.trim(), updated_at: new Date().toISOString() },
      { key: "poynt_business_id", value: bizId.trim(), updated_at: new Date().toISOString() },
    ]);
    setStatus(error ? `Error: ${error.message}` : "Saved. Reloading data…");
    if (!error) { router.refresh(); void load(); }
  }

  const totalToday = summary?.dailySales?.[0]?.cents;
  const total14 = (summary?.dailySales ?? []).reduce((a, d) => a + d.cents, 0);
  const maxDay = Math.max(1, ...(summary?.dailySales ?? []).map((d) => d.cents));

  return (
    <div className="hx-stack">
      {/* Deep-link hub */}
      <div className="hx-card">
        <div className="hx-card-title">GoDaddy quick access</div>
        <div className="hx-links">
          {DEEP_LINKS.map(([label, key]) => linkFor(key) ? (
            <a key={key} href={linkFor(key)} target="_blank" rel="noopener noreferrer" className="hx-link">{label} ↗</a>
          ) : null)}
        </div>
      </div>

      {/* Connection */}
      <div className="hx-card">
        <div className="hx-card-title">GoDaddy Payments (Poynt) connection</div>
        <p className="hx-muted">
          Live read-only data from your POS: sales, orders, catalog, customers. Needs three things: your Poynt <strong>application ID</strong> and <strong>business ID</strong> (from the developer center at sso.secureserver.net → Poynt), and the app&rsquo;s <strong>private key</strong> set as the <code>POYNT_PRIVATE_KEY</code> environment variable in Vercel (never stored in the database).
        </p>
        <div className="hx-grid2">
          <label className="hx-field"><span>Application ID</span><input value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="urn:aid:…" /></label>
          <label className="hx-field"><span>Business ID</span><input value={bizId} onChange={(e) => setBizId(e.target.value)} placeholder="uuid" /></label>
        </div>
        <div className="hx-row">
          <button className="hx-btn" onClick={saveCreds}>Save connection</button>
          <button className="hx-btn ghost" onClick={() => void load()}>Refresh data</button>
          {status && <span className="hx-status">{status}</span>}
        </div>
      </div>

      {/* Data */}
      {loading ? (
        <div className="hx-card"><div className="hx-muted">Loading commerce data…</div></div>
      ) : !summary?.configured ? (
        <div className="hx-card"><div className="hx-muted">Not connected yet — the dashboards light up once the connection above is saved and <code>POYNT_PRIVATE_KEY</code> is set in Vercel. The quick-access links work regardless.</div></div>
      ) : summary.error ? (
        <div className="hx-card"><div className="hx-error">Connection error: {summary.error}</div></div>
      ) : (
        <>
          <div className="hx-kpis">
            <div className="hx-kpi"><div className="hx-kpi-label">Today</div><div className="hx-kpi-value">{usd(totalToday)}</div></div>
            <div className="hx-kpi"><div className="hx-kpi-label">Last 14 days</div><div className="hx-kpi-value">{usd(total14)}</div></div>
            <div className="hx-kpi"><div className="hx-kpi-label">Recent orders</div><div className="hx-kpi-value">{summary.orders?.length ?? 0}</div></div>
            <div className="hx-kpi"><div className="hx-kpi-label">Products</div><div className="hx-kpi-value">{summary.products?.length ?? 0}</div></div>
          </div>

          <div className="hx-pills">
            {(["sales", "orders", "products", "customers"] as const).map((v) => (
              <button key={v} className={`hx-pill${view === v ? " on" : ""}`} onClick={() => setView(v)}>{v}</button>
            ))}
          </div>

          {view === "sales" && (
            <div className="hx-card">
              <div className="hx-card-title">Daily sales (captured), last 14 days</div>
              {(summary.dailySales ?? []).length === 0 ? <div className="hx-muted">No recent transactions.</div> : (
                <div className="hx-bars">
                  {(summary.dailySales ?? []).slice().reverse().map((d) => (
                    <div key={d.date} className="hx-barrow">
                      <span className="hx-bardate">{d.date.slice(5)}</span>
                      <span className="hx-bartrack"><span className="hx-barfill" style={{ width: `${Math.round((d.cents / maxDay) * 100)}%` }} /></span>
                      <span className="hx-barval">{usd(d.cents)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === "orders" && (
            <div className="hx-card">
              <div className="hx-card-title">Recent orders</div>
              <table className="hx-table">
                <thead><tr><th>Date</th><th>Items</th><th>Status</th><th>Total</th></tr></thead>
                <tbody>
                  {(summary.orders ?? []).map((o, i) => (
                    <tr key={o.id ?? i}>
                      <td>{o.createdAt?.slice(0, 10) ?? "—"}</td>
                      <td>{(o.items ?? []).map((it) => `${it.quantity ?? 1}× ${it.name ?? "item"}`).join(", ") || "—"}</td>
                      <td>{o.statuses?.status ?? "—"}</td>
                      <td>{usd(o.amounts?.netTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "products" && (
            <div className="hx-card">
              <div className="hx-card-title">Catalog</div>
              <table className="hx-table">
                <thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Status</th></tr></thead>
                <tbody>
                  {(summary.products ?? []).map((p, i) => (
                    <tr key={p.id ?? i}><td>{p.name ?? "—"}</td><td>{p.sku ?? "—"}</td><td>{usd(p.price?.amount)}</td><td>{p.status ?? "—"}</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="hx-muted" style={{ marginTop: 8 }}>Edits to products happen in GoDaddy → use the Products quick link above.</p>
            </div>
          )}

          {view === "customers" && (
            <div className="hx-card">
              <div className="hx-card-title">Customers (from POS)</div>
              <table className="hx-table">
                <thead><tr><th>Name</th><th>Email</th><th>Since</th></tr></thead>
                <tbody>
                  {(summary.customers ?? []).map((c, i) => {
                    const email = c.emails ? Object.values(c.emails)[0]?.emailAddress : undefined;
                    return (
                      <tr key={c.id ?? i}>
                        <td>{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</td>
                        <td>{email ?? "—"}</td>
                        <td>{c.createdAt?.slice(0, 10) ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
