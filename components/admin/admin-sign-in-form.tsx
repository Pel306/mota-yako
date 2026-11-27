"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeAdminPasswordSetup,
  requestAdminPasswordSetup,
  signInAdmin,
} from "@/app/actions/admin-auth";
import {
  completeAdminEmailSetup,
  requestAdminEmailSetupCode,
  requestAdminSupabasePasswordReset,
} from "@/src/app/actions/admin-supabase-reset";

export function AdminSignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<
    "sign-in" | "setup-code" | "setup-password" | "reset-email" | "email-setup-code" | "email-setup-address"
  >("sign-in");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
        setError(result.error ?? "Could not request an SMS password reset.");
        return;
      }
      setPhone(result.phone ?? phone);
      setDevCode(result.devCode ?? "");
      setMode("setup-code");
    } catch {
      setError("Could not send the SMS code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestEmailSetup() {
    if (!phone.trim()) {
      setError("Enter your existing admin phone number first.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestAdminEmailSetupCode(phone);
      if (!result.ok) {
        setError(result.error ?? "Could not start email setup.");
        return;
      }
      setPhone(result.phone ?? phone);
      setDevCode(result.devCode ?? "");
      setCode("");
      setMode("email-setup-code");
    } catch {
      setError("Could not send the SMS code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCompleteEmailSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await completeAdminEmailSetup({ phone, email, code });
      if (!result.ok || !result.email) {
        setError(result.error ?? "Could not verify the phone and save your email.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: emailError } = await supabase.auth.signInWithOtp({
        email: result.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
        },
      });
      if (emailError) {
        setError(`Email saved, but Supabase could not send the setup link: ${emailError.message}`);
        return;
      }
      setMessage(`Email saved. Check ${result.email} for a secure link to finish setting up password recovery.`);
    } catch {
      setError("Could not finish email setup. Please try again.");
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
        setError(result.error ?? "Could not reset the admin password.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not finish the password reset. Please try again.");
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
        {mode === "reset-email" ? "Reset admin password"
          : mode === "email-setup-code" ? "Verify your admin phone"
            : mode === "email-setup-address" ? "Add a recovery email"
              : mode === "setup-password" ? "Set your admin password"
                : mode === "setup-code" ? "Verify your admin phone" : "Admin sign in"}
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
          <button className="btn btn-navy" type="button" onClick={() => { setMode("sign-in"); setError(""); }} disabled={busy}>Back to admin sign in</button>
        </form>
      ) : mode === "sign-in" ? (
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
          <button className="btn btn-navy" type="button" onClick={handleRequestSetup} disabled={busy}>
            Set up or reset password using SMS
          </button>
          <button className="btn btn-navy" type="button" onClick={handleRequestEmailSetup} disabled={busy}>
            Set up recovery email using SMS
          </button>
          <button className="btn btn-navy" type="button" onClick={() => { setMode("reset-email"); setError(""); setPassword(""); }} disabled={busy}>
            Reset password with Supabase
          </button>
        </form>
      ) : mode === "email-setup-code" ? (
        <form onSubmit={(event) => { event.preventDefault(); setMode("email-setup-address"); }} className="form-grid" style={{ marginTop: 18 }}>
          <p className="small muted field-full">Enter the code sent to your existing admin phone number, {phone}.</p>
          {devCode && <div className="notice field-full" role="status">Development code: <strong>{devCode}</strong></div>}
          <label className="field field-full">
            Six-digit SMS code
            <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy || code.length !== 6}>Continue</button>
          <button className="btn btn-navy" type="button" onClick={() => { setMode("sign-in"); setError(""); }} disabled={busy}>Back to admin sign in</button>
        </form>
      ) : mode === "email-setup-address" ? (
        <form onSubmit={handleCompleteEmailSetup} className="form-grid" style={{ marginTop: 18 }}>
          <p className="small muted field-full">Your phone is verified. Add an email address you can access for password recovery.</p>
          <label className="field field-full">
            Recovery email
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" maxLength={254} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save email and send setup link"}</button>
          <button className="btn btn-navy" type="button" onClick={() => { setMode("email-setup-code"); setError(""); }} disabled={busy}>Back to phone verification</button>
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
              <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save password and sign in"}</button>
            </>
          )}
          <button className="btn btn-navy" type="button" onClick={() => { setMode("sign-in"); setCode(""); setPassword(""); }} disabled={busy}>Back to admin sign in</button>
        </form>
      )}
      {error && <p className="notice" role="alert" style={{ marginTop: 14 }}>{error}</p>}
      {message && <p className="notice" role="status" style={{ marginTop: 14 }}>{message}</p>}
    </section>
  );
}
