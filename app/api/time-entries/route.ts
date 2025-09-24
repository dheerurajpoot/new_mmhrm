import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { getTimeEntriesCollection } from "@/lib/mongodb/collections";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin and HR can view all attendance; employees can only view their own if needed later
    const timeEntriesCollection = await getTimeEntriesCollection();
    const entries = await timeEntriesCollection
      .find({})
      .sort({ clock_in: -1 })
      .toArray();

    return NextResponse.json(entries);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


