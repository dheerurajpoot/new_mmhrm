import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb/connection"

export async function GET() {
  try {
    console.log(" Testing database connection...")

    // Test environment variables
    const mongoUri = process.env.MONGODB_URI
    const mongoDb = process.env.MONGODB_DB
    const jwtSecret = process.env.JWT_SECRET

    console.log(" Environment variables check:")
    console.log("- MONGODB_URI:", !!mongoUri)
    console.log("- MONGODB_DB:", !!mongoDb)
    console.log("- JWT_SECRET:", !!jwtSecret)

    if (!mongoUri || !mongoDb) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required environment variables",
          details: {
            MONGODB_URI: !!mongoUri,
            MONGODB_DB: !!mongoDb,
            JWT_SECRET: !!jwtSecret,
          },
        },
        { status: 500 },
      )
    }

    // Test database connection
    const db = await getDatabase()
    console.log(" Database connection successful")

    // Test database operations
    const collections = await db.listCollections().toArray()
    console.log(
      " Available collections:",
      collections.map((c) => c.name),
    )

    // Test users collection
    const usersCollection = db.collection("users")
    const userCount = await usersCollection.countDocuments()
    console.log(" Users collection count:", userCount)

    // Test sessions collection
    const sessionsCollection = db.collection("sessions")
    const sessionCount = await sessionsCollection.countDocuments()
    console.log(" Sessions collection count:", sessionCount)

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      details: {
        database: mongoDb,
        collections: collections.map((c) => c.name),
        userCount,
        sessionCount,
        environment: {
          MONGODB_URI: !!mongoUri,
          MONGODB_DB: !!mongoDb,
          JWT_SECRET: !!jwtSecret,
        },
      },
    })
  } catch (error) {
    console.error(" Database test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
