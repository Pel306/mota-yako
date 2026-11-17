import { connection } from "next/server";
import { AdminSignInForm } from "@/components/admin/admin-sign-in-form";

export const instant = false;

export default async function AdminSignInPage() {
  await connection();

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <AdminSignInForm />
        </div>
      </section>
    </main>
  );
}
