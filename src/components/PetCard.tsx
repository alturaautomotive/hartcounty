import Image from "next/image";
import Link from "next/link";
import type { Pet } from "@/generated/prisma/client";

const badges = [
  { key: "goodWithKids", label: "Good with Kids" },
  { key: "goodWithDogs", label: "Good with Dogs" },
  { key: "goodWithCats", label: "Good with Cats" },
  { key: "houseTrained", label: "House Trained" },
  { key: "vaccinated", label: "Vaccinated" },
  { key: "spayedNeutered", label: "Spayed/Neutered" },
] as const;

export default function PetCard({ pet }: { pet: Pet }) {
  const fee = pet.adoptionFee ?? pet.price;

  return (
    <div className="group rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-100">
        {pet.imageUrl ? (
          <Image
            src={pet.imageUrl}
            alt={pet.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
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
          <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-700 backdrop-blur">
            {pet.energyLevel} energy
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-neutral-900">{pet.name}</h3>
          {fee != null && (
            <span className="shrink-0 text-lg font-bold text-primary-600">
              ${fee.toFixed(0)}
            </span>
          )}
        </div>

        <p className="mb-3 text-sm text-neutral-500">
          {[pet.breed, pet.ageCategory, pet.size].filter(Boolean).join(" · ")}
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {badges.map(
            ({ key, label }) =>
              pet[key] && (
                <span
                  key={key}
                  className="rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600"
                >
                  {label}
                </span>
              )
          )}
        </div>

        <Link
          href={`/book/${pet.slug}`}
          className="block w-full rounded-xl bg-primary-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-700"
          aria-label={`Book a meet-and-greet with ${pet.name}`}
        >
          Book Meet-and-Greet
        </Link>
      </div>
    </div>
  );
}
