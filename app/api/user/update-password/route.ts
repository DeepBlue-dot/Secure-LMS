import { getServerSession } from "next-auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { newPassword } = await req.json();

  if (!newPassword || newPassword.length < 12) {
    return new Response("Invalid password", { status: 400 });
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { email: session.user.email },
    data: { passwordHash: hashedPassword },
  });

  return new Response(JSON.stringify({ message: "Password updated successfully" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
