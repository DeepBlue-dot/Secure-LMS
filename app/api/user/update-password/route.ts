import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, newPassword, confirmPassword } = await req.json();

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters and include uppercase, lowercase, number, and special character." },
        { status: 400 }
      );
    }

    const resetToken = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
      // Update the user's password
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { 
          passwordHash: hashedPassword,
          failedLoginCount: 0,
          lockedUntil: null 
        },
      }),
      prisma.session.delete({
        where: { id: resetToken.id },
      }),
    ]);

    await createAuditLog({
      userId: resetToken.userId,
      action: "PASSWORD_UPDATE_SUCCESS",
      status: "SUCCESS",
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
      details: { method: "ResetToken" }
    });

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Update Password Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}