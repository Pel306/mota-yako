import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSellerSession } from "@/lib/auth";
import { SellerAuthForm } from "@/components/auth/seller-auth-form";

type AccountPageProps = {
  searchParams: Promise<{ seller?: string; next?: string }>;
};

export default function AccountPage(props: AccountPageProps) {
  return (
    <Suspense fallback={<main id="main"><section className="section"><div className="container"><p role="status">Loading account…</p></div></section></main>}>
      <AccountPageContent {...props} />
    </Suspense>
  );
}

async function AccountPageContent({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const sellerType = params.seller === "dealer" ? "dealer" : "private";
  const nextPath = params.next?.startsWith("/") && !params.next.startsWith("//")
    ? params.next
    : "/seller";
  const seller = await getSellerSession();

  if (seller) {
    redirect(nextPath === "/admin" ? "/seller?notice=admin-required" : nextPath);
  }

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <SellerAuthForm sellerType={sellerType} nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
