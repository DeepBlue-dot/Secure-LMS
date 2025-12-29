"use client";

import { useSession } from "next-auth/react";
import { evaluateAccess, Resource } from "@/lib/policy/engine";
import { toPolicyUser } from "@/lib/policy/adapter";
import React from "react";

interface PolicyBoundaryProps {
  resource: Resource;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PolicyBoundary({
  resource,
  children,
  fallback,
}: PolicyBoundaryProps) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (!session?.user) return null;

  const policyUser = toPolicyUser(session.user);

  if (!policyUser) {
    return (
      fallback ?? (
        <div className="p-4 border border-amber-200 bg-amber-50 text-amber-700 rounded-md text-sm">
          Security Warning: User profile incomplete (clearance or role missing).
        </div>
      )
    );
  }

  const result = evaluateAccess(policyUser, resource, {
    currentTime: new Date().getHours(),
    deviceType: "workstation",
  });

  if (!result.allowed) {
    return (
      fallback ?? (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
          <strong>Access Denied:</strong> {result.reason}
        </div>
      )
    );
  }

  return <>{children}</>;
}
