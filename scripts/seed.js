// Master Database Seeding Script for Agentic Placement Intelligence Platform
// Populates 100% of demo specifications with safe, idempotent operations
const dbService = require('../services/db');
const { initDb } = require('../services/initDb');
const rawDb = dbService.db;

console.log('🌱 Starting Agentic Placement Intelligence Platform Database Seeding...');

const forceReset = process.argv.includes('--force') || process.env.FORCE_SEED === 'true';

if (forceReset) {
  console.log('⚠️  --force detected: Purging existing database tables...');
  const tables = [
    'agentic_workflows', 'hackathons', 'tpo_interventions', 'portfolio_projects',
    'saved_opportunities', 'opportunities', 'mentorship_requests', 'alumni_mentors',
    'career_paths', 'career_roles', 'readiness_scores',
    'erasure_requests', 'report_exports', 'email_messages', 'email_campaigns',
    'notifications', 'approval_queue', 'agent_runs', 'learning_tasks', 'learning_paths',
    'mock_attempts', 'appeals', 'eligibility_decisions', 'eligibility_rule_sets',
    'applications', 'drives', 'job_descriptions', 'companies', 'consents',
    'verification_rules', 'evidence', 'student_skills', 'skills', 'mock_interview_rubrics',
    'mock_coding_problems', 'mock_questions', 'students', 'password_resets',
    'sessions', 'users', 'tenants'
  ];

  for (const t of tables) {
    try { rawDb.exec(`DELETE FROM ${t};`); } catch (e) {}
  }
} else {
  console.log('🛡️  Running in safe non-destructive mode (use --force to wipe existing records)');
}

// Run safe idempotent seeder
initDb(rawDb);

// Ensure audit log entries
const auditCount = rawDb.prepare('SELECT COUNT(*) as count FROM audit_logs').get();
if (auditCount.count <= 1) {
  console.log('  -> Initializing SHA-256 Tamper-Evident Hash Chain...');
  dbService.logAudit('vpcoe-mumbai', 'SYSTEM_INITIALIZED', { name: 'Dr. Anil Kulkarni', role: 'TP_OFFICER' }, { message: 'Placement Intelligence Platform Initialized with Multi-Tenant Security' });
  dbService.logAudit('vpcoe-mumbai', 'RULE_VERSION_PUBLISHED', { name: 'Dr. Anil Kulkarni', role: 'TP_OFFICER' }, { ruleVersion: '2.1', minCgpa: 7.5, mandatorySkills: ['python', 'git'] });
  dbService.logAudit('vpcoe-mumbai', 'STUDENT_CONSENT_GRANTED', { name: 'Rahul Sharma', role: 'STUDENT' }, { scope: ['read_github_repos', 'recruiter_search'], verifiableConsentId: 'DPDP-CONSENT-2026-RS042' });
  dbService.logAudit('vpcoe-mumbai', 'EVIDENCE_VERIFIED', { name: 'Automated Ingestion Agent', role: 'AGENT' }, { studentId: 'STU-VPCOE-042', skill: 'python', confidence: 96, source: 'github_repo' });
}

console.log('✅ Database Seeding Complete! placement.db is ready with 100% of demo requirements.\n');
