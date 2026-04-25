import Link from "next/link";
import { getFeaturedPets } from "@/lib/queries";
import PetCard from "@/components/PetCard";

const impactTiers = [
  { amount: "$25", label: "Vaccines & preventive care for one pet" },
  { amount: "$50", label: "Spay/neuter surgery" },
  { amount: "$100", label: "Emergency medical treatment" },
  { amount: "$250", label: "Full rescue, rehab & rehoming" },
];

export default async function HomePage() {
  const featuredPets = await getFeaturedPets();

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-24 text-center text-white sm:px-6 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.22),transparent_32rem),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.96))]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-5 text-sm font-black uppercase tracking-[0.32em] text-amber-300">
            Elevated rescue care for Hart County
          </p>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl">
            Every animal deserves a world-class second chance
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
            Hart County Animal Rescue Society connects abandoned and neglected
            animals with caring families. Browse our adoptable pets, schedule a
            visit, or make a donation to support our mission.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/pets"
              className="rounded-full bg-white px-7 py-3.5 text-base font-black text-slate-950 shadow-xl shadow-black/20 transition hover:bg-amber-100"
            >
              Browse Adoptable Pets
            </Link>
            <Link
              href="/donate"
              className="rounded-full bg-amber-400 px-7 py-3.5 text-base font-black text-slate-950 shadow-xl shadow-amber-950/30 transition hover:bg-amber-300"
              aria-label="Donate to support our rescue mission"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Tiers */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-700">
            Direct impact
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Your donation makes a difference
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Every dollar goes directly to the care and rescue of animals in need.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impactTiers.map((tier) => (
              <div
                key={tier.amount}
                className="rounded-3xl border border-amber-200/70 bg-white/90 p-6 text-center shadow-xl shadow-slate-950/10 ring-1 ring-white/70 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <p className="text-4xl font-black text-slate-950">
                  {tier.amount}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  {tier.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pets */}
      {featuredPets.length > 0 && (
        <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">
                Adoptable companions
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
                Meet our adoptable pets
              </h2>
              <p className="mt-3 text-slate-300">
                These friends are waiting for their forever homes.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {(featuredPets as any[]).map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/pets"
                className="inline-block rounded-full bg-amber-400 px-7 py-3.5 text-base font-black text-slate-950 shadow-xl shadow-amber-950/30 transition hover:bg-amber-300"
              >
                View All Pets
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTAs */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          <Link
            href="/match"
            className="group rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-950/10 ring-1 ring-white/70 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl"
          >
            <h3 className="text-2xl font-black text-slate-950 group-hover:text-amber-700">
              Find Your Perfect Match
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              Answer a few questions and we'll match you with the pet that fits
              your lifestyle.
            </p>
          </Link>
          <Link
            href="/donate"
            className="group rounded-3xl border border-slate-200 bg-slate-950 p-8 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl"
          >
            <h3 className="text-2xl font-black text-white group-hover:text-amber-200">
              Support Our Mission
            </h3>
            <p className="mt-3 leading-7 text-slate-300">
              Your generosity provides food, shelter, medical care, and love to
              animals in need.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
