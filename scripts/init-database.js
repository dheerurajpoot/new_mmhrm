import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB

if (!MONGODB_URI || !MONGODB_DB) {
  console.error("Missing required environment variables: MONGODB_URI and MONGODB_DB")
  process.exit(1)
}

async function initializeDatabase() {
  let client

  try {
    console.log("Connecting to MongoDB...")
    client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db(MONGODB_DB)
    console.log(`Connected to database: ${MONGODB_DB}`)

    // Create collections if they don't exist
    const collections = [
      "users",
      "sessions",
      "profiles",
      "leave_requests",
      "leave_balances",
      "leave_types",
      "time_entries",
      "wfh_requests",
      "employee_finances",
      "payroll_records",
    ]

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName)
        console.log(`Created collection: ${collectionName}`)
      } catch (error) {
        if (error.codeName === "NamespaceExists") {
          console.log(`Collection already exists: ${collectionName}`)
        } else {
          console.error(`Error creating collection ${collectionName}:`, error.message)
        }
      }
    }

    // Create indexes
    console.log("Creating indexes...")

    const usersCollection = db.collection("users")
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    console.log("Created unique index on users.email")

    const sessionsCollection = db.collection("sessions")
    await sessionsCollection.createIndex({ token: 1 }, { unique: true })
    await sessionsCollection.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
    console.log("Created indexes on sessions collection")

    const profilesCollection = db.collection("profiles")
    await profilesCollection.createIndex({ user_id: 1 }, { unique: true })
    await profilesCollection.createIndex({ email: 1 }, { unique: true })
    console.log("Created indexes on profiles collection")

    // Create default leave types
    const leaveTypesCollection = db.collection("leave_types")
    const defaultLeaveTypes = [
      { name: "Annual Leave", days_per_year: 25, carry_forward: true },
      { name: "Sick Leave", days_per_year: 10, carry_forward: false },
      { name: "Personal Leave", days_per_year: 5, carry_forward: false },
      { name: "Maternity Leave", days_per_year: 90, carry_forward: false },
      { name: "Paternity Leave", days_per_year: 14, carry_forward: false },
    ]

    for (const leaveType of defaultLeaveTypes) {
      try {
        await leaveTypesCollection.insertOne(leaveType)
        console.log(`Created leave type: ${leaveType.name}`)
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Leave type already exists: ${leaveType.name}`)
        } else {
          console.error(`Error creating leave type ${leaveType.name}:`, error.message)
        }
      }
    }

    console.log("Database initialization completed successfully!")
  } catch (error) {
    console.error("Database initialization failed:", error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("Database connection closed")
    }
  }
}

initializeDatabase()
