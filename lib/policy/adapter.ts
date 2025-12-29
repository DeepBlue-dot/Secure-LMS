import { Session } from "next-auth";
import { SecurityLevel } from "@/lib/generated/prisma";
import { PolicyUser } from "./engine";

/* -------------------------------
   Session → Policy User Adapter
-------------------------------- */
export function toPolicyUser(
  sessionUser: Session["user"]
): PolicyUser | null {
  if (!sessionUser.clearance || !sessionUser.role) {
    return null;
  }

  return {
    clearance: sessionUser.clearance as SecurityLevel,
    role: sessionUser.role,
    department: sessionUser.department ?? undefined,
  };
}
