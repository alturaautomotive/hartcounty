import Image from "next/image";
import Link from "next/link";
import type { Pet } from "@prisma/client";

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
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10 ring-1 ring-white/70 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        {pet.imageUrl ? (
          <Image
            src={pet.imageUrl}
            alt={pet.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-900 text-amber-200">
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
          <span className="absolute top-3 right-3 rounded-full border border-white/30 bg-slate-950/85 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-200 backdrop-blur">
            {pet.energyLevel} energy
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-xl font-black text-slate-950">{pet.name}</h3>
          {fee != null && (
            <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-800">
              ${fee.toFixed(0)}
            </span>
          )}
        </div>

        <p className="mb-4 text-sm font-semibold text-slate-500">
          {[pet.breed, pet.ageCategory, pet.size].filter(Boolean).join(" · ")}
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {badges.map(
            ({ key, label }) =>
              pet[key] && (
                <span
                  key={key}
                  className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200"
                >
                  {label}
                </span>
              )
          )}
        </div>

        <Link
          href={`/book/${pet.slug}`}
          className="block w-full rounded-full bg-slate-950 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-amber-500 hover:text-slate-950"
          aria-label={`Book a meet-and-greet with ${pet.name}`}
        >
          Book Meet-and-Greet
        </Link>
      </div>
    </div>
  );
}
