"use client";

import { useState } from "react";
import { createBuyerEnquiry } from "@/app/actions/cars";

export function EnquiryForm({ carId }: { carId: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await createBuyerEnquiry({
        carId,
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      setMessage("Your enquiry was sent to the seller.");
      event.currentTarget.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not send your enquiry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={submit} style={{ marginTop: 16 }}>
      <div className="field field-full">
        <label htmlFor="buyer-name">Your name</label>
        <input id="buyer-name" name="name" autoComplete="name" minLength={2} maxLength={120} required />
      </div>
      <div className="field field-full">
        <label htmlFor="buyer-phone">Mobile number</label>
        <input id="buyer-phone" name="phone" type="tel" autoComplete="tel" placeholder="+263 77 123 4567" required />
      </div>
      <div className="field field-full">
        <label htmlFor="buyer-email">Email (optional)</label>
        <input id="buyer-email" name="email" type="email" autoComplete="email" maxLength={254} />
      </div>
      <div className="field field-full">
        <label htmlFor="buyer-message">Message to seller</label>
        <textarea id="buyer-message" name="message" minLength={10} maxLength={2000} required placeholder="Ask a question or request a viewing…" />
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Send enquiry"}</button>
      {message && <p className="notice" role="status">{message}</p>}
      {error && <p className="notice" role="alert">{error}</p>}
      <p className="small muted field-full">Your contact details are shared with this listing&apos;s seller so they can reply. We do not request payment details here.</p>
    </form>
  );
}
