import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

export type PetFilters = {
  species?: string;
  size?: string;
  ageCategory?: string;
  excludeSlug?: string;
  goodWithKids?: boolean;
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  houseTrained?: boolean;
};

export async function getPetBySlug(slug: string) {
  const pet = await prisma.pet.findUnique({ where: { slug } });
  if (!pet) notFound();
  return pet;
}

export async function getFeaturedPets() {
  return prisma.pet.findMany({
    where: { status: "available" },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdoptablePets() {
  return getPets({});
}

export async function getPets(filters: PetFilters = {}) {
  const where: Record<string, unknown> = { status: "available" };

  if (filters.species) where.species = filters.species;
  if (filters.size) where.size = filters.size;
  if (filters.ageCategory) where.ageCategory = filters.ageCategory;
  if (filters.excludeSlug) where.slug = { not: filters.excludeSlug };
  if (filters.goodWithKids) where.goodWithKids = true;
  if (filters.goodWithDogs) where.goodWithDogs = true;
  if (filters.goodWithCats) where.goodWithCats = true;
  if (filters.houseTrained) where.houseTrained = true;

  return prisma.pet.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

// ─── Admin Dashboard Queries ─────────────────────────────────────────

export async function getDashboardData() {
  const [petCount, availableCount, adoptedCount, bookingCount, donationCount, recentBookings, recentDonations, monthlyDonationCount, monthlyTotalDonated, recentMonthlyDonations] =
    await Promise.all([
      prisma.pet.count(),
      prisma.pet.count({ where: { status: "available" } }),
      prisma.pet.count({ where: { status: "adopted" } }),
      prisma.bookingRequest.count(),
      prisma.donation.count(),
      prisma.bookingRequest.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { pet: { select: { name: true } } },
      }),
      prisma.donation.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { pet: { select: { name: true } } },
      }),
      prisma.donation.count({ where: { interval: "monthly" } }),
      prisma.donation.aggregate({ where: { interval: "monthly" }, _sum: { amount: true } }),
      prisma.donation.findMany({
        where: { interval: "monthly" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { pet: { select: { name: true } } },
      }),
    ]);

  const totalDonated = await prisma.donation.aggregate({ _sum: { amount: true } });

  return {
    petCount,
    availableCount,
    adoptedCount,
    bookingCount,
    donationCount,
    totalDonated: totalDonated._sum.amount ?? 0,
    recentBookings,
    recentDonations,
    monthlyDonationCount,
    monthlyTotalDonated: monthlyTotalDonated._sum.amount ?? 0,
    recentMonthlyDonations,
  };
}

export async function getAllPets() {
  return prisma.pet.findMany({ orderBy: { name: "asc" } });
}


export async function getActiveTeamMembers() {
  try {
    return await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  } catch (error) {
    // Allow About page to load even if TeamMember table is not in the deployed DB yet.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return [];
    }
    throw error;
  }
}

export async function getAllTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getAdminUsers() {
  return prisma.adminUser.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getAllAdminEmails(): Promise<string[]> {
  const admins = await prisma.adminUser.findMany({
    select: { email: true },
  });
  return admins.map((a) => a.email).filter(Boolean);
}
