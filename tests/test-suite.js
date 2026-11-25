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

console.log(`\n======================================================`);
console.log(`Test Execution Summary: ${passedTests}/${totalTests} Passed`);
console.log(`Status: ${passedTests === totalTests ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
console.log(`======================================================\n`);
