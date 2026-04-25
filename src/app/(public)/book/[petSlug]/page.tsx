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
  const similarPetsHref = `/pets?${new URLSearchParams({
    similarTo: pet.slug,
    species: pet.species,
  }).toString()}`;

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
  const similarPetsHref = `/pets?${new URLSearchParams({
    similarTo: pet.slug,
    species: pet.species,
  }).toString()}`;

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        {/* Back link */}
        <Link
          href={similarPetsHref}
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
          See other pets like {pet.name}
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 ring-1 ring-white/70">
              <div className="relative aspect-[4/3] bg-slate-900">
                {pet.imageUrl ? (
                  <Image
                    src={pet.imageUrl}
                    alt={pet.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-amber-200">
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
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">
                    Meet-and-greet request
                  </p>
                  <h1 className="mt-2 text-3xl font-black text-white">
                    {pet.name}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {[pet.breed, pet.ageCategory, pet.size].filter(Boolean).join(" - ")}
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    What happens next
                  </h2>
                  <ol className="mt-3 space-y-3 text-sm font-medium leading-6 text-slate-600">
                    <li>
                      <span className="font-black text-slate-950">1.</span> Send
                      your preferred visit times.
                    </li>
                    <li>
                      <span className="font-black text-slate-950">2.</span> Our
                      volunteers confirm availability.
                    </li>
                    <li>
                      <span className="font-black text-slate-950">3.</span> You
                      meet {pet.name} by appointment.
                    </li>
                  </ol>
                </div>

                <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                  <p className="text-sm font-black text-amber-900">
                    Appointment-based visits
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Visits are arranged after we review your request. For urgent
                    questions, call (706) 680-6648.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pet.vaccinated && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                      Vaccinated
                    </span>
                  )}
                  {pet.spayedNeutered && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                      Spayed/Neutered
                    </span>
                  )}
                  {pet.microchipped && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                      Microchipped
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              href={similarPetsHref}
              className="mt-4 inline-flex text-sm font-bold text-slate-600 underline decoration-amber-500 decoration-2 underline-offset-4 transition hover:text-amber-700"
            >
              Still browsing? See other pets like {pet.name}
            </Link>
          </aside>

          <section>
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-700">
                Schedule a visit
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                Tell us when you&apos;d like to meet {pet.name}.
              </h2>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600">
                This is not a payment form. It simply helps our volunteers
                coordinate a good time and prepare for your visit.
              </p>
            </div>

            <BookingForm
              petId={pet.id}
              petName={pet.name}
              petSlug={pet.slug}
              similarPetsHref={similarPetsHref}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
