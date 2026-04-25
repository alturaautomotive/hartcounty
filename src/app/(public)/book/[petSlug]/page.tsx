import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPetBySlug } from "@/lib/queries";
import BookingForm from "./BookingForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ petSlug: string }>;
}): Promise<Metadata> {
  const { petSlug } = await params;
  const pet = await getPetBySlug(petSlug);

  return {
    title: `Book a Visit with ${pet.name} | Hart County Animal Rescue`,
    description: `Schedule a meet-and-greet with ${pet.name} at Hart County Animal Rescue.`,
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ petSlug: string }>;
}) {
  const { petSlug } = await params;
  const pet = await getPetBySlug(petSlug);
  const fee = pet.adoptionFee ?? pet.price;

  return (
    <main className="flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href={`/pets/${pet.slug}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 transition hover:text-amber-700"
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
          Back to {pet.name}
        </Link>

        {/* Pet hero */}
        <div className="mb-8 flex items-center gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-950/10 ring-1 ring-white/70">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-900">
            {pet.imageUrl ? (
              <Image
                src={pet.imageUrl}
                alt={pet.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-amber-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
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
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-950">
              Book a Meet-and-Greet
            </h1>
            <p className="text-sm font-semibold text-slate-500">
              with{" "}
              <span className="font-black text-slate-800">{pet.name}</span>
              {pet.breed ? ` - ${pet.breed}` : ""}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {fee != null && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-800">
                  ${fee.toFixed(0)}
                </span>
              )}
              {pet.vaccinated && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                  Vaccinated
                </span>
              )}
              {pet.spayedNeutered && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                  Spayed/Neutered
                </span>
              )}
            </div>
          </div>
        </div>

        <BookingForm petId={pet.id} petName={pet.name} petSlug={pet.slug} petFee={fee} petVaccinated={pet.vaccinated} petSpayedNeutered={pet.spayedNeutered} petImageUrl={pet.imageUrl} petBreed={pet.breed} />
      </div>
    </main>
  );
}
