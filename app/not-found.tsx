import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="section">
      <div className="container" style={{ textAlign: "center", maxWidth: 680 }}>
        <div className="eyebrow">404 · Page not found</div>
        <h1>That page isn&apos;t in the marketplace.</h1>
        <p className="muted">The link may be out of date, or the vehicle listing may no longer be available.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          <Link className="btn btn-primary" href="/cars">Browse cars</Link>
          <Link className="btn btn-navy" href="/">Return home</Link>
        </div>
      </div>
    </main>
  );
}
