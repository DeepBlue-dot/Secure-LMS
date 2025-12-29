import { SecurityLevel } from "@/lib/generated/prisma";

const LEVEL = {
  PUBLIC: 1,
  INTERNAL: 2,
  CONFIDENTIAL: 3,
};

export function macAllows(
  userClearance: SecurityLevel,
  resourceLevel: SecurityLevel
): boolean {
  return LEVEL[userClearance] >= LEVEL[resourceLevel];
}