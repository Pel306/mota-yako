import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run database migrations.");
}

const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

try {
  await client`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`;

  const appliedRows = await client`SELECT name FROM schema_migrations`;
  const applied = new Set(appliedRows.map((row) => row.name));
  const files = (await readdir("drizzle"))
    .filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name))
    .sort();

  for (const name of files) {
    if (applied.has(name)) continue;
    const migration = await readFile(join("drizzle", name), "utf8");
    await client.begin(async (transaction) => {
      await transaction.unsafe(migration);
      await transaction`INSERT INTO schema_migrations (name) VALUES (${name})`;
    });
    console.log(`Applied ${name}`);
  }

  const normalizePhone = (value) => {
    const digits = value.replace(/\D/g, "");
    const international = digits.startsWith("0")
      ? `263${digits.slice(1)}`
      : digits.startsWith("263")
        ? digits
        : "";
    return international.length >= 11 && international.length <= 15
      ? `+${international}`
      : null;
  };
  const admins = [...new Set(
    (process.env.ADMIN_PHONES ?? "").split(",").map((phone) => normalizePhone(phone.trim())).filter(Boolean),
  )];
  const managers = new Set(
    (process.env.ADMIN_MANAGER_PHONES ?? "").split(",").map((phone) => normalizePhone(phone.trim())).filter(Boolean),
  );
  for (const phone of admins) {
    await client`
      INSERT INTO admin_users (name, phone, can_manage_admins)
      SELECT 'Administrator', ${phone}, ${managers.has(phone)}
      WHERE NOT EXISTS (
        SELECT 1 FROM admin_bootstrap_revocations WHERE admin_bootstrap_revocations.phone = ${phone}
      )
      ON CONFLICT (phone) DO NOTHING
    `;
  }
} finally {
  await client.end({ timeout: 5 });
}
