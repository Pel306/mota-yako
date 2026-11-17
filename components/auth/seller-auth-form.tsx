"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestSellerCode, verifySellerCode } from "@/app/actions/auth";

type SellerType = "private" | "dealer";

export function SellerAuthForm({
  sellerType,
  nextPath,
}: {
  sellerType: SellerType;
  nextPath: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "code">("details");
  const [name, setName] = useState("");
  const [dealerName, setDealerName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await requestSellerCode({ name, dealerName, phone, sellerType });
      if (!result.ok) {
        setError(result.error ?? "We could not start verification. Please try again.");
        return;
      }
      setPhone(result.phone ?? phone);
      setDevCode(result.devCode ?? "");
      setStep("code");
    } catch {
      setError("We could not send a verification code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await verifySellerCode({ phone, code });
      if (!result.ok) {
        setError(result.error ?? "We could not verify your code. Please try again.");
        return;
      }
      router.replace(nextPath === "/admin" ? "/seller?notice=admin-required" : nextPath);
      router.refresh();
    } catch {
      setError("We could not verify your code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="eyebrow">{sellerType === "dealer" ? "Dealer account" : "Private seller account"}</div>
      <h1>{step === "details" ? "Verify your phone to continue" : "Enter your verification code"}</h1>
      <p className="muted">
        We use your mobile number for sign-in and buyer enquiries. Phone verification does not mean your identity or business has been KYC-verified.
      </p>

      {step === "details" ? (
        <form onSubmit={sendCode} className="form-grid" style={{ marginTop: 18 }}>
          <div className="field field-full">
            <label htmlFor="seller-name">Your name</label>
            <input id="seller-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={120} required />
          </div>
          {sellerType === "dealer" && (
            <div className="field field-full">
              <label htmlFor="dealer-name">Dealership / business name</label>
              <input id="dealer-name" value={dealerName} onChange={(event) => setDealerName(event.target.value)} maxLength={160} required />
            </div>
          )}
          <div className="field field-full">
            <label htmlFor="seller-phone">Zimbabwe mobile number</label>
            <input id="seller-phone" type="tel" autoComplete="tel" placeholder="+263 77 123 4567" value={phone} onChange={(event) => setPhone(event.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Send verification code"}</button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="form-grid" style={{ marginTop: 18 }}>
          <p className="small muted field-full">Code sent to {phone}.</p>
          {devCode && (
            <div className="notice field-full" role="status">
              Development-only verification code: <strong>{devCode}</strong>
            </div>
          )}
          <div className="field field-full">
            <label htmlFor="seller-code">Six-digit code</label>
            <input id="seller-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Verifying…" : "Verify and continue"}</button>
          <button className="btn btn-outline" type="button" onClick={() => { setStep("details"); setCode(""); setDevCode(""); }} disabled={busy}>Change details</button>
        </form>
      )}

      {error && <p className="notice" role="alert" style={{ marginTop: 14 }}>{error}</p>}
      <p className="small muted" style={{ marginTop: 18 }}>
        Buyer? You can send an enquiry without creating an account. <Link href="/cars">Browse cars</Link>.
      </p>
    </section>
  );
}
