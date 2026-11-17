import { and, desc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { cars, sellers } from "@/src/db/schema";

export interface VehicleListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  transmission: string;
  fuel: string;
  bodyType: string;
  price: number;
  location: string;
  image: string;
  duty: "paid" | "unpaid";
  sellerType: "private" | "dealer";
  sellerName: string;
  sellerInitials: string;
  verified: boolean;
  featured: boolean;
  deal?: "great" | "fair" | "high";
  vin: string;
  description: string;
  documents: string[];
  features: string[];
  sellerId?: string;
  images?: string[];
  status?: string;
  sample?: boolean;
}

export const vehicles: VehicleListing[] = [
  {
    id: "toyota-fortuner",
    title: "Toyota Fortuner 2.8 GD-6",
    make: "Toyota",
    model: "Fortuner 2.8 GD-6",
    year: 2022,
    mileage: 62000,
    transmission: "Automatic",
    fuel: "Diesel",
    bodyType: "SUV",
    price: 34900,
    location: "Harare",
    image: "/images/toyota-fortuner.jpg",
    duty: "paid",
    sellerType: "dealer",
    sellerName: "Harare Auto Hub",
    sellerInitials: "HA",
    verified: true,
    featured: true,
    deal: "fair",
    vin: "JTMHY05J004123456",
    description:
      "A well-kept, spacious Fortuner with a strong service history. Contact the seller to arrange an in-person viewing and inspect all vehicle documents.",
    documents: ["Book of life (registration)", "ZINARA / RTSA number plate", "Roadworthy certificate", "Valid insurance"],
    features: ["Climate control", "Reverse camera", "Cruise control", "Push-start ignition", "Leather seats", "Alloy wheels", "Bluetooth / touchscreen", "7-seater"],
  },
  {
    id: "mazda-cx-5",
    title: "Mazda CX-5 2.5 AWD",
    make: "Mazda",
    model: "CX-5 2.5 AWD",
    year: 2021,
    mileage: 54200,
    transmission: "Automatic",
    fuel: "Petrol",
    bodyType: "SUV",
    price: 24500,
    location: "Bulawayo",
    image: "/images/mazda-cx5.jpg",
    duty: "paid",
    sellerType: "private",
    sellerName: "Tariro M.",
    sellerInitials: "TM",
    verified: true,
    featured: false,
    deal: "fair",
    vin: "JM3KFBDM1M0123456",
    description:
      "Comfortable all-wheel-drive SUV in clean condition. Please confirm the current mileage, service records and document status with the seller.",
    documents: ["Book of life (registration)", "Valid insurance"],
    features: ["Climate control", "Reverse camera", "Cruise control", "Alloy wheels", "Bluetooth"],
  },
  {
    id: "honda-fit-hybrid",
    title: "Honda Fit Hybrid",
    make: "Honda",
    model: "Fit Hybrid",
    year: 2020,
    mileage: 71500,
    transmission: "Automatic",
    fuel: "Hybrid",
    bodyType: "Hatchback",
    price: 11800,
    location: "Harare",
    image: "/images/honda-fit-hybrid.jpg",
    duty: "paid",
    sellerType: "private",
    sellerName: "Chipo R.",
    sellerInitials: "CR",
    verified: true,
    featured: false,
    deal: "great",
    vin: "GP5-1234567",
    description:
      "Practical hybrid hatchback with a roomy interior and economical city driving. View and verify the vehicle before agreeing to any payment.",
    documents: ["Book of life (registration)", "ZINARA / RTSA number plate"],
    features: ["Hybrid drive", "Reverse camera", "Push-start ignition", "Bluetooth"],
  },
  {
    id: "toyota-hilux",
    title: "Toyota Hilux 2.4 GD-6",
    make: "Toyota",
    model: "Hilux 2.4 GD-6",
    year: 2021,
    mileage: 88100,
    transmission: "Manual",
    fuel: "Diesel",
    bodyType: "Pickup",
    price: 29750,
    location: "Mutare",
    image: "/images/toyota-hilux.jpg",
    duty: "unpaid",
    sellerType: "dealer",
    sellerName: "Harare Auto Hub",
    sellerInitials: "HA",
    verified: true,
    featured: true,
    deal: "fair",
    vin: "AHTKB3CD502345678",
    description:
      "Work-ready Hilux pickup. Duty status is shown as supplied by the seller; confirm the total landed cost and documents before purchase.",
    documents: ["Book of life (registration)", "Roadworthy certificate"],
    features: ["4x4", "Diesel", "Double cab", "Alloy wheels"],
  },
  {
    id: "nissan-x-trail",
    title: "Nissan X-Trail 2.0",
    make: "Nissan",
    model: "X-Trail 2.0",
    year: 2020,
    mileage: 69800,
    transmission: "CVT",
    fuel: "Petrol",
    bodyType: "SUV",
    price: 18950,
    location: "Harare",
    image: "/images/nissan-xtrail.jpg",
    duty: "paid",
    sellerType: "dealer",
    sellerName: "Harare Auto Hub",
    sellerInitials: "HA",
    verified: true,
    featured: false,
    deal: "great",
    vin: "JN1TBNT32A0123456",
    description:
      "Versatile family SUV with a smooth CVT transmission. Contact the seller for a viewing and an opportunity to inspect the vehicle.",
    documents: ["Book of life (registration)", "ZINARA / RTSA number plate", "Valid insurance"],
    features: ["Climate control", "Reverse camera", "Cruise control", "Bluetooth"],
  },
  {
    id: "mercedes-c200",
    title: "Mercedes-Benz C200",
    make: "Mercedes-Benz",
    model: "C200",
    year: 2021,
    mileage: 48600,
    transmission: "Automatic",
    fuel: "Petrol",
    bodyType: "Sedan",
    price: 31600,
    location: "Harare",
    image: "/images/mercedes-c200.jpg",
    duty: "paid",
    sellerType: "dealer",
    sellerName: "Harare Auto Hub",
    sellerInitials: "HA",
    verified: true,
    featured: false,
    deal: "fair",
    vin: "WDDWF4JB2KR123456",
    description:
      "Executive sedan with a comfortable cabin. Ask the seller for service history and confirm the car's condition in person.",
    documents: ["Book of life (registration)", "Roadworthy certificate", "Valid insurance"],
    features: ["Leather seats", "Climate control", "Bluetooth / touchscreen", "Alloy wheels"],
  },
  {
    id: "toyota-corolla-cross",
    title: "Toyota Corolla Cross",
    make: "Toyota",
    model: "Corolla Cross",
    year: 2023,
    mileage: 41200,
    transmission: "Automatic",
    fuel: "Petrol",
    bodyType: "SUV",
    price: 27400,
    location: "Gweru",
    image: "/images/toyota-corolla-cross.jpg",
    duty: "unpaid",
    sellerType: "dealer",
    sellerName: "Harare Auto Hub",
    sellerInitials: "HA",
    verified: true,
    featured: true,
    deal: "fair",
    vin: "JTNABAAE2P0123456",
    description:
      "Recent-model compact SUV with low mileage. Arrange an inspection and confirm all details directly with the seller.",
    documents: ["Book of life (registration)", "ZINARA / RTSA number plate", "Roadworthy certificate"],
    features: ["Reverse camera", "Cruise control", "Push-start ignition", "Bluetooth"],
  },
  {
    id: "suzuki-swift",
    title: "Suzuki Swift",
    make: "Suzuki",
    model: "Swift",
    year: 2022,
    mileage: 38900,
    transmission: "Automatic",
    fuel: "Petrol",
    bodyType: "Hatchback",
    price: 13950,
    location: "Harare",
    image: "/images/suzuki-swift.jpg",
    duty: "paid",
    sellerType: "private",
    sellerName: "Farai K.",
    sellerInitials: "FK",
    verified: true,
    featured: false,
    deal: "great",
    vin: "JSAAZC13S00123456",
    description:
      "Compact, easy-to-drive hatchback. Message the seller to ask questions and set up a safe in-person viewing.",
    documents: ["Book of life (registration)", "Valid insurance"],
    features: ["Bluetooth", "Air conditioning", "Alloy wheels"],
  },
];

