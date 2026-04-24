import { Suspense } from "react";
import { getPets } from "@/lib/queries";
import PetCard from "@/components/PetCard";
import PetFilters from "@/components/PetFilters";

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
    <main className="flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-900">
          Adoptable Pets
        </h1>
        <p className="mb-8 text-neutral-600">
          {pets.length} {pets.length === 1 ? "pet" : "pets"} available for
          adoption
        </p>

        <Suspense>
          <PetFilters />
        </Suspense>

        {pets.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-lg font-medium text-neutral-700">
              No pets match your filters
            </p>
            <p className="mt-1 text-neutral-500">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
