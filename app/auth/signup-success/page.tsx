import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Mail } from "lucide-react"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">MM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MMHRM</span>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-800">Account Created!</CardTitle>
            <CardDescription>Please check your email to verify your account</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <Mail className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                We've sent a verification email to your inbox. Please click the link in the email to activate your
                account.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or contact your HR administrator.
              </p>
            </div>
            <Link href="/auth/login">
              <Button className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
