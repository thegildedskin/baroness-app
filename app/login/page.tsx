"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
          <p>
            A sign-in link has been sent to <strong>{email}</strong>. Open it on
            this device to enter the Quarters.
          </p>
        </div>
      ) : (
        <form className="card" onSubmit={handleSubmit}>
          <p style={{ marginBottom: 16 }}>
            Enter your email and we&rsquo;ll send you a one-click sign-in link.
          </p>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="katherine@baronesstattoo.com"
            />
          </label>
          {error && <p style={{ color: "#a33", marginBottom: 12 }}>{error}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
      )}
    </main>
  );
}
