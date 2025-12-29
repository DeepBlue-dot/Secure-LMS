import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const currentHour = new Date().getHours();

  // Rule-Based Access Control (RuBAC)
  const isWorkingHours = currentHour >= 5 && currentHour <= 23;

  // Allow admins anytime
  const isAdmin = token?.role === "SYSTEM_ADMIN";

  if (!isWorkingHours && !isAdmin) {
    // Block system access during off-hours
    return NextResponse.redirect(
      new URL("/maintenance", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/resources/:path*",
    "/api/resources/:path*",
    "/dashboard/:path*",
  ],
};
