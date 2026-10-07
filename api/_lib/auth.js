import crypto from "node:crypto";

const sign = (p) => crypto.createHmac("sha256", process.env.AUTH_SECRET).update(p).digest("hex");

export function makeToken() {
  const exp = Date.now() + 8 * 60 * 60 * 1000;
  return exp + "." + sign(String(exp));
}

export function isAdmin(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = sign(exp);
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
