import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPetBySlug } from "@/lib/queries";
import SponsorButton from "./SponsorButton";

const traitBadges = [
  { key: "goodWithKids", label: "Good with Kids" },
  { key: "goodWithDogs", label: "Good with Dogs" },
  { key: "goodWithCats", label: "Good with Cats" },
  { key: "houseTrained", label: "House Trained" },
  { key: "vaccinated", label: "Vaccinated" },
  { key: "spayedNeutered", label: "Spayed/Neutered" },
  { key: "microchipped", label: "Microchipped" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pet = await getPetBySlug(slug);
  const fee = pet.adoptionFee ?? pet.price;

  return {
    title: `${pet.name} | Hart County Animal Rescue`,
    description: `Meet ${pet.name}${pet.breed ? `, a ${pet.breed}` : ""} available for adoption${fee != null ? ` - $${fee.toFixed(0)} adoption fee` : ""}. Schedule a meet-and-greet today!`,
  };
}

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pet = await getPetBySlug(slug);
  const fee = pet.adoptionFee ?? pet.price;

  return (
    <main className="flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Back link */}
        <Link
          href="/pets"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to all pets
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Hero image */}
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-neutral-100">
            {pet.imageUrl ? (
              <Image
                src={pet.imageUrl}
                alt={pet.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 21C12 21 4 16.5 4 10a4 4 0 018 0 4 4 0 018 0c0 6.5-8 11-8 11z"
                  />
                </svg>
              </div>
            )}
            {pet.energyLevel && (
              <span className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm font-medium capitalize text-neutral-700 backdrop-blur">
                {pet.energyLevel} energy
              </span>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                {pet.name}
              </h1>
              {fee != null && (
                <span className="shrink-0 text-2xl font-bold text-primary-600">
                  ${fee.toFixed(0)}
                </span>
              )}
            </div>

            {/* Meta grid */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Breed", value: pet.breed },
                { label: "Age", value: pet.ageCategory },
                { label: "Size", value: pet.size },
                { label: "Sex", value: pet.sex },
                { label: "Weight", value: pet.weight },
                { label: "Color", value: pet.color },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl bg-neutral-50 px-3 py-2"
                  >
                    <p className="text-xs font-medium text-neutral-500">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold capitalize text-neutral-900">
                      {item.value}
                    </p>
                  </div>
                ))}
            </div>

            {/* Trait badges */}
            <div className="mb-6 flex flex-wrap gap-2">
              {traitBadges.map(
                ({ key, label }) =>
                  pet[key] && (
                    <span
                      key={key}
                      className="rounded-full bg-success-50 px-3 py-1 text-sm font-medium text-success-600"
                    >
                      {label}
                    </span>
                  )
              )}
            </div>

            {/* Special needs */}
            {pet.specialNeeds && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-800">
                  Special Needs
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  {pet.specialNeeds}
                </p>
              </div>
            )}

            {/* Description */}
            {pet.description && (
              <div className="mb-8">
                <h2 className="mb-2 text-lg font-semibold text-neutral-900">
                  About {pet.name}
                </h2>
                <ul className="list-inside list-disc space-y-1.5 text-neutral-600">
                  {pet.description
                    .split(/\.\s+/)
                    .filter(Boolean)
                    .map((bullet, i) => (
                      <li key={i}>{bullet.replace(/\.$/, "").trim()}</li>
                    ))}
                </ul>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/book/${pet.slug}`}
                className="flex-1 rounded-xl bg-primary-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-700"
                aria-label={`Book a meet-and-greet with ${pet.name}`}
              >
                Book Meet-and-Greet
              </Link>
              <SponsorButton petId={pet.id} petName={pet.name} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
