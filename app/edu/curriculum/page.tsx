import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "../../PublicHeader";
import { MODULES } from "@/lib/academy";

// The full 32-course curriculum, grouped by module. Server-rendered <details>
// accordions — every course's intro, teaching beats, topics and studio
// assignment are crawlable text (this page IS the Academy's SEO).

export const metadata: Metadata = {
  title: "The Curriculum — 32 Courses in 4 Modules | Baroness Tattoo Academy",
  description:
    "The complete Baroness Tattoo Academy curriculum: Foundations of Fine Art, Tattoo Arts & Design, Tattoo Application Theory, and The Professional Tattoo Artist — every course with its studio assignment.",
  alternates: { canonical: "/edu/curriculum" },
};

const label: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-dark)" };
const p: React.CSSProperties = { fontFamily: "var(--body)", fontSize: 15.5, lineHeight: 1.65, color: "#3a2f22", margin: "8px 0" };

export default function CurriculumPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <PublicHeader />
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "52px 24px 90px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={label}>Baroness Tattoo Academy</div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "clamp(34px,5.5vw,46px)", lineHeight: 1.1, color: "var(--black)", margin: "10px 0 0" }}>
            The Curriculum
          </h1>
          <p style={{ ...p, fontStyle: "italic", color: "var(--grey)", maxWidth: 520, margin: "12px auto 0", fontSize: 16.5 }}>
            Thirty-two courses in deliberate order. Open any course to see exactly what it
            teaches and what you&rsquo;ll make.
          </p>
        </div>

        {MODULES.map((m) => (
          <section key={m.roman} id={`module-${m.roman}`} style={{ marginTop: 44 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", borderBottom: "2px solid var(--gold)", paddingBottom: 8 }}>
              <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 34, color: "var(--gold-dark)" }}>{m.roman}</span>
              <h2 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 26, color: "var(--black)", margin: 0 }}>{m.name}</h2>
              <span style={{ ...label, fontSize: 10, marginLeft: "auto" }}>{m.range}</span>
            </div>
            <p style={{ ...p, fontStyle: "italic", color: "var(--grey)", margin: "10px 0 14px" }}>{m.tagline}</p>

            {m.courses.map((c) => (
              <details key={c.id} style={{ background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: 10, padding: "14px 20px", margin: "8px 0" }}>
                <summary style={{ cursor: "pointer" }}>
                  <span style={{ ...label, fontSize: 9.5 }}>Course {c.id}</span>
                  <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 19, color: "var(--black)", marginLeft: 10 }}>{c.t}</span>
                  <span style={{ fontFamily: "var(--display)", fontStyle: "italic", fontSize: 15, color: "var(--grey)", marginLeft: 8 }}>— {c.s}</span>
                </summary>
                <p style={{ ...p, marginTop: 10 }}>{c.intro}</p>
                {c.beats.map(([head, body]) => (
                  <p key={head} style={{ ...p, fontSize: 15 }}>
                    <strong>{head}.</strong> {body}
                  </p>
                ))}
                <p style={{ ...p, fontSize: 14.5 }}>
                  <span style={{ ...label, fontSize: 9 }}>Covers</span> &nbsp;{c.topics.join(" · ")}
                </p>
                <p style={{ ...p, fontSize: 14.5, background: "rgba(184,146,74,.1)", border: "1px solid var(--gold)", borderRadius: 8, padding: "10px 14px" }}>
                  <span style={{ ...label, fontSize: 9 }}>Studio assignment</span>
                  <br />{c.hw.join(" · ")}
                </p>
              </details>
            ))}
          </section>
        ))}

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/edu#waitlist" style={{ display: "inline-block", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 13, color: "var(--black)", background: "var(--gilt)", border: "1px solid var(--gold-dark)", borderRadius: 3, padding: "16px 30px", textDecoration: "none" }}>
            Join the Waitlist
          </Link>
          <p style={{ ...p, fontSize: 13, fontStyle: "italic", color: "var(--grey)", marginTop: 12 }}>
            <Link href="/edu" style={{ color: "var(--gold-dark)" }}>← Back to the Academy</Link>
          </p>
        </div>
      </article>
    </main>
  );
}
