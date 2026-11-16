import Link from "next/link";

export default function TermsPage() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> / Terms &amp; Privacy</div>
          <div className="eyebrow">Legal</div>
          <h1>Listing terms &amp; privacy summary</h1>
          <p className="muted">A plain-language starting point for buyers and sellers. Have a Zimbabwe-qualified lawyer review final terms before launch.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <article className="panel" style={{ marginBottom: 16 }}>
            <h2>Listing terms</h2>
            <ul className="price-list">
              <li><span className="price-check">✓</span> You must own or be authorised to sell any vehicle you list</li>
              <li><span className="price-check">✓</span> Photos and descriptions must accurately represent the vehicle</li>
              <li><span className="price-check">✓</span> Listings may be reviewed or removed if details are misleading</li>
              <li><span className="price-check">✓</span> Buyers should inspect vehicles and documents before purchase</li>
              <li><span className="price-check">✓</span> Listing plans shown in this prototype are samples; no payment is processed</li>
            </ul>
          </article>
          <article className="panel" style={{ marginBottom: 16 }}>
            <h2>Privacy summary</h2>
            <ul className="price-list">
              <li><span className="price-check">✓</span> Do not submit sensitive identity documents through this prototype</li>
              <li><span className="price-check">✓</span> Contact details are shown only as needed for a listing enquiry</li>
              <li><span className="price-check">✓</span> Payment is not connected and payment credentials are not requested</li>
              <li><span className="price-check">✓</span> Contact support to ask about listing data or privacy questions</li>
            </ul>
          </article>
          <div className="notice"><strong>Draft notice:</strong> These terms are placeholder content for design review and are not legal advice.</div>
        </div>
      </section>
    </main>
  );
}
