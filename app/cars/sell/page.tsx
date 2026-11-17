import Link from "next/link";

const plans = [
  {
    name: "Basic Plan",
    price: "$3",
    unit: "/listing",
    items: ["Live for 30 days", "Up to 3 photos", "WhatsApp contact button"],
    tier: "private",
    plan: "basic",
  },
  {
    name: "Featured Plan",
    price: "$7",
    unit: "/listing",
    items: ["Live for 60 days", "Up to 8 photos", "Priority placement in search"],
    tier: "private",
    plan: "featured",
    featured: true,
  },
  {
    name: "Dealer Plan",
    price: "$25",
    unit: "/bundle",
    items: ["List up to 5 vehicles", "Live for 60 days each", "Homepage feature slot + dealer badge"],
    tier: "dealer",
    plan: "dealer",
  },
];

export default function SellCarPage() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> / Sell Your Car</div>
          <div className="eyebrow">Seller onboarding</div>
          <h1>List your car on Mota Yako</h1>
          <p className="muted">Choose a seller path, share your vehicle details and photos, then prepare your listing for review.</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="eyebrow">Trusted by sellers across Zimbabwe</div>
          <div className="stat-cards-grid" style={{ marginTop: 14 }}>
            <div className="stat-card"><div className="num">512</div><div className="label">Cars sold</div></div>
            <div className="stat-card"><div className="num">132</div><div className="label">Verified sellers</div></div>
            <div className="stat-card"><div className="num">10</div><div className="label">Cities covered</div></div>
            <div className="stat-card"><div className="num">6</div><div className="label">Avg. days to sell</div></div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="section-head">
            <div><div className="eyebrow">Browse first</div><h2>See what buyers are searching for</h2><p className="muted">Check listings in your car&apos;s category before you price it.</p></div>
            <Link className="btn btn-navy" href="/cars">View all cars</Link>
          </div>
          <div className="category-grid">
            {[
              ["SUVs", "SUV"],
              ["Sedans", "Sedan"],
              ["Hatchbacks", "Hatchback"],
              ["Pickups & 4x4", "Pickup"],
            ].map(([label, value]) => (
              <Link className="category" href={`/cars?bodyType=${value}`} key={value}>{label}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="seller-type">
        <div className="container">
          <div className="stepper" aria-label="Listing steps">
            {["Seller type", "Vehicle details", "Photos & documents", "Verification", "Publish"].map((step, index) => (
              <div className={`step ${index === 0 ? "active" : ""}`} key={step}>{index + 1} · {step}</div>
            ))}
          </div>
          <div className="sell-options">
            <article className="sell-option">
              <div className="option-icon">DEALER</div>
              <h2>I&apos;m a dealer</h2>
              <p className="muted">Create a dealer inventory listing flow for multiple vehicles.</p>
              <ul className="small">
                <li>Dealer profile and rating</li>
                <li>Business verification step</li>
                <li>Inventory presentation</li>
              </ul>
              <Link className="btn btn-primary btn-block" href="/cars/sell/new?seller=dealer&plan=dealer">Continue as dealer</Link>
            </article>
            <article className="sell-option">
              <div className="option-icon">PRIVATE</div>
              <h2>I&apos;m a private seller</h2>
              <p className="muted">List one vehicle as an individual seller and prepare it for review.</p>
              <ul className="small">
                <li>Individual verification step</li>
                <li>Vehicle details and photos</li>
                <li>Buyer enquiry handling</li>
              </ul>
              <Link className="btn btn-navy btn-block" href="/cars/sell/new?seller=private&plan=featured">Continue as private seller</Link>
            </article>
          </div>
          <div className="notice" style={{ marginTop: 18 }}>
            Seller verification and online payments are not connected in this prototype. Do not upload identity documents or send a payment through this demo.
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="eyebrow">Listing fees</div>
          <h2>One-time fee per listing</h2>
          <p className="muted" style={{ maxWidth: 520 }}>
            Plan options are included from the design guide. Checkout is a visual prototype and no fee is charged here.
          </p>
          <div className="pricing-grid">
            {plans.map((plan) => (
              <article className={`price-card ${plan.featured ? "featured" : ""}`} key={plan.plan}>
                {plan.featured && <span className="tag">Most Popular</span>}
                <h3>{plan.name}</h3>
                <div className="amount">{plan.price}<span>{plan.unit}</span></div>
                <ul className="price-list">
                  {plan.items.map((item) => <li key={item}><span className="price-check">✓</span>{item}</li>)}
                </ul>
                <Link
                  className={`btn ${plan.featured ? "btn-primary" : "btn-navy"} btn-block`}
                  href={`/cars/sell/new?seller=${plan.tier}&plan=${plan.plan}`}
                >
                  Choose {plan.name.replace(" Plan", "")}
                </Link>
                {plan.tier === "dealer" && <p className="small muted" style={{ marginTop: 10 }}>Dealer plans require business verification.</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band cta-whatsapp">
        <div className="container split">
          <div><div className="eyebrow">Still deciding?</div><h2>Not sure which plan fits your car?</h2><p>Message our team and we&apos;ll help you choose the right listing path.</p></div>
          <a className="btn btn-navy" href="https://wa.me/263777183773?text=Hi%20Mota%20Yako%2C%20I%20need%20help%20choosing%20a%20listing%20plan.">Chat on WhatsApp</a>
        </div>
      </section>
    </main>
  );
}
