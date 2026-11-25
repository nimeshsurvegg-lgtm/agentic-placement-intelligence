// Declarative Versioned Eligibility Engine
const db = require('../data/db');
const auditLedger = require('./auditLedger');

class DeclarativeEligibilityEngine {
  evaluateStudent(studentId, ruleIdOrVersion = null) {
    const student = db.STUDENTS.find(s => s.id === studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    let rule;
    if (ruleIdOrVersion) {
      rule = db.ELIGIBILITY_RULES.find(r => r.ruleId === ruleIdOrVersion || r.version === ruleIdOrVersion);
    }
    if (!rule) {
      // Pick currently active rule for the tenant
      rule = db.ELIGIBILITY_RULES.find(r => r.tenantId === student.tenantId && r.active) || db.ELIGIBILITY_RULES[1];
    }

    const evaluationClauses = [];
    let isEligible = true;

    // 1. CGPA Check
    const cgpaPassed = student.cgpa >= rule.minCgpa;
    evaluationClauses.push({
      clause: 'Academic CGPA Threshold',
      ruleRequirement: `>= ${rule.minCgpa}`,
      studentValue: student.cgpa,
      passed: cgpaPassed,
      failureReason: cgpaPassed ? null : `Current CGPA (${student.cgpa}) is below required cut-off of ${rule.minCgpa}`
    });
    if (!cgpaPassed) isEligible = false;

    // 2. Active Backlogs Check
    const activeBacklogsPassed = student.activeBacklogs <= rule.maxActiveBacklogs;
    evaluationClauses.push({
      clause: 'Active Backlog Clearance',
      ruleRequirement: `<= ${rule.maxActiveBacklogs} active backlogs`,
      studentValue: student.activeBacklogs,
      passed: activeBacklogsPassed,
      failureReason: activeBacklogsPassed ? null : `Student has ${student.activeBacklogs} active backlog(s); rule allows maximum of ${rule.maxActiveBacklogs}`
    });
    if (!activeBacklogsPassed) isEligible = false;

    // 3. Allowed Branches Check
    const branchPassed = rule.allowedBranches.includes(student.branch);
    evaluationClauses.push({
      clause: 'Eligible Branch / Discipline',
      ruleRequirement: `Branches: [${rule.allowedBranches.join(', ')}]`,
      studentValue: student.branch,
      passed: branchPassed,
      failureReason: branchPassed ? null : `Discipline '${student.branch}' is not in approved drive branches`
    });
    if (!branchPassed) isEligible = false;

    // 4. Mandatory Skills Evidence Verification
    if (rule.mandatorySkills && rule.mandatorySkills.length > 0) {
      for (const reqSkill of rule.mandatorySkills) {
        const studentSkill = student.skills.find(s => s.skillId === reqSkill.skillId);
        const stateRank = { 'Unclaimed': 0, 'Claimed': 1, 'Observed': 2, 'Evidence-linked': 3, 'Verified': 4 };
        const reqRank = stateRank[reqSkill.minState] || 4;
        const studentRank = studentSkill ? (stateRank[studentSkill.state] || 0) : 0;
        const confidencePassed = studentSkill ? (studentSkill.confidence >= reqSkill.minConfidence) : false;

        const skillPassed = studentRank >= reqRank && confidencePassed;
        const skillName = (db.TAXONOMY[reqSkill.skillId] && db.TAXONOMY[reqSkill.skillId].name) || reqSkill.skillId;

        evaluationClauses.push({
          clause: `Verified Competency: ${skillName}`,
          ruleRequirement: `Must be state '${reqSkill.minState}' with confidence >= ${reqSkill.minConfidence}%`,
          studentValue: studentSkill ? `${studentSkill.state} (${studentSkill.confidence}%)` : 'Not present on skill graph',
          passed: skillPassed,
          failureReason: skillPassed ? null : `Skill '${skillName}' is currently in state '${studentSkill ? studentSkill.state : 'None'}' (Required: ${reqSkill.minState} with proof)`
        });
        if (!skillPassed) isEligible = false;
      }
    }

    const decisionSnapshot = {
      decisionId: `DEC-${Date.now()}-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      tenantId: student.tenantId,
      ruleId: rule.ruleId,
      ruleVersion: rule.version,
      ruleTitle: rule.title,
      isEligible,
      evaluatedAt: new Date().toISOString(),
      clauses: evaluationClauses,
      reasonCodes: evaluationClauses.map(c => ({
        clause: c.clause,
        status: c.passed ? 'PASS' : 'FAIL',
        note: c.failureReason || 'Requirement satisfied with verifiable evidence'
      }))
    };

    // Log decision in append-only cryptographic ledger
    auditLedger.addEntry(student.tenantId, 'DECLARATIVE_ELIGIBILITY_EVALUATION', 'ELIGIBILITY_ENGINE', {
      decisionId: decisionSnapshot.decisionId,
      studentId: student.id,
      ruleVersion: rule.version,
      isEligible,
      failedClausesCount: evaluationClauses.filter(c => !c.passed).length
    });

    return decisionSnapshot;
  }

  evaluateDriveEligibility(studentId, driveId) {
    const drive = db.DRIVES.find(d => d.id === driveId);
    if (!drive) throw new Error(`Drive ${driveId} not found`);
    const student = db.STUDENTS.find(s => s.id === studentId);
    if (!student) throw new Error(`Student ${studentId} not found`);

    const result = this.evaluateStudent(studentId, drive.ruleVersion);
    return {
      ...result,
      driveId: drive.id,
      company: drive.company,
      role: drive.role,
      packageCtc: drive.packageCtc
    };
  }

  evaluateBatch(tenantId = 'vpcoe-mumbai', ruleIdOrVersion = null) {
    const students = db.STUDENTS.filter(s => s.tenantId === tenantId);
    return students.map(s => this.evaluateStudent(s.id, ruleIdOrVersion));
  }
}

module.exports = new DeclarativeEligibilityEngine();
