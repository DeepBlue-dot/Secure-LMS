import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Secure LMS Dashboard</h1>

      <section style={{ marginTop: "1rem" }}>
        <h2>User Security Context</h2>
        <ul>
          <li>Email: {session.user.email}</li>
          <li>Role: {session.user.role}</li>
          <li>Clearance: {session.user.clearance}</li>
          <li>Department: {session.user.department ?? "N/A"}</li>
        </ul>
        <a href="/resources">View Secure Resources</a>
      </section>

      <p style={{ marginTop: "2rem", color: "gray" }}>
        All actions are logged and monitored.
      </p>
    </main>
  );
}
