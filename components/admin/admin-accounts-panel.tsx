"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAdminAccount,
  inviteAdminAccount,
  revokeAdminAccount,
  requestAdminPhoneChange,
  updateAdminDetails,
  verifyAdminPhoneChange,
} from "@/app/actions/admin-accounts";

export type AdminAccountSummary = {
  id: string;
  hasSupabaseAuth: boolean;
  name: string;
  phone: string;
  email: string | null;
  organizationName: string | null;
  idNumberLastFour: string | null;
  canManageAdmins: boolean;
};

function AdminAuthInvite({ adminId }: { adminId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendInvite() {
    setBusy(true);
    setMessage("");
    try {
      const result = await inviteAdminAccount({ adminId });
      if (!result.ok) {
        setMessage(result.error ?? "Could not send the Supabase invitation.");
        return;
      }
      setMessage(result.invited
        ? "Supabase invitation sent."
        : "Linked to an existing Supabase account. The admin can sign in or request an email password reset.");
      router.refresh();
    } catch {
      setMessage("Could not send the Supabase invitation. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      <button className="btn btn-navy btn-sm" type="button" onClick={sendInvite} disabled={busy}>
        {busy ? "Sending…" : "Send Supabase invite"}
      </button>
      {message && <p className="small notice" role="status">{message}</p>}
    </div>
  );
}

function AdminPhoneChange({ admin }: { admin: AdminAccountSummary }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [message, setMessage] = useState("");
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);

  async function requestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = await requestAdminPhoneChange({ adminId: admin.id, phone });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Could not request phone verification.");
      return;
    }
    setPhone(result.phone ?? phone);
    setDevCode(result.devCode ?? "");
    setRequested(true);
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = await verifyAdminPhoneChange({ adminId: admin.id, phone, code });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error ?? "Could not verify the new phone number.");
      return;
    }
    setMessage("Phone number verified and updated.");
    setRequested(false);
    setPhone("");
    setCode("");
    setDevCode("");
  }

  return (
    <details style={{ marginTop: 10 }}>
      <summary>Change verified phone number</summary>
      <p className="small muted">The new number only takes effect after its SMS code is verified.</p>
      {!requested ? (
        <form onSubmit={requestCode} className="form-grid" style={{ marginTop: 10 }}>
          <label className="field">New phone<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+263 77 123 4567" required /></label>
          <button className="btn btn-navy btn-sm" type="submit" disabled={busy}>{busy ? "Sending…" : "Send verification code"}</button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="form-grid" style={{ marginTop: 10 }}>
          <p className="small muted field-full">Enter the code sent to {phone}.</p>
          {devCode && <p className="notice field-full" role="status">Development code: <strong>{devCode}</strong></p>}
          <label className="field">Six-digit code<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} required /></label>
          <button className="btn btn-navy btn-sm" type="submit" disabled={busy}>{busy ? "Verifying…" : "Verify phone"}</button>
        </form>
      )}
      {message && <p className="small notice" role="status">{message}</p>}
    </details>
  );
}

export function AdminAccountsPanel({
  admins,
  currentAdminId,
  canManageAdmins,
}: {
  admins: AdminAccountSummary[];
  currentAdminId: string;
  canManageAdmins: boolean;
}) {
  const [error, setError] = useState("");
  const [createdMessage, setCreatedMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    setCreatedMessage("");
    const result = await createAdminAccount(new FormData(form));
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not create the admin account.");
      return;
    }
    setCreatedMessage(result.invited
      ? "Admin account created. A Supabase invitation was sent to their email."
      : "Admin account created and linked to an existing Supabase account. They can sign in or request an email password reset.");
    form.reset();
  }

  return (
    <section className="section-sm">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2 style={{ margin: 0, fontSize: 17 }}>Admin accounts ({admins.length}/5)</h2>
        </div>
        {admins.map((account) => (
          <article className="admin-row" key={account.id}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong>{account.name}</strong>
              <div className="meta">
                {account.phone} · {account.email || "No sign-in email"} · {account.organizationName || "No organization"} · {account.canManageAdmins ? "Admin manager" : "Admin"}
                {account.idNumberLastFour ? ` · ID ending ${account.idNumberLastFour}` : " · No ID number"}
              </div>
              {canManageAdmins && (
                <>
                  <details style={{ marginTop: 10 }}>
                    <summary>Edit admin details</summary>
                    <form action={updateAdminDetails} className="form-grid" style={{ marginTop: 10 }}>
                      <input type="hidden" name="adminId" value={account.id} />
                      <label className="field">Name<input name="name" defaultValue={account.name} required minLength={2} maxLength={120} /></label>
                      <label className="field">Admin sign-in email<input name="email" type="email" defaultValue={account.email || ""} maxLength={254} required /></label>
                      <label className="field">Organization<input name="organizationName" defaultValue={account.organizationName || ""} maxLength={160} /></label>
                      <label className="field">Optional ID number<input name="idNumber" maxLength={100} autoComplete="off" placeholder={account.idNumberLastFour ? "Enter to replace; blank removes it" : "Optional"} /></label>
                      <button className="btn btn-navy btn-sm" type="submit">Save details</button>
                    </form>
                  </details>
                  {account.email && !account.hasSupabaseAuth && <AdminAuthInvite adminId={account.id} />}
                  <AdminPhoneChange admin={account} />
                </>
              )}
            </div>
            {canManageAdmins && account.id !== currentAdminId && (
              <form action={revokeAdminAccount}>
                <input type="hidden" name="adminId" value={account.id} />
                <button className="btn btn-reject btn-sm" type="submit">Revoke admin</button>
              </form>
            )}
          </article>
        ))}
        {canManageAdmins ? (
          <>
            <div className="admin-panel-head"><h3 style={{ margin: 0, fontSize: 15 }}>Create an admin account</h3></div>
            <form onSubmit={createAccount} className="form-grid" style={{ padding: 18 }}>
              <label className="field">Full name<input name="name" required minLength={2} maxLength={120} /></label>
              <label className="field">Zimbabwe phone<input name="phone" type="tel" placeholder="+263 77 123 4567" required /></label>
              <label className="field">Admin sign-in email<input name="email" type="email" maxLength={254} required /></label>
              <label className="field">Organization name<input name="organizationName" maxLength={160} /></label>
              <label className="field">Optional ID number<input name="idNumber" maxLength={100} autoComplete="off" /></label>
              <p className="small muted">Supabase will email the new admin an invitation to set their password. ID numbers are encrypted at rest.</p>
              <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Creating…" : "Create admin account"}</button>
            </form>
            {createdMessage && <p className="notice" role="status" style={{ margin: 18 }}>{createdMessage}</p>}
            {error && <p className="notice" role="alert" style={{ margin: 18 }}>{error}</p>}
          </>
        ) : (
          <p className="small muted" style={{ padding: 18 }}>Only designated admin managers can change admin accounts.</p>
        )}
      </div>
    </section>
  );
}
