// Agentic Placement Intelligence Platform
// Native SQLite Database Engine & Multi-Tenant Data Access Layer (DAL)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'placement.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'data', 'schema.sql');

class DatabaseService {
  constructor() {
    // Ensure parent directory exists for persistent storage
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

    this.db = new DatabaseSync(DB_PATH);
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA synchronous = NORMAL;');
    
    // Initialize schema with all 33 tables
    if (fs.existsSync(SCHEMA_PATH)) {
      const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
      this.db.exec(schemaSql);
    }
    
    this.initGenesisAuditBlock();
    this.ensureDemoData();
  }

  // Safe idempotent demo data initialization
  ensureDemoData() {
    try {
      const studentCheck = this.db.prepare("SELECT COUNT(*) as count FROM students WHERE id = 'STU-VPCOE-042'").get();
      if (!studentCheck || studentCheck.count === 0) {
        console.log('⚡ Initializing demo records safely and idempotently...');
        const { initDb } = require('./initDb');
        initDb(this.db);
        console.log('✅ Database demo records initialized successfully.');

        // Initialize core audit logs if needed
        const auditCount = this.db.prepare('SELECT COUNT(*) as count FROM audit_logs').get();
        if (auditCount.count <= 1) {
          this.logAudit('vpcoe-mumbai', 'SYSTEM_INITIALIZED', { name: 'Dr. Anil Kulkarni', role: 'TP_OFFICER' }, { message: 'Placement Intelligence Platform Initialized with Multi-Tenant Security' });
          this.logAudit('vpcoe-mumbai', 'RULE_VERSION_PUBLISHED', { name: 'Dr. Anil Kulkarni', role: 'TP_OFFICER' }, { ruleVersion: '2.1', minCgpa: 7.5, mandatorySkills: ['python', 'git'] });
          this.logAudit('vpcoe-mumbai', 'STUDENT_CONSENT_GRANTED', { name: 'Rahul Sharma', role: 'STUDENT' }, { scope: ['read_github_repos', 'recruiter_search'], verifiableConsentId: 'DPDP-CONSENT-2026-RS042' });
          this.logAudit('vpcoe-mumbai', 'EVIDENCE_VERIFIED', { name: 'Automated Ingestion Agent', role: 'AGENT' }, { studentId: 'STU-VPCOE-042', skill: 'python', confidence: 96, source: 'github_repo' });
        }
      }
    } catch (err) {
      console.error('Database demo data auto-init error:', err);
    }
  }

  // Cryptographic Ledger Genesis Block
  initGenesisAuditBlock() {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM audit_logs').get();
    if (row.count === 0) {
      const timestamp = '2026-08-01T00:00:00.000Z';
      const prevHash = '0'.repeat(64);
      const details = JSON.stringify({ message: 'Genesis Block - Tamper-Evident Ledger Initialized' });
      const hash = this.calculateHash(0, 'GLOBAL', 'GENESIS_BLOCK', 'SYSTEM', details, prevHash, timestamp);
      
      this.db.prepare(`
        INSERT INTO audit_logs (id, tenant_id, event_type, actor_id, actor_name, actor_role, details_json, prev_hash, hash, timestamp)
        VALUES (1, 'GLOBAL', 'GENESIS_BLOCK', 'SYSTEM', 'Security Kernel', 'SYSTEM', ?, ?, ?, ?)
      `).run(details, prevHash, hash, timestamp);
    }
  }

  calculateHash(id, tenantId, eventType, actorName, detailsJson, prevHash, timestamp) {
    const content = `${id}|${tenantId}|${eventType}|${actorName}|${detailsJson}|${prevHash}|${timestamp}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Append entry to tamper-evident audit ledger
  logAudit(tenantId, eventType, actor, details = {}) {
    const lastBlock = this.db.prepare('SELECT id, hash FROM audit_logs ORDER BY id DESC LIMIT 1').get();
    const prevHash = lastBlock ? lastBlock.hash : '0'.repeat(64);
    const nextId = (lastBlock ? lastBlock.id : 0) + 1;
    const timestamp = new Date().toISOString();
    const detailsJson = JSON.stringify(details);
    const actorId = actor ? (actor.id || actor.userId || null) : null;
    const actorName = actor ? (actor.name || 'System Agent') : 'System Agent';
    const actorRole = actor ? (actor.role || 'SYSTEM') : 'SYSTEM';

    const hash = this.calculateHash(nextId, tenantId || 'GLOBAL', eventType, actorName, detailsJson, prevHash, timestamp);

    this.db.prepare(`
      INSERT INTO audit_logs (id, tenant_id, event_type, actor_id, actor_name, actor_role, details_json, prev_hash, hash, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nextId, tenantId || 'GLOBAL', eventType, actorId, actorName, actorRole, detailsJson, prevHash, hash, timestamp);

    return { id: nextId, hash, prevHash, timestamp };
  }

