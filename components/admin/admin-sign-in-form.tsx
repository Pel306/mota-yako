"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeAdminPasswordSetup,
  requestAdminPasswordSetup,
  signInAdmin,
} from "@/app/actions/admin-auth";

export function AdminSignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "setup-code" | "setup-password">("sign-in");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await signInAdmin({ phone, password });
      if (!result.ok) {
        setError(result.error ?? "The phone number or password is incorrect.");
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

  async function handleRequestSetup() {
    if (!phone.trim()) {
      setError("Enter your admin phone number first, then choose this option.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const result = await requestAdminPasswordSetup(phone);
      if (!result.ok) {
        setError(result.error ?? "Could not request an initial admin password setup.");
        return;
      }
      setPhone(result.phone ?? phone);
      setDevCode(result.devCode ?? "");
      setMode("setup-code");
    } catch {
      setError("Could not send the setup code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCompleteSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await completeAdminPasswordSetup({ phone, code, password });
      if (!result.ok) {
        setError(result.error ?? "Could not complete admin password setup.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not finish admin setup. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="eyebrow">Administrator access</div>
      <h1>{mode === "setup-password" ? "Set your admin password" : mode === "setup-code" ? "Verify your admin phone" : "Admin sign in"}</h1>
      <p className="muted">
        Admin accounts are separate from private-seller and dealer accounts.
      </p>
      {mode === "sign-in" ? (
        <form onSubmit={handleSignIn} className="form-grid" style={{ marginTop: 18 }}>
          <label className="field field-full">
            Admin phone number
            <input type="tel" autoComplete="username" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+263 77 123 4567" required />
          </label>
          <label className="field field-full">
            Password
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to admin"}</button>
          <button className="btn btn-outline" type="button" onClick={handleRequestSetup} disabled={busy}>
            Set up your password using SMS
          </button>
        </form>
      ) : (
        <form onSubmit={handleCompleteSetup} className="form-grid" style={{ marginTop: 18 }}>
          <p className="small muted field-full">A verification code was sent to {phone}.</p>
          {devCode && <div className="notice field-full" role="status">Development code: <strong>{devCode}</strong></div>}
          {mode === "setup-code" && (
            <label className="field field-full">
              Six-digit verification code
              <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} required />
            </label>
          )}
          {mode === "setup-code" ? (
            <button className="btn btn-primary" type="button" disabled={busy || code.length !== 6} onClick={() => setMode("setup-password")}>Continue</button>
          ) : (
            <>
              <label className="field field-full">
                New password (at least 12 characters)
                <input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
              <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Set password and sign in"}</button>
            </>
          )}
          <button className="btn btn-outline" type="button" onClick={() => { setMode("sign-in"); setCode(""); setPassword(""); }} disabled={busy}>Back to admin sign in</button>
        </form>
      )}
      {error && <p className="notice" role="alert" style={{ marginTop: 14 }}>{error}</p>}
    </section>
  );
}
