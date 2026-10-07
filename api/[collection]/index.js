import { randomUUID } from "node:crypto";
import { sql, tableOk } from "../_lib/db.js";
import { isAdmin } from "../_lib/auth.js";

export default async function handler(req, res) {
  const { collection, ...filters } = req.query;
  if (!tableOk(collection)) return res.status(404).json({ error: "Not found" });
  try {
    if (req.method === "GET") {
      const keys = Object.keys(filters);
      if (keys.length === 0 && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
      let q = "SELECT data FROM " + collection;
      const params = [];
      keys.forEach((k, i) => {
        q += (i ? " AND " : " WHERE ") + "data->>$" + (2 * i + 1) + "::text = $" + (2 * i + 2);
        params.push(k, String(filters[k]));
      });
      q += " ORDER BY seq";
      const rows = await sql.query(q, params);
      return res.status(200).json(rows.map((r) => r.data));
    }
    if (req.method === "POST") {
      if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
      const body = req.body || {};
      const id = body.id !== undefined ? body.id : randomUUID();
      const data = { ...body, id };
      const rows = await sql.query(
        "INSERT INTO " + collection + " (id, data) VALUES ($1, $2::jsonb) RETURNING data",
        [String(id), JSON.stringify(data)]
      );
      return res.status(201).json(rows[0].data);
    }
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
