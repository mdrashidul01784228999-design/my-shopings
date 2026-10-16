import { breaking } from "./data";

export default function Ticker() {
  const items = [...breaking, ...breaking];
  return (
    <div className="flex items-center bg-ink text-white">
      <div className="container-x flex items-center gap-4 py-2">
        <span className="shrink-0 rounded-md bg-jaba px-3 py-0.5 text-sm font-bold">ব্রেকিং</span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-12 whitespace-nowrap text-sm sm:text-[15px]">
            {items.map((t, i) => (
              <span key={i} className="flex items-center gap-12">
                {t}
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}