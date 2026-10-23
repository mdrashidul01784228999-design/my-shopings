import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "sc_admin";
// Set ADMIN_PASSWORD in production. Dev fallback: admin123
const password = () => ("admin123");
export const makeToken = () =>
  crypto.createHmac("sha256", process.env.AUTH_SECRET || "shopcube-dev-secret").update(password()).digest("hex");

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();
export const checkPassword = (input) => !!password() && crypto.timingSafeEqual(sha(input), sha(password()));

export function isAdmin() {
  if (!password()) return false;
  const v = cookies().get(COOKIE)?.value;
  const t = makeToken();
  return !!v && v.length === t.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(t));
}
