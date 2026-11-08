"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  const [me, setMe] = useState({ admin: false, pending: 0 });

  useEffect(() => {
    fetch("/api/auth", { cache: "no-store" }).then((r) => r.json()).then(setMe).catch(() => {});
  }, [path]);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setMe({ admin: false, pending: 0 });
    router.push("/"); router.refresh();
  };

  const links = [["/", "Home"], ["/products", "Products"]];
  if (me.admin) links.push(["/add-product", "+ Add Product"], ["/orders", "Orders"]);

  return (
    <nav className="sc-nav">
      <Link href="/" className="sc-logo">◆ ShopCube</Link>
      <div className="sc-nv">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={path === href ? "on" : ""}>
            {label}
            {href === "/orders" && me.pending > 0 && <span className="sc-badge">{me.pending}</span>}
          </Link>
        ))}
        {me.admin ? <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a> : <Link href="/login" className={path === "/login" ? "on" : ""}>Admin</Link>}
      </div>
    </nav>
  );
}
