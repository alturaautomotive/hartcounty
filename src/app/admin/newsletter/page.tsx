import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { render } from "@react-email/render";
import WeeklyDigest from "@/emails/WeeklyDigest";
import prisma from "@/lib/prisma";
import {
  getPetOfMonth,
  getRecentlyAdopted,
  getNewArrivals,
  getWeeklyDonationStats,
} from "@/lib/email-data";
import { getPublicSiteUrl } from "@/lib/site-url";
import NewsletterClient from "./NewsletterClient";

const BASE_URL = getPublicSiteUrl();

export default async function NewsletterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session) redirect("/admin/login");

  const [petOfMonth, recentlyAdopted, newArrivals, donationStats] =
    await Promise.all([
      getPetOfMonth(),
      getRecentlyAdopted(),
      getNewArrivals(),
      getWeeklyDonationStats(),
    ]);

  const previewHtml = await render(
    WeeklyDigest({
      petOfMonth: petOfMonth ?? undefined,
      recentlyAdopted,
      newArrivals,
      monthlyDonorFirstNames: donationStats.monthlyDonorFirstNames,
      unsubscribeUrl: `${BASE_URL}/api/unsubscribe?token=preview`,
      baseUrl: BASE_URL,
    })
  );

  const [subscribers, stats] = await Promise.all([
    prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.subscriber.groupBy({
      by: ["unsubscribed"],
      _count: true,
    }),
  ]);

  const activeCount =
    stats.find((s) => !s.unsubscribed)?._count ?? 0;
  const unsubscribedCount =
    stats.find((s) => s.unsubscribed)?._count ?? 0;

  return (
    <NewsletterClient
      previewHtml={previewHtml}
      subscribers={subscribers.map((s) => ({
        id: s.id,
        email: s.email,
        firstName: s.firstName,
        source: s.source,
        unsubscribed: s.unsubscribed,
        createdAt: s.createdAt.toISOString(),
      }))}
      activeCount={activeCount}
      unsubscribedCount={unsubscribedCount}
    />
  );
}
