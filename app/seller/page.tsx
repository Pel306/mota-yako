import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getSellerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cars, enquiries } from "@/src/db/schema";
import { signOutAction } from "@/app/actions/session";

type SellerDashboardPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

export default function SellerDashboardPage(props: SellerDashboardPageProps) {
  return (
    <Suspense fallback={<main id="main"><section className="section"><div className="container"><p role="status">Loading seller dashboard…</p></div></section></main>}>
      <SellerDashboardContent {...props} />
    </Suspense>
  );
}

async function SellerDashboardContent({ searchParams }: SellerDashboardPageProps) {
  const seller = await getSellerSession();
  if (!seller) redirect("/account?next=%2Fseller");
  const params = await searchParams;

  const listings = await db
    .select()
    .from(cars)
    .where(eq(cars.sellerId, seller.id))
    .orderBy(desc(cars.createdAt));
  const messages = await db
    .select({
      id: enquiries.id,
      carId: enquiries.carId,
      carTitle: cars.title,
      buyerName: enquiries.buyerName,
      buyerEmail: enquiries.buyerEmail,
      buyerPhone: enquiries.buyerPhone,
      message: enquiries.message,
      createdAt: enquiries.createdAt,
    })
    .from(enquiries)
    .innerJoin(cars, eq(enquiries.carId, cars.id))
    .where(eq(cars.sellerId, seller.id))
    .orderBy(desc(enquiries.createdAt));

  return (
    <main id="main">
      <section className="page-hero">
        <div className="container">
          {params.notice === "admin-required" && (
            <p className="notice" role="status">
              You are signed in, but this phone number is not authorized for admin access. Ask your site administrator to add it to ADMIN_PHONES.
            </p>
          )}
          <div className="eyebrow">Seller dashboard</div>
          <h1>Welcome, {seller.name}</h1>
          <p className="muted">{seller.type === "dealer" ? seller.dealerName : "Private seller"} · {seller.phone} · phone verified</p>
          <div className="detail-actions" style={{ marginTop: 14 }}>
            <Link className="btn btn-primary" href={`/cars/sell/new?seller=${seller.type}`}>Add a car</Link>
            <form action={signOutAction}><button className="btn btn-outline" type="submit">Sign out</button></form>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container split">
          <div>
            <h2>Your listings ({listings.length})</h2>
            {listings.length === 0 ? (
              <div className="panel"><p className="muted">You have not submitted a listing yet.</p><Link className="btn btn-primary" href={`/cars/sell/new?seller=${seller.type}`}>Create your first listing</Link></div>
            ) : listings.map((car) => (
              <article className="panel" key={car.id} style={{ marginBottom: 12 }}>
                <h3>{car.title}</h3>
                <p className="muted">${Number(car.price).toLocaleString("en-US")} · {car.status} · submitted {car.createdAt.toLocaleDateString()}</p>
                {car.status === "available" && <Link href={`/cars/${car.id}`}>View public listing →</Link>}
              </article>
            ))}
          </div>
          <aside>
            <h2>Buyer enquiries ({messages.length})</h2>
            {messages.length === 0 ? <p className="muted">Buyer enquiries about your published listings will appear here.</p> : messages.map((message) => (
              <article className="panel" key={message.id} style={{ marginBottom: 12 }}>
                <strong>{message.buyerName} · {message.carTitle}</strong>
                <p>{message.message}</p>
                <p className="small muted">{message.buyerPhone}{message.buyerEmail ? ` · ${message.buyerEmail}` : ""}</p>
                <a className="btn btn-navy btn-sm" href={`https://wa.me/${message.buyerPhone.replace(/\D/g, "")}`}>Contact buyer</a>
              </article>
            ))}
          </aside>
        </div>
      </section>
    </main>
  );
}
