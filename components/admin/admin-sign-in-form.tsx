"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAdmin } from "@/app/actions/admin-auth";
import { requestAdminSupabasePasswordReset } from "@/app/actions/admin-supabase-reset";

export function AdminSignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "reset-email">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await signInAdmin({ email, password });
      if (!result.ok) {
        setError(result.error ?? "The email or password is incorrect.");
        return;
      }
      router.replace(result.mustChangePassword ? "/admin/change-password" : "/admin");
      router.refresh();
    } catch {
      setError("Admin sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestAdminSupabasePasswordReset(email);
      if (!result.ok) {
        setError(result.error ?? "Could not send the reset email.");
        return;
      }
      setMessage(result.message ?? "Check your email for the reset link.");
    } catch {
      setError("Could not send the reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="eyebrow">Administrator access</div>
      <h1>
        {mode === "reset-email" ? "Reset admin password" : "Admin sign in"}
      </h1>
      <p className="muted">
        Admin accounts are separate from private-seller and dealer accounts.
      </p>
      {mode === "reset-email" ? (
        <form onSubmit={handleResetRequest} className="form-grid" style={{ marginTop: 18 }}>
          <label className="field field-full">
            Admin email
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
          <button className="btn btn-navy" type="button" onClick={() => { setMode("sign-in"); setError(""); setMessage(""); }} disabled={busy}>Back to admin sign in</button>
        </form>
      ) : (
        <form onSubmit={handleSignIn} className="form-grid" style={{ marginTop: 18 }}>
          <label className="field field-full">
            Admin email
            <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" required />
          </label>
          <label className="field field-full">
            Password
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to admin"}</button>
          <button className="btn btn-navy" type="button" onClick={() => { setMode("reset-email"); setError(""); setMessage(""); setPassword(""); }} disabled={busy}>
            Reset password via email
          </button>
        </form>
      )}
      {error && <p className="notice" role="alert" style={{ marginTop: 14 }}>{error}</p>}
      {message && <p className="notice" role="status" style={{ marginTop: 14 }}>{message}</p>}
    </section>
  );
}