  // Verify full blockchain integrity
  verifyAuditIntegrity(tenantId = null) {
    const blocks = this.db.prepare('SELECT * FROM audit_logs ORDER BY id ASC').all();
    const issues = [];

    for (let i = 1; i < blocks.length; i++) {
      const current = blocks[i];
      const prev = blocks[i - 1];

      // Check linkage
      if (current.prev_hash !== prev.hash) {
        issues.push({
          blockId: current.id,
          reason: 'CHAIN_LINK_BROKEN',
          expectedPrevHash: prev.hash,
          actualPrevHash: current.prev_hash
        });
      }

      // Check content integrity
      const recalculated = this.calculateHash(current.id, current.tenant_id, current.event_type, current.actor_name, current.details_json, current.prev_hash, current.timestamp);
      if (current.hash !== recalculated) {
        issues.push({
          blockId: current.id,
          reason: 'HASH_TAMPERED',
          expectedHash: recalculated,
          actualHash: current.hash
        });
      }
    }

    return {
      valid: issues.length === 0,
      totalBlocks: blocks.length,
      lastBlockHash: blocks.length > 0 ? blocks[blocks.length - 1].hash : null,
      lastVerifiedAt: new Date().toISOString(),
      issues,
      status: issues.length === 0 ? 'CRYPTOGRAPHICALLY_VERIFIED_TAMPER_FREE' : 'TAMPER_DETECTED'
    };
  }

  // Tenant-Scoped Data Access Layer Wrapper
  forTenant(tenantId, userRole = 'STUDENT') {
    const isUniv = userRole === 'UNIVERSITY_ADMIN';
    const rawDb = this.db;

    return {
      // Students
      getStudents: () => {
        if (isUniv) return rawDb.prepare('SELECT * FROM students ORDER BY cgpa DESC').all();
        return rawDb.prepare('SELECT * FROM students WHERE tenant_id = ? ORDER BY cgpa DESC').all(tenantId);
      },
      getStudentById: (id) => {
        if (isUniv) return rawDb.prepare('SELECT * FROM students WHERE id = ?').get(id);
        return rawDb.prepare('SELECT * FROM students WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      },
      getStudentByUserId: (userId) => {
        return rawDb.prepare('SELECT * FROM students WHERE user_id = ?').get(userId);
      },

      // Student Skills with Proof & State
      getStudentSkills: (studentId) => {
        return rawDb.prepare(`
          SELECT ss.*, s.name, s.category, s.esco_code, s.onet_code, s.nsqf_level, s.description
          FROM student_skills ss
          JOIN skills s ON ss.skill_id = s.id
          WHERE ss.student_id = ?
          ORDER BY ss.confidence DESC
        `).all(studentId);
      },
      getEvidenceForSkill: (studentSkillId) => {
        return rawDb.prepare('SELECT * FROM evidence WHERE student_skill_id = ? ORDER BY date DESC').all(studentSkillId);
      },

      // Drives & Rules
      getDrives: () => {
        if (isUniv) return rawDb.prepare('SELECT * FROM drives ORDER BY drive_date ASC').all();
        return rawDb.prepare('SELECT * FROM drives WHERE tenant_id = ? ORDER BY drive_date ASC').all(tenantId);
      },
      getActiveRuleSet: () => {
        return rawDb.prepare('SELECT * FROM eligibility_rule_sets WHERE tenant_id = ? AND is_active = 1 LIMIT 1').get(tenantId)
          || rawDb.prepare('SELECT * FROM eligibility_rule_sets WHERE is_active = 1 LIMIT 1').get();
      },
      getAllRuleSets: () => {
        return rawDb.prepare('SELECT * FROM eligibility_rule_sets WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId);
      },

      // Companies
      getCompanies: () => {
        if (isUniv) return rawDb.prepare('SELECT * FROM companies ORDER BY name ASC').all();
        return rawDb.prepare('SELECT * FROM companies WHERE tenant_id = ? ORDER BY name ASC').all(tenantId);
      },

      // Approval Queue
      getPendingApprovals: () => {
        if (isUniv) return rawDb.prepare("SELECT * FROM approval_queue WHERE status = 'PENDING_HUMAN_DECISION' ORDER BY created_at DESC").all();
        return rawDb.prepare("SELECT * FROM approval_queue WHERE tenant_id = ? AND status = 'PENDING_HUMAN_DECISION' ORDER BY created_at DESC").all(tenantId);
      },

      // Appeals
      getAppeals: () => {
        if (isUniv) return rawDb.prepare('SELECT a.*, s.name as student_name FROM appeals a JOIN students s ON a.student_id = s.id ORDER BY a.submitted_at DESC').all();
        return rawDb.prepare('SELECT a.*, s.name as student_name FROM appeals a JOIN students s ON a.student_id = s.id WHERE a.tenant_id = ? ORDER BY a.submitted_at DESC').all(tenantId);
      },

      // Audit Logs
      getAuditLogs: (limit = 50) => {
        if (isUniv) return rawDb.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?').all(limit);
        return rawDb.prepare("SELECT * FROM audit_logs WHERE tenant_id = ? OR tenant_id = 'GLOBAL' ORDER BY id DESC LIMIT ?").all(tenantId, limit);
      }
    };
  }
}

module.exports = new DatabaseService();
