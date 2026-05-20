import { NextRequest, NextResponse } from "next/server";
import { createPocketBase } from "@/lib/pocketbase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const insurance_type = formData.get("insurance_type") as string;
    const policy_file = formData.get("policy_file") as File | null;

    if (!first_name || !last_name || !email || !phone || !insurance_type) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const pb = createPocketBase();

    // Authenticate as admin using PocketBase admin credentials
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL || "admin@trinity.local",
      process.env.PB_ADMIN_PASSWORD || "trinity2026"
    );

    const data = new FormData();
    data.append("first_name", first_name);
    data.append("last_name", last_name);
    data.append("email", email);
    data.append("phone", phone);
    data.append("insurance_type", insurance_type);
    data.append("status", "pending");
    data.append("submitted_at", new Date().toISOString());
    if (policy_file && policy_file.size > 0) {
      data.append("policy_file", policy_file);
    }

    const record = await pb.collection("submissions").create(data);

    // Kick off async extraction if a file was attached
    if (policy_file && policy_file.size > 0) {
      // Fire-and-forget — don't await so the user gets a fast response
      fetch(`${process.env.NEXT_PUBLIC_PB_URL?.replace("api.", "") || "http://localhost:3000"}/api/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id }),
      }).catch(() => {});
    }

    return NextResponse.json({ id: record.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("[submit]", err);
    return NextResponse.json({ error: "Failed to submit quote." }, { status: 500 });
  }
}
