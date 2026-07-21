import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchOrders, fetchTransactions, fetchProducts, fetchCustomers,
  type PoyntConfig,
} from "@/lib/poynt";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET — owner-only snapshot of GoDaddy Payments (Poynt) data for the Commerce tab.
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "owner") return NextResponse.json({ error: "Owner only." }, { status: 403 });

  const admin = createAdminClient();
  const { data: settings } = await admin.from("site_settings").select("key, value").in("key", ["poynt_application_id", "poynt_business_id"]);
  const applicationId = settings?.find((s) => s.key === "poynt_application_id")?.value?.trim() || "";
  const businessId = settings?.find((s) => s.key === "poynt_business_id")?.value?.trim() || "";
  const privateKeyPem = (process.env.POYNT_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!applicationId || !businessId || !privateKeyPem) {
    return NextResponse.json({ configured: false });
  }

  const cfg: PoyntConfig = { applicationId, businessId, privateKeyPem };
  try {
    const [orders, transactions, products, customers] = await Promise.all([
      fetchOrders(cfg).catch(() => []),
      fetchTransactions(cfg).catch(() => []),
      fetchProducts(cfg).catch(() => []),
      fetchCustomers(cfg).catch(() => []),
    ]);

    // Daily sales totals from captured/sale transactions, last 14 days.
    const daily: Record<string, number> = {};
    for (const t of transactions) {
      if (!t.createdAt || !t.amounts?.transactionAmount) continue;
      if (t.status && !["CAPTURED", "AUTHORIZED", "SETTLED", "COMPLETED"].includes(t.status)) continue;
      const day = t.createdAt.slice(0, 10);
      daily[day] = (daily[day] ?? 0) + t.amounts.transactionAmount;
    }
    const dailySales = Object.entries(daily)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 14)
      .map(([date, cents]) => ({ date, cents }));

    return NextResponse.json({ configured: true, orders, transactions: transactions.slice(0, 25), products, customers, dailySales });
  } catch (e) {
    return NextResponse.json({ configured: true, error: e instanceof Error ? e.message : "Poynt request failed." }, { status: 502 });
  }
}
