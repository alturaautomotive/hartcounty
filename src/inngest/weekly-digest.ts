import { inngest } from "./client";
import { render } from "@react-email/render";
import WeeklyDigest from "../emails/WeeklyDigest";
import { getResend } from "../lib/resend";
import prisma from "../lib/prisma";
import {
  getPetOfMonth,
  getRecentlyAdopted,
  getNewArrivals,
  getWeeklyDonationStats,
} from "../lib/email-data";
import crypto from "crypto";
import { getPublicSiteUrl } from "../lib/site-url";
import { getTokenSecret } from "../lib/token-secret";

const BASE_URL = getPublicSiteUrl();
const FROM_EMAIL =
  process.env.EMAIL_FROM ?? "Hart County Animal Rescue <newsletter@hcars.org>";

function generateUnsubscribeToken(subscriberId: string): string {
  const payload = JSON.stringify({ id: subscriberId, purpose: "unsubscribe" });
  const hmac = crypto
    .createHmac("sha256", getTokenSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(payload).toString("base64") + "." + hmac;
}

export const weeklyDigestJob = inngest.createFunction(
  {
    id: "weekly-digest",
    name: "Weekly Digest Email",
    triggers: [{ cron: "0 14 * * 1" }, { event: "app/weekly-digest.send" }],
  },
  async ({ step }) => {
    const data = await step.run("fetch-data", async () => {
      const [petOfMonth, recentlyAdopted, newArrivals, donationStats] =
        await Promise.all([
          getPetOfMonth(),
          getRecentlyAdopted(),
          getNewArrivals(),
          getWeeklyDonationStats(),
        ]);

      return { petOfMonth, recentlyAdopted, newArrivals, donationStats };
    });

    const subscribers = await step.run("fetch-subscribers", async () => {
      return prisma.subscriber.findMany({
        where: { unsubscribed: false },
        select: { id: true, email: true, firstName: true },
      });
    });

    if (subscribers.length === 0) {
      return { sent: 0 };
    }

    const batchSize = 50;
    const batchCount = Math.ceil(subscribers.length / batchSize);
    let totalSent = 0;

    for (let i = 0; i < batchCount; i++) {
      const batch = subscribers.slice(i * batchSize, (i + 1) * batchSize);

      const sent = await step.run(`send-batch-${i}`, async () => {
        const resend = getResend();
        let count = 0;

        for (const sub of batch) {
          const unsubscribeUrl = `${BASE_URL}/api/unsubscribe?token=${generateUnsubscribeToken(sub.id)}`;

          const html = await render(
            WeeklyDigest({
              petOfMonth: data.petOfMonth ?? undefined,
              recentlyAdopted: data.recentlyAdopted,
              newArrivals: data.newArrivals,
              monthlyDonorFirstNames:
                data.donationStats.monthlyDonorFirstNames,
              unsubscribeUrl,
              baseUrl: BASE_URL,
            })
          );

          await resend.emails.send({
            from: FROM_EMAIL,
            to: sub.email,
            subject: data.petOfMonth
              ? `Meet ${data.petOfMonth.name}, our Pet of the Month!`
              : "This Week at Hart County Animal Rescue",
            html,
          });

          count++;
        }

        return count;
      });

      totalSent += sent;
    }

    return { sent: totalSent, batches: batchCount };
  }
);
