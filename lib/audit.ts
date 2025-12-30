import { prisma } from "./prisma";
import crypto from "crypto";

export async function createAuditLog(data: {
  userId?: string;
  action: string;
  status: string;
  ipAddress: string;
  resourceId?: string;
}) {
  // Get the last log to create a hash chain (Log Integrity)
  const lastLog = await prisma.auditLog.findFirst({
    orderBy: { timestamp: 'desc' }
  });

  const logContent = `${data.userId}-${data.action}-${data.status}-${Date.now()}`;
  const currentHash = crypto.createHmac('sha256', process.env.LOG_ENCRYPTION_KEY!)
                           .update(logContent + (lastLog?.logHash || ''))
                           .digest('hex');

  return await prisma.auditLog.create({
    data: {
      ...data,
      userAgent: "System-Defined",
      logHash: currentHash,
      previousHash: lastLog?.logHash || "root",
    }
  });
}

export async function logAccess(
  email: string,
  url: string,
  status: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    await createAuditLog({
      userId: user?.id,
      action: "RESOURCE_ACCESS",
      status,
      resourceId: url,
      ipAddress: "system", // replace with real IP if available
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}


