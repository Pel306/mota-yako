"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  changeAdminPassword,
  requestAdminPasswordChangeCode,
} from "@/src/app/actions/admin-auth";

export function ChangeAdminPasswordForm({ mustChangePassword }: { mustChangePassword: boolean }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestCode() {
    setBusy(true);
    setError("");
    try {
      const result = await requestAdminPasswordChangeCode({ currentPassword });
      if (!result.ok) {
        setError(result.error ?? "Could not send the SMS code.");
        return;
      }
      setDevCode(result.devCode ?? "");
      setCodeRequested(true);
    } catch {
      setError("Could not send the SMS code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await changeAdminPassword({ currentPassword, code, newPassword });
      if (!result.ok) {
        setError(result.error ?? "Could not change the password.");
      } else {
        router.replace("/admin");
        router.refresh();
      }
    } catch {
      setError("Could not change the password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="eyebrow">Secure your account</div>
      <h1>{mustChangePassword ? "Change your temporary password" : "Change your admin password"}</h1>
      <p className="muted">Enter your current password and verify a code sent to your admin phone. New passwords must have at least 12 characters.</p>
      <form onSubmit={submit} className="form-grid">
        <label className="field field-full">Current password<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
        {!codeRequested ? (
          <button className="btn btn-outline" type="button" onClick={requestCode} disabled={busy || !currentPassword}>
            {busy ? "Sending…" : "Send SMS verification code"}
          </button>
        ) : (
          <>
            <p className="small muted field-full">Enter the code sent to your admin phone.</p>
            {devCode && <div className="notice field-full" role="status">Development code: <strong>{devCode}</strong></div>}
            <label className="field field-full">Six-digit SMS code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} required /></label>
            <button className="btn btn-outline" type="button" onClick={requestCode} disabled={busy}>Resend SMS code</button>
            <label className="field field-full">New password<input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
            <button className="btn btn-primary" type="submit" disabled={busy || code.length !== 6}>{busy ? "Saving…" : "Verify and change password"}</button>
          </>
        )}
      </form>
      {error && <p className="notice" role="alert">{error}</p>}
    </section>
  );
}
