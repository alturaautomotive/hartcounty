import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { weeklyDigestJob } from "@/inngest/weekly-digest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [weeklyDigestJob],
});
