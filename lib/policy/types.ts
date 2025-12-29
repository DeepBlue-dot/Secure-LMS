// lib/policy/types.ts
export type Classification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL";

export interface SecuredResource {
  id: string;
  classification: Classification;
  department?: string | null;
  ownerId?: string;
}

export type Role =
  | "SYSTEM_ADMIN"
  | "INSTRUCTOR"
  | "STUDENT";

export type Department = string | null;

export interface PolicyUser {
  role: Role | null;
  department: Department;
}

export interface PolicyResource {
  department: Department;
}

// lib/policy/types.ts or a dedicated audit type file
export interface AuditLogEntry {
  id: string;
  timestamp: string | Date;
  action: string;
  userId: string;
  status: "SUCCESS" | "FAILURE" | "BLOCKED";
  ipAddress: string;
  logHash: string;
}
