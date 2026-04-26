import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DonationsClient from "./DonationsClient";

export default async function DonationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session) redirect("/admin/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    donations,
    allTimeAgg,
    monthAgg,
    weekAgg,
    recurringCount,
    petGroups,
    pets,
  ] = await Promise.all([
    prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      include: { pet: { select: { name: true, slug: true } } },
    }),
    prisma.donation.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.donation.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.donation.aggregate({
      where: { createdAt: { gte: startOfWeek } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.donation.count({ where: { interval: "monthly" } }),
    prisma.donation.groupBy({
      by: ["petId"],
      where: { petId: { not: null } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
    prisma.pet.findMany({ select: { id: true, name: true, slug: true } }),
  ]);

  const petMap = Object.fromEntries(pets.map((p) => [p.id, p]));

  const topPets = petGroups.map((g) => ({
    petId: g.petId!,
    petName: petMap[g.petId!]?.name ?? "Unknown",
    petSlug: petMap[g.petId!]?.slug ?? "",
    total: g._sum.amount ?? 0,
    count: g._count,
  }));

  return (
    <DonationsClient
      donations={donations.map((d) => ({
        id: d.id,
        amount: d.amount,
        name: d.name,
        email: d.email,
        interval: d.interval,
        petName: d.pet?.name ?? null,
        petSlug: d.pet?.slug ?? null,
        paypalTransactionId: d.paypalTransactionId,
        createdAt: d.createdAt.toISOString(),
      }))}
      stats={{
        allTimeTotal: allTimeAgg._sum.amount ?? 0,
        allTimeCount: allTimeAgg._count,
        monthTotal: monthAgg._sum.amount ?? 0,
        monthCount: monthAgg._count,
        weekTotal: weekAgg._sum.amount ?? 0,
        weekCount: weekAgg._count,
        recurringCount,
        topPets,
      }}
    />
  );
}
