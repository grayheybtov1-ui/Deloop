import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubUserStats } from "@/lib/github";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username parameter is required" }, { status: 400 });
  }

  try {
    const stats = await fetchGitHubUserStats(username);
    return NextResponse.json({ data: stats });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch GitHub stats", message: error.message },
      { status: 500 }
    );
  }
}
