-- Agentic Placement Intelligence Platform
-- Multi-Tenant Relational Schema (SQLite with Postgres-compatible SQL DDL)

PRAGMA foreign_keys = ON;

-- 1. TENANTS & INSTITUTIONAL BOUNDARIES
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  university TEXT NOT NULL,
  location TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Tier 2',
  parent_tenant_id TEXT,
  config_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. USERS & CREDENTIALS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL, -- UNIVERSITY_ADMIN, COLLEGE_ADMIN, DEPARTMENT_HEAD, TP_OFFICER, STUDENT, RECRUITER
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PENDING_APPROVAL, SUSPENDED
  require_otp INTEGER NOT NULL DEFAULT 0,
  otp_code TEXT,
  otp_expires_at TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 3. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  last_active_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. PASSWORD RESETS
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. STUDENTS (DYNAMIC PROFILE RECORD)
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  roll_no TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  branch TEXT NOT NULL, -- CSE, IT, ECE, Mech, Civil
  batch TEXT NOT NULL DEFAULT '2023-2027',
  semester INTEGER NOT NULL DEFAULT 7,
  cgpa REAL NOT NULL DEFAULT 8.0,
  active_backlogs INTEGER NOT NULL DEFAULT 0,
  history_backlogs INTEGER NOT NULL DEFAULT 0,
  gender TEXT NOT NULL, -- Male, Female, Other
  category TEXT NOT NULL, -- General, OBC, SC, ST, EWS
  target_role TEXT NOT NULL DEFAULT 'Backend Developer',
  github_handle TEXT,
  leetcode_handle TEXT,
  leetcode_solved INTEGER NOT NULL DEFAULT 0,
  at_risk_flag INTEGER NOT NULL DEFAULT 0,
  officer_approved_risk INTEGER NOT NULL DEFAULT 0,
  risk_reason TEXT,
  assigned_mentor TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. SKILL TAXONOMY (ESCO, O*NET, NSQF)
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  esco_code TEXT NOT NULL,
  onet_code TEXT NOT NULL,
  nsqf_level TEXT NOT NULL,
  description TEXT NOT NULL
);

