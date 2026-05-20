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

export async function GET(req: NextRequest) {
  if (!(await verifyAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pb = createPocketBase();
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL || "admin@trinity.local",
      process.env.PB_ADMIN_PASSWORD || "trinity2026"
    );

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    let filter = "";
    const filters: string[] = [];
    if (search) {
      filters.push(
        `(first_name ~ "${search}" || last_name ~ "${search}" || phone ~ "${search}" || email ~ "${search}")`
      );
    }
    if (status) {
      filters.push(`status = "${status}"`);
    }
    filter = filters.join(" && ");

    const result = await pb.collection("submissions").getList(1, 200, {
      filter: filter || undefined,
      sort: "-created",
    });

    return NextResponse.json({ items: result.items, total: result.totalItems });
  } catch (err: unknown) {
    console.error("[admin/submissions]", err);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
