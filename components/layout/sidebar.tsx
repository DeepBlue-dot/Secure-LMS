"use client";

import Link from "next/link";
import { Shield, Home, FolderLock, Users, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Sidebar({ role }: { role: string }) {
  return (
    <aside className="w-64 border-r bg-background p-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="text-primary" />
        <span className="font-semibold">Secure LMS</span>
      </div>

      <nav className="space-y-2 text-sm">
        <Link href="/" className="flex items-center gap-2 p-2 rounded hover:bg-muted">
          <Home size={16} /> Dashboard
        </Link>

        <Link
          href="/resources"
          className="flex items-center gap-2 p-2 rounded hover:bg-muted"
        >
          <FolderLock size={16} /> Secure Resources
        </Link>

        <Separator className="my-3" />

        {role === "ADMIN" && (
          <>
            <Link
              href="/admin/roles"
              className="flex items-center gap-2 p-2 rounded hover:bg-muted"
            >
              <Users size={16} /> Role Management
            </Link>

            <Link
              href="/admin/audit"
              className="flex items-center gap-2 p-2 rounded hover:bg-muted"
            >
              <FileText size={16} /> Audit Logs
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
