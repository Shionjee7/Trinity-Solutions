import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createPocketBase } from "@/lib/pocketbase";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "trinity-solutions-secret-key-2026"
);

async function verifyAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pb = createPocketBase();
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL || "admin@trinity.local",
      process.env.PB_ADMIN_PASSWORD || "trinity2026"
    );

    const record = await pb.collection("submissions").getOne(params.id);
    return NextResponse.json(record);
  } catch (err: unknown) {
    console.error("[admin/submissions/id]", err);
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
}
