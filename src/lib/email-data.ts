import prisma from "./prisma";

type PetOfMonth = {
  name: string;
  imageUrl: string | null;
  description: string | null;
  slug: string;
};

function toPetOfMonth(pet: PetOfMonth) {
  return {
    name: pet.name,
    imageUrl: pet.imageUrl!,
    description: pet.description!,
    slug: pet.slug,
  };
}

export async function getPetOfMonth() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  return prisma.$transaction(async (tx) => {
    const currentPet = await tx.pet.findFirst({
      where: { status: "available", featuredMonth: currentMonth },
      orderBy: [{ lastFeaturedAt: "desc" }, { createdAt: "asc" }],
    });

    if (currentPet) {
      return toPetOfMonth(currentPet);
    }

    const pet = await tx.pet.findFirst({
      where: {
        status: "available",
        OR: [{ featuredMonth: null }, { featuredMonth: { not: currentMonth } }],
      },
      orderBy: [{ lastFeaturedAt: "asc" }, { createdAt: "asc" }],
    });

    if (!pet) return null;

    const updatedPet = await tx.pet.update({
      where: { id: pet.id },
      data: { featuredMonth: currentMonth, lastFeaturedAt: new Date() },
    });

    return toPetOfMonth(updatedPet);
  });
}

export async function getRecentlyAdopted() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return prisma.pet.findMany({
    where: { status: "adopted", updatedAt: { gte: oneWeekAgo } },
    select: { name: true, imageUrl: true },
    take: 4,
  });
}

export async function getNewArrivals() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return prisma.pet.findMany({
    where: { status: "available", createdAt: { gte: oneWeekAgo } },
    select: {
      name: true,
      imageUrl: true,
      ageCategory: true,
      size: true,
      slug: true,
    },
    take: 4,
  });
}

export async function getWeeklyDonationStats() {
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const [count, aggregate, monthlyDonors] = await Promise.all([
    prisma.donation.count({ where: { createdAt: { gte: weekStart } } }),

    prisma.donation.aggregate({
      where: { createdAt: { gte: weekStart } },
      _sum: { amount: true },
    }),

    prisma.donation.groupBy({
      by: ["name"],
      where: { createdAt: { gte: monthStart }, name: { not: null } },
    }),
  ]);

  return {
    count,
    total: aggregate._sum.amount ?? 0,
    monthlyDonorFirstNames: monthlyDonors
      .map((d) => d.name?.split(" ")[0])
      .filter((n): n is string => Boolean(n)),
  };
}
