import { prisma } from "./prisma";

export async function logSystemStartup() {
  await prisma.systemEvent.create({
    data: {
      event: "SYSTEM_STARTUP",
      severity: "INFO",
      details: "LMS Security Kernel Initialized. All access controls active.",
    }
  });
}