// Minimal Resend sender. No-ops if RESEND_API_KEY isn't set, so the app
// works before email is configured.
export function escHtml(s: string) {
  return (s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
}

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !opts.to) return;
  const from = process.env.RESEND_FROM || "Baroness Tattoo <onboarding@resend.dev>";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html }),
    });
  } catch { /* email is best-effort */ }
}
