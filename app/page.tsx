import { Suspense } from "react";
import Link from "next/link";
import { CarFront } from "lucide-react";
import { AnimatedSection } from "@/components/animations";
import { VehicleCard } from "@/components/marketplace/vehicle-card";
import { getPublishedVehicles, vehicles } from "@/lib/marketplace-data";

const makes = ["Toyota", "Honda", "Mazda", "Nissan", "Mercedes-Benz", "Suzuki", "Ford", "Isuzu"];
const categories = [
  { label: "SUVs", value: "SUV", icon: "suv" },
  { label: "Sedans", value: "Sedan", icon: "sedan" },
  { label: "Hatchbacks", value: "Hatchback", icon: "hatchback" },
  { label: "Pickups & 4x4", value: "Pickup", icon: "pickup" },
];

export default function HomePage() {
  return (
    <main id="main">
      <section className="hero">
        <div className="container hero-inner">
          <AnimatedSection><div className="eyebrow">Verified vehicles · Zimbabwe</div></AnimatedSection>
          <AnimatedSection delay={0.08}><h1>Find your next car with confidence.</h1></AnimatedSection>
          <AnimatedSection delay={0.18}>
            <p>
              Search vehicle listings from phone-verified sellers across Zimbabwe. Prices are
              shown in USD.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.28}>
          <form action="/cars" className="search-panel">
            <div className="search-grid">
              <div className="field">
                <label htmlFor="home-make">Make</label>
                <select id="home-make" name="make" defaultValue="">
                  <option value="">Any make</option>
                  {makes.map((make) => <option key={make}>{make}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="home-model">Model</label>
                <input id="home-model" name="model" placeholder="e.g. Corolla" />
              </div>
              <div className="field">
                <label htmlFor="home-year">Year</label>
                <select id="home-year" name="minYear" defaultValue="">
                  <option value="">Any year</option>
                  {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="home-price">Max price</label>
                <select id="home-price" name="maxPrice" defaultValue="">
                  <option value="">No limit</option>
                  {[10000, 20000, 30000, 40000].map((price) => (
                    <option key={price} value={price}>${price.toLocaleString("en-US")}</option>
                  ))}
                </select>
              </div>
              <div className="search-submit">
                <button className="btn btn-primary btn-block" type="submit">Search cars</button>
              </div>
            </div>
          </form>
          </AnimatedSection>
        </div>
        <div className="stat-strip">
          <div className="container stat-grid">
            <div className="stat-item"><div className="stat-num">1,240<span>+</span></div><div className="stat-label">Verified listings</div></div>
            <div className="stat-item"><div className="stat-num">18</div><div className="stat-label">Trusted dealers</div></div>
            <div className="stat-item"><div className="stat-num">10</div><div className="stat-label">Cities covered</div></div>
            <div className="stat-item"><div className="stat-num">24<span>/7</span></div><div className="stat-label">WhatsApp support</div></div>
          </div>
        </div>
      </section>

      <section className="make-strip" aria-label="Browse by make">
        <div className="container">
          <div className="make-scroll">
            {makes.map((make) => (
              <Link key={make} className="make-chip" href={`/cars?make=${encodeURIComponent(make)}`}>
                {make}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div className="trust-item"><span className="trust-icon">✓</span><div><strong>KYC verified</strong><span className="small">Seller identity checks built into the marketplace.</span></div></div>
          <div className="trust-item"><span className="trust-icon">★</span><div><strong>Trusted dealers</strong><span className="small">Dealer profiles and ratings shown beside listings.</span></div></div>
          <div className="trust-item"><span className="trust-icon">W</span><div><strong>WhatsApp support</strong><span className="small">Chat with our team on +263 777 183 773.</span></div></div>
          <div className="trust-item"><span className="trust-icon">$</span><div><strong>USD pricing</strong><span className="small">Clear, consistent vehicle prices in USD.</span></div></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><div className="eyebrow">Browse</div><h2>Shop by category</h2></div>
            <Link className="btn btn-navy" href="/cars">View all cars</Link>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <AnimatedSection key={category.value} delay={index * 0.06}>
                <Link className="category" href={`/cars?bodyType=${encodeURIComponent(category.value)}`}>
                  <span className="category-icon"><CarFront aria-hidden="true" /></span>
                  {category.label}
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={<FeaturedListings listings={vehicles.slice(0, 6)} />}>
        <DatabaseFeaturedListings />
      </Suspense>

      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container trust-grid">
          <AnimatedSection>
            <div className="eyebrow">Buying with confidence</div>
            <h2>Made for Zimbabwe&apos;s car market.</h2>
            <p className="muted">
              Review vehicle details, duty status and seller information, then arrange a safe
              in-person viewing before you buy.
            </p>
            <Link href="/trust" className="btn btn-navy">Read trust &amp; safety</Link>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="panel">
              <h3>Buying or selling?</h3>
              <p className="muted">Our marketplace keeps vehicle information and seller contact details together.</p>
              <div className="detail-actions">
                <Link href="/dealers" className="btn btn-navy">Browse dealers</Link>
                <Link href="/cars/sell" className="btn btn-primary">List your car</Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="cta-band">
        <div className="container split">
          <div>
            <div className="eyebrow">Ready to sell?</div>
            <h2>List your car and connect with serious buyers.</h2>
            <p>Choose a dealer or private-seller path and start your listing.</p>
          </div>
          <div><Link className="btn btn-navy btn-block" href="/cars/sell">Start listing your car</Link></div>
        </div>
      </section>
    </main>
  );
}

async function DatabaseFeaturedListings() {
  const listings = [...await getPublishedVehicles(6), ...vehicles].slice(0, 6);
  return <FeaturedListings listings={listings} />;
}

function FeaturedListings({ listings }: { listings: typeof vehicles }) {
  return (
    <section className="section section-sm">
      <div className="container">
        <div className="section-head">
          <div><div className="eyebrow">Fresh stock</div><h2>Featured listings</h2></div>
          <span className="muted small">Verified marketplace inventory</span>
        </div>
        <div className="vehicle-grid">
          {listings.map((vehicle) => (
            <AnimatedSection key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
            </AnimatedSection>
          ))}
        </div>
        <div className="section-head" style={{ justifyContent: "center", margin: "24px 0 0" }}>
          <Link className="btn btn-navy" href="/cars">Browse all vehicles</Link>
        </div>
      </div>
    </section>
  );
}
