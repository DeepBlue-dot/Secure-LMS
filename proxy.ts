import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { logAccess } from "./lib/audit";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token) return NextResponse.redirect(new URL("/auth/login", request.url));

  const currentHour = new Date().getHours();
  const START_HOUR = Number(process.env.WORK_START_HOUR ?? 5);
  const END_HOUR = Number(process.env.WORK_END_HOUR ?? 23);

  const userRoles = token.role ? [token.role] : [];
  const isAdmin = userRoles.includes("SYSTEM_ADMIN");
  const isWorkingHours = currentHour >= START_HOUR && currentHour <= END_HOUR;

  if (!isWorkingHours && !isAdmin) {
    void logAccess(token.email!, request.url, "BLOCKED_OFF_HOURS");
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}
