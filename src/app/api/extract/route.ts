import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing submission id." }, { status: 400 });
    }

    const pb = createPocketBase();
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL || "admin@trinity.local",
      process.env.PB_ADMIN_PASSWORD || "trinity2026"
    );

    const record = await pb.collection("submissions").getOne(id);

    if (!record.policy_file) {
      return NextResponse.json({ error: "No policy file attached." }, { status: 400 });
    }

    // Update status to processing
    await pb.collection("submissions").update(id, { status: "processing" });

    // Fetch the file from PocketBase
    const fileUrl = pb.files.getUrl(record, record.policy_file);
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      throw new Error("Failed to fetch policy file from storage.");
    }

    const fileBuffer = await fileRes.arrayBuffer();
    const base64Pdf = Buffer.from(fileBuffer).toString("base64");

    // Call Claude to extract policy data
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Pdf,
              },
            },
            {
              type: "text",
              text: `Extract all relevant insurance policy information from this PDF and return a JSON object with the following structure. Only include fields that are present in the document. Return raw JSON only, no markdown.

{
  "carrier": "Insurance company name",
  "policy_number": "Policy number",
  "premiums": {
    "total": "Total annual or semi-annual premium",
    "breakdown": { "coverage_name": "amount" }
  },
  "coverage_limits": { "coverage_name": "limit" },
  "deductibles": { "coverage_name": "deductible amount" },
  "vehicles": [{ "year": "", "make": "", "model": "", "vin": "" }],
  "drivers": [{ "name": "", "dob": "", "license": "" }],
  "mortgagee": { "name": "", "address": "" },
  "discounts": ["discount names"],
  "policy_period": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "raw_notes": "Any other relevant details"
}`,
            },
          ],
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let extracted_data = null;
    try {
      // Strip potential markdown code fences
      const cleaned = rawText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      extracted_data = JSON.parse(cleaned);
    } catch {
      extracted_data = { raw_notes: rawText };
    }

    await pb.collection("submissions").update(id, {
      status: "complete",
      extracted_data: JSON.stringify(extracted_data),
    });

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    console.error("[extract]", err);
    // Try to mark the record as needing review so it doesn't stay in "processing"
    try {
      const { id } = await req.json().catch(() => ({}));
      if (id) {
        const pb = createPocketBase();
        await pb.admins.authWithPassword(
          process.env.PB_ADMIN_EMAIL || "admin@trinity.local",
          process.env.PB_ADMIN_PASSWORD || "trinity2026"
        );
        await pb.collection("submissions").update(id, { status: "pending" });
      }
    } catch {}
    return NextResponse.json({ error: "Extraction failed." }, { status: 500 });
  }
}
