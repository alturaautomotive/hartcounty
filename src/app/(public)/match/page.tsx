import { Suspense } from "react";
import { getAdoptablePets } from "@/lib/queries";
import Survey from "@/components/Survey";

export const metadata = {
  title: "Find Your Match | Hart County Animal Rescue",
  description:
    "Answer a few questions and we'll match you with adoptable pets that fit your lifestyle.",
};

export default async function MatchPage() {
  const pets = await getAdoptablePets();

  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="bg-white py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Find Your Perfect Match
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-500">
          Answer 7 quick questions about your home and lifestyle, and we'll show
          you the pets that are the best fit for you.
        </p>
      </section>

      <Suspense>
        <Survey initialPets={pets} />
      </Suspense>
    </main>
  );
}
