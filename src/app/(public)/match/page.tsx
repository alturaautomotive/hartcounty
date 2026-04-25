import { Suspense } from "react";
import Survey from "@/components/Survey";

export const metadata = {
  title: "Find Your Match | Hart County Animal Rescue",
  description:
    "Answer a few questions and we'll match you with adoptable pets that fit your lifestyle.",
};

export default function MatchPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-slate-950 px-4 py-14 text-center text-white">
        <p className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-amber-300">
          Concierge matching
        </p>
        <h1 className="text-5xl font-black tracking-tight text-white">
          Find Your Perfect Match
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-300">
          Answer 7 quick questions about your home and lifestyle, and we'll show
          you the pets that are the best fit for you.
        </p>
      </section>

      <Suspense>
        <Survey />
      </Suspense>
    </main>
  );
}
