import fs from "node:fs/promises";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { prisma } from "../../lib/prisma.js";
import { receiptExtractionSchema } from "./receipt.extraction.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getDemoUser() {
  const email = process.env.DEMO_USER_EMAIL ?? "demo@tradieassistant.com";

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Demo user was not found.");
  }

  return user;
}

export async function extractReceiptData(receiptId: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const owner = await getDemoUser();

  const receipt = await prisma.receipt.findFirst({
    where: {
      id: receiptId,
      ownerId: owner.id,
    },
  });

  if (!receipt) {
    throw new Error("Receipt not found.");
  }

  const file = await fs.readFile(receipt.storagePath);

  const base64 = file.toString("base64");

  const instructions = `
You extract accounting information from Australian business receipts.

Read the supplied receipt carefully.

Return:
- supplier
- expense date
- total amount including GST
- GST amount shown or reliably identifiable
- suggested expense category
- short useful description
- confidence from 0 to 1
- warnings for anything unclear

Expense categories must be one of:
MATERIALS
TOOLS
FUEL
VEHICLE
SUBCONTRACTOR
EQUIPMENT_HIRE
INSURANCE
PHONE_INTERNET
OFFICE
TRAVEL
OTHER

Rules:
- Do not invent missing values.
- Use null when a value cannot be determined.
- expenseDate should use YYYY-MM-DD when known.
- totalAmount should represent the final amount paid or payable.
- gstAmount should only be supplied when clearly shown or reliably derived from the receipt.
- Do not assume every purchase contains GST.
- Put uncertainty or conflicting values in warnings.
`;

  const model = process.env.OPENAI_RECEIPT_MODEL ?? "gpt-5.6";

  const fileContent =
    receipt.mimeType === "application/pdf"
      ? {
          type: "input_file" as const,
          filename: receipt.originalName,
          file_data: `data:application/pdf;base64,${base64}`,
        }
      : {
          type: "input_image" as const,
          image_url: `data:${receipt.mimeType};base64,${base64}`,
          detail: "high" as const,
        };

  const response = await openai.responses.parse({
    model,

    input: [
      {
        role: "system",
        content:
          "You are an accurate Australian receipt data extraction assistant.",
      },

      {
        role: "user",

        content: [
          {
            type: "input_text",
            text: instructions,
          },

          fileContent,
        ],
      },
    ],

    text: {
      format: zodTextFormat(receiptExtractionSchema, "receipt_extraction"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("The receipt could not be analysed.");
  }

  return response.output_parsed;
}
