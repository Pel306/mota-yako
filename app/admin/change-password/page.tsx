import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { ChangeAdminPasswordForm } from "@/components/admin/change-admin-password-form";

export const instant = false;

export default async function ChangeAdminPasswordPage() {
  await connection();

  const admin = await getAdminSession();
  if (!admin) redirect("/admin/sign-in");

  return (
    <main id="main">
      <section className="section">
        <div className="container">
          <ChangeAdminPasswordForm mustChangePassword={admin.mustChangePassword} />
        </div>
      </section>
    </main>
  );
}