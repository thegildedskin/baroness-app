"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState<"" | "link" | "confirm">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function go(m: Mode) { setMode(m); setError(""); setSent(""); }

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message); else router.push("/dashboard");
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Please choose a password of at least 6 characters."); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if (data.session) router.push("/dashboard");        // confirmations off → straight in
    else setSent("confirm");                              // confirmations on → verify email
  }

  async function magic(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setLoading(false);
    if (error) setError(error.message); else setSent("link");
  }

  const sub = mode === "signup" ? "Create your account" : "Members & artists of the house";

  return (
    <main className="wrap" style={{ maxWidth: 460 }}>
      <h1 style={{ fontSize: 40 }}>{mode === "signup" ? "Join the House" : "Enter the House"}</h1>
      <p className="caps" style={{ fontSize: 10, color: "var(--gold-dark)", margin: "6px 0 18px" }}>{sub}</p>

      {sent === "link" ? (
        <div className="card">
          <p>A sign-in link has been sent to <strong>{email}</strong>. Open it on this device to enter.</p>
          <p style={{ fontSize: 14, color: "var(--grey)", marginTop: 10 }}>Tip: the link can only be used once. If it says &ldquo;invalid,&rdquo; request a fresh one and open it immediately.</p>
        </div>
      ) : sent === "confirm" ? (
        <div className="card">
          <p>Welcome! We&rsquo;ve sent a confirmation link to <strong>{email}</strong>. Confirm it, then sign in with your new password.</p>
          <p style={{ marginTop: 12 }}><a style={{ cursor: "pointer" }} onClick={() => go("signin")}>← Back to sign in</a></p>
        </div>
      ) : mode === "signin" ? (
        <form className="card" onSubmit={signIn}>
          <label className="field"><span>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" /></label>
          <label className="field"><span>Password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
          {error && <p style={{ color: "#a33", marginBottom: 12 }}>{error}</p>}
          <button className="btn" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          <p style={{ marginTop: 16, fontSize: 15 }}>New here? <a style={{ cursor: "pointer", color: "var(--gold-dark)" }} onClick={() => go("signup")}>Create an account</a></p>
          <p style={{ marginTop: 6, fontSize: 15 }}>Forgot your password? <a style={{ cursor: "pointer", color: "var(--gold-dark)" }} onClick={() => go("magic")}>Email me a sign-in link</a></p>
        </form>
      ) : mode === "signup" ? (
        <form className="card" onSubmit={signUp}>
          <p style={{ marginBottom: 16 }}>Create an account to design tattoos, customize your avatar, save your work, and message the artists.</p>
          <label className="field"><span>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" /></label>
          <label className="field"><span>Choose a password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
          {error && <p style={{ color: "#a33", marginBottom: 12 }}>{error}</p>}
          <button className="btn" type="submit" disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
          <p style={{ marginTop: 16, fontSize: 15 }}>Already have an account? <a style={{ cursor: "pointer", color: "var(--gold-dark)" }} onClick={() => go("signin")}>Sign in</a></p>
        </form>
      ) : (
        <form className="card" onSubmit={magic}>
          <p style={{ marginBottom: 16 }}>Enter your email and we&rsquo;ll send a one-click sign-in link.</p>
          <label className="field"><span>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" /></label>
          {error && <p style={{ color: "#a33", marginBottom: 12 }}>{error}</p>}
          <button className="btn" type="submit" disabled={loading}>{loading ? "Sending…" : "Send sign-in link"}</button>
          <p style={{ marginTop: 16, fontSize: 15 }}><a style={{ cursor: "pointer", color: "var(--gold-dark)" }} onClick={() => go("signin")}>← Back to sign in</a></p>
        </form>
      )}
    </main>
  );
}
