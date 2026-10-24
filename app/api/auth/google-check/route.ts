import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return NextResponse.json({ enabled: false, reason: "NO_SUPABASE_URL" });
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google`, {
      method: "GET",
      redirect: "manual",
    });

    // If Supabase returns 400 with "provider is not enabled", it is disabled
    if (res.status === 400) {
      const data = await res.json().catch(() => null);
      if (data?.msg?.includes("provider is not enabled") || data?.error_code === "validation_failed") {
        return NextResponse.json({ enabled: false, reason: "PROVIDER_NOT_ENABLED" });
      }
    }

    // Status 302 or 303 means it redirects to accounts.google.com -> Provider is ENABLED!
    return NextResponse.json({ enabled: true });
  } catch (error: any) {
    return NextResponse.json({ enabled: false, error: error.message });
  }
}
