import assert from "node:assert/strict";
import test from "node:test";
import { processMetaWebhookBody } from "./route";

test("processes every batched leadgen change and non-echo message", async () => {
  const leadIds: string[] = [];
  const messageIds: string[] = [];

  await processMetaWebhookBody(
    {
      entry: [
        {
          changes: [
            { field: "leadgen", value: { leadgen_id: "lead-1" } },
            { field: "leadgen", value: { leadgen_id: "lead-2" } },
          ],
          messaging: [
            {
              sender: { id: "psid-1" },
              message: { mid: "mid-1", text: "first" },
            },
            { sender: { id: "page" }, message: { mid: "echo", is_echo: true } },
          ],
        },
        {
          messaging: [
            {
              sender: { id: "psid-2" },
              message: { mid: "mid-2", text: "second" },
            },
          ],
        },
      ],
    },
    {
      handleLeadgen: async (value) => {
        leadIds.push(value.leadgen_id);
      },
      handleMessaging: async (messaging) => {
        messageIds.push(messaging.message?.mid ?? "");
      },
    }
  );

  assert.deepEqual(leadIds, ["lead-1", "lead-2"]);
  assert.deepEqual(messageIds, ["mid-1", "mid-2"]);
});

test("surfaces handler failures so webhook callers can retry", async () => {
  await assert.rejects(
    processMetaWebhookBody(
      {
        entry: [
          { changes: [{ field: "leadgen", value: { leadgen_id: "lead-1" } }] },
        ],
      },
      {
        handleLeadgen: async () => {
          throw new Error("transient graph failure");
        },
        handleMessaging: async () => {},
      }
    ),
    /transient graph failure/
  );
});
