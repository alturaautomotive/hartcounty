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
      <section className="bg-primary-50 px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Every animal deserves a loving home
          </h1>
          <p className="mt-4 text-lg text-neutral-600 sm:text-xl">
            Hart County Animal Rescue Society connects abandoned and neglected
            animals with caring families. Browse our adoptable pets, schedule a
            visit, or make a donation to support our mission.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/pets"
              className="rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-700"
            >
              Browse Adoptable Pets
            </Link>
            <Link
              href="/donate"
              className="rounded-xl bg-green-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-green-600"
              aria-label="Donate to support our rescue mission"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Tiers */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            Your donation makes a difference
          </h2>
          <p className="mt-3 text-neutral-600">
            Every dollar goes directly to the care and rescue of animals in need.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impactTiers.map((tier) => (
              <div
                key={tier.amount}
                className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
              >
                <p className="text-3xl font-bold text-primary-600">
                  {tier.amount}
                </p>
                <p className="mt-2 text-sm text-neutral-600">{tier.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pets */}
      {featuredPets.length > 0 && (
        <section className="bg-neutral-50 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                Meet our adoptable pets
              </h2>
              <p className="mt-3 text-neutral-600">
                These friends are waiting for their forever homes.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/pets"
                className="inline-block rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-700"
              >
                View All Pets
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTAs */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          <Link
            href="/match"
            className="group rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition hover:shadow-md"
          >
            <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-600">
              Find Your Perfect Match
            </h3>
            <p className="mt-2 text-neutral-600">
              Answer a few questions and we'll match you with the pet that fits
              your lifestyle.
            </p>
          </Link>
          <Link
            href="/donate"
            className="group rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm transition hover:shadow-md"
          >
            <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-600">
              Support Our Mission
            </h3>
            <p className="mt-2 text-neutral-600">
              Your generosity provides food, shelter, medical care, and love to
              animals in need.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
