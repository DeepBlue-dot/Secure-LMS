import { PolicyUser, PolicyResource } from "./types";

export function abacAllows(
  user: PolicyUser,
  resource: PolicyResource
): boolean {
  // Public resource
  if (!resource.department) return true;

  // Admin bypass
  if (user.role === "SYSTEM_ADMIN") return true;

  // Department match required
  return user.department === resource.department;
}
