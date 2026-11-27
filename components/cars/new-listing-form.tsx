"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createCarListing } from "@/app/actions/cars";

type SellerType = "dealer" | "private";
type Plan = "basic" | "featured" | "dealer";

interface NewListingFormProps {
  seller: SellerType;
  initialPlan: Plan;
}

interface UploadResponse {
  publicUrl: string;
}

const plans: { id: Plan; name: string; price: number; details: string; sellers: SellerType[] }[] = [
  { id: "basic", name: "Basic", price: 5, details: "30 days · 3 photos", sellers: ["private"] },
  { id: "featured", name: "Featured", price: 15, details: "60 days · 8 photos · priority", sellers: ["private", "dealer"] },
  { id: "dealer", name: "Dealer", price: 25, details: "5 vehicles · homepage slot", sellers: ["dealer"] },
];

function isUploadResponse(value: unknown): value is UploadResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "publicUrl" in value &&
    typeof value.publicUrl === "string"
  );
}

export function NewListingForm({ seller, initialPlan }: NewListingFormProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const selectedPlan = plans.find((item) => item.id === plan) ?? plans[1];
  const maxPhotos = plan === "basic" ? 3 : 8;

  function handleImageSelection(files: FileList | null) {
    const selected = Array.from(files ?? []);
    const invalidFile = selected.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
    );

    if (selected.length > maxPhotos) {
      setErrorMessage(`The ${selectedPlan.name} plan allows up to ${maxPhotos} photos.`);
      return;
    }
    if (invalidFile) {
      setErrorMessage("Photos must be JPG, PNG or WebP files no larger than 10 MB each.");
      return;
    }

    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setImages(selected);
    setPreviews(selected.map((file) => URL.createObjectURL(file)));
    setErrorMessage(null);
  }

  function removeImage(index: number) {
    const nextImages = images.filter((_, imageIndex) => imageIndex !== index);
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setImages(nextImages);
    setPreviews(nextImages.map((file) => URL.createObjectURL(file)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (images.length === 0) {
      setErrorMessage("Add at least one clear vehicle photo before submitting.");
      return;
    }
    if (images.length > maxPhotos) {
      setErrorMessage(`The ${selectedPlan.name} plan allows up to ${maxPhotos} photos.`);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const value = (name: string) => {
      const field = formData.get(name);
      return typeof field === "string" ? field.trim() : "";
    };

    const uploadedImageUrls: string[] = [];
    let listingSaved = false;
    try {
      for (const file of images) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (!response.ok) {
          const errorPayload: unknown = await response.json();
          const message =
            typeof errorPayload === "object" &&
            errorPayload !== null &&
            "error" in errorPayload &&
            typeof errorPayload.error === "string"
              ? errorPayload.error
              : `Could not prepare an upload for ${file.name}.`;
          throw new Error(message);
        }

        const payload: unknown = await response.json();
        if (!isUploadResponse(payload)) {
          throw new Error(`The upload service returned an invalid response for ${file.name}.`);
        }

        uploadedImageUrls.push(payload.publicUrl);
      }

      const make = value("make");
      const model = value("model");
      const listingId = await createCarListing({
        title: `${value("year")} ${make} ${model}`,
        make,
        model,
        year: Number(value("year")),
        price: value("price"),
        mileage: Number(value("mileage")),
        transmission: value("transmission"),
        fuelType: value("fuelType"),
        bodyType: value("bodyType"),
        description: value("description"),
        location: value("location"),
        vin: value("vin"),
        duty: value("duty"),
        documents: formData.getAll("documents").filter((document): document is string => typeof document === "string"),
        plan,
        images: uploadedImageUrls,
      });

      listingSaved = true;
      router.push(`/cars/sell/submitted?plan=${plan}&listing=${listingId}`);
      router.refresh();
    } catch (error) {
      console.error("Could not submit car listing", error);
      if (!listingSaved && uploadedImageUrls.length > 0) {
        try {
          const cleanup = await fetch("/api/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: uploadedImageUrls }),
          });
          if (!cleanup.ok) console.error("Some unsubmitted vehicle photos could not be removed from storage.");
        } catch (cleanupError) {
          console.error("Could not clean up unsubmitted vehicle photos", cleanupError);
        }
      }
      setErrorMessage(
        error instanceof Error ? error.message : "We could not submit your listing. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> / <Link href="/cars/sell">Sell Your Car</Link> / New Listing</div>
          <div className="eyebrow">Step 2–5 · New listing</div>
          <h1>Create your listing</h1>
          <p className="muted">Add vehicle details and photos, then submit your listing for review.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="stepper" aria-label="Listing steps">
            {["Seller type", "Vehicle details", "Photos & documents", "Plan & payment", "Publish"].map((step, index) => (
              <div className={`step ${index > 0 && index < 4 ? "active" : ""}`} key={step}>{index + 1} · {step}</div>
            ))}
          </div>

          <form className="split listing-form" onSubmit={handleSubmit}>
            <div>
              <section className="panel" style={{ marginBottom: 16 }}>
                <h2>Vehicle details</h2>
                <p className="muted small">This information appears on your public listing card and detail page.</p>
                <div className="form-grid" style={{ marginTop: 14 }}>
                  <div className="field">
                    <label htmlFor="v-make">Make</label>
                    <select id="v-make" name="make" required defaultValue="">
                      <option value="">Select make</option>
                      {["Toyota", "Honda", "Mazda", "Nissan", "Mercedes-Benz", "Suzuki", "Ford", "Isuzu"].map((make) => <option key={make}>{make}</option>)}
                    </select>
                  </div>
                  <div className="field"><label htmlFor="v-model">Model</label><input id="v-model" name="model" placeholder="e.g. Fortuner 2.8 GD-6" required /></div>
                  <div className="field"><label htmlFor="v-year">Year</label><input id="v-year" name="year" type="number" min="1960" max={new Date().getFullYear()} defaultValue="2020" required /></div>
                  <div className="field"><label htmlFor="v-mileage">Mileage (km)</label><input id="v-mileage" name="mileage" type="number" min="0" placeholder="e.g. 62000" required /></div>
                  <div className="field">
                    <label htmlFor="v-transmission">Transmission</label>
                    <select id="v-transmission" name="transmission" defaultValue="Automatic">
                      {["Automatic", "Manual", "CVT"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="v-fuel">Fuel type</label>
                    <select id="v-fuel" name="fuelType" defaultValue="Petrol">
                      {["Petrol", "Diesel", "Hybrid", "Electric"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="field"><label htmlFor="v-price">Asking price (USD)</label><input id="v-price" name="price" type="number" min="1" step="0.01" placeholder="e.g. 18500" required /></div>
                  <div className="field">
                    <label htmlFor="v-body">Body type</label>
                    <select id="v-body" name="bodyType" defaultValue="SUV">
                      {["SUV", "Sedan", "Hatchback", "Pickup", "Truck"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="v-location">Location</label>
                    <select id="v-location" name="location" defaultValue="Harare">
                      {["Harare", "Bulawayo", "Mutare", "Gweru", "Kwekwe", "Masvingo"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="field"><label htmlFor="v-vin">VIN / Chassis number</label><input id="v-vin" name="vin" placeholder="VIN or chassis number (optional)" /></div>
                  <div className="field">
                    <label htmlFor="v-duty">Duty status</label>
                    <select id="v-duty" name="duty" defaultValue="">
                      <option value="">Select duty status</option>
                      <option value="paid">Duty paid</option>
                      <option value="unpaid">Duty unpaid</option>
                    </select>
                  </div>
                  <div className="field field-full">
                    <label htmlFor="v-desc">Description</label>
                    <textarea id="v-desc" name="description" placeholder="Service history, condition, extras, reason for selling…" />
                  </div>
                </div>
                <p className="small muted" style={{ marginTop: 10 }}>
                  Vehicle location, VIN/chassis, duty status and document details are saved with your listing.
                </p>
              </section>

              <section className="panel" style={{ marginBottom: 16 }}>
                <h2>Documents held</h2>
                <p className="muted small">Select every document you can produce for the buyer.</p>
                <div className="doc-checklist" style={{ marginTop: 12 }}>
                  {[
                    ["book-of-life", "Book of life (registration)"],
                    ["zinara-plate", "ZINARA / RTSA number plate"],
                    ["roadworthy", "Roadworthy certificate"],
                    ["insurance", "Valid insurance"],
                  ].map(([value, label], index) => (
                    <label className={`doc-item ${index < 2 ? "held" : "missing"}`} key={value}>
                      <input type="checkbox" name="documents" value={value} defaultChecked={index < 2} />
                      {label}
                    </label>
                  ))}
                </div>
                <p className="small muted" style={{ marginTop: 10 }}>These are seller-provided details and are not a substitute for in-person document checks.</p>
              </section>

              <section className="panel">
                <h2>Photos</h2>
                <p className="muted small">Clear exterior, interior, engine bay and odometer photos help buyers assess a car.</p>
                <label className="upload-zone" style={{ display: "block", marginTop: 14, cursor: "pointer" }}>
                  <strong>Drag photos here, or tap to choose files</strong>
                  Up to {maxPhotos} photos · JPG, PNG or WebP · 10 MB max each
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(event) => handleImageSelection(event.target.files)}
                    style={{ marginTop: 12 }}
                    aria-label="Choose vehicle photos"
                  />
                </label>
                {previews.length > 0 && (
                  <div className="upload-thumbs" aria-live="polite">
                    {previews.map((preview, index) => (
                      <div className="upload-thumb listing-preview" key={preview}>
                        <Image src={preview} alt={`Vehicle photo ${index + 1}`} width={240} height={180} unoptimized />
                        <button type="button" onClick={() => removeImage(index)} aria-label={`Remove photo ${index + 1}`}>×</button>
                      </div>
                    ))}
                    <div className="upload-thumb add">{images.length} / {maxPhotos}</div>
                  </div>
                )}
              </section>
            </div>

            <aside>
              <section className="panel" style={{ marginBottom: 16 }}>
                <h2>Seller contact</h2>
                <p className="muted small">Buyer enquiries will be sent to your verified account phone.</p>
                <div className="notice" style={{ marginTop: 12 }}>
                  {seller === "dealer" ? "Dealer" : "Private seller"} account · phone verified
                </div>
                <div className="notice" style={{ marginTop: 12 }}>
                  Do not upload identity documents here. Phone verification is not a full identity or business check.
                </div>
              </section>

              <section className="panel" style={{ marginBottom: 16 }}>
                <h2>Choose your plan</h2>
                <p className="small muted" style={{ marginTop: 2 }}>
                  Showing options for {seller === "dealer" ? "dealers" : "private sellers"}.
                </p>
                <div className="plan-select-grid" style={{ marginTop: 12 }}>
                  {plans.map((item) => {
                    const available = item.sellers.includes(seller);
                    return (
                      <label className={`plan-select ${available ? "" : "locked"}`} key={item.id}>
                        <input
                          type="radio"
                          name="plan"
                          value={item.id}
                          checked={plan === item.id}
                          disabled={!available}
                          onChange={() => setPlan(item.id)}
                        />
                        <span>
                          <span className="name">{item.name}</span><span className="price">${item.price}</span><br />
                          <span className="small muted">{item.details}</span>
                          {!available && <><br /><span className="plan-lock-tag">Not available for this seller type</span></>}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="small muted" style={{ marginTop: 10 }}>
                  <Link href="/cars/sell#seller-type">Compare plans</Link> or <a href="https://wa.me/263777183773">ask on WhatsApp</a>.
                </p>
              </section>

              <section className="panel">
                <h2>Review &amp; payment</h2>
                <p className="muted small">This page does not start EcoCash checkout or charge a fee.</p>
                <div className="pay-summary" style={{ marginTop: 14 }}>
                  <div className="pay-summary-row"><span>Selected plan</span><span>{selectedPlan.name}</span></div>
                  <div className="pay-summary-row"><span>Listed price</span><span>${selectedPlan.price.toFixed(2)} (guide)</span></div>
                  <div className="pay-summary-row total"><span>Due now</span><span>$0.00</span></div>
                </div>
                <p className="small muted" style={{ marginTop: 10 }}>
                  Submitting saves the vehicle as pending review. Payment and identity verification are not enabled.
                </p>
                {errorMessage && <p role="alert" className="notice listing-error">{errorMessage}</p>}
                <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Uploading photos & submitting…" : "Submit listing for review"}
                </button>
                <p className="small muted" style={{ marginTop: 10, textAlign: "center" }}>
                  By submitting you agree to the <Link href="/terms">listing terms</Link> and <Link href="/trust#kyc-verified">verification requirements</Link>.
                </p>
              </section>
            </aside>
          </form>
        </div>
      </section>
    </main>
  );
}
