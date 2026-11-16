import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { PhotoGallery } from "@/components/marketplace/photo-gallery";
import { VehicleCard } from "@/components/marketplace/vehicle-card";
import { EnquiryForm } from "@/components/marketplace/enquiry-form";
import { getDatabaseVehicle, getPublishedVehicle, getPublishedVehicles, getVehicle, vehicles } from "@/lib/marketplace-data";

export const instant = false;

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let car = getVehicle(id) ?? await getPublishedVehicle(id);
  if (!car) {
    const admin = await getAdminSession();
    if (admin && !admin.mustChangePassword) car = await getDatabaseVehicle(id);
  }

  if (!car) notFound();

  const liveVehicles = await getPublishedVehicles();
  const similarVehicles = [...liveVehicles, ...vehicles].filter(
    (vehicle) => vehicle.id !== car.id && vehicle.bodyType === car.bodyType
  ).slice(0, 3);
  const isSample = car.sample !== false;
  const waLink = `https://wa.me/263777183773?text=${encodeURIComponent(
    `Hi Mota Yako, I am interested in the ${car.title} listing.`
  )}`;

  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <Link href="/cars">Find Cars</Link> / {car.title}
          </div>
          <div className="eyebrow">Verified listing · sample</div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="detail-top">
            <PhotoGallery src={car.image} images={car.images ?? [car.image]} alt={car.title} />
            <div>
              <span className="verified"><span className="verified-dot">✓</span> {isSample ? "Sample listing" : "Phone-verified seller"}</span>
              <h1 className="detail-title">{car.title}</h1>
              <p className="muted">{car.year} · {car.mileage.toLocaleString("en-US")} km · {car.transmission} · {car.fuel} · {car.location}</p>
              <div className="detail-price">${car.price.toLocaleString("en-US")}</div>
              {car.deal && <div className={`deal-meter deal-${car.deal}`} style={{ margin: "12px 0" }}>
                <span className="deal-meter-icon">{car.deal === "great" ? "✓" : car.deal === "fair" ? "≈" : "!"}</span>
                <div>
                  <strong>{car.deal === "great" ? "Great Deal" : car.deal === "fair" ? "Fair Price" : "High Price"}</strong>
                  <div className="small muted">Illustrative price indicator for the reference design.</div>
                </div>
              </div>}
              <div className="detail-actions">
                {isSample && <a className="btn whatsapp" href={waLink} target="_blank" rel="noopener noreferrer">WhatsApp about this car</a>}
                <a className="btn btn-primary" href="#seller">{isSample ? "Seller information" : "Send enquiry"}</a>
              </div>
              <div className="panel panel-surface" style={{ marginTop: 16 }}>
                <div className="seller-card">
                  <div className="avatar">{car.sellerInitials}</div>
                  <div>
                    <strong>{car.sellerName}</strong>
                    <div className="verified"><span className="verified-dot">✓</span> {isSample ? car.sellerType === "dealer" ? "Sample dealer" : "Sample seller" : "Phone verified"}</div>
                    {isSample && car.sellerType === "dealer" ? (
                      <div className="rating">★ 4.8 · 32 reviews (sample)</div>
                    ) : isSample ? (
                      <div className="rating">Identity status shown as a design placeholder</div>
                    ) : null}
                    {car.sellerType === "dealer" && isSample && <Link className="small" href="/dealers/harare-auto-hub">View dealer profile →</Link>}
                    {car.sellerType === "dealer" && !isSample && car.sellerId && <Link className="small" href={`/dealers/${car.sellerId}`}>View dealer profile →</Link>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="split" style={{ marginTop: 28 }}>
            <div>
              <section className="panel" style={{ marginBottom: 16 }}>
                <h2>Vehicle specifications</h2>
                <table className="spec-table">
                  <tbody>
                    <tr><th>Make</th><td>{car.make}</td></tr>
                    <tr><th>Model</th><td>{car.model}</td></tr>
                    <tr><th>Year</th><td>{car.year}</td></tr>
                    <tr><th>Mileage</th><td>{car.mileage.toLocaleString("en-US")} km</td></tr>
                    <tr><th>Transmission</th><td>{car.transmission}</td></tr>
                    <tr><th>Fuel</th><td>{car.fuel}</td></tr>
                    <tr><th>Body type</th><td>{car.bodyType}</td></tr>
                    <tr><th>Location</th><td>{car.location}, Zimbabwe</td></tr>
                    <tr><th>Duty status</th><td><span className={`badge ${car.duty === "paid" ? "badge-duty-paid" : "badge-duty-unpaid"}`} style={{ position: "static", display: "inline-block" }}>DUTY {car.duty.toUpperCase()}</span></td></tr>
                    {car.vin && <tr><th>VIN / Chassis</th><td className="vin-row">{isSample ? car.vin : `${car.vin.slice(0, 4)}••••••••`} <span className="small muted">{isSample ? "sample only" : "partially hidden"}</span></td></tr>}
                  </tbody>
                </table>
              </section>
              <section className="panel" style={{ marginBottom: 16 }}>
                <h2>Documents held</h2>
                <p className="muted small">Document information is supplied by the sample seller and must be checked in person.</p>
                <div className="doc-checklist" style={{ marginTop: 12 }}>
                  {["Book of life (registration)", "ZINARA / RTSA number plate", "Roadworthy certificate", "Valid insurance"].map((document) => {
                    const held = car.documents.includes(document);
                    return (
                      <div className={`doc-item ${held ? "held" : "missing"}`} key={document}>
                        <span className="doc-dot" />{document}
                      </div>
                    );
                  })}
                </div>
              </section>
              <section className="panel">
                <h2>Features</h2>
                <div className="specs" style={{ marginTop: 10, gap: 8 }}>
                  {car.features.map((feature) => <span className="spec" key={feature}>{feature}</span>)}
                </div>
              </section>
            </div>
            <aside className="panel panel-surface" id="seller">
              <h2>Seller&apos;s notes</h2>
              <p className="muted">{car.description}</p>
              <div className="notice" style={{ marginTop: 16 }}>
                {isSample
                  ? "Sample listing for design review. Inspect the vehicle, verify ownership and documents, and meet safely before paying."
                  : "Seller-provided details are not independently verified. Inspect the vehicle and documents in person before paying."}
              </div>
              {isSample ? (
                <a className="btn whatsapp btn-block" style={{ marginTop: 16 }} href={waLink} target="_blank" rel="noopener noreferrer">
                  Ask Mota Yako about this car
                </a>
              ) : car.status === "available" ? <EnquiryForm carId={car.id} /> : <p className="small muted">This listing is not public yet.</p>}
              <Link className="btn btn-navy btn-block" style={{ marginTop: 10 }} href="/trust">
                Read safe-enquiry guidance
              </Link>
            </aside>
          </div>
        </div>
      </section>
      {similarVehicles.length > 0 && (
        <section className="section section-sm">
          <div className="container">
            <div className="section-head"><div><div className="eyebrow">You may also like</div><h2>Similar listings</h2></div></div>
            <div className="vehicle-grid">
              {similarVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
