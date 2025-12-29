import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { title, classification, department } = await req.json();

  // Create the resource with the current user as the Owner (DAC)
  const resource = await prisma.resource.create({
    data: {
      title,
      classification, // MAC Label
      department,     // ABAC Attribute
      ownerId: session.user.id,
      contentUrl: "https://secure-storage.local/file-uuid", // Mock storage link
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "RESOURCE_CREATED",
    resourceId: resource.id,
    status: "SUCCESS",
    ipAddress: req.headers.get("x-forwarded-for") || "unknown",
  });

  return Response.json(resource);
}