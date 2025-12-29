import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { createAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

interface ShareRequest {
  resourceId: string;
  targetUserId: string;
  permissions: {
    read: boolean;
    write: boolean;
  };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // ✅ FIX: No `any`, fully typed
  const currentUserId = session.user.id;

  try {
    const body: ShareRequest = await req.json();
    const { resourceId, targetUserId, permissions } = body;

    // 1. Verify Ownership (DAC)
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    if (resource.ownerId !== currentUserId) {
      return new NextResponse(
        "Forbidden: Only the owner can grant permissions",
        { status: 403 }
      );
    }

    // 2. Grant Access
    const access = await prisma.resourceAccess.create({
      data: {
        resourceId,
        userId: targetUserId,
        canRead: permissions.read,
        canWrite: permissions.write,
        grantedBy: currentUserId,
      },
    });

    // 3. Audit Log
    await createAuditLog({
      userId: currentUserId,
      action: "PERMISSION_GRANTED",
      status: "SUCCESS",
      ipAddress: req.headers.get("x-forwarded-for") ?? "127.0.0.1",
      resourceId,
    });

    return NextResponse.json(access);
  } catch {
    return new NextResponse("Invalid Request Body", { status: 400 });
  }
}
