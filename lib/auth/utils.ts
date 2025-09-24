import type { NextRequest } from "next/server"

export function getUserFromRequest(request: NextRequest): {
  userId: string | null
  role: string | null
} {
  const userId = request.headers.get("x-user-id")
  const role = request.headers.get("x-user-role")

  return {
    userId,
    role,
  }
}

export function createAuthResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export function createErrorResponse(message: string, status = 400) {
  return createAuthResponse({ error: message }, status)
}

export function createUnauthorizedResponse() {
  return createErrorResponse("Unauthorized", 401)
}

export function createForbiddenResponse() {
  return createErrorResponse("Forbidden", 403)
}
