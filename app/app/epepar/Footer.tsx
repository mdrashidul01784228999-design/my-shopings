import Link from "next/link";
import { categories } from "./data";

export default function Footer() {
  return (
    <footer className="mt-20 bg-forest-dark text-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl font-extrabold">বাংলা পেপার</p>
          <p className="mt-3 max-w-sm text-white/70">
            সত্য, নিরপেক্ষ ও দ্রুত খবর পৌঁছে দিই আপনার হাতের মুঠোয়।
          </p>
        </div>
        <div>
          <p className="font-semibold text-gold">বিভাগ</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-white/80">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-white">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gold">যোগাযোগ</p>
          <ul className="mt-3 space-y-2 text-white/80">
            <li>info@banglapaper.com</li>
            <li>+৮৮০ ১২৩৪ ৫৬৭৮৯০</li>
            <li>সিরাজগঞ্জ, বাংলাদেশ</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-white/60">
        © {new Date().getFullYear()} বাংলা পেপার। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
