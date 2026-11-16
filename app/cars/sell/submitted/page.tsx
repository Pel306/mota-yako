import Link from "next/link";

export const instant = false;

const plans = {
  basic: "Basic",
  featured: "Featured",
  dealer: "Dealer",
};

export default async function ListingSubmittedPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const planName = plan && plan in plans ? plans[plan as keyof typeof plans] : undefined;

  return (
    <main id="main">
      <section className="section" style={{ padding: "60px 0" }}>
        <div className="container" style={{ maxWidth: 680, textAlign: "center" }}>
          <div className="stepper" aria-label="Listing steps">
            {["Seller type", "Vehicle details", "Photos & documents", "Plan & payment", "Publish"].map((step, index) => (
              <div className={`step ${index === 4 ? "active" : ""}`} key={step}>{index + 1} · {step}</div>
            ))}
          </div>
          <div className="admin-stat" style={{ borderColor: "#DCF3E4", background: "#F3FBF6", margin: "18px auto 0", maxWidth: 120 }}>
            <div className="num" style={{ color: "#1E9E5A" }}>✓</div>
          </div>
          <h1 style={{ marginTop: 14 }}>Your listing was submitted for review.</h1>
          <p className="muted">
            {planName ? `You selected the ${planName} plan. ` : ""}
            The listing has been saved as pending review. This prototype does not process EcoCash payments or seller verification.
          </p>
          <div className="panel" style={{ textAlign: "left", marginTop: 22 }}>
            <h2>What happens next</h2>
            <ul className="price-list">
              <li><span className="price-check">✓</span> The team reviews your vehicle details and photos</li>
              <li><span className="price-check">✓</span> Seller identity and documents need to be verified in the secure seller flow</li>
              <li><span className="price-check">✓</span> Once approved, the listing can be published and made searchable</li>
              <li><span className="price-check">✓</span> No payment has been taken through this prototype</li>
            </ul>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
            <Link className="btn btn-primary" href="/cars">Browse other listings</Link>
            <Link className="btn btn-navy" href="/cars/sell">List another car</Link>
          </div>
          <p className="small muted" style={{ marginTop: 18 }}>
            Questions? <a href="https://wa.me/263777183773?text=Hi%20Mota%20Yako%2C%20I%20have%20a%20question%20about%20a%20listing." style={{ color: "var(--orange-dark)", fontWeight: 700 }}>Message us on WhatsApp</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
