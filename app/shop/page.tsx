import type { Metadata } from "next";
import PublicHeader from "../PublicHeader";
import { createStaticClient } from "@/lib/supabase/static";
import { STUDIO } from "@/lib/studio";
import { GIFT_AMOUNTS_CENTS } from "@/lib/giftcards";
import { BuyProductButton, GiftCardButton } from "./ShopButtons";

// Server-rendered shop; revalidates every 10 minutes so newly listed
// products appear without a deploy.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Shop — Gift Cards, Aftercare & Prints | Baroness Tattoo, Garland TX",
  description:
    "Baroness Tattoo gift cards ($50–$250), tattoo aftercare and artist prints — from the fine-art tattoo studio at Firewheel Town Center, Garland, TX.",
  alternates: { canonical: "/shop" },
};

type Product = { id: string; title: string; description: string | null; price_cents: number; kind: string; preview_url: string | null; is_active: boolean; claimable?: boolean | null };

async function fetchProducts(): Promise<(Product & { artist_name: string })[]> {
  try {
    const supabase = createStaticClient();
    if (!supabase) return [];
    // Same proven anon-read path the homepage uses: products embedded under
    // published artists. claimable (migration 012) is fetched with a
    // fallback so the shop still renders pre-migration.
    const cols = "id,title,description,price_cents,kind,preview_url,is_active";
    let data: unknown = (await supabase
      .from("artists")
      .select(`display_name, products(${cols},claimable)`)
      .eq("is_published", true)).data;
    if (!data) {
      data = (await supabase.from("artists").select(`display_name, products(${cols})`).eq("is_published", true)).data;
    }
    const rows = ((data as unknown[] | null) ?? []) as { display_name: string; products: Product[] }[];
    return rows.flatMap((a) => (a.products ?? []).filter((p) => p.is_active).map((p) => ({ ...p, artist_name: a.display_name })));
  } catch {
    return [];
  }
}

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };
const h2: React.CSSProperties = { fontFamily: "var(--display)", fontWeight: 700, fontSize: 30, color: "var(--black)", margin: "0 0 4px" };
const cardS: React.CSSProperties = { background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 8, overflow: "hidden", boxShadow: "0 10px 24px rgba(0,0,0,.12)" };

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div style={{ textAlign: "center", margin: "60px 0 24px" }}>
      <div style={label}>{kicker}</div>
      <h2 style={h2}>{title}</h2>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "4px auto 0", maxWidth: 300, color: "var(--gold-dark)" }}>
        <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,transparent,var(--gold-dark))" }} />
        <span>❦</span>
        <span style={{ height: 1, flex: 1, background: "linear-gradient(90deg,var(--gold-dark),transparent)" }} />
      </div>
    </div>
  );
}

