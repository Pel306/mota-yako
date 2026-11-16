import Link from "next/link";

export default function TrustPage() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> / Trust &amp; Safety</div>
          <div className="eyebrow">Trust &amp; Safety</div>
          <h1>Buying and selling safely on Mota Yako</h1>
          <p className="muted">How verification, enquiries and payments should work — and what to do if something feels off.</p>
        </div>
      </section>

      <section className="section" id="kyc-verified">
        <div className="container split">
          <article className="panel">
            <h2>Seller verification</h2>
            <p className="muted">Seller verification is a planned marketplace step. The prototype does not collect or verify identity documents.</p>
            <ul className="price-list">
              <li><span className="price-check">✓</span> Confirm the seller&apos;s identity before publishing</li>
              <li><span className="price-check">✓</span> Confirm a phone number and the seller&apos;s authority to sell</li>
              <li><span className="price-check">✓</span> Verify a dealer as a registered business</li>
              <li><span className="price-check">✓</span> Use a verification badge only after checks are complete</li>
            </ul>
          </article>
          <article className="panel panel-surface">
            <h2>What badges should mean</h2>
            <p className="muted small">Sample listings use illustrative badges only; they do not prove a real identity check has occurred.</p>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="trust-item"><span className="trust-icon">✓</span><div><strong>Verified Seller</strong><span className="small">Individual verification complete.</span></div></div>
              <div className="trust-item"><span className="trust-icon">★</span><div><strong>Verified Dealer</strong><span className="small">Business and individual checks complete.</span></div></div>
              <div className="trust-item"><span className="trust-icon">P</span><div><strong>Featured plan</strong><span className="small">Paid placement is not a safety signal.</span></div></div>
            </div>
          </article>
        </div>
      </section>

      <section className="section" id="buyer-support" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="section-head"><div><div className="eyebrow">Buyer support</div><h2>If something doesn&apos;t feel right</h2></div></div>
          <div className="split">
            <article className="panel">
              <h3>Before you pay or transfer anything</h3>
              <ul className="price-list">
                <li><span className="price-check">✓</span> Meet in a public place or at the dealer&apos;s listed location</li>
                <li><span className="price-check">✓</span> Inspect the vehicle and confirm its registration matches the seller</li>
                <li><span className="price-check">✓</span> Never send a deposit before viewing the car in person</li>
                <li><span className="price-check">✓</span> Report suspicious listings to the support team</li>
              </ul>
            </article>
            <article className="panel">
              <h3>Get help</h3>
              <p className="muted">Contact the team if a seller or listing seems suspicious.</p>
              <a className="btn whatsapp btn-block" href="https://wa.me/263777183773?text=Hi%20Mota%20Yako%2C%20I%20need%20help%20with%20a%20listing.">Chat with support</a>
              <a className="btn btn-navy btn-block" style={{ marginTop: 10 }} href="mailto:support@motayako.co.zw">Email support@motayako.co.zw</a>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="safe-enquiries">
        <div className="container">
          <div className="section-head"><div><div className="eyebrow">Safe enquiries</div><h2>How enquiries work</h2></div></div>
          <div className="split">
            <article className="panel"><h3>On every listing</h3><p className="muted">Contact the seller directly, arrange an in-person viewing, and verify all documents. Mota Yako does not collect vehicle deposits on a seller&apos;s behalf.</p></article>
            <article className="panel">
              <h3>Red flags to watch for</h3>
              <ul className="price-list">
                <li><span className="price-check">✓</span> A seller who refuses to meet or show the vehicle</li>
                <li><span className="price-check">✓</span> Prices far below similar listings without a clear reason</li>
                <li><span className="price-check">✓</span> Requests for a deposit before viewing</li>
              </ul>
            </article>
          </div>
          <div className="notice" style={{ marginTop: 16 }}>
            See something wrong? <a href="https://wa.me/263777183773" style={{ color: "var(--orange-dark)", fontWeight: 700 }}>Report it to support</a> with the listing link so the team can review it.
          </div>
        </div>
      </section>
    </main>
  );
}
