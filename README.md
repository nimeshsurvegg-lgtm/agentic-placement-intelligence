# Agentic Placement Intelligence Platform (Quasar 5.0 - EdTech)

> **Built for Vasantdada Patil Pratishthan's College of Engineering & Visual Arts (VPCOE & VA)**  
> **Quasar 5.0 Hackathon Problem Statement Solution**  
> *Scale: Single-College Pilot → University → Multi-College Federated Rollout*

---

## 🎯 Problem Statement & Industry Reality

Colleges and Training & Placement (T&P) departments traditionally run campus placement on static PDF resumes, manual spreadsheet eligibility filters, and reactive training.
- **The Result**: Unverified skill claims, uncoordinated drives, clash-heavy scheduling, and training scheduled too late (after the hiring season has already begun).
- **The Reality (India Skills Report 2026)**:
  - Overall graduate employability: **56.35%**
  - CS / IT employability: **~78–80%**
  - Polytechnic employability: **32.92%**
  - The core bottleneck is **Match, not Volume**. Employers struggle to verify hands-on competency—especially across Cloud, Backend Microservices, and AI/ML.

---

## 💡 Solution Overview

The **Agentic Placement Intelligence Platform** is a production-grade, multi-tenant, evidence-based placement ecosystem running on Node.js + Express + native SQLite (`node:sqlite`) with an unforgeable, cryptographic **SHA-256 Verified Skill Graph**.

```
[Student Evidence] (GitHub AST, LeetCode, Labs, Attestations)
       │
       ▼
[Verified Skill Graph] (Claimed → Observed → Evidence-linked → Verified → Expired)
       │
       ▼
[Gap-Bridging Engine] (Industry JD Profiler + Mock Drive Diagnostics + AI Learning Paths)
       │
       ▼
[Placement Orchestrator] (Declarative Versioned Rules + Clash-Free Drive Scheduler)
       │
       ▼
[Governance & Trust Layer] (India DPDP Act 2023 + 4/5ths Fairness Rule + SHA-256 Ledger)
```

---

## 🚀 Quick Start (Single Command)

### Prerequisites
- Node.js (v18+ or Node 26)

### 1. Install & Run Dev Server
```bash
npm install
npm run dev
```

### 2. (Optional) Re-Seed Master Database
The SQLite database `data/placement.db` is already pre-seeded with 100% of Section 14 requirements (120 cohort students, 310 aptitude questions, 12 companies, 6 drives). To refresh at any time:
```bash
npm run seed
```

### 3. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)**

### 4. Run Test Suite
```bash
npm test
```

---

## 👥 Demo Accounts Registry (`Demo@1234`)

Use the split-layout **"1-Click Demo Accounts" Accordion** on the login page or enter credentials manually:

| Role | Name | Email | Password | College / Tenant | Key Capability Demo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **STUDENT** | Rahul Sharma | `rahul@vppcoe.demo` | `Demo@1234` | VPCOE & VA (Mumbai) | 8.42 CGPA, Verified Skills, ATS Resume, 3-Round Mock Drive, Learning Path |
| **TP_OFFICER** | Dr. Anil Kulkarni | `anil.kulkarni@vppcoe.demo` | `Demo@1234` | VPCOE & VA (Mumbai) | Declarative Rules v2.1, Human Approval Queue, Calendar Clash Check, Bulk Campaigns |
| **DEPARTMENT_HEAD** | Prof. S. Rane | `hod.cs@vppcoe.demo` | `Demo@1234` | VPCOE & VA (Mumbai) | CSE Cohort Heatmap, Mentor Attestations & Remedial Labs |
| **RECRUITER (Active)** | Sarah Jenkins | `recruiter@google.demo` | `Demo@1234` | Google India | Semantic Candidate Search, Explainable Match Breakdown, Dossier View |
| **RECRUITER (Pending)** | Vikramaditya Roy | `recruiter@barclays.demo` | `Demo@1234` | Barclays Talent | **Officer Approval Gate**: Demonstrates access pending approval screen |
| **UNIVERSITY_ADMIN** | Dr. Suhas Pednekar | `chancellor@univ.demo` | `Demo@1234` | Mumbai University | Cross-College NIRF Table 5 & NAAC 5.2.1 Comparative Intelligence |
| **TP_OFFICER (College B)** | Dr. Sunita Deshpande | `officer@coep.demo` | `Demo@1234` | COEP Pune | Multi-Tenant Boundary: Demonstrates zero cross-college data leaks |

---

## 🌟 Key Architecture & Product Pillars

### 1. Authentication, Authorization & Security (Section 1)
- **Split-Layout Login UI**: Left abstract brand panel with 3 core value props; right form with College tenant selector, email, password (show/hide), remember me, forgot password (15-minute token link), and 1-click Demo Accounts accordion.
- **OWASP-Compliant Security**: Bcrypt (cost 12), JWT in httpOnly Secure Lax cookies, 30-minute inactivity auto-logout, 5 attempts / 15-minute rate limiter lockout.
- **Role-Based Access Control (RBAC)**: Route guards and server-side DAL enforcement across 6 distinct roles.
- **Strict Multi-Tenancy**: Tenant-scoped Data Access Layer injecting tenant ID into every query. Automated cross-tenant leak test suite verifying 100% isolation.