export const dealer = {
  slug: "harare-auto-hub",
  name: "Harare Auto Hub",
  initials: "HA",
  location: "Harare",
  rating: "4.8",
  reviews: 32,
  description:
    "A Zimbabwe-based automotive seller profile. Confirm business details and inspect every vehicle before purchase.",
};

export const vehicleCategories = ["SUV", "Sedan", "Hatchback", "Pickup"];

export function getVehicle(id: string) {
  return vehicles.find((vehicle) => vehicle.id === id);
}

const documentLabels: Record<string, string> = {
  "book-of-life": "Book of life (registration)",
  "zinara-plate": "ZINARA / RTSA number plate",
  roadworthy: "Roadworthy certificate",
  insurance: "Valid insurance",
};

function toVehicleListing(row: {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  bodyType: string;
  price: string;
  location: string;
  images: string[];
  duty: string;
  plan: string;
  vin: string | null;
  description: string | null;
  documents: string[];
  sellerId: string;
  status: string;
  sellerName: string;
  sellerType: string;
  dealerName: string | null;
}): VehicleListing {
  const name = row.sellerType === "dealer" ? row.dealerName || row.sellerName : row.sellerName;
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
  return {
    id: row.id,
    title: row.title,
    make: row.make,
    model: row.model,
    year: row.year,
    mileage: row.mileage,
    transmission: row.transmission,
    fuel: row.fuelType,
    bodyType: row.bodyType,
    price: Number(row.price),
    location: row.location,
    image: row.images[0],
    duty: row.duty === "paid" ? "paid" : "unpaid",
    sellerType: row.sellerType === "dealer" ? "dealer" : "private",
    sellerName: name,
    sellerInitials: initials,
    verified: true,
    featured: row.plan === "featured" || row.plan === "dealer",
    vin: row.vin ?? "",
    description: row.description ?? "",
    documents: row.documents.map((document) => documentLabels[document] ?? document),
    features: [],
    sellerId: row.sellerId,
    images: row.images,
    status: row.status,
    sample: false,
  };
}

