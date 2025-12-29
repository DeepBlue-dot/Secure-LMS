"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { AuditLogEntry } from "@/lib/policy/types";

interface Props {
  logs: AuditLogEntry[];
}

export function AuditDashboard({ logs }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Security Audit Logs</h2>
        <Badge variant="outline" className="text-green-600 border-green-600">
          Centralized Logging Active
        </Badge>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Event Integrity</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-mono text-slate-400">
                      {log.logHash.substring(0, 8)}...
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <code className="bg-slate-100 px-1 rounded text-xs">{log.action}</code>
                </TableCell>
                <TableCell className="text-sm font-mono">{log.userId.split('-')[0]}</TableCell>
                <TableCell>
                  <Badge variant={log.status === "SUCCESS" ? "default" : "destructive"}>
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-mono">{log.ipAddress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
