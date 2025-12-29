import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type AuditLog = {
  id: string;
  timestamp: string | Date;
  userId: string;
  action: string;
  status: "SUCCESS" | "FAILURE";
  hash?: string;
};

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Integrity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {new Date(log.timestamp).toLocaleString()}
              </TableCell>
              <TableCell>{log.userId}</TableCell>
              <TableCell className="font-mono text-xs">
                {log.action}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    log.status === "SUCCESS"
                      ? "default"
                      : "destructive"
                  }
                >
                  {log.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div
                  className={`h-2 w-2 rounded-full ${
                    log.hash ? "bg-green-500" : "bg-red-500"
                  }`}
                  title={
                    log.hash
                      ? "Hash Verified"
                      : "Integrity Issue"
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
