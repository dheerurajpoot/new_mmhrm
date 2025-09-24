import { type NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth/server"
import { getLeaveTypesCollection } from "@/lib/mongodb/collections"

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const collection = await getLeaveTypesCollection()
    const defaults = [
      { name: "Casual leave", description: "General purpose leave", max_days_per_year: 12, carry_forward: false },
      { name: "Sick leave", description: "Illness or recovery", max_days_per_year: 10, carry_forward: true },
      { name: "Medical leave", description: "Medical procedures", max_days_per_year: 7, carry_forward: false },
      { name: "Marriage leave", description: "Marriage ceremony", max_days_per_year: 7, carry_forward: false },
      { name: "Halfday leave", description: "Half-day absence", max_days_per_year: 24, carry_forward: false },
      { name: "Shortday leave", description: "Short absence", max_days_per_year: 24, carry_forward: false },
      { name: "Mensuration leave", description: "Period leave", max_days_per_year: 12, carry_forward: false },
      { name: "Workfrom home", description: "WFH days", max_days_per_year: 60, carry_forward: false },
    ]

    // Seed defaults if empty
    const count = await collection.countDocuments({})
    if (count === 0) {
      await collection.insertMany(
        defaults.map((d) => ({ ...d, created_at: new Date(), updated_at: new Date() })),
      )
    }

    const docs = await collection.find({}).toArray()
    const payload = docs.map((d) => ({
      id: (d as any)._id?.toString?.() || (d as any)._id,
      name: d.name,
      description: d.description,
      max_days_per_year: d.max_days_per_year,
      carry_forward: d.carry_forward,
    }))

    return NextResponse.json(payload)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
