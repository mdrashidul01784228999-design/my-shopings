import { redirect } from "next/navigation";
import { isAdmin } from "../../lib/auth";

export const metadata = { title: "Add Product", robots: { index: false, follow: false } };

export default function Layout({ children }) {
  if (!isAdmin()) redirect("/login");
  return children;
}