export async function getPublishedVehicles(limit = 100) {
  await connection();
  const rows = await db
    .select({
      id: cars.id,
      title: cars.title,
      make: cars.make,
      model: cars.model,
      year: cars.year,
      mileage: cars.mileage,
      transmission: cars.transmission,
      fuelType: cars.fuelType,
      bodyType: cars.bodyType,
      price: cars.price,
      location: cars.location,
      images: cars.images,
      duty: cars.duty,
      plan: cars.plan,
      vin: cars.vin,
      description: cars.description,
      documents: cars.documents,
      status: cars.status,
      sellerId: sellers.id,
      sellerName: sellers.name,
      sellerType: sellers.type,
      dealerName: sellers.dealerName,
    })
    .from(cars)
    .innerJoin(sellers, eq(cars.sellerId, sellers.id))
    .where(eq(cars.status, "available"))
    .orderBy(desc(cars.createdAt))
    .limit(limit);
  return rows.filter((row) => row.images.length > 0).map(toVehicleListing);
}

export async function getPublishedVehicle(id: string) {
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) return undefined;
  return getDatabaseVehicle(id, "available");
}

export async function getDatabaseVehicle(id: string, status?: string) {
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) return undefined;
  await connection();
  const conditions = [eq(cars.id, id)];
  if (status) conditions.push(eq(cars.status, status));
  const [row] = await db
    .select({
      id: cars.id,
      title: cars.title,
      make: cars.make,
      model: cars.model,
      year: cars.year,
      mileage: cars.mileage,
      transmission: cars.transmission,
      fuelType: cars.fuelType,
      bodyType: cars.bodyType,
      price: cars.price,
      location: cars.location,
      images: cars.images,
      duty: cars.duty,
      plan: cars.plan,
      vin: cars.vin,
      description: cars.description,
      documents: cars.documents,
      status: cars.status,
      sellerId: sellers.id,
      sellerName: sellers.name,
      sellerType: sellers.type,
      dealerName: sellers.dealerName,
    })
    .from(cars)
    .innerJoin(sellers, eq(cars.sellerId, sellers.id))
    .where(and(...conditions))
    .limit(1);
  return row && row.images.length > 0 ? toVehicleListing(row) : undefined;
}
