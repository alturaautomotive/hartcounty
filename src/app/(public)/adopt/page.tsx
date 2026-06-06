import Link from "next/link";

export const metadata = {
  title: "How to Adopt | Hart County Animal Rescue",
  description: "Learn how to adopt a pet from Hart County Animal Rescue Society. Our simple process helps match you with your perfect companion.",
};

const steps = [
  {
    number: "01",
    title: "Browse Available Pets",
    description:
      "Explore our adoptable animals on the Pets page. Filter by species, size, age, and compatibility to find the right match for your home and lifestyle.",
    cta: { label: "View Pets", href: "/pets" },
  },
  {
    number: "02",
    title: "Find Your Match",
    description:
      "Not sure where to start? Take our Pet Match Survey and we'll score every available pet against your preferences and email you your top 5 matches.",
    cta: { label: "Take the Survey", href: "/match" },
  },
  {
    number: "03",
    title: "Schedule a Meet & Greet",
    description:
      "Found a pet you love? Book a meet-and-greet visit at the shelter. Bring all household members — including resident pets — so everyone can get acquainted.",
    cta: { label: "Book a Visit", href: "/pets" },
  },
  {
    number: "04",
    title: "Complete the Adoption",
    description:
      "If it's a great fit, we'll complete the adoption paperwork at the shelter. Adoption fees vary by animal and help cover vaccinations, spay/neuter, and microchipping.",
    cta: null,
  },
];

const requirements = [
  "Valid government-issued photo ID",
  "Proof of residence (lease or utility bill)",
  "All household members present or in agreement",
  "If renting, written pet-permission from landlord",
  "Up-to-date vaccination records for resident pets",
];

const fees = [
  { animal: "Adult Dog (1+ yr)", fee: "$150" },
  { animal: "Puppy (under 1 yr)", fee: "$250" },
  { animal: "Adult Cat (1+ yr)", fee: "$75" },
  { animal: "Kitten (under 1 yr)", fee: "$100" },
  { animal: "Senior Pet (7+ yr)", fee: "$50" },
];

export default function AdoptPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-slate-950 px-4 py-20 text-center text-white">
        <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
          How to Adopt
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">
          Our adoption process is designed to be simple, transparent, and to set
          every pet and family up for a lifetime of success.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/pets"
            className="rounded-full bg-amber-500 px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:bg-amber-400"
          >
            Browse Pets
          </Link>
          <Link
            href="/match"
            className="rounded-full border-2 border-white px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-white hover:text-slate-950"
          >
            Take the Match Survey
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="mb-12 text-center text-2xl font-black uppercase tracking-tight text-slate-950">
          The Adoption Process
        </h2>
        <div className="space-y-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-6 rounded-2xl border border-slate-100 bg-slate-50 p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 text-lg font-black text-slate-950">
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-950">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                {step.cta && (
                  <Link
                    href={step.cta.href}
                    className="mt-3 inline-block rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-amber-500 hover:text-slate-950"
                  >
                    {step.cta.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements + Fees */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
          {/* Requirements */}
          <div>
            <h2 className="mb-6 text-xl font-black uppercase tracking-tight text-slate-950">
              What to Bring
            </h2>
            <ul className="space-y-3">
              {requirements.map((req) => (
                <li key={req} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
                    ✓
                  </span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Fees */}
          <div>
            <h2 className="mb-6 text-xl font-black uppercase tracking-tight text-slate-950">
              Adoption Fees
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {fees.map((row, i) => (
                <div
                  key={row.animal}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${
                    i < fees.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <span className="font-medium text-slate-700">{row.animal}</span>
                  <span className="font-black text-slate-950">{row.fee}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Fees include spay/neuter, vaccinations, and microchip. Senior pet
              discounts available.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-950">
          Ready to Find Your Forever Friend?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
          Have questions? Contact us at the shelter and we&apos;ll be happy to help.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/pets"
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-amber-500 hover:text-slate-950"
          >
            Browse Pets
          </Link>
          <Link
            href="/donate"
            className="rounded-full border-2 border-slate-950 px-6 py-3 text-sm font-black uppercase tracking-widest text-slate-950 transition hover:bg-slate-950 hover:text-white"
          >
            Support Us
          </Link>
        </div>
      </section>
    </div>
  );
}
