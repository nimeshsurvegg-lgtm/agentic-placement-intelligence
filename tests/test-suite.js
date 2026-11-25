// Automated Integration & Unit Test Suite for Agentic Placement Intelligence Platform
const assert = require('assert');
const auditLedger = require('../services/auditLedger');
const eligibilityEngine = require('../services/declarativeEligibility');
const { industryProfiler, predictiveAnalytics } = require('../services/aiAgents');
const fairnessMonitor = require('../services/fairnessMonitor');
const accreditationExporter = require('../services/accreditationExporter');
const mockDriveEngine = require('../services/mockDriveEngine');
const leakTestService = require('../services/crossTenantLeakTest');
const db = require('../data/db');

console.log('🧪 Starting Agentic Placement Intelligence Platform Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
  }
}

// 1. Audit Ledger Cryptographic Chain Tests
runTest('Audit Ledger: Genesis Block created and chained', () => {
  const chain = auditLedger.chain;
  assert.strictEqual(chain.length >= 1, true);
  assert.strictEqual(chain[0].eventType, 'GENESIS_BLOCK');
  assert.strictEqual(chain[0].previousHash, '0'.repeat(64));
});

runTest('Audit Ledger: SHA-256 Tamper-evident integrity verification', () => {
  const status = auditLedger.verifyIntegrity();
  assert.strictEqual(status.valid, true);
  assert.strictEqual(status.status, 'CRYPTOGRAPHICALLY_VERIFIED_TAMPER_FREE');
});

// 2. Declarative Eligibility Engine Tests
runTest('Eligibility Engine: Evaluates Rahul Sharma against Rule V2.1', () => {
  const evalResult = eligibilityEngine.evaluateStudent('STU-VPCOE-042', '2.1');
  assert.strictEqual(evalResult.ruleVersion, '2.1');
  assert.strictEqual(evalResult.studentName, 'Rahul Sharma');
  // Rahul has CGPA 8.42 (>= 7.5), 0 backlogs, CSE, verified Python and Git -> passed!
  assert.strictEqual(evalResult.isEligible, true);
  assert.strictEqual(evalResult.clauses.length >= 4, true);
});

runTest('Eligibility Engine: Correctly marks Rohan Patil as Ineligible due to active backlog', () => {
  const evalResult = eligibilityEngine.evaluateStudent('STU-VPCOE-088', '2.1');
  assert.strictEqual(evalResult.isEligible, false);
  const backlogClause = evalResult.clauses.find(c => c.clause === 'Active Backlog Clearance');
  assert.strictEqual(backlogClause.passed, false);
});

// 3. AI Profiler Agent Tests
runTest('Industry Skill Gap Profiler Agent: Detects Docker and SQL deficits', () => {
  const report = industryProfiler.scanMarketDemand('vpcoe-mumbai');
  assert.strictEqual(report.analysis.length >= 5, true);
  const dockerAnalysis = report.analysis.find(a => a.skillId === 'docker');
  assert.strictEqual(dockerAnalysis.urgency, 'HIGH_DEFICIT');
  assert.strictEqual(report.recommendedInterventions.length >= 1, true);
});

// 4. Predictive Placement Analytics Agent Tests
runTest('Predictive Analytics Agent: Generates batch forecast & at-risk triage', () => {
  const forecast = predictiveAnalytics.runForecast('vpcoe-mumbai');
  assert.strictEqual(forecast.projectedBatchPlacementRate > 50, true);
  assert.strictEqual(forecast.atRiskQueue.length >= 1, true);
  assert.strictEqual(forecast.atRiskQueue[0].name, 'Rohan Patil');
});

// 5. Mock Drive Evaluation Engine Tests
runTest('Mock Drive Engine: Aptitude scoring across 30 questions', () => {
  const answers = { 'APT-Q01': 1, 'APT-Q02': 0, 'APT-Q03': 0 }; // 3 correct
  const result = mockDriveEngine.evaluateAptitude(answers);
  assert.strictEqual(result.maxScore, 30);
  assert.strictEqual(result.score >= 3, true);
  assert.strictEqual(typeof result.sectionScores.Quantitative.correct, 'number');
});

runTest('Mock Drive Engine: Machine coding test syntax & window function checks', () => {
  const submissions = {
    'CODE-Q1': 'SELECT DENSE_RANK() OVER (PARTITION BY d.dept_id ORDER BY SUM(o.amount) DESC) as dept_rank FROM customers WHERE status != "SUSPENDED" GROUP BY d.dept_id HAVING dept_rank <= 3;',
    'CODE-Q2': 'class SlidingWindowRateLimiter: def __init__(self): self.q = deque() \n def allow_request(self): self.q.popleft(); return True'
  };
  const result = mockDriveEngine.evaluateMachineTest(submissions);
  assert.strictEqual(result.maxScore, 20);
  assert.strictEqual(result.score >= 10, true);
});

// 6. Fairness Monitoring Tests
runTest('Fairness Monitor: Calculates four-fifths impact ratio for Gender and Category', () => {
  const fairness = fairnessMonitor.computeFairnessMetrics('vpcoe-mumbai');
  assert.strictEqual(fairness.dimensions.gender.fourFifthsThreshold, 0.80);
  assert.strictEqual(typeof fairness.dimensions.gender.lowestImpactRatio, 'number');
});

