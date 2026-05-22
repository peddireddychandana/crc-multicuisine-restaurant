import jwt from "jsonwebtoken";

export function generateToken(userId: string, role: string): string {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.sign({ id: userId, role }, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): { id: string; role: string } {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.verify(token, secret) as { id: string; role: string };
}
