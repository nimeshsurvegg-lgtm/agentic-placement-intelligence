// AI Placement Intelligence Agents
const db = require('../data/db');
const auditLedger = require('./auditLedger');

class IndustrySkillGapProfilerAgent {
  constructor() {
    this.name = 'IndustrySkillGapProfilerAgent';
    this.lastRun = '2026-09-02T08:00:00Z';
  }

  // Autonomous scan of tech job postings vs verified skills of batch
  scanMarketDemand(tenantId = 'vpcoe-mumbai') {
    const students = db.STUDENTS.filter(s => s.tenantId === tenantId);
    const totalStudents = students.length || 1;

    // Simulated market hiring demand sampled from 500+ active enterprise & high-growth JDs
    const marketDemand = [
      { skillId: 'python', skillName: 'Python', marketDemandPct: 82, targetRole: 'Backend / Data / AI' },
      { skillId: 'sql', skillName: 'SQL & Relational DBs', marketDemandPct: 76, targetRole: 'Enterprise / Backend' },
      { skillId: 'docker', skillName: 'Docker & Containerization', marketDemandPct: 44, targetRole: 'Cloud / DevOps' },
      { skillId: 'fastapi', skillName: 'FastAPI / Async Python', marketDemandPct: 38, targetRole: 'Modern Microservices' },
      { skillId: 'dsa', skillName: 'Data Structures & Algorithms', marketDemandPct: 85, targetRole: 'Product & Tech Giants' },
      { skillId: 'react', skillName: 'React.js', marketDemandPct: 52, targetRole: 'Full Stack / Web' },
      { skillId: 'aws_cloud', skillName: 'AWS Cloud Services', marketDemandPct: 42, targetRole: 'Cloud Systems' }
    ];

    // Compute cohort verified supply
    const analysis = marketDemand.map(item => {
      const verifiedCount = students.filter(s => {
        const sk = s.skills.find(x => x.skillId === item.skillId);
        return sk && sk.state === 'Verified';
      }).length;

      const cohortSupplyPct = Math.round((verifiedCount / totalStudents) * 100);
      const gapPct = cohortSupplyPct - item.marketDemandPct; // negative means deficit!

      let urgency = 'BALANCED';
      if (gapPct <= -18) urgency = 'HIGH_DEFICIT';
      else if (gapPct <= -8) urgency = 'MODERATE_DEFICIT';

      return {
        ...item,
        cohortVerifiedCount: verifiedCount,
        cohortTotal: totalStudents,
        cohortSupplyPct,
        gapPct,
        urgency
      };
    });

    // Detect critical alerts
    const alerts = analysis.filter(a => a.urgency === 'HIGH_DEFICIT');
    const recommendedInterventions = alerts.map(alert => ({
      interventionId: `INTV-${alert.skillId.toUpperCase()}-2026`,
      skillId: alert.skillId,
      skillName: alert.skillName,
      title: `Pre-Season Intensive: ${alert.skillName} Hands-On Certification & Project Lab`,
      marketDemandPct: alert.marketDemandPct,
      cohortSupplyPct: alert.cohortSupplyPct,
      deficit: Math.abs(alert.gapPct),
      recommendedDuration: '3 Days (18 Hours Hands-On)',
      deliverable: `Every participating student builds and pushes 1 verified repo with automated AST test checks to flip skill state from Claimed/Observed to Verified.`,
      projectedPlacementBoost: `+${Math.round(Math.abs(alert.gapPct) * 0.45)}% improvement in shortlist conversion`
    }));

    auditLedger.addEntry(tenantId, 'AGENT_MARKET_SCAN_COMPLETED', this.name, {
      analyzedSkillsCount: analysis.length,
      criticalGapsIdentified: alerts.length
    });

    return {
      agent: this.name,
      analyzedAt: new Date().toISOString(),
      tenantId,
      analysis,
      criticalAlertsCount: alerts.length,
      recommendedInterventions
    };
  }
}

class PredictivePlacementAnalyticsAgent {
  constructor() {
    this.name = 'PredictivePlacementAnalyticsAgent';
  }

