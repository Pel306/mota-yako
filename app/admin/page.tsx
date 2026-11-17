import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { count, desc, eq } from "drizzle-orm";
import { approveListing, rejectListing } from "@/app/actions/admin";
import { signOutAdmin } from "@/app/actions/admin-session";
import { AdminAccountsPanel } from "@/components/admin/admin-accounts-panel";
import { getAdminSession } from "@/lib/auth";
import { getAdminIdLastFour } from "@/lib/admin-id";
import { db } from "@/lib/db";
import { adminUsers, cars, sellers } from "@/src/db/schema";

const documentLabels: Record<string, string> = {
  "book-of-life": "Book of life",
  "zinara-plate": "ZINARA plate",
  roadworthy: "Roadworthy",
  insurance: "Insurance",
};

export default async function AdminPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/sign-in");
  if (admin.mustChangePassword) redirect("/admin/change-password");
  const canManageAdmins = admin.canManageAdmins;

  const [[pendingCount], [publishedCount], pending, adminRows] = await Promise.all([
    db.select({ count: count() }).from(cars).where(eq(cars.status, "pending")),
    db.select({ count: count() }).from(cars).where(eq(cars.status, "available")),
    db
      .select({
        id: cars.id,
        title: cars.title,
        make: cars.make,
        model: cars.model,
        year: cars.year,
        price: cars.price,
        mileage: cars.mileage,
        transmission: cars.transmission,
        fuelType: cars.fuelType,
        bodyType: cars.bodyType,
        location: cars.location,
        duty: cars.duty,
        description: cars.description,
        documents: cars.documents,
        images: cars.images,
        plan: cars.plan,
        sellerPhone: cars.sellerPhone,
        createdAt: cars.createdAt,
        sellerName: sellers.name,
        dealerName: sellers.dealerName,
        sellerType: sellers.type,
      })
      .from(cars)
      .leftJoin(sellers, eq(cars.sellerId, sellers.id))
      .where(eq(cars.status, "pending"))
      .orderBy(desc(cars.createdAt)),
    db
      .select({
        id: adminUsers.id,
        name: adminUsers.name,
        phone: adminUsers.phone,
        organizationName: adminUsers.organizationName,
        idNumberEncrypted: adminUsers.idNumberEncrypted,
        canManageAdmins: adminUsers.canManageAdmins,
      })
      .from(adminUsers)
      .orderBy(adminUsers.name),
  ]);
  const adminList = adminRows.map((account) => ({
    id: account.id,
    name: account.name,
    phone: account.phone,
    organizationName: account.organizationName,
    idNumberLastFour: getAdminIdLastFour(account.idNumberEncrypted),
    canManageAdmins: account.canManageAdmins,
  }));

  return (
    <main id="main" className="admin-body">
      <div className="admin-bar">
        <div className="container admin-bar-inner">
          <strong>MOTA YAKO · ADMIN</strong>
          <span className="admin-badge">AUTHENTICATED ADMIN</span>
          <span className="small">{admin.name} · {admin.phone}</span>
          <a className="btn btn-outline btn-sm" href="/admin/change-password">Change password</a>
          <form action={signOutAdmin}><button className="btn btn-outline btn-sm" type="submit">Sign out</button></form>
        </div>
      </div>
      <div className="container section">
        <div className="security-bar"><div className="container security-bar-inner">Seller phone verification is not KYC. Confirm vehicle and ownership details before approving listings.</div></div>
        <section className="section-sm">
          <div className="eyebrow">Marketplace overview</div>
          <h1>Listing review</h1>
          <p className="admin-review-intro">Review seller details, vehicle information, and submitted photos before publishing.</p>
          <div className="admin-stats admin-review-stats" style={{ marginTop: 18 }}>
            <div className="admin-stat warn"><div className="num">{pendingCount.count}</div><div className="label">Listings pending review</div></div>
            <div className="admin-stat"><div className="num">{publishedCount.count}</div><div className="label">Published database listings</div></div>
          </div>
        </section>
        <section className="section-sm admin-review-queue">
          <div className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2 style={{ margin: 0, fontSize: 17 }}>Pending listings</h2>
                <p className="small muted" style={{ margin: "4px 0 0" }}>Newest submissions appear first.</p>
              </div>
              <span className="pill pill-pending">{pending.length} awaiting review</span>
            </div>
            {pending.length === 0 ? (
              <div className="admin-review-empty">
                <span className="admin-review-empty-mark" aria-hidden="true">✓</span>
                <h3>Queue clear</h3>
                <p className="muted">There are no listings waiting for review.</p>
              </div>
            ) : (
              <div className="admin-review-list">
                {pending.map((listing) => {
                  const sellerName = listing.dealerName || listing.sellerName || "Seller account unavailable";
                  const sellerType = listing.sellerType === "dealer" ? "Dealer" : "Private seller";
                  const submittedAt = listing.createdAt.toISOString();

                  return (
                    <article className="admin-review-card" key={listing.id}>
                      <Link className="admin-review-photo" href={`/cars/${listing.id}`} target="_blank" aria-label={`Preview photos for ${listing.title}`}>
                        {listing.images[0] ? (
                          <Image
                            src={listing.images[0]}
                            alt={`${listing.title} listing photo`}
                            width={640}
                            height={420}
                            unoptimized
                          />
                        ) : (
                          <span className="admin-review-no-photo">No photo</span>
                        )}
                        {listing.images.length > 1 && <span className="admin-review-photo-count">{listing.images.length} photos</span>}
                      </Link>
                      <div className="admin-review-content">
                        <div className="admin-review-topline">
                          <span className="pill pill-pending">Awaiting review</span>
                          <span className="admin-review-plan">{listing.plan} plan</span>
                        </div>
                        <div className="admin-review-title-row">
                          <div>
                            <h3>{listing.title}</h3>
                            <p className="admin-review-price">${Number(listing.price).toLocaleString("en-US")}</p>
                          </div>
                          <span className={`admin-review-duty ${listing.duty === "paid" ? "is-paid" : "is-unpaid"}`}>
                            Duty {listing.duty}
                          </span>
                        </div>
                        <dl className="admin-review-specs">
                          <div><dt>Year</dt><dd>{listing.year}</dd></div>
                          <div><dt>Mileage</dt><dd>{listing.mileage.toLocaleString("en-US")} km</dd></div>
                          <div><dt>Transmission</dt><dd>{listing.transmission}</dd></div>
                          <div><dt>Fuel</dt><dd>{listing.fuelType}</dd></div>
                          <div><dt>Body</dt><dd>{listing.bodyType}</dd></div>
                          <div><dt>Location</dt><dd>{listing.location}</dd></div>
                        </dl>
                        <div className="admin-review-seller">
                          <div>
                            <span className="admin-review-label">Seller</span>
                            <strong>{sellerName}</strong>
                            <span className="admin-review-seller-type">{sellerType} · {listing.sellerPhone}</span>
                          </div>
                          <div className="admin-review-submitted">
                            <span className="admin-review-label">Submitted</span>
                            <time dateTime={submittedAt}>
                              {listing.createdAt.toLocaleString("en-ZW", { dateStyle: "medium", timeStyle: "short" })}
                            </time>
                          </div>
                        </div>
                        {listing.description && <p className="admin-review-description">{listing.description}</p>}
                        <div className="admin-review-documents">
                          <span className="admin-review-label">Seller-declared documents</span>
                          {listing.documents.length ? (
                            <ul>
                              {listing.documents.map((document) => (
                                <li key={document}>{documentLabels[document] ?? document}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="admin-review-none">None selected</span>
                          )}
                        </div>
                        <div className="admin-review-actions">
                          <Link className="btn btn-outline btn-sm" href={`/cars/${listing.id}`} target="_blank">View full listing</Link>
                          <div className="admin-actions">
                            <form action={approveListing}>
                              <input type="hidden" name="carId" value={listing.id} />
                              <button className="btn btn-approve btn-sm" type="submit">Approve &amp; publish</button>
                            </form>
                            <form action={rejectListing}>
                              <input type="hidden" name="carId" value={listing.id} />
                              <button className="btn btn-reject btn-sm" type="submit">Reject</button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        <AdminAccountsPanel admins={adminList} currentAdminId={admin.id} canManageAdmins={canManageAdmins} />
        <p className="small muted">Payments and identity/business document verification are not integrated. Admin ID numbers are encrypted at rest and are not KYC verification.</p>
      </div>
    </main>
  );
}
