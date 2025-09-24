import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb/connection"

export async function GET() {
  try {
    console.log(" Testing MongoDB connection...")
    console.log(" MONGODB_URI exists:", !!process.env.MONGODB_URI)
    console.log(" MONGODB_DB exists:", !!process.env.MONGODB_DB)
    console.log(" MONGODB_DB value:", process.env.MONGODB_DB)

    const db = await getDatabase()

    // Test basic database operation
    const collections = await db.listCollections().toArray()
    console.log(
      " Available collections:",
      collections.map((c) => c.name),
    )

    // Test users collection specifically
    const usersCollection = db.collection("users")
    const userCount = await usersCollection.countDocuments()
    console.log(" Users collection count:", userCount)

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      database: process.env.MONGODB_DB,
      collections: collections.map((c) => c.name),
      userCount,
    })
  } catch (error) {
    console.error(" MongoDB connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        mongoUri: process.env.MONGODB_URI ? "Set" : "Not set",
        mongoDb: process.env.MONGODB_DB ? "Set" : "Not set",
      },
      { status: 500 },
    )
  }
}
