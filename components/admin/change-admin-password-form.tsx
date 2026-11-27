"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdminPassword } from "@/app/actions/admin-auth";

export function ChangeAdminPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const result = await updateAdminPassword(password);
      if (!result.ok) {
        setError(result.error ?? "Could not update your password.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not update your password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="eyebrow">Secure your account</div>
      <h1>Set or change your admin password</h1>
      <p className="muted">Choose a password with at least 12 characters for your Supabase Auth account.</p>
      <form onSubmit={submit} className="form-grid">
        <label className="field field-full">
          New password
          <input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <label className="field field-full">
          Confirm new password
          <input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save password"}</button>
      </form>
      {error && <p className="notice" role="alert">{error}</p>}
    </section>
  );
}
