import { cookies } from "next/headers"
import { verifyToken } from "./jwt"
import { getUserById } from "../mongodb/operations"
import type { User } from "../mongodb/models"

export async function getCurrentUserServer(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const payload = await verifyToken(token)
    const user = await getUserById(payload.userId)

    return user
  } catch (error) {
    console.error(" Error getting current user on server:", error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUserServer()

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function requireRole(allowedRoles: ("admin" | "hr" | "employee")[]): Promise<User> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(", ")}`)
  }

  return user
}

// Helper functions for specific role checks
export async function requireAdmin(): Promise<User> {
  return requireRole(["admin"])
}

export async function requireHROrAdmin(): Promise<User> {
  return requireRole(["admin", "hr"])
}

export async function requireEmployee(): Promise<User> {
  return requireRole(["admin", "hr", "employee"])
}

export const getServerUser = getCurrentUserServer
