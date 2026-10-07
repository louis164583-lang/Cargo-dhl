import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
export const tableOk = (n) => typeof n === "string" && /^[a-z_]+$/.test(n);
