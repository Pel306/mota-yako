import { NewListingForm } from "@/components/cars/new-listing-form";
import { getSellerSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const instant = false;

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ seller?: string; plan?: string }>;
}) {
  const params = await searchParams;
  const account = await getSellerSession();
  if (!account) redirect(`/account?next=${encodeURIComponent("/cars/sell/new")}&seller=${params.seller === "dealer" ? "dealer" : "private"}`);
  const seller = account.type;
  const requestedPlan = params.plan;
  const initialPlan =
    requestedPlan === "basic" || requestedPlan === "dealer" || requestedPlan === "featured"
      ? requestedPlan
      : seller === "dealer"
        ? "dealer"
        : "featured";
  const planAvailable =
    seller === "dealer" ? initialPlan !== "basic" : initialPlan !== "dealer";

  return <NewListingForm seller={seller} initialPlan={planAvailable ? initialPlan : seller === "dealer" ? "dealer" : "featured"} />;
}
