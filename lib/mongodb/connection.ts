import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

if (!process.env.MONGODB_DB) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_DB"')
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

const options = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDatabase(): Promise<Db> {
  try {
    console.log(" Attempting to connect to MongoDB...")
    console.log(" MongoDB URI exists:", !!process.env.MONGODB_URI)
    console.log(" MongoDB DB name:", process.env.MONGODB_DB)

    const client = await clientPromise
    const db = client.db(dbName)
    console.log(" MongoDB connection successful, database:", dbName)

    await db.admin().ping()
    console.log(" Database ping successful")

    return db
  } catch (error) {
    console.error(" MongoDB connection failed:", error)
    console.error(" Connection error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

export async function connectToDatabase() {
  try {
    const client = await clientPromise
    const db = client.db(dbName)

    console.log(" Connected to MongoDB successfully")
    return { client, db }
  } catch (error) {
    console.error(" MongoDB connection error:", error)
    throw error
  }
}
