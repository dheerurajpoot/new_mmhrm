import { type NextRequest, NextResponse } from "next/server"
import { createUser, createSession } from "@/lib/auth/auth"
import { getEmailVerificationTokensCollection, getUsersCollection } from "@/lib/mongodb/collections"
import { sendVerificationEmail, generateVerificationToken, getBaseUrl } from "@/lib/services/email"

export async function POST(request: NextRequest) {
  try {
    console.log(" Signup API called")
    console.log(" Environment check - MONGODB_URI:", !!process.env.MONGODB_URI)
    console.log(" Environment check - MONGODB_DB:", !!process.env.MONGODB_DB)

    const { email, full_name } = await request.json()
    console.log(" Signup data received:", { email, full_name })

    if (!email || !full_name) {
      console.log(" Missing required fields")
      return NextResponse.json({ error: "Email and full name are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Check if user already exists (without creating them)
    const usersCollection = await getUsersCollection()
    const existingUser = await usersCollection.findOne({ email })
    
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 })
    }

    console.log(" Attempting to create verification token...")
    // Generate verification token
    const verificationToken = generateVerificationToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

    // Clean up any existing verification tokens for this email
    const tokensCollection = await getEmailVerificationTokensCollection()
    await tokensCollection.deleteMany({ email })

    // Save verification token to database
    await tokensCollection.insertOne({
      email,
      token: verificationToken,
      full_name,
      role: "employee",
      expires_at: expiresAt,
      used: false,
      created_at: new Date(),
    })

    console.log(" Attempting to send verification email...")
    // Send verification email
    const emailResult = await sendVerificationEmail(email, full_name, verificationToken)
    
    if (!emailResult.success) {
      console.log(" Email sending failed:", emailResult.error)
      
      // For development: if email fails, still return success but with different message
      // In production, you might want to handle this differently
      console.log(" Email service not configured, returning verification link for manual use")
      const verificationUrl = `${getBaseUrl()}/auth/verify-email?token=${verificationToken}`
      
      return NextResponse.json({
        success: true,
        message: `Email service is not working properly. Please use this link to complete your registration: ${verificationUrl}`,
        verificationUrl: verificationUrl,
        token: verificationToken, // Include token for development
        emailError: emailResult.error // Include the specific error
      })
    }

    console.log(" Signup successful for user:", email)
    return NextResponse.json({
      success: true,
      message: "Verification email sent! Please check your inbox and click the link to complete your registration.",
    })
  } catch (error) {
    console.error(" Sign up API error:", error)
    console.error(" Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
