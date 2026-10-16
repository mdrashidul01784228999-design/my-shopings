import ProfileTabs from "../../profiletab";
import { profile } from "../../data";

export const metadata = { title: "আমার প্রোফাইল — বাংলা পেপার" };

export default function ProfilePage() {
  return (
    <div className="container-x py-8 sm:py-12">
      <section className="overflow-hidden rounded-3xl bg-white shadow-lift">
        {/* কভার */}
        <div
          className="relative h-40 sm:h-56"
          style={{ background: "linear-gradient(120deg,#073D31,#0B5D4B 55%,#C8203A)" }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0 1px,transparent 1px 16px)" }} />
        </div>

        <div className="px-5 pb-8 sm:px-10">
          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-white bg-forest font-serif text-5xl font-extrabold text-white sm:h-32 sm:w-32">
                আ
              </div>
              <div className="pb-1">
                <h1 className="font-serif text-2xl font-extrabold sm:text-3xl">{profile.name}</h1>
                <p className="text-ink/60">{profile.handle}</p>
              </div>
            </div>
            <button className="w-full rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-forest sm:w-auto">
              প্রোফাইল সম্পাদনা
            </button>
          </div>

          <p className="mt-6 max-w-2xl text-lg text-ink/80">{profile.bio}</p>
          <p className="mt-2 text-sm text-ink/55">
            {profile.location} • যোগ দিয়েছেন {profile.joined}
          </p>

          <div className="mt-6 grid max-w-md grid-cols-3 gap-3">
            {profile.stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-forest-light px-4 py-3 text-center">
                <p className="font-serif text-2xl font-extrabold text-forest">{s.value}</p>
                <p className="text-sm text-ink/65">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProfileTabs />
    </div>
  );
}