import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { render } from "@react-email/render";
import WeeklyDigest from "@/emails/WeeklyDigest";
import { getResend } from "@/lib/resend";
import {
  getPetOfMonth,
  getRecentlyAdopted,
  getNewArrivals,
  getWeeklyDonationStats,
} from "@/lib/email-data";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://hcars.org";
const FROM_EMAIL =
  process.env.EMAIL_FROM ?? "Hart County Animal Rescue <newsletter@hcars.org>";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [petOfMonth, recentlyAdopted, newArrivals, donationStats] =
    await Promise.all([
      getPetOfMonth(),
      getRecentlyAdopted(),
      getNewArrivals(),
      getWeeklyDonationStats(),
    ]);

  const html = await render(
    WeeklyDigest({
      petOfMonth: petOfMonth ?? undefined,
      recentlyAdopted,
      newArrivals,
      weeklyDonorCount: donationStats.count,
      weeklyDonationTotal: donationStats.total,
      monthlyDonorFirstNames: donationStats.monthlyDonorFirstNames,
      unsubscribeUrl: `${BASE_URL}/api/unsubscribe?token=test-preview`,
      baseUrl: BASE_URL,
    })
  );

  const resend = getResend();
  await resend.emails.send({
    from: FROM_EMAIL,
    to: session.email,
    subject: "[TEST] Weekly Digest Preview",
    html,
  });

  return NextResponse.json({ sent: true, to: session.email });
}
