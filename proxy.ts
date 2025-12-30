import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token) return NextResponse.redirect(new URL("/auth/login", request.url));

  const currentHour = new Date().getHours();
  const START_HOUR = parseInt(process.env.WORK_START_HOUR || "5");
  const END_HOUR = parseInt(process.env.WORK_END_HOUR || "23");

  const userRoles = token.roles || [];
  const isAdmin = userRoles.includes("SYSTEM_ADMIN");
  const isWorkingHours = currentHour >= START_HOUR && currentHour <= END_HOUR;

  // ---------------- RuBAC: Rule-Based ----------------
  if (!isWorkingHours && !isAdmin) {
    await logAccess(token.email, request.url, "BLOCKED_OFF_HOURS");
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // ---------------- Resource & Path ----------------
  const resourceId = request.headers.get("x-resource-id"); // Resource ID from frontend
  if (!resourceId) return NextResponse.next(); // Not accessing resource, skip DAC/MAC

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: { sharedWith: true, owner: true },
  });

  if (!resource) return NextResponse.redirect(new URL("/not-found", request.url));

  // ---------------- MAC: Mandatory Access ----------------
  const userClearance = token.clearanceLevel; // e.g., "INTERNAL"
  const clearanceHierarchy = ["PUBLIC", "INTERNAL", "CONFIDENTIAL"];
  if (
    clearanceHierarchy.indexOf(userClearance) <
    clearanceHierarchy.indexOf(resource.classification)
  ) {
    await logAccess(token.email, request.url, "BLOCKED_MAC");
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // ---------------- DAC: Discretionary Access ----------------
  const hasDACAccess =
    resource.ownerId === token.sub || // Owner always has full access
    resource.sharedWith.some(
      (access) => access.userId === token.sub && access.canRead
    );

  if (!hasDACAccess && !isAdmin) {
    await logAccess(token.email, request.url, "BLOCKED_DAC");
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // ---------------- ABAC: Attribute-Based ----------------
  const userDepartment = token.department;
  if (resource.department && resource.department !== userDepartment && !isAdmin) {
    await logAccess(token.email, request.url, "BLOCKED_ABAC");
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // ---------------- ALLOW ACCESS ----------------
  await logAccess(token.email, request.url, "ALLOWED");
  return NextResponse.next();
}

// ---------------- Audit Logging ----------------
async function logAccess(email: string, url: string, status: string) {
  try {
    await prisma.auditLog.create({
      data: {
        user: { connect: { email } },
        action: "RESOURCE_ACCESS",
        resourceId: url,
        ipAddress: "", // You can extract from request
        userAgent: "", // Optional: request.headers.get("user-agent")
        status,
      },
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}

export const config = {
  matcher: ["/resources/:path*", "/api/resources/:path*", "/dashboard/:path*"],
};
