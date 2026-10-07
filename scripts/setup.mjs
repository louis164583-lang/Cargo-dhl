import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
const db = JSON.parse(readFileSync("server/db.json", "utf8"));

for (const [name, rows] of Object.entries(db)) {
  if (!Array.isArray(rows)) continue;
  if (!/^[a-z_]+$/.test(name)) { console.log("SKIPPED (name must be lowercase letters/underscore):", name); continue; }
  await sql.query("CREATE TABLE IF NOT EXISTS " + name + " (id TEXT PRIMARY KEY, data JSONB NOT NULL, seq BIGSERIAL)");
  for (const r of rows) {
    const id = r.id !== undefined ? r.id : randomUUID();
    await sql.query(
      "INSERT INTO " + name + " (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING",
      [String(id), JSON.stringify({ ...r, id })]
    );
  }
  console.log("table", name, "- imported", rows.length, "rows");
}
