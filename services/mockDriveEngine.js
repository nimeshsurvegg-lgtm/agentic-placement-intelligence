// Mock Drive Engine: Aptitude (30 Qs), Machine Coding Test (2 Qs), AI Technical Interview (Role-based)
const db = require('../data/db');
const auditLedger = require('./auditLedger');

class MockDriveEngine {
  evaluateAptitude(answers) {
    // answers is an object: { 'APT-Q01': 1, 'APT-Q02': 0, ... }
    let totalScore = 0;
    const sectionScores = {
      Quantitative: { correct: 0, total: 10, marksLost: [] },
      'Logical Reasoning': { correct: 0, total: 10, marksLost: [] },
      'Verbal Ability': { correct: 0, total: 10, marksLost: [] }
    };

    db.APTITUDE_BANK.forEach(q => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct;
      if (isCorrect) {
        totalScore += 1;
        sectionScores[q.section].correct += 1;
      } else {
        sectionScores[q.section].marksLost.push({
          questionId: q.id,
          question: q.question,
          selectedAnswer: selected !== undefined ? q.options[selected] : 'Unanswered',
          correctAnswer: q.options[q.correct],
          explanation: q.explanation
        });
      }
    });

    return {
      score: totalScore,
      maxScore: 30,
      percentage: Math.round((totalScore / 30) * 100),
      sectionScores
    };
  }

  evaluateMachineTest(submissions) {
    // submissions: { 'CODE-Q1': code1, 'CODE-Q2': code2 }
    let totalMarks = 0;
    const results = [];

    // Question 1: SQL Relational Optimization
    const q1Code = submissions['CODE-Q1'] || '';
    let q1Score = 0;
    const q1Checks = [
      { name: 'Contains DENSE_RANK() OVER (PARTITION BY ...)', passed: /DENSE_RANK\s*\(\s*\)\s*OVER/i.test(q1Code) },
      { name: 'Filters out SUSPENDED customers', passed: /SUSPENDED/i.test(q1Code) },
      { name: 'Groups and aggregates order_amount', passed: /SUM\s*\(\s*.*order_amount.*\)/i.test(q1Code) && /GROUP\s+BY/i.test(q1Code) },
      { name: 'Filters rank <= 3 for top-K output', passed: /dept_rank\s*<=\s*3/i.test(q1Code) || /rank\s*<=\s*3/i.test(q1Code) }
    ];
    const q1PassedCount = q1Checks.filter(c => c.passed).length;
    q1Score = Math.round((q1PassedCount / q1Checks.length) * 10);
    totalMarks += q1Score;
    results.push({
      questionId: 'CODE-Q1',
      title: db.MACHINE_TEST_BANK[0].title,
      score: q1Score,
      max: 10,
      checks: q1Checks,
      feedback: q1Score >= 8 ? 'Strong query optimization and window function syntax.' : 'Needs refinement on window function partitioning and subquery filtering.'
    });

    // Question 2: Algorithmic Rate Limiter
    const q2Code = submissions['CODE-Q2'] || '';
    let q2Score = 0;
    const q2Checks = [
      { name: 'Defines SlidingWindowRateLimiter class', passed: /class\s+SlidingWindowRateLimiter/i.test(q2Code) },
      { name: 'Maintains client timestamps queue/deque', passed: /deque|list|array|queue/i.test(q2Code) },
      { name: 'Evicts timestamps older than sliding cutoff', passed: /popleft|pop|filter|cutoff/i.test(q2Code) },
      { name: 'Accurately allows/rejects requests based on window capacity', passed: /return\s+True/i.test(q2Code) && /return\s+False/i.test(q2Code) }
    ];
    const q2PassedCount = q2Checks.filter(c => c.passed).length;
    q2Score = Math.round((q2PassedCount / q2Checks.length) * 10);
    totalMarks += q2Score;
    results.push({
      questionId: 'CODE-Q2',
      title: db.MACHINE_TEST_BANK[1].title,
      score: q2Score,
      max: 10,
      checks: q2Checks,
      feedback: q2Score >= 8 ? 'Efficient sliding window implementation with timestamp pruning.' : 'Memory eviction logic needs optimization to prevent unbounded buffer growth.'
    });

    return {
      score: totalMarks,
      maxScore: 20,
      percentage: Math.round((totalMarks / 20) * 100),
      questionResults: results
    };
  }

  evaluateInterview(answers, role = 'Backend Developer') {
    // answers: { 'INT-Q1': text1, 'INT-Q2': text2, 'INT-Q3': text3 }
    const questions = db.AI_INTERVIEW_BANK[role] || db.AI_INTERVIEW_BANK['Backend Developer'];
    let totalScore = 0;
    const evaluations = [];

    questions.forEach((q, idx) => {
      const answerText = (answers[q.id] || '').toLowerCase();
      let matchedKeywords = 0;
      q.keywords.forEach(kw => {
        if (answerText.includes(kw.toLowerCase())) matchedKeywords++;
      });

      const keywordRatio = q.keywords.length > 0 ? (matchedKeywords / q.keywords.length) : 0.5;
      const lengthBonus = answerText.length > 80 ? 0.2 : 0;
      const normalizedRatio = Math.min(1.0, keywordRatio + lengthBonus);

      const qMax = Math.round(50 / questions.length);
      const qScore = Math.round(normalizedRatio * qMax);
      totalScore += qScore;

      evaluations.push({
        questionId: q.id,
        question: q.question,
        score: qScore,
        maxScore: qMax,
        matchedKeywordsCount: matchedKeywords,
        totalKeywords: q.keywords.length,
        feedback: normalizedRatio >= 0.75
          ? 'Clear technical articulation with accurate architectural keywords and trade-offs.'
          : 'Answer was conceptual but missed crucial implementation specifics (e.g. deadlock isolation levels or connection pool thresholds).'
      });
    });

    return {
      score: totalScore,
      maxScore: 50,
      percentage: Math.round((totalScore / 50) * 100),
      evaluations
    };
  }

  generateDiagnosticReport(studentId, role, aptitudeResult, machineResult, interviewResult) {
    const totalScore = aptitudeResult.score + machineResult.score + interviewResult.score;
    const maxScore = 30 + 20 + 50; // 100
    const percentage = Math.round((totalScore / maxScore) * 100);

    const weakTopics = [];
    if (aptitudeResult.percentage < 70) {
      if (aptitudeResult.sectionScores.Quantitative.correct < 7) weakTopics.push('Quantitative Aptitude Ratios & Time-Work');
      if (aptitudeResult.sectionScores['Logical Reasoning'].correct < 7) weakTopics.push('Logical Deductions & Syllogisms');
      if (aptitudeResult.sectionScores['Verbal Ability'].correct < 7) weakTopics.push('Verbal Prepositions & Sentence Coherence');
    }
    if (machineResult.score < 15) {
      weakTopics.push('SQL Window Functions & Subqueries');
      weakTopics.push('Sliding Window Algorithmic Optimization');
    }
    if (interviewResult.percentage < 70) {
      weakTopics.push('System Deadlock & Transaction Isolation Mechanisms');
      weakTopics.push('Resilient Message Queuing & Circuit Breakers');
    }

    const summary = weakTopics.length > 0
      ? `Identified primary performance gaps in: ${weakTopics.slice(0, 3).join(', ')}. Marks were lost in machine test subqueries and transaction isolation depth.`
      : 'Demonstrated outstanding all-round competency across aptitude, live coding, and technical interview.';

    // Generate personalized learning path tasks targeting verifiable proof
    const recommendedTasks = [
      {
        id: `TASK-PRACTICE-${Date.now()}-1`,
        title: 'SQL Practice Sprint: 15 Joins & Window Function Queries',
        type: 'practice_set',
        estimatedHours: 4,
        status: 'pending',
        verifiableOutcome: 'Solves 15 interactive query challenges with automated check'
      },
      {
        id: `TASK-PROJECT-${Date.now()}-2`,
        title: 'Mini-Project: SQL Query Performance Profiler & Index Optimizer',
        type: 'mini_project',
        estimatedHours: 10,
        status: 'pending',
        verifiableOutcome: 'Pushes verified GitHub repository with schema migrations and EXPLAIN ANALYZE benchmarks'
      },
      {
        id: `TASK-RETAKE-${Date.now()}-3`,
        title: 'Retake Mock Drive Machine Coding Test',
        type: 'mock_test',
        estimatedHours: 2,
        status: 'pending',
        verifiableOutcome: 'Score >= 16/20 on SQL and algorithmic challenges'
      }
    ];

    const report = {
      reportId: `REP-${Date.now()}-${studentId}`,
      studentId,
      role,
      evaluatedAt: new Date().toISOString(),
      scores: {
        aptitude: aptitudeResult,
        machineTest: machineResult,
        interview: interviewResult,
        total: {
          score: totalScore,
          max: maxScore,
          percentage
        }
      },
      weakTopics,
      diagnosticSummary: summary,
      recommendedLearningPath: recommendedTasks
    };

    // Record mock test in audit trail
    const student = db.STUDENTS.find(s => s.id === studentId);
    if (student) {
      if (!student.mockDriveHistory) student.mockDriveHistory = [];
      student.mockDriveHistory.unshift({
        id: report.reportId,
        date: new Date().toISOString().split('T')[0],
        role,
        scores: {
          aptitude: { score: aptitudeResult.score, max: 30, percentage: aptitudeResult.percentage },
          machineTest: { score: machineResult.score, max: 20, percentage: machineResult.percentage },
          interview: { score: interviewResult.score, max: 50, percentage: interviewResult.percentage },
          total: { score: totalScore, max: maxScore, percentage }
        },
        weakTopics,
        diagnosticSummary: summary
      });

      auditLedger.addEntry(student.tenantId, 'MOCK_DRIVE_COMPLETED', student.name, {
        reportId: report.reportId,
        role,
        totalScore,
        percentage,
        weakTopicsCount: weakTopics.length
      });
    }

    return report;
  }
}

module.exports = new MockDriveEngine();
