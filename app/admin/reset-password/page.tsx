"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdminPassword } from "@/app/actions/admin-auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    setBusy(true);
    try {
      const result = await updateAdminPassword(password);
      if (!result.ok) {
        setError(result.error ?? "Could not finish the password reset.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError("Password updated, but sign-out failed. Please sign out before continuing.");
        return;
      }
      router.replace("/admin/sign-in?reset=complete");
      router.refresh();
    } catch {
      setError("Could not finish the password reset.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <section className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="eyebrow">Administrator access</div>
            <h1>Reset admin password</h1>
            <p className="muted">Choose a new password for this Supabase admin account.</p>
            <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 18 }}>
              <label className="field field-full">
                New password
                <input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
              <label className="field field-full">
                Confirm password
                <input type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
              </label>
              <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Reset password"}</button>
            </form>
            {error && <p className="notice" role="alert" style={{ marginTop: 14 }}>{error}</p>}
          </section>
        </div>
      </section>
    </main>
  );
}
