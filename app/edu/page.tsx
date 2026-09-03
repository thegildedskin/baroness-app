import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "../PublicHeader";
import EduForm from "./EduForm";
import { MODULES, FAQS } from "@/lib/academy";
import { STUDIO } from "@/lib/studio";

// The Baroness Tattoo Academy — ported from the Baroness.Art project.
// 32 courses · 4 modules · every studio assignment critiqued. Restorative /
// paramedical training is named alongside it so nobody is pigeonholed.

export const metadata: Metadata = {
  title: "Baroness Tattoo Academy — A Professional Tattoo Arts Program | Garland, TX",
  description:
    "Thirty-two courses across four modules that build the artist before the tattooer — fine art, design, application theory, and the business of the craft. From the House of Baroness, Garland TX.",
  alternates: { canonical: "/edu" },
};

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };
const h2: React.CSSProperties = { fontFamily: "var(--display)", fontWeight: 700, fontSize: 28, color: "var(--black)", margin: "40px 0 8px" };
const p: React.CSSProperties = { fontFamily: "var(--body)", fontSize: 16.5, lineHeight: 1.68, color: "#3a2f22", margin: "8px 0" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const STATS: [string, string][] = [["32", "Courses"], ["4", "Modules"], ["32", "Studio Assignments"], ["10", "Portfolio Projects"]];

export default function EduPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "52px 24px 90px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>Baroness.Art · A Professional Tattoo Arts Program</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(36px,6vw,52px)", lineHeight: 1.08, color: "var(--black)", margin: "10px 0 0" }}>
            Baroness Tattoo Academy
          </h1>
          <p style={{ ...p, fontStyle: "italic", color: "var(--grey)", maxWidth: 560, margin: "14px auto 0" }}>
            Thirty-two courses across four modules that build the <strong>artist</strong> before
            the tattooer — fine art, design, application, and the business of the craft.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
            <Link href="/edu/curriculum" style={{ fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 12.5, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 3, padding: "14px 26px", textDecoration: "none" }}>
              View the Curriculum
            </Link>
            <a href="#waitlist" style={{ fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 12.5, color: "var(--gold-dark)", border: "1px solid var(--gold)", borderRadius: 3, padding: "14px 26px", textDecoration: "none" }}>
              Join the Waitlist
            </a>
          </div>
        </div>

        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 40, textAlign: "center" }}>
          {STATS.map(([n, t]) => (
            <div key={t} style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 10, padding: "16px 6px" }}>
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 30, color: "var(--black)" }}>{n}</div>
              <div style={{ ...label, fontSize: 9 }}>{t}</div>
            </div>
          ))}
        </div>

        <h2 style={h2}>A machine can be learned in a weekend. <em>Seeing</em> takes a curriculum.</h2>
        <p style={p}>
          The artists who struggle behind the machine are rarely the ones who can&rsquo;t run it.
          They&rsquo;re the ones who never learned to draw, to read value, to build a composition
          that survives on skin for thirty years. So Baroness starts where the old ateliers
          started — <strong>observation, form, value, and design</strong> — then moves through
          needles, machines, color, and saturation, and finishes with the part most courses
          ignore entirely: <strong>how to actually build a career</strong>.
        </p>
        <p style={p}>
          Every course carries a short studio assignment, a milestone project arrives every few
          weeks, and every piece you submit comes back with an individual written critique — you
          improve with direction, not by guessing alone.
        </p>

        <h2 style={h2}>Four modules, one path</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {MODULES.map((m) => (
            <Link key={m.roman} href={`/edu/curriculum#module-${m.roman}`} style={{ display: "block", textDecoration: "none", background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 10, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 26, color: "var(--gold-dark)" }}>{m.roman}</span>
                <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 21, color: "var(--black)" }}>{m.name}</span>
                <span style={{ ...label, fontSize: 9.5, marginLeft: "auto" }}>{m.range}</span>
              </div>
              <p style={{ ...p, fontSize: 15, fontStyle: "italic", color: "var(--grey)", margin: "6px 0 0" }}>{m.tagline}</p>
            </Link>
          ))}
        </div>

        <h2 style={h2}>Who it&rsquo;s for</h2>
        <p style={p}><strong>The Aspiring Apprentice.</strong> You can&rsquo;t draw like a master yet, but you&rsquo;re serious. This builds the fundamentals and the portfolio that get you through a shop&rsquo;s front door.</p>
        <p style={p}><strong>The Working Artist.</strong> You already draw or paint. Learn to translate that skill onto skin — body flow, machines, saturation — without picking up bad habits first.</p>
        <p style={p}><strong>The Lone Tattooer.</strong> You&rsquo;ve been figuring it out alone. Fill the gaps in fundamentals, safety, color, and business that nobody was around to teach you.</p>
        <p style={p}>
          And beyond the machine: the house also teaches <Link href="/restorative" style={{ color: "var(--gold-dark)" }}><strong>restorative &amp; paramedical artistry</strong></Link> —
          nipple-areola restoration and scar work — as its own discipline, open in time to
          medical-adjacent professionals as well as tattoo artists.
        </p>

        <h2 style={h2}>What this program is — and isn&rsquo;t</h2>
        <p style={p}>
          We&rsquo;d rather you enroll knowing exactly what you&rsquo;re buying. This program
          <strong> is</strong> a complete fine-art, design, and tattoo-theory education in
          deliberate order, with critique on everything you make. It <strong>is not</strong> a
          license to tattoo — licensing, bloodborne-pathogen certification, and the supervised
          apprenticeship your region requires are steps you complete locally. This program
          prepares you to earn them; any course claiming otherwise isn&rsquo;t being honest with you.
        </p>

        <h2 style={h2}>Common questions</h2>
        {FAQS.map((f) => (
          <details key={f.q} style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 10, padding: "14px 20px", margin: "8px 0" }}>
            <summary style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 17.5, color: "var(--black)", cursor: "pointer" }}>{f.q}</summary>
            <p style={{ ...p, fontSize: 15.5, margin: "8px 0 0" }}>{f.a}</p>
          </details>
        ))}

        <h2 id="waitlist" style={h2}>Begin as an artist.</h2>
        <p style={p}>
          Enrollment opens in small cohorts. Join the waitlist and you&rsquo;ll hear first when
          the doors open — no spam, the house writes rarely and only when it matters.
        </p>
        <div style={{ marginTop: 16 }}>
          <EduForm />
        </div>

        <p style={{ ...p, textAlign: "center", fontSize: 13, fontStyle: "italic", color: "var(--grey)", marginTop: 24 }}>
          {STUDIO.name} · {STUDIO.address.full} · {STUDIO.phone}
        </p>
      </article>
    </main>
  );
}
