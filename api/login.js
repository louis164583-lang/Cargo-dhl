import crypto from "node:crypto";
import { makeToken } from "./_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { username, password } = req.body || {};
  const hash = crypto.createHash("sha256").update(String(password)).digest("hex");
  if (username === process.env.ADMIN_USERNAME && hash === process.env.ADMIN_HASH) {
    return res.status(200).json({ token: makeToken() });
  }
  return res.status(401).json({ error: "Invalid credentials" });
}
