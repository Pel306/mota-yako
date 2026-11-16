import { Suspense } from "react";
import Link from "next/link";
import { VehicleCard } from "@/components/marketplace/vehicle-card";
import { dealer, getPublishedVehicles, vehicles } from "@/lib/marketplace-data";

export default function DealersPage() {
  return (
    <Suspense fallback={<DealersLoading />}>
      <DealersPageContent />
    </Suspense>
  );
}

async function DealersPageContent() {
  const liveVehicles = await getPublishedVehicles();
  const dealerVehicles = [...liveVehicles, ...vehicles].filter((vehicle) => vehicle.sellerType === "dealer");
  const liveDealers = new Map<string, { name: string; id: string; vehicles: typeof liveVehicles }>();
  for (const vehicle of liveVehicles) {
    if (vehicle.sellerType !== "dealer" || !vehicle.sellerId) continue;
    const current = liveDealers.get(vehicle.sellerId);
    if (current) current.vehicles.push(vehicle);
    else liveDealers.set(vehicle.sellerId, { id: vehicle.sellerId, name: vehicle.sellerName, vehicles: [vehicle] });
  }
  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> / Dealers</div>
          <div className="eyebrow">Marketplace partners</div>
          <h1>Browse verified dealers</h1>
          <p className="muted">Explore dealer profiles and current stock from across Zimbabwe.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <article className="panel dealer-directory-card">
            <div className="seller-card">
              <div className="avatar">{dealer.initials}</div>
              <div>
                <h2>{dealer.name}</h2>
                <div className="verified"><span className="verified-dot">✓</span> Sample dealer profile</div>
                <p className="muted">{dealer.location} · ★ {dealer.rating} · {dealer.reviews} sample reviews</p>
              </div>
            </div>
            <p className="muted">{dealer.description}</p>
            <Link href={`/dealers/${dealer.slug}`} className="btn btn-navy">View dealer profile</Link>
          </article>
          {[...liveDealers.values()].map((item) => (
            <article className="panel dealer-directory-card" key={item.id} style={{ marginTop: 16 }}>
              <div className="seller-card">
                <div className="avatar">{item.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</div>
                <div>
                  <h2>{item.name}</h2>
                  <div className="verified"><span className="verified-dot">✓</span> Phone-verified dealer account</div>
                  <p className="muted">{item.vehicles.length} published vehicles</p>
                </div>
              </div>
              <Link href={`/dealers/${item.id}`} className="btn btn-navy">View dealer profile</Link>
            </article>
          ))}
          <div className="section-head" style={{ marginTop: 32 }}>
            <div><div className="eyebrow">Dealer stock</div><h2>Cars from our dealers</h2></div>
            <span className="muted small">{dealerVehicles.length} listings, including samples</span>
          </div>
          <div className="vehicle-grid">
            {dealerVehicles.slice(0, 4).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 18 }}>
            New dealer accounts show their published vehicles here. Sample dealer content remains for design review.
          </p>
        </div>
      </section>
    </main>
  );
}

function DealersLoading() {
  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> / Dealers</div>
          <div className="eyebrow">Marketplace partners</div>
          <h1>Browse verified dealers</h1>
          <p className="muted">Explore dealer profiles and current stock from across Zimbabwe.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <p role="status" className="muted">Loading dealer listings...</p>
        </div>
      </section>
    </main>
  );
}