-- 7. STUDENT SKILL GRAPH (EVIDENCE-GATED: Claimed, Observed, Evidence-linked, Verified, Expired)
CREATE TABLE IF NOT EXISTS student_skills (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  state TEXT NOT NULL, -- Claimed, Observed, Evidence-linked, Verified, Expired
  confidence INTEGER NOT NULL DEFAULT 40,
  verified_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(student_id, skill_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 8. EVIDENCE REPOSITORY
CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  student_skill_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL, -- github_repo, github_commit, leetcode_submission, lab_report, contest_cert, mentor_attestation, machine_test
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  checksum TEXT,
  metadata_json TEXT DEFAULT '{}',
  date TEXT NOT NULL,
  verified_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (student_skill_id) REFERENCES student_skills(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 9. VERIFICATION RULES
CREATE TABLE IF NOT EXISTS verification_rules (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL UNIQUE,
  min_commits INTEGER NOT NULL DEFAULT 3,
  min_tests_passed INTEGER NOT NULL DEFAULT 1,
  max_age_days INTEGER NOT NULL DEFAULT 365,
  requires_mentor_signoff INTEGER NOT NULL DEFAULT 0,
  threshold_score REAL NOT NULL DEFAULT 70.0,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 10. DPDP ACT 2023 CONSENT SETTINGS
CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  repo_read_consent INTEGER NOT NULL DEFAULT 1,
  recruiter_search_consent INTEGER NOT NULL DEFAULT 1,
  demographic_sharing_consent INTEGER NOT NULL DEFAULT 1,
  verifiable_consent_id TEXT NOT NULL UNIQUE,
  is_under_18 INTEGER NOT NULL DEFAULT 0,
  parental_consent_verified INTEGER NOT NULL DEFAULT 0,
  granted_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 11. COMPANIES & RECRUITERS
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'APPROVED', -- PENDING_APPROVAL, APPROVED, REJECTED
  notes TEXT,
  last_contacted_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_descriptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  extracted_skills_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 12. DRIVES & CALENDAR
CREATE TABLE IF NOT EXISTS drives (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  package_ctc TEXT NOT NULL,
  drive_date TEXT NOT NULL,
  venue TEXT NOT NULL,
  rule_version TEXT NOT NULL DEFAULT '2.1',
  min_cgpa REAL NOT NULL DEFAULT 7.5,
  max_backlogs INTEGER NOT NULL DEFAULT 0,
  allowed_branches_json TEXT NOT NULL DEFAULT '["CSE","IT"]',
  required_skills_json TEXT NOT NULL DEFAULT '["python","git"]',
  status TEXT NOT NULL DEFAULT 'Scheduled', -- Proposed, Scheduled, In Progress, Completed, Cancelled
  stages_json TEXT NOT NULL DEFAULT '["Eligibility Check","Machine Test","Interviews","Offer"]',
  created_at TEXT NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 13. APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  drive_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Applied', -- Applied, Shortlisted, In_Interview, Offered, Rejected
  stage TEXT NOT NULL DEFAULT 'Eligibility Check',
  eligibility_snapshot_json TEXT NOT NULL,
  applied_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(drive_id, student_id),
  FOREIGN KEY (drive_id) REFERENCES drives(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 14. DECLARATIVE VERSIONED ELIGIBILITY RULES
CREATE TABLE IF NOT EXISTS eligibility_rule_sets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_cgpa REAL NOT NULL DEFAULT 7.5,
  max_active_backlogs INTEGER NOT NULL DEFAULT 0,
  max_history_backlogs INTEGER NOT NULL DEFAULT 1,
  allowed_branches_json TEXT NOT NULL,
  mandatory_skills_json TEXT NOT NULL,
  max_offers INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS eligibility_decisions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  drive_id TEXT,
  rule_set_id TEXT NOT NULL,
  rule_version TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  is_eligible INTEGER NOT NULL,
  clauses_json TEXT NOT NULL,
  inputs_snapshot_json TEXT NOT NULL,
  evaluated_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 15. APPEALS
CREATE TABLE IF NOT EXISTS appeals (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  drive_id TEXT,
  tenant_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_link TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_OFFICER_REVIEW', -- PENDING_OFFICER_REVIEW, APPROVED_BY_OFFICER, REJECTED_BY_OFFICER
  officer_decision TEXT,
  officer_notes TEXT,
  submitted_at TEXT NOT NULL,
  decided_at TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 16. MOCK DRIVE ENGINE & REPORTS
CREATE TABLE IF NOT EXISTS mock_attempts (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  role TEXT NOT NULL,
  aptitude_score INTEGER NOT NULL DEFAULT 0,
  machine_score INTEGER NOT NULL DEFAULT 0,
  interview_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  percentile REAL NOT NULL DEFAULT 70.0,
  weak_topics_json TEXT NOT NULL DEFAULT '[]',
  diagnostic_summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mock_questions (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL, -- Quantitative, Logical Reasoning, Verbal Ability
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  options_json TEXT NOT NULL,
  correct_option INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  tags_json TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS mock_coding_problems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  marks INTEGER NOT NULL DEFAULT 10,
  description TEXT NOT NULL,
  starter_code_json TEXT NOT NULL,
  test_cases_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mock_interview_rubrics (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  question TEXT NOT NULL,
  keywords_json TEXT NOT NULL,
  ideal_answer_summary TEXT NOT NULL
);

-- 17. PERSONAL LEARNING PATHS
CREATE TABLE IF NOT EXISTS learning_paths (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  target_role TEXT NOT NULL,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  total_tasks INTEGER NOT NULL DEFAULT 4,
  generated_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learning_tasks (
  id TEXT PRIMARY KEY,
  learning_path_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- practice_set, mini_project, assessment
  estimated_hours INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  verifiable_outcome TEXT NOT NULL,
  produces_skill_id TEXT,
  completed_at TEXT,
  due_date TEXT,
  FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE
);

-- 18. AGENT RUNS & HUMAN-IN-THE-LOOP APPROVAL QUEUE
CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  agent_name TEXT NOT NULL, -- IndustrySkillGapProfilerAgent, PredictivePlacementAnalyticsAgent
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  inputs_hash TEXT NOT NULL,
  outputs_json TEXT NOT NULL,
  alert_triggered INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_queue (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  item_type TEXT NOT NULL, -- AT_RISK_LABEL, ELIGIBILITY_OVERRIDE, DRIVE_PROPOSAL, STUDENT_APPEAL, RECRUITER_APPROVAL, ERASURE_REQUEST
  title TEXT NOT NULL,
  proposed_action TEXT NOT NULL,
  evidence_json TEXT NOT NULL DEFAULT '{}',
  confidence INTEGER NOT NULL DEFAULT 85,
  affected_entity_id TEXT NOT NULL,
  affected_student_name TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_HUMAN_DECISION', -- PENDING_HUMAN_DECISION, APPROVED, OVERRIDDEN, REJECTED
  officer_id TEXT,
  officer_notes TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 19. NOTIFICATIONS & BULK MAILING
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read INTEGER NOT NULL DEFAULT 0,
  link TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_template TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, DELIVERED
  total_recipients INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  replied_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_messages (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DELIVERED', -- SENT, DELIVERED, OPENED, REPLIED
  opened_at TEXT,
  replied_at TEXT,
  tracking_id TEXT NOT NULL UNIQUE,
  sent_at TEXT NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE
);

-- 20. TAMPER-EVIDENT SHA-256 AUDIT LOG (BLOCK CHAIN)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_id TEXT,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  details_json TEXT NOT NULL,
  prev_hash TEXT NOT NULL,
  hash TEXT NOT NULL,
  timestamp TEXT NOT NULL
);

-- 21. REPORT EXPORTS (NAAC, NIRF, Resume, Fairness)
CREATE TABLE IF NOT EXISTS report_exports (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  report_type TEXT NOT NULL, -- NAAC_5_2_1, NIRF_TABLE_5, ATS_RESUME, MOCK_REPORT, FAIRNESS_REPORT, AUDIT_TRAIL
  format TEXT NOT NULL, -- PDF, EXCEL, CSV, JSON
  title TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  parameters_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL
);

-- 22. DATA ERASURE REQUESTS (DPDP 30-day SLA)
CREATE TABLE IF NOT EXISTS erasure_requests (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_OFFICER_REVIEW', -- PENDING_OFFICER_REVIEW, COMPLETED
  sla_deadline TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  completed_at TEXT
);
