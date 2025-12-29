import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, captchaToken } =
      await req.json();
      console.log(captchaToken)

    // 1. Bot Prevention: Google reCAPTCHA v3 (ALL environments)
    if (!captchaToken) {
      return NextResponse.json(
        { error: "Captcha token missing" },
        { status: 400 }
      );
    }

    const captchaRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY!,
          response: captchaToken,
        }),
      }
    );

    const captchaData = await captchaRes.json();

    /**
     * reCAPTCHA v3 validation
     * - success must be true
     * - score >= 0.5 (adjust if needed)
     * - action should match frontend ("register")
     */
    if (
      !captchaData.success ||
      captchaData.score < 0.5 ||
      captchaData.action !== "register"
    ) {
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 }
      );
    }

    // 2. Password Policy Check
    if (
      password.length < 12 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return NextResponse.json(
        { error: "Password does not meet complexity requirements" },
        { status: 400 }
      );
    }

    // 3. Secure Hashing
    const hashedPassword = await hashPassword(password);

    // 4. Database Creation
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        passwordSalt: "managed-by-argon2",
        clearanceLevel: "PUBLIC",
        profile: {
          create: { firstName, lastName },
        },
      },
    });

    // 5. Audit Logging (Integrity chained)
    await createAuditLog({
      userId: newUser.id,
      action: "USER_REGISTRATION",
      status: "SUCCESS",
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({
      message: "User registered. Please verify email.",
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
