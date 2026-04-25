import { Suspense } from "react";
import { getPets } from "@/lib/queries";
import PetCard from "@/components/PetCard";
import PetFilters from "@/components/PetFilters";
import MembershipBanner from "@/components/MembershipBanner";

export const metadata = {
  title: "Adoptable Pets | Hart County Animal Rescue",
  description:
    "Browse all adoptable pets at Hart County Animal Rescue. Filter by species, size, age, and more to find your perfect companion.",
};

export default async function PetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const filters = {
    species: typeof params.species === "string" ? params.species : undefined,
    size: typeof params.size === "string" ? params.size : undefined,
    ageCategory:
      typeof params.ageCategory === "string" ? params.ageCategory : undefined,
    goodWithKids: params.goodWithKids === "true",
    goodWithDogs: params.goodWithDogs === "true",
    goodWithCats: params.goodWithCats === "true",
    houseTrained: params.houseTrained === "true",
  };

  const pets = await getPets(filters);

  return (
    <main className="flex-1 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-amber-700">
          Private adoption gallery
        </p>
        <h1 className="mb-3 text-5xl font-black tracking-tight text-slate-950">
          Adoptable Pets
        </h1>
        <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600">
          {pets.length} {pets.length === 1 ? "pet" : "pets"} available for
          adoption, each receiving attentive care while they wait for the right
          home.
        </p>

        <Suspense>
          <PetFilters />
        </Suspense>

        <div className="mt-8">
          <MembershipBanner />
        </div>

        {pets.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="mt-16 rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-xl shadow-slate-950/10">
            <p className="text-lg font-black text-slate-800">
              No pets match your filters
            </p>
            <p className="mt-1 text-slate-500">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
