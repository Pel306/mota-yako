import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/src/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to connect to the marketplace database.");
}

// Disable prefetch for serverless compatibility
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });