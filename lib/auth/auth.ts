import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { getUsersCollection, getSessionsCollection } from "@/lib/mongodb/collections"
import type { User, Session } from "@/lib/mongodb/models"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  role: "admin" | "hr" | "employee"
  profile_photo?: string
  department?: string
  position?: string
  phone?: string
  address?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(userData: {
  email: string
  password?: string // Make password optional for signup
  full_name?: string
  role?: "admin" | "hr" | "employee"
  department?: string
  position?: string
  phone?: string
  address?: string
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log(" Getting users collection...")
    const usersCollection = await getUsersCollection()
    console.log(" Users collection obtained")

    // Check if user already exists
    console.log(" Checking if user exists:", userData.email)
    const existingUser = await usersCollection.findOne({ email: userData.email })
    if (existingUser) {
      console.log(" User already exists")
      return { success: false, error: "User already exists" }
    }

    // Create user without password initially (for signup flow)
    // Password will be set on first login
    const newUser: User = {
      email: userData.email,
      password: userData.password ? await hashPassword(userData.password) : "", // Only hash if password provided
      full_name: userData.full_name,
      role: userData.role || "employee",
      department: userData.department,
      position: userData.position,
      phone: userData.phone,
      address: userData.address,
      created_at: new Date(),
      updated_at: new Date(),
    }

    console.log(" Inserting user into database...")
    const result = await usersCollection.insertOne(newUser)
    newUser._id = result.insertedId
    console.log(" User inserted successfully with ID:", result.insertedId)

    return { success: true, user: newUser }
  } catch (error) {
    console.error(" Error creating user:", error)
    console.error(" Create user error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof Error && "code" in error ? error.code : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    return {
      success: false,
      error: `Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const usersCollection = await getUsersCollection()

    // Find user by email
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    // Check if this is first-time login (no password set)
    if (!user.password || user.password === "") {
      // First-time login: set the password
      console.log(" First-time login: setting password for user:", email)
      const hashedPassword = await hashPassword(password)
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword, updated_at: new Date() } }
      )
    } else {
      // Regular login: verify password
      const isValidPassword = await verifyPassword(password, user.password)
      if (!isValidPassword) {
        return { success: false, error: "Invalid credentials" }
      }
    }

    // Return user without password
    const authUser: AuthUser = {
      id: user._id!.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      profile_photo: user.profile_photo,
      department: user.department,
      position: user.position,
      phone: user.phone,
      address: user.address,
    }

    return { success: true, user: authUser }
  } catch (error) {
    console.error(" Error authenticating user:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function createSession(userId: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    console.log(" Getting sessions collection...")
    const sessionsCollection = await getSessionsCollection()
    console.log(" Sessions collection obtained")

    // Generate JWT token
    console.log(" Generating JWT token...")
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    console.log(" JWT token generated")

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    // Create session record
    const session: Session = {
      user_id: new ObjectId(userId),
      token,
      expires_at: expiresAt,
      created_at: new Date(),
    }

    console.log(" Inserting session into database...")
    await sessionsCollection.insertOne(session)
    console.log(" Session created successfully")

    return { success: true, token }
  } catch (error) {
    console.error(" Error creating session:", error)
    console.error(" Create session error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof Error && "code" in error ? error.code : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    return {
      success: false,
      error: `Failed to create session: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function verifySession(token: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    // Get user from database
    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Check if session exists and is not expired
    const sessionsCollection = await getSessionsCollection()
    const session = await sessionsCollection.findOne({
      token,
      expires_at: { $gt: new Date() },
    })

    if (!session) {
      return { success: false, error: "Session expired or invalid" }
    }

    const authUser: AuthUser = {
      id: user._id!.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      profile_photo: user.profile_photo,
      department: user.department,
      position: user.position,
      phone: user.phone,
      address: user.address,
    }

    return { success: true, user: authUser }
  } catch (error) {
    console.error(" Error verifying session:", error)
    return { success: false, error: "Invalid session" }
  }
}

export async function deleteSession(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionsCollection = await getSessionsCollection()
    await sessionsCollection.deleteOne({ token })
    return { success: true }
  } catch (error) {
    console.error(" Error deleting session:", error)
    return { success: false, error: "Failed to delete session" }
  }
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!user) return null

    return {
      id: user._id!.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      profile_photo: user.profile_photo,
      department: user.department,
      position: user.position,
      phone: user.phone,
      address: user.address,
    }
  } catch (error) {
    console.error(" Error getting user by ID:", error)
    return null
  }
}
