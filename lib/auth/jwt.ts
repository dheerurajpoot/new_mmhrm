import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

export interface JWTPayload {
  userId: string
  email: string
  role?: string
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    throw new Error("Invalid token")
  }
}
