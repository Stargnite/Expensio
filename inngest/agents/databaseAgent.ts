import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import convex from "@/lib/convexClient";
import { client } from "@/lib/schematic";
import { createAgent, openai, createTool } from "@inngest/agent-kit";
import { z } from "zod";

const saveToDatabaseTool = createTool({
  name: "save-to-database",
  description: "Save the given data to the convex database.",
  parameters: z.object({
    fileDisplayName: z
      .string()
      .describe(
        "The readable display name of the receipt to show in the UI. If the file name is not human readable, use this to give a more readable name.",
      ),
    receiptId: z.string().describe("The ID of the receipt to update"),
    merchantName: z.string(),
    merchantAddress: z.string(),
    merchantContact: z.string(),
    transactionDate: z.string(),
    transactionAmount: z
      .string()
      .describe(
        "The total amount of the transaction, summing all the items on the receipt.",
      ),
    receiptSummary: z
      .string()
      .describe(
        "A summary of the receipt, including the merchant name, address, contact, transaction date, transaction amount and currency. Include a human readable summary of the recipt. Mention both invoice number and receipt number if both are present. Include some key details about the items on the receipt this is a special featured summary so it should include some key details about the items on the receipt with some context.",
      ),
    currency: z.string(),
    items: z.array(
      z
        .object({
          name: z.string(),
          quantity: z.number(),
          unitPrice: z.number(),
          totalPrice: z.number(),
        })
        .describe(
          "An array of items on the receipt. Include the name, quantity, unit price, and total price of each item.",
        ),
    ),
  }),
  handler: async (params, context) => {
    const {
      fileDisplayName,
      receiptId,
      merchantName,
      merchantAddress,
      merchantContact,
      transactionDate,
      transactionAmount,
      receiptSummary,
      currency,
      items,
    } = params;

    const result = await context.step?.run(
      "save-receipt-to-database",
      async () => {
        try {
          //  Call the convex mutation to update the receipt with extracted data
          const { userId } = await convex.mutation(
            api.receipts.updateReceiptWithExtractedData,
            {
              id: receiptId as Id<"receipts">,
              fileDisplayName,
              merchantName,
              merchantAddress,
              merchantContact,
              transactionDate,
              transactionAmount,
              receiptSummary,
              currency,
              items,
            },
          );

          //   Track event in Schematic
          if (userId) {
            await client.track({
              event: "scan",
              company: {
                id: userId,
              },
              user: {
                id: userId,
              },
            });
          }

          return {
            addedToDb: "Success",
            receiptId,
            fileDisplayName,
            merchantName,
            merchantAddress,
            merchantContact,
            transactionDate,
            transactionAmount,
            receiptSummary,
            currency,
            items,
          };
        } catch (error) {
          return {
            addedToDb: "Failed",
            error: error instanceof Error ? error.message : "Unkown error",
          };
        }
      },
    );

    if (result?.addedToDb === "Success") {
      // Only set KV values if the result was successful
      context.network?.state.kv.set("save-to-database", true);
      context.network?.state.kv.set("receipt", receiptId);
    }
    return result;
  },
});

export const databaseAgent = createAgent({
  name: "Database Agent",
  description:
    "responsible for taking key information regarding receipts and saving it to the convex database.",
  system:
    "you are a helpful assistant that takes key information regrading receipts and save it to the convex database.",
  model: openai({
    model: "gpt-4o-mini",
    defaultParameters: {
      max_completion_tokens: 1000,
    },
  }),
  tools: [saveToDatabaseTool],
});