### 2. Design System & Typography (Section 2 & 3)
- **Modern SaaS Aesthetics**: Linear, Vercel, and Stripe Dashboard inspired design with Inter typography, 8px layout grid, 12px radius, and persistent Light + Dark mode.
- **Strictly Zero Emojis**: 100% crisp vector Lucide SVG icons (`lucide-react` style).
- **Slim 64px Header**: Tenant dropdown switcher, Guided Demo button, Global Command Palette (`Ctrl+K`), Trust & Compliance popover, and Account menu.

### 3. Student Competency Profile & Mock Drive (Section 4)
- **Dynamic Profile Hero**: 72px avatar, verified badge, CGPA, backlogs, and **1-Click ATS Verified Resume** (opens printable resume with verification seal & SHA-256 block reference).
- **Safe Code Import & DPDP Consent**: Read-only AST ingestion (18 commits, 0 circular imports) without retaining proprietary IP; **W3C Verifiable Credential** JSON-LD export.
- **Dynamic Verified Skill Graph**: 5 states (Verified, Evidence-linked, Observed, Claimed, Expired). Clicking any card opens the slide drawer displaying cryptographic checksums and evidence URLs.
- **3-Round Mock Placement Drive**:
  - *Round 1 Aptitude*: 30 questions drawn from 310-question bank (Quant, Logic, Verbal) with live countdown timer and instant auto-grading.
  - *Round 2 Machine Coding*: Code test environment with automated test case validation.
  - *Round 3 AI Technical Interview*: Role-based evaluation scoring correctness, depth, and architecture decomposition.
  - *Diagnostic Report & 4-Step Learning Path*: Check off tasks to automatically produce verified evidence on your skill graph.

### 4. T&P Officer / Admin Portal (Section 5)
- **Smart Declarative Eligibility Matrix**: Versioned rules (v2.1) enforcing verified skills and academic cutoffs, with student appeal workflows.
- **Human-in-the-Loop Triage & Approval Queue**: "AI Helps, Human Decides" governance—no candidate is flagged at-risk or disqualified without human officer sign-off.
- **Placement Calendar & Clash Detection**: Automatic conflict detection across venues, dates, and semester exams.
- **Bulk Personalized Campaigns**: Dispatches real personalized email campaigns with variable substitution (`{{name}}`, `{{target_role}}`).
- **Cryptographic Audit Log Explorer**: Live view of append-only SHA-256 blocks with 1-click **Verify Blockchain Integrity** check.

### 5. Recruiter Talent Discovery (Section 6)
- **Explainable Semantic Search**: Multi-filter candidate discovery with plain-language match factors and verified evidence badges.
- **Officer Approval Status Gate**: Demonstrates verification gate for pending recruiters.

### 6. University Chancellor Comparative Analytics (Section 7)
- Multi-college comparative benchmarks (VPCOE Mumbai vs COEP Pune) with NIRF Table 5 metrics, NAAC Criterion 5.2.1, and regional affirmative action tracking.

### 7. Multi-Format Exports (Section 12)
- **Multi-Sheet Excel Workbook (`.xlsx`)**: Generated with `exceljs` across 5 dedicated sheets:
  1. *Placement Cohort* (Students, CGPA, Verified Skills, Placement Status)
  2. *Verified Competencies* (Frameworks, ESCO/NSQF codes, Checksums, Expiry Dates)
  3. *Campus Placement Drives* (Schedules, CTC, Minimum Cutoffs, Venues)
  4. *NAAC Criterion 5.2.1* (Branch-wise Outgoing, Placed %, Higher Studies)
  5. *NIRF Table 5* (3-Year Engineering Placement & Compliance Verification)
- **Print-Ready ATS Resume & W3C Verifiable Credential**.

---

## 🧪 Automated Test Suite Verification

Run the test suite with `npm test`:

```
🧪 Starting Agentic Placement Intelligence Platform Test Suite...

  ✅ [PASS] Audit Ledger: Genesis Block created and chained
  ✅ [PASS] Audit Ledger: SHA-256 Tamper-evident integrity verification
  ✅ [PASS] Eligibility Engine: Evaluates Rahul Sharma against Rule V2.1
  ✅ [PASS] Eligibility Engine: Correctly marks Rohan Patil as Ineligible due to active backlog
  ✅ [PASS] Industry Skill Gap Profiler Agent: Detects Docker and SQL deficits
  ✅ [PASS] Predictive Analytics Agent: Generates batch forecast & at-risk triage
  ✅ [PASS] Mock Drive Engine: Aptitude scoring across 30 questions
  ✅ [PASS] Mock Drive Engine: Machine coding test syntax & window function checks
  ✅ [PASS] Fairness Monitor: Calculates four-fifths impact ratio for Gender and Category
  ✅ [PASS] Accreditation Exporter: Generates NAAC Criterion 5.2.1 report
  ✅ [PASS] Cross-Tenant Leak Suite: Validates data isolation and zero cross-tenant leakage

======================================================
Test Execution Summary: 11/11 Passed
Status: 🎉 ALL TESTS PASSED
======================================================
```
