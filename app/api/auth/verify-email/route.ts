import { type NextRequest, NextResponse } from "next/server"
import { createUser, createSession, hashPassword } from "@/lib/auth/auth"
import { getEmailVerificationTokensCollection, getUsersCollection } from "@/lib/mongodb/collections"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Get verification token from database
    const tokensCollection = await getEmailVerificationTokensCollection()
    const verificationToken = await tokensCollection.findOne({
      token,
      used: false,
    })

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 })
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires_at) {
      // Mark token as used and delete it
      await tokensCollection.deleteOne({ _id: verificationToken._id })
      return NextResponse.json({ error: "Verification link has expired. Please request a new one." }, { status: 400 })
    }

    // Create user account with password
    const usersCollection = await getUsersCollection()
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: verificationToken.email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = {
      email: verificationToken.email,
      password: hashedPassword,
      full_name: verificationToken.full_name,
      role: verificationToken.role,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const userResult = await usersCollection.insertOne(newUser)

    // Mark token as used
    await tokensCollection.updateOne(
      { _id: verificationToken._id },
      { $set: { used: true } }
    )

    // Create session for immediate login
    const sessionResult = await createSession(userResult.insertedId.toString())

    if (!sessionResult.success) {
      return NextResponse.json({ error: "Account created but failed to create session" }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Email verified and account created successfully",
      token: sessionResult.token,
      user: {
        id: userResult.insertedId.toString(),
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
