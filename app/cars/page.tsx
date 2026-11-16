import { Suspense } from "react";
import Link from "next/link";
import { VehicleCard } from "@/components/marketplace/vehicle-card";
import { getPublishedVehicles, vehicles } from "@/lib/marketplace-data";

type SearchFilters = {
  make?: string;
  model?: string;
  minPrice?: string;
  maxPrice?: string;
  price?: string;
  minYear?: string;
  year?: string;
  bodyType?: string;
  location?: string;
  transmission?: string;
  duty?: string;
  sort?: string;
};

interface PageProps {
  searchParams: Promise<SearchFilters>;
}

export default function CarsPage({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <main className="container section">
          <h1>Find cars in Zimbabwe</h1>
          <p role="status" className="muted">Loading vehicle listings…</p>
        </main>
      }
    >
      <CarsPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CarsPageContent({ searchParams }: PageProps) {
  const filters = await searchParams;
  const allVehicles = [...await getPublishedVehicles(), ...vehicles];
  const maxPrice = filters.maxPrice || filters.price;
  const minimumYear = Number(filters.minYear || filters.year || 0);

  const filteredVehicles = allVehicles.filter((vehicle) => {
    const makeMatches = !filters.make || vehicle.make.toLowerCase() === filters.make.toLowerCase();
    const modelMatches = !filters.model || vehicle.model.toLowerCase().includes(filters.model.toLowerCase());
    const minimumMatches = !filters.minPrice || vehicle.price >= Number(filters.minPrice);
    const maximumMatches = !maxPrice || vehicle.price <= Number(maxPrice);
    const yearMatches = !minimumYear || vehicle.year >= minimumYear;
    const bodyTypeMatches =
      !filters.bodyType ||
      vehicle.bodyType.toLowerCase() === filters.bodyType.toLowerCase().replace(/s$/, "");
    const locationMatches = !filters.location || vehicle.location === filters.location;
    const transmissionMatches = !filters.transmission || vehicle.transmission === filters.transmission;
    const dutyMatches = !filters.duty || vehicle.duty === filters.duty;
    return (
      makeMatches &&
      modelMatches &&
      minimumMatches &&
      maximumMatches &&
      yearMatches &&
      bodyTypeMatches &&
      locationMatches &&
      transmissionMatches &&
      dutyMatches
    );
  });

  if (filters.sort === "price-asc") {
    filteredVehicles.sort((a, b) => a.price - b.price);
  } else if (filters.sort === "price-desc") {
    filteredVehicles.sort((a, b) => b.price - a.price);
  } else if (filters.sort === "newest") {
    filteredVehicles.sort((a, b) => b.year - a.year);
  }

  const activeFilters = Object.entries(filters).filter(([, value]) => Boolean(value));

  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> / Find Cars</div>
          <div className="eyebrow">Marketplace</div>
          <h1>Find cars in Zimbabwe</h1>
          <p className="muted">Filter verified listings by price, make, year, location and transmission.</p>
        </div>
      </section>
      <section className="make-strip" aria-label="Popular makes">
        <div className="container make-scroll">
          {["Toyota", "Honda", "Mazda", "Nissan", "Mercedes-Benz", "Suzuki", "Ford", "Isuzu"].map((make) => (
            <Link className="make-chip" key={make} href={`/cars?make=${encodeURIComponent(make)}`}>{make}</Link>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container results-layout">
          <form method="GET" className="filters" aria-label="Vehicle filters">
            <h2>Filter cars</h2>
            <div className="small muted">Filters apply when you select “Apply filters”.</div>
            <div className="filter-group">
              <div className="filter-title">Make &amp; model</div>
              <div className="field">
                <label htmlFor="filter-make">Make</label>
                <select id="filter-make" name="make" defaultValue={filters.make || ""}>
                  <option value="">Any make</option>
                  {["Toyota", "Honda", "Mazda", "Nissan", "Mercedes-Benz", "Suzuki"].map((make) => (
                    <option key={make}>{make}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginTop: 8 }}>
                <label htmlFor="filter-model">Model</label>
                <input id="filter-model" name="model" defaultValue={filters.model || ""} placeholder="e.g. Corolla" />
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-title">Price (USD)</div>
              <div className="field">
                <label htmlFor="min-price">Minimum</label>
                <select id="min-price" name="minPrice" defaultValue={filters.minPrice || ""}>
                  <option value="">Any</option>
                  {[5000, 10000, 20000].map((price) => <option key={price} value={price}>${price.toLocaleString("en-US")}</option>)}
                </select>
              </div>
              <div className="field" style={{ marginTop: 8 }}>
                <label htmlFor="max-price">Maximum</label>
                <select id="max-price" name="maxPrice" defaultValue={maxPrice || ""}>
                  <option value="">Any</option>
                  {[10000, 20000, 30000, 40000].map((price) => <option key={price} value={price}>${price.toLocaleString("en-US")}</option>)}
                </select>
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-title">Year &amp; vehicle type</div>
              <div className="field">
                <label htmlFor="filter-year">Minimum year</label>
                <select id="filter-year" name="minYear" defaultValue={filters.minYear || filters.year || ""}>
                  <option value="">Any year</option>
                  {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div className="field" style={{ marginTop: 8 }}>
                <label htmlFor="filter-body-type">Body type</label>
                <select id="filter-body-type" name="bodyType" defaultValue={filters.bodyType || ""}>
                  <option value="">Any type</option>
                  {["SUV", "Sedan", "Hatchback", "Pickup"].map((bodyType) => <option key={bodyType} value={bodyType}>{bodyType}</option>)}
                </select>
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-title">Location &amp; details</div>
              <div className="field">
                <label htmlFor="filter-location">Location</label>
                <select id="filter-location" name="location" defaultValue={filters.location || ""}>
                  <option value="">All Zimbabwe</option>
                  {["Harare", "Bulawayo", "Mutare", "Gweru"].map((location) => <option key={location}>{location}</option>)}
                </select>
              </div>
              <div className="field" style={{ marginTop: 8 }}>
                <label htmlFor="filter-transmission">Transmission</label>
                <select id="filter-transmission" name="transmission" defaultValue={filters.transmission || ""}>
                  <option value="">Any transmission</option>
                  {["Automatic", "Manual", "CVT"].map((transmission) => <option key={transmission}>{transmission}</option>)}
                </select>
              </div>
              <div className="field" style={{ marginTop: 8 }}>
                <label htmlFor="filter-duty">Duty status</label>
                <select id="filter-duty" name="duty" defaultValue={filters.duty || ""}>
                  <option value="">Any duty status</option>
                  <option value="paid">Duty paid</option>
                  <option value="unpaid">Duty unpaid</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="sort">Sort results</label>
              <select id="sort" name="sort" defaultValue={filters.sort || "newest"}>
                <option value="newest">Newest listings</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 14 }}>Apply filters</button>
            <Link href="/cars" className="btn btn-outline btn-block" style={{ marginTop: 8, color: "var(--navy)", borderColor: "var(--line)" }}>Clear filters</Link>
          </form>

          <section aria-label="Vehicle results">
            <div className="results-toolbar">
              <span className="result-count">
                {filteredVehicles.length} {filteredVehicles.length === 1 ? "verified vehicle" : "verified vehicles"}
              </span>
              {activeFilters.length > 0 && <span className="small muted">Filtered results</span>}
            </div>
            {filteredVehicles.length === 0 ? (
              <div className="panel" role="status">
                <h2>No vehicles found</h2>
                <p className="muted">Try changing or clearing your filters.</p>
                <Link href="/cars" className="btn btn-navy">Clear filters</Link>
              </div>
            ) : (
              <div className="vehicle-grid">
                {filteredVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
              </div>
            )}
            <p className="small muted" style={{ marginTop: 18 }}>
              Newly submitted seller listings appear after review. Sample cards are included for the design preview.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