  // 6-Month Pre-Season Forecast & At-Risk Identification (AI Helps, Human Decides)
  runForecast(tenantId = 'vpcoe-mumbai') {
    const students = db.STUDENTS.filter(s => s.tenantId === tenantId);
    let totalPlacementProbSum = 0;
    const studentRiskProfiles = [];

    students.forEach(student => {
      let score = 50; // baseline

      // CGPA factor (weight 25)
      if (student.cgpa >= 8.5) score += 20;
      else if (student.cgpa >= 7.5) score += 12;
      else if (student.cgpa < 7.0) score -= 15;

      // Backlog factor (weight 20)
      if (student.activeBacklogs > 0) score -= 25;
      if (student.historyBacklogs > 1) score -= 10;

      // Verified Skills Factor (weight 30)
      const verifiedCount = student.skills.filter(s => s.state === 'Verified').length;
      if (verifiedCount >= 4) score += 20;
      else if (verifiedCount >= 2) score += 10;
      else if (verifiedCount === 0) score -= 20;

      // Mock drive history factor (weight 25)
      const latestMock = student.mockDriveHistory && student.mockDriveHistory[0];
      if (latestMock) {
        if (latestMock.scores.total.percentage >= 75) score += 15;
        else if (latestMock.scores.total.percentage < 50) score -= 15;
      }

      // Bound probability between 10% and 98%
      const placementProb = Math.min(98, Math.max(10, score));
      totalPlacementProbSum += placementProb;

      let riskCategory = 'ON_TRACK';
      const riskFactors = [];

      if (student.activeBacklogs > 0) riskFactors.push(`Has ${student.activeBacklogs} active backlog(s)`);
      if (verifiedCount < 2) riskFactors.push(`Only ${verifiedCount} verified skill(s) on graph`);
      if (student.cgpa < 7.2) riskFactors.push(`CGPA is ${student.cgpa} (below 7.2 product threshold)`);
      if (latestMock && latestMock.scores.total.percentage < 55) {
        riskFactors.push(`Mock drive performance is ${latestMock.scores.total.percentage}% (weak fundamentals)`);
      }

      if (placementProb < 45 || riskFactors.length >= 2) {
        riskCategory = 'HIGH_RISK';
      } else if (placementProb < 70 || riskFactors.length === 1) {
        riskCategory = 'MODERATE_RISK';
      }

      studentRiskProfiles.push({
        studentId: student.id,
        rollNo: student.rollNo,
        name: student.name,
        branch: student.branch,
        cgpa: student.cgpa,
        activeBacklogs: student.activeBacklogs,
        verifiedSkillsCount: verifiedCount,
        placementProbability: placementProb,
        riskCategory,
        riskFactors,
        // AI Helps, Human Decides governance fields
        officerReviewed: student.atRiskPrediction ? student.atRiskPrediction.officerReviewed : false,
        assignedMentor: student.atRiskPrediction ? student.atRiskPrediction.assignedMentor : null,
        remediationStatus: student.atRiskPrediction ? student.atRiskPrediction.status : 'AI_SUGGESTED_FLAG'
      });
    });

    const averageForecast = Math.round(totalPlacementProbSum / (students.length || 1));
    const highRiskStudents = studentRiskProfiles.filter(s => s.riskCategory === 'HIGH_RISK');
    const moderateRiskStudents = studentRiskProfiles.filter(s => s.riskCategory === 'MODERATE_RISK');

    auditLedger.addEntry(tenantId, 'PREDICTIVE_FORECAST_GENERATED', this.name, {
      projectedBatchPlacementRate: averageForecast,
      highRiskCount: highRiskStudents.length,
      moderateRiskCount: moderateRiskStudents.length
    });

    return {
      agent: this.name,
      evaluatedAt: new Date().toISOString(),
      tenantId,
      projectedBatchPlacementRate: averageForecast,
      projectedRateWithInterventions: Math.min(95, averageForecast + 16),
      totalCohortEvaluated: students.length,
      riskBreakdown: {
        highRisk: highRiskStudents.length,
        moderateRisk: moderateRiskStudents.length,
        onTrack: students.length - highRiskStudents.length - moderateRiskStudents.length
      },
      atRiskQueue: highRiskStudents
    };
  }
}

module.exports = {
  industryProfiler: new IndustrySkillGapProfilerAgent(),
  predictiveAnalytics: new PredictivePlacementAnalyticsAgent()
};
