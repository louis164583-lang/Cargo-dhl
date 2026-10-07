import { sql, tableOk } from "../_lib/db.js";
import { isAdmin } from "../_lib/auth.js";

export default async function handler(req, res) {
  const { collection, id } = req.query;
  if (!tableOk(collection)) return res.status(404).json({ error: "Not found" });
  try {
    if (req.method === "GET") {
      const rows = await sql.query("SELECT data FROM " + collection + " WHERE id = $1", [id]);
      return rows[0] ? res.status(200).json(rows[0].data) : res.status(404).json({ error: "Not found" });
    }
    if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
    if (req.method === "PUT") {
      const body = req.body || {};
      const data = { ...body, id: body.id !== undefined ? body.id : id };
      const rows = await sql.query(
        "UPDATE " + collection + " SET data = $2::jsonb WHERE id = $1 RETURNING data",
        [id, JSON.stringify(data)]
      );
      return rows[0] ? res.status(200).json(rows[0].data) : res.status(404).json({ error: "Not found" });
    }
    if (req.method === "PATCH") {
      const rows = await sql.query(
        "UPDATE " + collection + " SET data = data || $2::jsonb WHERE id = $1 RETURNING data",
        [id, JSON.stringify(req.body || {})]
      );
      return rows[0] ? res.status(200).json(rows[0].data) : res.status(404).json({ error: "Not found" });
    }
    if (req.method === "DELETE") {
      await sql.query("DELETE FROM " + collection + " WHERE id = $1", [id]);
      return res.status(204).end();
    }
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
