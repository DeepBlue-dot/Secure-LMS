import { RoleName, SecurityLevel } from "../lib/generated/prisma/index.js";
import { hashPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto";


function hashLog(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function main() {
  console.log("🌱 Seeding Secure LMS database...");

  /* 1. ROLES */
  const roles = await prisma.$transaction([
    prisma.role.upsert({
      where: { name: RoleName.STUDENT },
      update: {},
      create: { name: RoleName.STUDENT, permissions: ["READ_COURSE"] },
    }),
    prisma.role.upsert({
      where: { name: RoleName.INSTRUCTOR },
      update: {},
      create: { name: RoleName.INSTRUCTOR, permissions: ["READ_COURSE","CREATE_RESOURCE","GRADE_STUDENT"] },
    }),
    prisma.role.upsert({
      where: { name: RoleName.SYSTEM_ADMIN },
      update: {},
      create: { name: RoleName.SYSTEM_ADMIN, permissions: ["*"] },
    }),
  ]);

  const roleMap = Object.fromEntries(roles.map(r => [r.name, r.id]));

  /* 2. USERS */
  const password = await hashPassword("Password123!");

  const admin = await prisma.user.create({
    data: {
      email: "admin@lms.edu",
      passwordHash: password,
      passwordSalt: "argon2",
      isVerified: true,
      clearanceLevel: SecurityLevel.CONFIDENTIAL,
      department: "IT",
      profile: { create: { firstName: "System", lastName: "Admin" } },
    },
  });

  const instructor = await prisma.user.create({
    data: {
      email: "instructor@lms.edu",
      passwordHash: password,
      passwordSalt: "argon2",
      isVerified: true,
      clearanceLevel: SecurityLevel.INTERNAL,
      department: "Computer Science",
      profile: { create: { firstName: "Ada", lastName: "Lovelace" } },
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@lms.edu",
      passwordHash: password,
      passwordSalt: "argon2",
      isVerified: true,
      clearanceLevel: SecurityLevel.PUBLIC,
      department: "Computer Science",
      profile: { create: { firstName: "Alan", lastName: "Turing" } },
    },
  });

  /* 3. ASSIGN ROLES */
  await prisma.userRole.createMany({
    data: [
      { userId: admin.id, roleId: roleMap[RoleName.SYSTEM_ADMIN], assignedBy: "seed" },
      { userId: instructor.id, roleId: roleMap[RoleName.INSTRUCTOR], assignedBy: "seed" },
      { userId: student.id, roleId: roleMap[RoleName.STUDENT], assignedBy: "seed" },
    ],
  });

  /* 4. RESOURCES */
  const syllabus = await prisma.resource.create({
    data: {
      title: "CS101 – Syllabus",
      contentUrl: "s3://secure-bucket/syllabus.pdf",
      classification: SecurityLevel.PUBLIC,
      ownerId: instructor.id,
      department: "Computer Science",
    },
  });

  const exam = await prisma.resource.create({
    data: {
      title: "Midterm Exam",
      contentUrl: "s3://secure-bucket/midterm.enc",
      classification: SecurityLevel.CONFIDENTIAL,
      ownerId: instructor.id,
      department: "Computer Science",
    },
  });

  /* 5. DAC SHARING */
  await prisma.resourceAccess.create({
    data: { resourceId: syllabus.id, userId: student.id, canRead: true, grantedBy: instructor.id },
  });

  /* 6. RuBAC POLICY */
  await prisma.accessPolicy.create({
    data: {
      name: "Working Hours Policy",
      description: "Restrict access outside 05:00–23:00",
      startTime: "05:00",
      endTime: "23:00",
      allowedDevices: ["Workstation", "Mobile"],
    },
  });

  /* 7. AUDIT LOG */
  const firstHash = hashLog("GENESIS");
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SYSTEM_SEED",
      status: "SUCCESS",
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
      logHash: firstHash,
    },
  });

  console.log("✅ Seeding complete.");
}

main()
  .catch(e => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
