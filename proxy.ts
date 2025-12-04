import { default as middleware } from "next-auth/middleware"
import { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  return middleware(request)
}

export const config = { matcher: ["/", "/projects/:path*", "/settings"] }
