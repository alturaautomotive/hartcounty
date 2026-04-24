import prisma from "@/lib/prisma";

export type PetFilters = {
  species?: string;
  size?: string;
  ageCategory?: string;
  goodWithKids?: boolean;
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  houseTrained?: boolean;
};

export async function getFeaturedPets() {
  return prisma.pet.findMany({
    where: { status: "available" },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPets(filters: PetFilters = {}) {
  const where: Record<string, unknown> = { status: "available" };

  if (filters.species) where.species = filters.species;
  if (filters.size) where.size = filters.size;
  if (filters.ageCategory) where.ageCategory = filters.ageCategory;
  if (filters.goodWithKids) where.goodWithKids = true;
  if (filters.goodWithDogs) where.goodWithDogs = true;
  if (filters.goodWithCats) where.goodWithCats = true;
  if (filters.houseTrained) where.houseTrained = true;

  return prisma.pet.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}
