import { SecurityLevel } from "@/lib/generated/prisma";

/* -------------------------------
   Clearance Weight Mapping (MAC)
-------------------------------- */
export const LEVEL_WEIGHT: Record<SecurityLevel, number> = {
  PUBLIC: 1,
  INTERNAL: 2,
  CONFIDENTIAL: 3,
};

/* -------------------------------
   Policy Subject (User)
-------------------------------- */
export interface PolicyUser {
  clearance: SecurityLevel;
  department?: string;
  role: string;
}

/* -------------------------------
   Policy Object (Resource)
-------------------------------- */
export interface Resource {
  classification: SecurityLevel;
  department: string | null; // Prisma-compatible
}

/* -------------------------------
   Context (RuBAC / Environment)
-------------------------------- */
export interface AccessContext {
  currentTime: number;
  deviceType?: string;
}

/* -------------------------------
   Policy Decision Point (PDP)
-------------------------------- */
export function evaluateAccess(
  user: PolicyUser,
  resource: Resource,
  context?: AccessContext
): { allowed: boolean; reason?: string } {

  /* 1️⃣ RuBAC — Time-based */
  if (context && (context.currentTime < 8 || context.currentTime > 18)) {
    if (user.role !== "SYSTEM_ADMIN") {
      return {
        allowed: false,
        reason: "Outside working hours (08:00–18:00).",
      };
    }
  }

  /* 2️⃣ MAC — Clearance vs Classification */
  const userClearance = LEVEL_WEIGHT[user.clearance];
  const resourceClass = LEVEL_WEIGHT[resource.classification];

  if (userClearance < resourceClass) {
    return {
      allowed: false,
      reason: `Insufficient clearance (${resource.classification}).`,
    };
  }

  /* 3️⃣ ABAC — Department */
  if (resource.department && user.department !== resource.department) {
    if (user.role !== "SYSTEM_ADMIN") {
      return {
        allowed: false,
        reason: `Department mismatch (${resource.department}).`,
      };
    }
  }

  return { allowed: true };
}
