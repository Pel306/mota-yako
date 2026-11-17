import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleCard } from "@/components/marketplace/vehicle-card";
import { dealer, getPublishedVehicles, vehicles } from "@/lib/marketplace-data";

export const instant = false;

export default async function DealerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const liveVehicles = await getPublishedVehicles();
  if (slug === dealer.slug) {
    const dealerVehicles = vehicles.filter((vehicle) => vehicle.sellerType === "dealer" && vehicle.sellerName === dealer.name);
    return (
      <main id="main">
        <section className="hero hero-simple">
          <div className="container">
            <div className="breadcrumb"><Link href="/">Home</Link> / <Link href="/dealers">Dealers</Link> / {dealer.name}</div>
            <div className="eyebrow" style={{ color: "var(--orange-light)" }}>Sample dealer profile</div>
            <h1>{dealer.name}</h1>
            <p>{dealer.location} · sample dealer account</p>
            <p>{dealer.description}</p>
          </div>
        </section>
        <section className="section"><div className="container">
          <div className="vehicle-grid">{dealerVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
        </div></section>
      </main>
    );
  }

  const dealerVehicles = liveVehicles.filter((vehicle) => vehicle.sellerId === slug && vehicle.sellerType === "dealer");
  const profile = dealerVehicles[0];
  if (!profile) notFound();

  return (
    <main id="main">
      <section className="hero hero-simple">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> / <Link href="/dealers">Dealers</Link> / {profile.sellerName}</div>
          <div className="eyebrow" style={{ color: "var(--orange-light)" }}>Phone-verified dealer account</div>
          <h1>{profile.sellerName}</h1>
          <p>{dealerVehicles.length} published vehicles · seller phone verification is not business KYC.</p>
        </div>
      </section>
      <section className="section"><div className="container">
        <div className="section-head"><div><div className="eyebrow">Current stock</div><h2>Published vehicles</h2></div></div>
        <div className="vehicle-grid">{dealerVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
      </div></section>
    </main>
  );
}
