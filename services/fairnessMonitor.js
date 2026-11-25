// Fairness & Bias Monitoring Service (NYC Local Law 144 & EU AI Act High-Risk Compliant)
// Computes Impact-Ratio Analysis (Four-Fifths / 80% Benchmark) across demographic dimensions
const db = require('../data/db');
const auditLedger = require('./auditLedger');

class FairnessMonitorService {
  computeFairnessMetrics(tenantId = 'vpcoe-mumbai') {
    const students = db.STUDENTS.filter(s => s.tenantId === tenantId);
    
    // Dimension 1: Gender Disparity
    const genderStats = this.analyzeDimension(students, 'gender', ['Male', 'Female']);

    // Dimension 2: Social Category Disparity
    const categoryStats = this.analyzeDimension(students, 'category', ['General', 'OBC', 'SC', 'ST']);

    // Dimension 3: Discipline / Branch Disparity
    const branchStats = this.analyzeDimension(students, 'branch', ['CSE', 'IT', 'ECE', 'Mech']);

    const adverseImpactFound = [genderStats, categoryStats, branchStats].some(d => d.hasAdverseImpact);

    auditLedger.addEntry(tenantId, 'FAIRNESS_AUDIT_EVALUATED', 'FAIRNESS_MONITOR_ENGINE', {
      adverseImpactFound,
      genderLowestImpactRatio: genderStats.lowestImpactRatio,
      categoryLowestImpactRatio: categoryStats.lowestImpactRatio
    });

    return {
      evaluatedAt: new Date().toISOString(),
      frameworks: ['Four-Fifths Rule (EEOC 80% Benchmark)', 'NYC Local Law 144', 'EU AI Act Article 10 & Annex III'],
      overallCompliance: adverseImpactFound ? 'FLAGGED_FOR_HUMAN_REVIEW' : 'COMPLIANT_WITH_BENCHMARK',
      adverseImpactFound,
      dimensions: {
        gender: genderStats,
        category: categoryStats,
        branch: branchStats
      },
      recommendedRemediation: adverseImpactFound
        ? 'Disparities detected in selection rate (< 0.80 benchmark). Review interview shortlist rubrics for non-core criteria bias and conduct targeted gap-bridging workshops.'
        : 'All demographic slices currently meet or exceed the 80% impact-ratio fairness benchmark.'
    };
  }

  analyzeDimension(students, attribute, groups) {
    const groupMetrics = {};

    groups.forEach(group => {
      const cohort = students.filter(s => s[attribute] === group);
      const total = cohort.length;
      // In our platform, candidate is "selected" or "shortlisted" if they have an active application in shortlist status
      // or meet the active eligibility rule with high confidence
      const selected = cohort.filter(s => {
        const hasShortlist = s.applications && s.applications.some(a => a.status.includes('Shortlist') || a.status.includes('Offered'));
        const verifiedSkills = s.skills.filter(sk => sk.state === 'Verified').length;
        return hasShortlist || (s.cgpa >= 7.5 && verifiedSkills >= 2);
      }).length;

      const selectionRate = total > 0 ? (selected / total) : 0;
      groupMetrics[group] = {
        total,
        selected,
        selectionRate: Math.round(selectionRate * 1000) / 10 // e.g. 75.0%
      };
    });

    // Find highest selection rate among groups with at least 1 candidate
    let maxRate = 0;
    let favoredGroup = null;
    for (const [group, data] of Object.entries(groupMetrics)) {
      if (data.total > 0 && data.selectionRate > maxRate) {
        maxRate = data.selectionRate;
        favoredGroup = group;
      }
    }

    let lowestRatio = 1.0;
    let hasAdverseImpact = false;
    const impactRatios = {};

    for (const [group, data] of Object.entries(groupMetrics)) {
      if (maxRate > 0 && data.total > 0) {
        const ratio = Math.round((data.selectionRate / maxRate) * 100) / 100;
        impactRatios[group] = ratio;
        if (ratio < lowestRatio) lowestRatio = ratio;
        if (ratio < 0.80) {
          hasAdverseImpact = true;
        }
      } else {
        impactRatios[group] = 1.0;
      }
    }

    return {
      attribute,
      groups: groupMetrics,
      favoredGroup,
      highestSelectionRate: maxRate,
      lowestImpactRatio: lowestRatio,
      hasAdverseImpact,
      fourFifthsThreshold: 0.80,
      impactRatios
    };
  }
}

module.exports = new FairnessMonitorService();