// 7. Accreditation Reporting Tests
runTest('Accreditation Exporter: Generates NAAC Criterion 5.2.1 report', () => {
  const naac = accreditationExporter.generateNaacReport('vpcoe-mumbai');
  assert.strictEqual(naac.summary.totalOutgoingGraduates > 0, true);
  assert.strictEqual(naac.branchWiseData.length >= 3, true);
  const csv = accreditationExporter.exportCsv(naac);
  assert.strictEqual(csv.includes('Branch,Outgoing Students'), true);
});

// 8. Cross-Tenant Leak Security Suite Tests
runTest('Cross-Tenant Leak Suite: Validates data isolation and zero cross-tenant leakage', () => {
  const leakReport = leakTestService.runSecuritySuite('vpcoe-mumbai');
  assert.strictEqual(leakReport.overallStatus, 'ALL_TESTS_PASSED_SECURE');
  assert.strictEqual(leakReport.totalTests, 4);
  assert.strictEqual(leakReport.passedTests, 4);
});

// 9. SQLite Database Auto-Initialization & Demo Student Tests
const dbService = require('../services/db');
const { initDb } = require('../services/initDb');

runTest('Database Service: Auto-initializes on startup and populates demo student STU-VPCOE-042', () => {
  const dal = dbService.forTenant('vpcoe-mumbai', 'STUDENT');
  const student = dal.getStudentById('STU-VPCOE-042');
  assert.notStrictEqual(student, null);
  assert.strictEqual(student.id, 'STU-VPCOE-042');
  assert.strictEqual(student.name, 'Rahul Sharma');
  assert.strictEqual(student.tenant_id, 'vpcoe-mumbai');
  assert.strictEqual(student.target_role, 'Backend Developer');
});

runTest('Database Service: Multi-tenant DAL retrieves enriched student skills and evidence', () => {
  const dal = dbService.forTenant('vpcoe-mumbai', 'STUDENT');
  const skills = dal.getStudentSkills('STU-VPCOE-042');
  assert.strictEqual(skills.length >= 7, true);
  
  const pySkill = skills.find(s => s.skill_id === 'python');
  assert.strictEqual(pySkill.state, 'Verified');
  assert.strictEqual(pySkill.confidence, 96);

  const evidence = dal.getEvidenceForSkill(pySkill.id);
  assert.strictEqual(evidence.length >= 2, true);
  assert.strictEqual(evidence.some(e => e.source === 'github'), true);
});

runTest('Database Service: Gracefully returns null for non-existent student without crashing', () => {
  const dal = dbService.forTenant('vpcoe-mumbai', 'STUDENT');
  const nonExistent = dal.getStudentById('STU-NONEXISTENT-999');
  assert.strictEqual(nonExistent, undefined);
});

runTest('Database Service: Safe initialization is strictly idempotent (zero duplicates or errors)', () => {
  // Running initDb a second time on existing db must succeed with 0 duplicates
  const res = initDb(dbService.db);
  assert.strictEqual(res.success, true);

  const dal = dbService.forTenant('vpcoe-mumbai', 'STUDENT');
  const student = dal.getStudentById('STU-VPCOE-042');
  assert.strictEqual(student.name, 'Rahul Sharma');
  
  // Verify count of primary student is exactly 1
  const countRow = dbService.db.prepare("SELECT COUNT(*) as count FROM students WHERE id = 'STU-VPCOE-042'").get();
  assert.strictEqual(countRow.count, 1);
});

runTest('Database Service: V2 enterprise tables (readiness, roadmaps, opportunities) initialized', () => {
  const readiness = dbService.db.prepare("SELECT * FROM readiness_scores WHERE student_id = 'STU-VPCOE-042'").get();
  assert.notStrictEqual(readiness, undefined);
  assert.strictEqual(readiness.overall_score, 84.5);

  const oppCount = dbService.db.prepare("SELECT COUNT(*) as count FROM opportunities").get();
  assert.strictEqual(oppCount.count >= 4, true);

  const roleCount = dbService.db.prepare("SELECT COUNT(*) as count FROM career_roles").get();
  assert.strictEqual(roleCount.count >= 5, true);
});

runTest('Database Service: Supports fresh DB creation with schema and safe auto-seeding', () => {
  const os = require('os');
  const fs = require('fs');
  const path = require('path');
  const { DatabaseSync } = require('node:sqlite');
  const tempDbPath = path.join(os.tmpdir(), `placement-test-${Date.now()}.db`);
  const tempDb = new DatabaseSync(tempDbPath);
  
  const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'data', 'schema.sql'), 'utf8');
  tempDb.exec(schemaSql);

  const res = initDb(tempDb);
  assert.strictEqual(res.success, true);

  const student = tempDb.prepare("SELECT * FROM students WHERE id = 'STU-VPCOE-042'").get();
  assert.notStrictEqual(student, undefined);
  assert.strictEqual(student.name, 'Rahul Sharma');

  const questionsCount = tempDb.prepare("SELECT COUNT(*) as count FROM mock_questions").get();
  assert.strictEqual(questionsCount.count >= 300, true);

  tempDb.close();
  try { fs.unlinkSync(tempDbPath); } catch (e) {}
});



console.log(`\n======================================================`);
console.log(`Test Execution Summary: ${passedTests}/${totalTests} Passed`);
console.log(`Status: ${passedTests === totalTests ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
console.log(`======================================================\n`);
