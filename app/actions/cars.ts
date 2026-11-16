"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gt, sql } from "drizzle-orm";
import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { getAdminSession, getSellerSession, normalizeZimbabwePhone } from "@/lib/auth";
import { s3Client } from "@/lib/storage";
import { cars, enquiries, listingReviews } from "@/src/db/schema";

type ListingInput = {
  title: string;
  make: string;
  model: string;
  year: number;
  price: string;
  mileage: number;
  transmission: string;
  fuelType: string;
  bodyType: string;
  description: string;
  location: string;
  vin: string;
  duty: string;
  documents: string[];
  plan: string;
  images: string[];
};

const allowedDocuments = new Set(["book-of-life", "zinara-plate", "roadworthy", "insurance"]);
const allowedPlans = new Set(["basic", "featured", "dealer"]);

function isValidString(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

export async function createCarListing(input: ListingInput) {
  const seller = await getSellerSession();
  if (!seller) throw new Error("Sign in and verify your phone before submitting a listing.");
  if (!input || typeof input !== "object") throw new Error("Invalid listing details.");

  const currentYear = new Date().getFullYear();
  const price = Number(input.price);
  const validImages = Array.isArray(input.images) &&
    input.images.length >= 1 &&
    input.images.length <= 8 &&
    input.images.every((url) => {
      if (typeof url !== "string") return false;
      try {
        const parsed = new URL(url);
        const expected = process.env.STORAGE_PUBLIC_URL?.replace(/\/$/, "");
        return Boolean(expected && ["http:", "https:"].includes(parsed.protocol) &&
          url.startsWith(`${expected}/vehicles/${seller.id}/`));
      } catch {
        return false;
      }
    });

  if (
    !isValidString(input.make, 1, 100) ||
    !isValidString(input.model, 1, 100) ||
    !Number.isInteger(input.year) ||
    input.year < 1960 ||
    input.year > currentYear ||
    !Number.isFinite(price) ||
    price <= 0 ||
    price > 100_000_000 ||
    !Number.isInteger(input.mileage) ||
    input.mileage < 0 ||
    input.mileage > 2_000_000 ||
    !["Automatic", "Manual", "CVT"].includes(input.transmission) ||
    !["Petrol", "Diesel", "Hybrid", "Electric"].includes(input.fuelType) ||
    !["SUV", "Sedan", "Hatchback", "Pickup", "Truck"].includes(input.bodyType) ||
    !isValidString(input.location, 1, 80) ||
    (input.vin !== "" && !isValidString(input.vin, 5, 40)) ||
    !["paid", "unpaid"].includes(input.duty) ||
    !isValidString(input.description, 0, 5000) ||
    !Array.isArray(input.documents) ||
    input.documents.some((document) => !allowedDocuments.has(document)) ||
    !allowedPlans.has(input.plan) ||
    (seller.type === "private" && input.plan === "dealer") ||
    (seller.type === "dealer" && input.plan === "basic") ||
    !validImages
  ) {
    throw new Error("Please check the vehicle details, plan, and uploaded photos.");
  }

  const bucket = process.env.STORAGE_BUCKET_NAME;
  if (!bucket) throw new Error("Image storage is not configured.");
  await Promise.all(input.images.map(async (url) => {
    const objectKey = new URL(url).pathname.replace(/^\/[^/]+\//, "");
    try {
      await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
    } catch (error) {
      console.error("Could not verify an uploaded vehicle photo", error);
      throw new Error("A vehicle photo could not be verified in storage. Upload the photos again.");
    }
  }));

  let created: { id: string } | undefined;
  try {
    [created] = await db
    .insert(cars)
    .values({
      title: `${input.year} ${input.make.trim()} ${input.model.trim()}`.slice(0, 255),
      make: input.make.trim(),
      model: input.model.trim(),
      year: input.year,
      price: price.toFixed(2),
      mileage: input.mileage,
      transmission: input.transmission,
      fuelType: input.fuelType,
      bodyType: input.bodyType,
      description: input.description.trim(),
      sellerPhone: seller.phone,
      sellerId: seller.id,
      location: input.location.trim(),
      vin: input.vin.trim() || null,
      duty: input.duty,
      documents: input.documents,
      plan: input.plan,
      images: input.images,
      status: "pending",
    })
    .returning({ id: cars.id });
  } catch (error) {
    const cleanupResults = await Promise.allSettled(input.images.map((url) => {
      const parsed = new URL(url);
      const base = new URL(process.env.STORAGE_PUBLIC_URL!);
      const objectKey = decodeURIComponent(parsed.pathname.slice(base.pathname.replace(/\/$/, "").length + 1));
      return s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
    }));
    cleanupResults.forEach((result) => {
      if (result.status === "rejected") console.error("Could not remove a photo for a failed listing", result.reason);
    });
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/cars");
  revalidatePath("/seller");
  revalidatePath("/admin");
  if (!created) throw new Error("The listing could not be saved.");
  return created.id;
}

export async function createBuyerEnquiry(input: {
  carId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const email = typeof input?.email === "string" ? input.email.trim() : "";
  const phone = typeof input?.phone === "string" ? normalizeZimbabwePhone(input.phone) : null;
  const message = typeof input?.message === "string" ? input.message.trim() : "";
  const carId = typeof input?.carId === "string" ? input.carId : "";
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(carId)) {
    throw new Error("This listing is not accepting online enquiries.");
  }
  if (!isValidString(name, 2, 120) || !phone || !isValidString(message, 10, 2000)) {
    throw new Error("Enter your name, a valid mobile number, and a message of at least 10 characters.");
  }
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new Error("Enter a valid email address or leave it blank.");
  }

  const [car] = await db.select({ id: cars.id }).from(cars)
    .where(and(eq(cars.id, carId), eq(cars.status, "available"))).limit(1);
  if (!car) throw new Error("This listing is no longer available.");

  const recent = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(enquiries)
    .where(and(eq(enquiries.carId, carId), eq(enquiries.buyerPhone, phone), gt(enquiries.createdAt, new Date(Date.now() - 60 * 60_000))));
  if (Number(recent[0]?.count ?? 0) >= 3) {
    throw new Error("You have already sent several enquiries about this car. Please try again later.");
  }

  await db.insert(enquiries).values({
    carId,
    buyerName: name,
    buyerEmail: email || null,
    buyerPhone: phone,
    message,
  });
  revalidatePath(`/cars/${carId}`);
  revalidatePath("/seller");
}

export async function reviewPendingListing(input: { carId: string; status: "available" | "rejected" }) {
  const admin = await getAdminSession();
  if (!admin) throw new Error("Only an authorized marketplace admin can review listings.");
  if (admin.mustChangePassword) throw new Error("Change your temporary password before reviewing listings.");
  if (
    typeof input?.carId !== "string" ||
    !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(input.carId) ||
    (input.status !== "available" && input.status !== "rejected")
  ) {
    throw new Error("Invalid listing review request.");
  }

  await db.transaction(async (tx) => {
    const [updated] = await tx.update(cars)
      .set({ status: input.status })
      .where(and(eq(cars.id, input.carId), eq(cars.status, "pending")))
      .returning({ id: cars.id });
    if (!updated) throw new Error("This listing is no longer pending review.");
    await tx.insert(listingReviews).values({
      carId: input.carId,
      adminUserId: admin.id,
      status: input.status,
    });
  });

  revalidatePath("/");
  revalidatePath("/cars");
  revalidatePath(`/cars/${input.carId}`);
  revalidatePath("/admin");
  revalidatePath("/seller");
}
