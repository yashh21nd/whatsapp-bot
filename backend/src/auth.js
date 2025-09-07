import dotenv from "dotenv";
dotenv.config();

export function requireAdmin(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : hdr;
  if (token && token === process.env.ADMIN_TOKEN) return next();
  return res.status(401).json({ error: "Unauthorized" });
}
