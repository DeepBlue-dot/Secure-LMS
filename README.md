This README is designed to present your project as a professional, enterprise-grade security solution. It highlights how the code maps directly to the complex access control and authentication requirements you’ve implemented.

---

# SecureLMS: Enterprise-Grade Access Controlled Platform

**SecureLMS** is a high-integrity Learning Management System designed with a "Security-First" architecture. The project demonstrates advanced cybersecurity principles, including multi-layered access control models (MAC, DAC, RBAC, RuBAC, and ABAC) and cryptographically secured audit trails.

## 🛡️ Security Architecture

The system implements five distinct access control models to ensure granular and mandatory security:

1.  **Mandatory Access Control (MAC):** Data is classified into `Public`, `Internal`, and `Confidential` levels. User clearance must meet or exceed resource classification.
2.  **Role-Based Access Control (RBAC):** Hierarchical roles (System Admin, Instructor, Student) define baseline system permissions.
3.  **Discretionary Access Control (DAC):** Resource owners have the power to grant or revoke specific permissions (Read/Write/Share) for their own records.
4.  **Attribute-Based Access Control (ABAC):** Real-time access decisions based on user attributes like `Department`, `Employment Status`, and `Location`.
5.  **Rule-Based Access Control (RuBAC):** Conditional logic including account lockout policies (5 failed attempts) and time-based access restrictions.

## ✨ Key Features

### 🔐 Authentication & Identity
*   **Multi-Factor Authentication (MFA):** Mandatory TOTP (One-Time Password) challenge for elevated roles.
*   **Secure Password Management:** Implements **Argon2id** hashing with unique salts and a global system "pepper" to neutralize rainbow table attacks.
*   **Bot Prevention:** Integrated Captcha/Turnstile verification during registration and login to prevent automated brute-force attacks.
*   **Account Lockout:** Automatic 15-minute cooldown after 5 unsuccessful login attempts to mitigate brute-force.

### 📜 Auditing & Compliance
*   **User Activity Logging:** Every action (login, resource access, role change) is logged with UserID, IP Address, and Timestamp.
*   **Log Integrity (Hash Chaining):** Logs are cryptographically chained; each entry contains an HMAC hash of the previous entry, making log deletion or tampering immediately detectable.
*   **Encryption at Rest:** Sensitive audit logs are encrypted before storage.

### 📂 Secure Resource Management
*   **Classification Tagging:** Every uploaded resource must be assigned a MAC security label.
*   **Policy Enforcement Point (PEP):** A specialized UI boundary that evaluates session JWT attributes before rendering sensitive data.

## 🚀 Tech Stack

*   **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
*   **UI/UX:** [Shadcn UI](https://ui.shadcn.com/) & Tailwind CSS
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Stateless JWT Strategy)
*   **Database/ORM:** [Prisma](https://www.prisma.io/) (PostgreSQL)
*   **Validation:** [Zod](https://zod.dev/) (Schema-based validation)
*   **Security:** Argon2id, Crypto-API, TOTP

## 🛠️ Project Structure

```text
src/
├── app/              # Next.js App Router (Auth & Dashboard)
├── components/       # Shadcn UI & PolicyBoundary components
├── lib/
│   ├── auth.ts       # NextAuth Configuration & Lockout Logic
│   ├── audit.ts      # Cryptographic Log Chaining Engine
│   ├── password.ts   # Argon2id Hashing & Verification
│   └── policy/       # PDP (Policy Decision Point) Logic
│       ├── mac.ts    # Mandatory Access Control
│       ├── rbac.ts   # Role-Based logic
│       └── abac.ts   # Attribute-Based logic
├── middleware.ts     # Global RuBAC (Time/Device checks)
└── prisma/           # Security-first Database Schema
```

## ⚙️ Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/secure-lms.git
    cd secure-lms
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file and populate:
    ```env
    DATABASE_URL="your-database-url"
    NEXTAUTH_SECRET="your-secret-key"
    PASSWORD_PEPPER="your-long-random-pepper-string"
    LOG_ENCRYPTION_KEY="your-log-hmac-key"
    ```

4.  **Database Migration:**
    ```bash
    npx prisma migrate dev --name init_security_schema
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 📋 Demonstration Scenarios

To verify the system design, the following test cases are implemented in the seed data:

*   **Scenario 1 (MAC Fail):** A user with `Internal` clearance attempts to access a `Confidential` document. Access is denied despite having an "Instructor" role.
*   **Scenario 2 (ABAC Fail):** An Admin from the `Finance` department attempts to view `IT` payroll data. Access is denied based on the `Department` attribute mismatch.
*   **Scenario 3 (RuBAC Success):** A user is locked out of the system for 15 minutes after 5 incorrect password entries.

## 📄 License
This project is developed for educational and demonstration purposes under the MIT License.

---
**Designed by:** [Your Name]
**Project Focus:** Advanced System Design & Cyber Security in LMS Platforms.