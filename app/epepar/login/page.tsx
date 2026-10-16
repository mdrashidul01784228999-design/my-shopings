import Link from "next/link";

export const metadata = { title: "লগইন — বাংলা পেপার" };

export default function LoginPage() {
  return (
    <div className="container-x grid min-h-[75vh] place-items-center py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-lift md:grid-cols-2">
        <div
          className="hidden p-10 text-white md:flex md:flex-col md:justify-end"
          style={{ background: "linear-gradient(150deg,#073D31,#0B5D4B 60%,#C8203A)" }}
        >
          <p className="font-serif text-3xl font-extrabold leading-snug">
            আপনার পছন্দের খবর, এক জায়গায়
          </p>
          <p className="mt-3 text-white/80">খবর সংরক্ষণ করুন, মন্তব্য করুন, প্রোফাইল সাজান।</p>
        </div>

        <form className="grid gap-5 p-6 sm:p-10">
          <h1 className="font-serif text-2xl font-extrabold sm:text-3xl">লগইন করুন</h1>
          <label className="grid gap-1.5">
            <span className="font-semibold">ইমেইল</span>
            <input type="email" required className="rounded-xl border border-ink/15 px-4 py-3 outline-none focus:border-forest" />
          </label>
          <label className="grid gap-1.5">
            <span className="font-semibold">পাসওয়ার্ড</span>
            <input type="password" required className="rounded-xl border border-ink/15 px-4 py-3 outline-none focus:border-forest" />
          </label>
          <button className="rounded-xl bg-forest py-3 font-bold text-white hover:bg-forest-dark">লগইন</button>
          <p className="text-sm text-ink/60">
            নতুন পাঠক? <Link href="/profile" className="font-semibold text-forest">অ্যাকাউন্ট খুলুন</Link>
          </p>
        </form>
      </div>
    </div>
  );
}