export default async function ShopPage() {
  const products = await fetchProducts();
  const aftercare = products.filter((p) => p.kind === "aftercare");
  const flash = products.filter((p) => p.kind === "flash");
  const prints = products.filter((p) => p.kind !== "aftercare" && p.kind !== "flash"); // art / stencil / merch

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 90px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>Maison Baroness · {STUDIO.address.city}, {STUDIO.address.state}</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(36px,6vw,52px)", lineHeight: 1.08, color: "var(--black)", margin: "8px 0 0" }}>The Shop</h1>
          <p style={{ fontFamily: "var(--body)", fontSize: 17, fontStyle: "italic", color: "var(--grey)", maxWidth: 560, margin: "10px auto 0", lineHeight: 1.6 }}>
            Gift cards, aftercare, and works from the house artists — everything but the needle itself.
          </p>
        </div>

        {/* ── GIFT CARDS ─────────────────────────────────────────── */}
        <SectionHead kicker="The Perfect Present" title="Gift Cards" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22, maxWidth: 860, margin: "0 auto" }}>
          {GIFT_AMOUNTS_CENTS.map((cents) => (
            <div key={cents} style={{ ...cardS, textAlign: "center", padding: "0 0 24px" }}>
              <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--velvet-2),var(--velvet))", position: "relative" }}>
                <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 52, color: "var(--gold-light)" }}>${cents / 100}</span>
                <span style={{ position: "absolute", inset: 10, border: "1px solid var(--gold)", borderRadius: 4, pointerEvents: "none" }} />
              </div>
              <div style={{ fontFamily: "var(--caps)", fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--black)", margin: "18px 0 4px" }}>
                ${cents / 100} Gift Card
              </div>
              <p style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 15.5, color: "var(--grey)", margin: "0 18px 16px" }}>
                {cents === 5000 ? "A fine-line token." : cents === 10000 ? "Covers the deposit — and then some." : "A serious piece awaits."}
              </p>
              <div style={{ padding: "0 22px" }}>
                <GiftCardButton amountCents={cents} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontFamily: "var(--body)", fontSize: 14, fontStyle: "italic", color: "var(--grey)", marginTop: 18, lineHeight: 1.6 }}>
          Your code arrives instantly after checkout (on-screen and by email). Redeemable in-studio toward any tattoo or purchase —
          present the code at the counter. Gift cards don&rsquo;t expire and are redeemed in person at {STUDIO.address.full}.
        </p>

        {/* ── AFTERCARE ──────────────────────────────────────────── */}
        <SectionHead kicker="Tend the Crown" title="Aftercare" />
        {aftercare.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22 }}>
            {aftercare.map((p) => (
              <div key={p.id} style={{ ...cardS, textAlign: "center", padding: "0 0 22px" }}>
                {p.preview_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.preview_url} alt={p.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                ) : (
                  <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--velvet-2),var(--velvet))", color: "var(--gold-light)", fontSize: 40 }}>✦</div>
                )}
                <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 21, color: "var(--black)", margin: "14px 12px 2px" }}>{p.title}</div>
                {p.description && <p style={{ fontFamily: "var(--body)", fontSize: 14.5, color: "var(--grey)", margin: "0 16px 8px" }}>{p.description}</p>}
                <div style={{ ...label, fontSize: 12, margin: "4px 0 12px" }}>${(p.price_cents / 100).toFixed(2)}</div>
                <div style={{ display: "flex", justifyContent: "center" }}><BuyProductButton productId={p.id} /></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ ...cardS, maxWidth: 640, margin: "0 auto", padding: "26px 30px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--body)", fontSize: 16.5, lineHeight: 1.65, color: "#3a2f22", margin: 0 }}>
              The house aftercare line is stocked <strong>in-studio</strong> — fragrance-free wash, healing balm and second-skin film,
              chosen by the artists. Ask at your sitting, and read the{" "}
              <a href="/aftercare" style={{ color: "var(--gold-dark)" }}>full aftercare guide</a> before you go home.
            </p>
          </div>
        )}

        {/* ── FLASH — claimable one-off designs ──────────────────── */}
        {flash.length > 0 && (
          <>
            <SectionHead kicker="One Skin Only" title="Flash" />
            <p style={{ textAlign: "center", fontFamily: "var(--body)", fontSize: 15, fontStyle: "italic", color: "var(--grey)", maxWidth: 620, margin: "0 auto 24px", lineHeight: 1.6 }}>
              Ready-to-wear designs from the house sketchbooks. Claim one and it&rsquo;s yours alone — your purchase includes
              the design and books your session deposit; we&rsquo;ll reach out within 1 business day to schedule.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22 }}>
              {flash.map((p) => (
                <div key={p.id} style={{ ...cardS, textAlign: "center", padding: "0 0 22px" }}>
                  {p.preview_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.preview_url} alt={`${p.title} — tattoo flash by ${p.artist_name}, Baroness Tattoo, Garland TX`} style={{ width: "100%", height: 220, objectFit: "cover" }} />
                  ) : (
                    <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--velvet-2),var(--velvet))", color: "var(--gold-light)", fontSize: 40 }}>✦</div>
                  )}
                  <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 21, color: "var(--black)", margin: "14px 12px 2px" }}>{p.title}</div>
                  <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 15, color: "var(--grey)" }}>by {p.artist_name}</div>
                  {p.description && <p style={{ fontFamily: "var(--body)", fontSize: 14.5, color: "var(--grey)", margin: "6px 16px 8px" }}>{p.description}</p>}
                  {p.claimable && (
                    <div style={{ ...label, fontSize: 9.5, margin: "6px 0 0", color: "var(--gold-dark)" }}>✦ Claim it — includes the design + your session deposit</div>
                  )}
                  <div style={{ ...label, fontSize: 12, margin: "6px 0 12px" }}>${(p.price_cents / 100).toFixed(2)}</div>
                  <div style={{ display: "flex", justifyContent: "center" }}><BuyProductButton productId={p.id} /></div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── PRINTS & DIGITAL ART ───────────────────────────────── */}
        <SectionHead kicker="From the Artists' Hands" title={flash.length > 0 ? "Prints & Digital Art" : "Flash & Prints"} />
        {prints.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22 }}>
            {prints.map((p) => (
              <div key={p.id} style={{ ...cardS, textAlign: "center", padding: "0 0 22px" }}>
                {p.preview_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.preview_url} alt={`${p.title} — by ${p.artist_name}, Baroness Tattoo`} style={{ width: "100%", height: 220, objectFit: "cover" }} />
                ) : (
                  <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--velvet-2),var(--velvet))", color: "var(--gold-light)", fontSize: 40 }}>✦</div>
                )}
                <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 21, color: "var(--black)", margin: "14px 12px 2px" }}>{p.title}</div>
                <div style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 15, color: "var(--grey)" }}>by {p.artist_name} · {p.kind}</div>
                {p.description && <p style={{ fontFamily: "var(--body)", fontSize: 14.5, color: "var(--grey)", margin: "6px 16px 8px" }}>{p.description}</p>}
                <div style={{ ...label, fontSize: 12, margin: "4px 0 12px" }}>${(p.price_cents / 100).toFixed(2)}</div>
                <div style={{ display: "flex", justifyContent: "center" }}><BuyProductButton productId={p.id} /></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ ...cardS, maxWidth: 640, margin: "0 auto", padding: "26px 30px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--body)", fontSize: 16.5, lineHeight: 1.65, color: "#3a2f22", margin: 0 }}>
              Flash sheets and fine-art prints from the house artists are <strong>coming soon</strong>. Meanwhile, see what the artists
              are working on in <a href="/artists" style={{ color: "var(--gold-dark)" }}>their portfolios</a>.
            </p>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <p style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 19, color: "var(--grey)" }}>
            The finest thing we sell is still made of ink.
          </p>
          <a href="/book" className="btn" style={{ marginTop: 14 }}>Book a Consultation</a>
        </div>
      </div>
    </main>
  );
}
