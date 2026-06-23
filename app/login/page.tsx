"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function passwordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/dashboard");
  }

  async function magicSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="wrap" style={{ maxWidth: 460 }}>
      <h1 style={{ fontSize: 40 }}>Artists&rsquo; Quarters</h1>
      <p className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "6px 0 18px" }}>
        Private entrance · staff of the house
      </p>
      {sent ? (
        <div className="card">
          <p>A sign-in link has been sent to <strong>{email}</strong>. Open it on this device to enter the Quarters.</p>
        </div>
      ) : mode === "password" ? (
        <form className="card" onSubmit={passwordSignIn}>
          <label className="field"><span>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@baronesstattoo.com" /></label>
          <label className="field"><span>Password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
          {error && <p style={{ color: "#a33", marginBottom: 12 }}>{error}</p>}
          <button className="btn" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          <p style={{ marginTop: 16, fontSize: 15 }}>No password yet, or forgot it?{" "}
            <a style={{ cursor: "pointer" }} onClick={() => { setMode("magic"); setError(""); }}>Email me a sign-in link</a>.</p>
        </form>
      ) : (
        <form className="card" onSubmit={magicSignIn}>
          <p style={{ marginBottom: 16 }}>Enter your email and we&rsquo;ll send you a one-click sign-in link. (Set a password once you&rsquo;re in, to skip this next time.)</p>
          <label className="field"><span>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@baronesstattoo.com" /></label>
          {error && <p style={{ color: "#a33", marginBottom: 12 }}>{error}</p>}
          <button className="btn" type="submit" disabled={loading}>{loading ? "Sending…" : "Send sign-in link"}</button>
          <p style={{ marginTop: 16, fontSize: 15 }}>
            <a style={{ cursor: "pointer" }} onClick={() => { setMode("password"); setError(""); }}>← Sign in with a password instead</a></p>
        </form>
      )}
    </main>
  );
}
