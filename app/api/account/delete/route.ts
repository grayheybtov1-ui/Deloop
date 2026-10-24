import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      supabaseUrl &&
      serviceRoleKey &&
      serviceRoleKey !== "your-supabase-service-role-key" &&
      !serviceRoleKey.includes("your-")
    ) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      // Delete user from auth.users (cascades to all user tables)
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Account delete API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
