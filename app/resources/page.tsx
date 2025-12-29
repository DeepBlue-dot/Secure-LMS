import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PolicyBoundary } from "@/components/security/PolicyBoundary";
import { Resource } from "@/lib/policy/engine";

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const resources = await prisma.resource.findMany();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Secure Resources</h1>

      {resources.map((r) => {
        const policyResource: Resource = {
          classification: r.classification,
          department: r.department, // null-safe
        };

        return (
          <PolicyBoundary key={r.id} resource={policyResource}>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h3>{r.title}</h3>
              <p>Classification: {r.classification}</p>
              <p>Department: {r.department ?? "All"}</p>
            </div>
          </PolicyBoundary>
        );
      })}
    </main>
  );
}
