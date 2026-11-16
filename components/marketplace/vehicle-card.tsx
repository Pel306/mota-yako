import Image from "next/image";
import Link from "next/link";
import type { VehicleListing } from "@/lib/marketplace-data";

const dealLabels = {
  great: "GREAT DEAL",
  fair: "FAIR PRICE",
  high: "HIGH PRICE",
};

export function VehicleCard({ vehicle }: { vehicle: VehicleListing }) {
  return (
    <article className="vehicle-card">
      <Link href={`/cars/${vehicle.id}`} aria-label={`View ${vehicle.title}`}>
        <div className="vehicle-image">
          <Image
            src={vehicle.image}
            alt={vehicle.title}
            width={640}
            height={400}
            sizes="(max-width: 700px) 50vw, (max-width: 1050px) 33vw, 25vw"
            unoptimized={vehicle.image.startsWith("http://") || vehicle.image.startsWith("https://")}
          />
          <div className="badge-stack">
            {vehicle.featured ? (
              <span className="badge badge-orange">FEATURED</span>
            ) : (
              <span className="badge">VERIFIED</span>
            )}
            <span className={`badge ${vehicle.duty === "paid" ? "badge-duty-paid" : "badge-duty-unpaid"}`}>
              DUTY {vehicle.duty.toUpperCase()}
            </span>
          </div>
          {vehicle.deal && <span className={`deal-badge deal-${vehicle.deal}`}>{dealLabels[vehicle.deal]}</span>}
        </div>
        <div className="vehicle-body">
          <div className="vehicle-title">{vehicle.title}</div>
          <div className="price">${vehicle.price.toLocaleString("en-US")}</div>
          <div className="specs">
            <span className="spec">{vehicle.year}</span>
            <span className="spec">{vehicle.mileage.toLocaleString("en-US")} km</span>
            <span className="spec">{vehicle.transmission}</span>
          </div>
          <div className="card-meta">
            <span>{vehicle.location}</span>
            <span className="verified">
              <span className="verified-dot">✓</span>
              {vehicle.sample === false ? "Phone verified" : vehicle.sellerType === "dealer" ? "Sample Dealer" : "Sample Seller"}
            </span>
          </div>
          <div className="hover-reveal">
            <span className="dealer-mini">View vehicle details →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
