"use server";

import { revalidatePath } from "next/cache";
import { reviewPendingListing } from "@/app/actions/cars";

export async function approveListing(formData: FormData) {
  const carId = formData.get("carId");
  if (typeof carId !== "string") throw new Error("Missing listing id.");
  await reviewPendingListing({ carId, status: "available" });
  revalidatePath("/admin");
}

export async function rejectListing(formData: FormData) {
  const carId = formData.get("carId");
  if (typeof carId !== "string") throw new Error("Missing listing id.");
  await reviewPendingListing({ carId, status: "rejected" });
  revalidatePath("/admin");
}
