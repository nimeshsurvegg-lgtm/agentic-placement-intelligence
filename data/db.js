// Master In-Memory & Relational-Style Database for Agentic Placement Intelligence Platform
const auditLedger = require('../services/auditLedger');

// Standard Taxonomy Dictionary: ESCO, O*NET, NSQF
const TAXONOMY = {
  python: {
    name: 'Python',
    category: 'Backend & Systems',
    esco: '2512.1.4 (Software Developer: Python)',
    onet: '15-1252.00 (Software Developers)',
    nsqf: 'Level 7 - Full Stack Software Developer',
    description: 'Object-oriented programming, data processing, backend APIs, algorithm implementation'
  },
  sql: {
    name: 'SQL & Relational Databases',
    category: 'Databases & Storage',
    esco: '2521.1.2 (Database Designer & Administrator)',
    onet: '15-1242.00 (Database Administrators and Architects)',
    nsqf: 'Level 6 - Database Developer',
    description: 'Schema modeling, relational algebra, indexing, CTEs, window functions, query plan optimization'
  },
  docker: {
    name: 'Docker & Containerization',
    category: 'Cloud & DevOps',
    esco: '2519.2.1 (DevOps and Cloud Infrastructure Specialist)',
    onet: '15-1251.00 (Computer Programmers: Infrastructure)',
    nsqf: 'Level 7 - Cloud Infrastructure Specialist',
    description: 'Container lifecycles, multi-stage builds, container networks, microservice isolation'
  },
  fastapi: {
    name: 'FastAPI / Async Python',
    category: 'Backend & Systems',
    esco: '2512.2.3 (Web & API Architect)',
    onet: '15-1252.00 (Software Developers)',
    nsqf: 'Level 7 - RESTful API Engineer',
    description: 'Asynchronous event handling, Pydantic validation, OpenAPI documentation, high-throughput microservices'
  },
  react: {
    name: 'React.js & Frontend',
    category: 'Frontend Engineering',
    esco: '2513.1.1 (Frontend Web Developer)',
    onet: '15-1254.00 (Web Developers)',
    nsqf: 'Level 6 - Frontend Developer',
    description: 'Component architecture, state management, hooks, virtual DOM optimization, client-side rendering'
  },
  dsa: {
    name: 'Data Structures & Algorithms',
    category: 'Core Computer Science',
    esco: '2512.1.1 (Algorithms Specialist)',
    onet: '15-1252.00 (Software Developers)',
    nsqf: 'Level 7 - Problem Solving Specialist',
    description: 'Asymptotic complexity, dynamic programming, graph algorithms, trees, heaps, search & sort'
  },
  system_design: {
    name: 'Distributed System Design',
    category: 'Architecture & Systems',
    esco: '2511.1.5 (Solutions Architect)',
    onet: '15-1251.00 (Computer Systems Analysts)',
    nsqf: 'Level 8 - Principal Solutions Architect',
    description: 'CAP theorem, horizontal scaling, caching strategies, load balancing, message queues, rate limiters'
  },
  git: {
    name: 'Git Version Control',
    category: 'Engineering Practices',
    esco: '2519.1.4 (Software Configuration Engineer)',
    onet: '15-1252.00 (Software Developers)',
    nsqf: 'Level 6 - Version Control Specialist',
    description: 'Branching models, atomic commits, pull requests, merge conflict resolution, CI/CD hooks'
  },
  aws_cloud: {
    name: 'AWS Cloud Services',
    category: 'Cloud & DevOps',
    esco: '2529.2.2 (Cloud Solutions Engineer)',
    onet: '15-1244.00 (Network and Computer Systems Administrators)',
    nsqf: 'Level 7 - Cloud Operations Specialist',
    description: 'IAM security, EC2, S3, RDS, Lambda serverless, VPC networking'
  },
  machine_learning: {
    name: 'Machine Learning & AI',
    category: 'AI & Data Science',
    esco: '2511.3.1 (AI Systems Engineer)',
    onet: '15-2051.01 (Data Scientists)',
    nsqf: 'Level 8 - Machine Learning Specialist',
    description: 'Supervised/unsupervised models, scikit-learn, deep learning architectures, feature engineering'
  }
};

// Multi-tenant College Database
const TENANTS = [
  {
    id: 'vpcoe-mumbai',
    name: "Vasantdada Patil Pratishthan's College of Engineering & Visual Arts (VPCOE & VA)",
    code: 'VPCOE',
    university: 'University of Mumbai',
    location: 'Sion, Mumbai, Maharashtra',
    tier: 'Tier 2',
    totalStudents: 480,
    placementRate: 74.2,
    verifiedSkillCoverage: 82.5,
    tpoOfficer: {
      name: 'Dr. Anil Kulkarni',
      email: 'tpo@vpcoe.ac.in',
      phone: '+91 98201 54321',
      designation: 'Head - Training & Placement Cell'
    }
  },
  {
    id: 'coep-pune',
    name: 'COEP Technological University',
    code: 'COEP',
    university: 'State University',
    location: 'Shivajinagar, Pune, Maharashtra',
    tier: 'Tier 1',
    totalStudents: 620,
    placementRate: 88.4,
    verifiedSkillCoverage: 91.0,
    tpoOfficer: {
      name: 'Dr. Sunita Deshpande',
      email: 'tpo@coep.ac.in',
      phone: '+91 98220 11223',
      designation: 'Dean - Corporate Relations & TPO'
    }
  },
  {
    id: 'vjti-mumbai',
    name: 'Veermata Jijabai Technological Institute (VJTI)',
    code: 'VJTI',
    university: 'Autonomous Institute',
    location: 'Matunga, Mumbai, Maharashtra',
    tier: 'Tier 1',
    totalStudents: 560,
    placementRate: 89.2,
    verifiedSkillCoverage: 89.5,
    tpoOfficer: {
      name: 'Prof. Rajesh Joshi',
      email: 'tpo@vjti.ac.in',
      phone: '+91 98199 44332',
      designation: 'Training & Placement Officer'
    }
  }
];

// Initial Cohort of Students (with Rahul Sharma as our primary hero student)
let STUDENTS = [
  {
    id: 'STU-VPCOE-042',
    tenantId: 'vpcoe-mumbai',
    rollNo: 'VP-2023-CS-042',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@student.vpcoe.ac.in',
    phone: '+91 98765 43210',
    branch: 'CSE',
    batch: '2023-2027',
    semester: 7,
    cgpa: 8.42,
    activeBacklogs: 0,
    historyBacklogs: 0,
    gender: 'Male',
    category: 'General',
    targetRole: 'Backend Developer',
    githubConnected: true,
    githubHandle: 'rahulsharma-dev',
    leetcodeConnected: true,
    leetcodeHandle: 'rahul_code2026',
    leetcodeProblemsSolved: 230,
    // Consent settings under India DPDP Act 2023
    consent: {
      repoReadConsent: true,
      repoConsentGrantedAt: '2026-06-10T10:00:00Z',
      recruiterSearchConsent: true,
      demographicSharingConsent: true,
      dataRetentionDays: 180,
      verifiableConsentId: 'DPDP-CONSENT-2026-RS042'
    },
    // Skills with explicit Evidence-Gated states: Claimed, Observed, Evidence-linked, Verified, Expired
    skills: [
      {
        skillId: 'python',
        state: 'Verified',
        confidence: 94,
        verifiedAt: '2026-08-15',
        expiresAt: '2027-08-15',
        evidenceCount: 3,
        evidenceTrail: [
          {
            type: 'github_repo',
            title: 'Distributed Event Streamer in FastAPI & Redis',
            url: 'https://github.com/rahulsharma-dev/event-streamer',
            details: '18 atomic commits, AST code parse passed, 100% Python 3.12 syntax, PEP8 compliance',
            date: '2026-08-14'
          },
          {
            type: 'mentor_attestation',
            title: 'Prof. S. Rane (Systems Lab)',
            details: 'Reviewed and validated concurrency architecture and asyncio lock handling',
            date: '2026-08-15'
          }
        ]
      },
      {
        skillId: 'fastapi',
        state: 'Verified',
        confidence: 90,
        verifiedAt: '2026-08-14',
        expiresAt: '2027-08-14',
        evidenceCount: 2,
        evidenceTrail: [
          {
            type: 'github_repo',
            title: 'event-streamer (FastAPI microservices)',
            url: 'https://github.com/rahulsharma-dev/event-streamer',
            details: 'Pydantic models, Dependency Injection, Swagger OpenAPI docs generated',
            date: '2026-08-14'
          }
        ]
      },
      {
        skillId: 'dsa',
        state: 'Verified',
        confidence: 88,
        verifiedAt: '2026-09-01',
        expiresAt: '2027-09-01',
        evidenceCount: 1,
        evidenceTrail: [
          {
            type: 'leetcode_submission',
            title: 'LeetCode Verified Profile: 230 Problems Solved',
            url: 'https://leetcode.com/rahul_code2026',
            details: '110 Easy, 95 Medium, 25 Hard; top 15% contest rating (1740)',
            date: '2026-09-01'
          }
        ]
      },
      {
        skillId: 'sql',
        state: 'Claimed', // Notice: Rahul initially only CLAIMED SQL without proof -> will trigger skill gap!
        confidence: 45,
        verifiedAt: null,
        expiresAt: null,
        evidenceCount: 0,
        evidenceTrail: []
      },
      {
        skillId: 'docker',
        state: 'Observed', // Seen in Dockerfile, but not tested or verified yet
        confidence: 50,
        verifiedAt: null,
        expiresAt: null,
        evidenceCount: 1,
        evidenceTrail: [
          {
            type: 'github_repo',
            title: 'event-streamer/Dockerfile',
            url: 'https://github.com/rahulsharma-dev/event-streamer/blob/main/Dockerfile',
            details: 'Multi-stage Dockerfile observed in repo root',
            date: '2026-08-10'
          }
        ]
      },
      {
        skillId: 'react',
        state: 'Expired', // Proof is over 1 year old without re-verification!
        confidence: 40,
        verifiedAt: '2025-06-01',
        expiresAt: '2026-06-01',
        evidenceCount: 1,
        evidenceTrail: [
          {
            type: 'hackathon_cert',
            title: 'Frontend Hackathon 2025 Certificate',
            url: 'https://credentials.vpcoe.ac.in/cert/2025-fe-441',
            details: 'Proof expired on 2026-06-01. Student needs to refresh evidence with new commit or test.',
            date: '2025-06-01'
          }
        ]
      },
      {
        skillId: 'git',
        state: 'Verified',
        confidence: 95,
        verifiedAt: '2026-08-14',
        expiresAt: '2027-08-14',
        evidenceCount: 2,
        evidenceTrail: [
          {
            type: 'github_commit',
            title: 'Verified Git History Coherence',
            url: 'https://github.com/rahulsharma-dev',
            details: '142 commits in 2026 across 5 repositories, regular commit spacing, signed commits',
            date: '2026-08-14'
          }
        ]
      }
    ],
    projects: [
      {
        id: 'PRJ-1',
        title: 'Distributed Event Streamer in FastAPI & Redis',
        repoUrl: 'https://github.com/rahulsharma-dev/event-streamer',
        techStack: ['Python', 'FastAPI', 'Redis', 'Docker'],
        summary: 'High-throughput event streaming backend capable of processing 8,500 req/sec with async Redis pub/sub queue.',
        verifiedBySystem: true,
        commitsCount: 18,
        starsCount: 14
      },
      {
        id: 'PRJ-2',
        title: 'E-Commerce Microservices Engine',
        repoUrl: 'https://github.com/rahulsharma-dev/ecommerce-microservices',
        techStack: ['Python', 'Docker', 'PostgreSQL', 'Git'],
        summary: 'Service-oriented architecture with decoupled authentication, catalog, and order payment processing.',
        verifiedBySystem: true,
        commitsCount: 24,
        starsCount: 9
      },
      {
        id: 'PRJ-3',
        title: 'Algorithmic Trading Backtester',
        repoUrl: 'https://github.com/rahulsharma-dev/algo-backtest',
        techStack: ['Python', 'Pandas', 'NumPy'],
        summary: 'Vectorized backtesting engine simulating moving average crossovers on NSE Nifty 50 historical ticks.',
        verifiedBySystem: true,
        commitsCount: 12,
        starsCount: 6
      }
    ],
    certifications: [
      {
        id: 'CERT-1',
        title: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issuedDate: '2026-04-12',
        verifiableCredentialUrl: 'https://aws.amazon.com/verification/8841-A29',
        w3cVC: {
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          id: "urn:uuid:8841-a29-aws-ccp",
          type: ["VerifiableCredential", "CertificationBadge"],
          issuer: "did:web:aws.amazon.com",
          issuanceDate: "2026-04-12T00:00:00Z"
        }
      },
      {
        id: 'CERT-2',
        title: 'Python for Enterprise Backend Engineering',
        issuer: 'NPTEL / IIT Madras',
        issuedDate: '2026-02-18',
        verifiableCredentialUrl: 'https://nptel.ac.in/verify/NPTEL26CS99',
        score: 'Elite + Silver (84%)'
      }
    ],
    mockDriveHistory: [
      {
        id: 'MOCK-001',
        date: '2026-09-02',
        role: 'Backend Developer',
        scores: {
          aptitude: { score: 21, max: 30, percentage: 70 },
          machineTest: { score: 12, max: 20, percentage: 60 },
          interview: { score: 28, max: 50, percentage: 56 },
          total: { score: 61, max: 100, percentage: 61 }
        },
        weakTopics: ['SQL Window Functions & Subqueries', 'System Deadlock & Transaction Isolation', 'Algorithmic Problem Solving'],
        diagnosticSummary: 'Strong in Core Python and API conventions. Weak in SQL relational query tuning, subqueries, and concurrency problem solving.'
      }
    ],
    learningPath: {
      generatedAt: '2026-09-03',
      targetRole: 'Backend Developer',
      completedTasks: 1,
      totalTasks: 4,
      tasks: [
        {
          id: 'TASK-1',
          title: 'Complete SQL Practice Set 1: Joins & Aggregations',
          type: 'practice_set',
          estimatedHours: 4,
          status: 'completed',
          completedAt: '2026-09-04',
          verifiableOutcome: 'Passed 15/15 practice queries on interactive engine'
        },
        {
          id: 'TASK-2',
          title: 'Complete SQL Practice Set 2: Window Functions & CTEs',
          type: 'practice_set',
          estimatedHours: 6,
          status: 'pending',
          verifiableOutcome: 'Solves 10 advanced window function challenges (RANK, DENSE_RANK, LEAD, LAG)'
        },
        {
          id: 'TASK-3',
          title: 'Build Mini Project: SQL Query Performance Profiler Repo',
          type: 'mini_project',
          estimatedHours: 12,
          status: 'pending',
          verifiableOutcome: 'Push repository with schema migrations, indexes, EXPLAIN ANALYZE benchmarks producing verified evidence trail'
        },
        {
          id: 'TASK-4',
          title: 'Retake Mock Drive Machine Coding Test',
          type: 'mock_test',
          estimatedHours: 2,
          status: 'pending',
          verifiableOutcome: 'Score >= 16/20 on SQL & problem solving machine round'
        }
      ]
    },
    applications: [
      {
        driveId: 'DRIVE-BARCLAYS-2026',
        company: 'Barclays',
        role: 'Backend Developer',
        appliedAt: '2026-09-05T14:30:00Z',
        status: 'Under Review',
        eligibilitySnapshot: {
          ruleVersion: 'RULE_V2.1',
          passed: true,
          checkedAt: '2026-09-05T14:29:40Z'
        }
      }
    ],
    appeals: []
  },
  {
    id: 'STU-VPCOE-015',
    tenantId: 'vpcoe-mumbai',
    rollNo: 'VP-2023-CS-015',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@student.vpcoe.ac.in',
    phone: '+91 98765 11223',
    branch: 'CSE',
    batch: '2023-2027',
    semester: 7,
    cgpa: 9.12,
    activeBacklogs: 0,
    historyBacklogs: 0,
    gender: 'Female',
    category: 'General',
    targetRole: 'Full Stack Engineer',
    githubConnected: true,
    githubHandle: 'ananyaiyer',
    leetcodeConnected: true,
    leetcodeHandle: 'ananya_coder',
    leetcodeProblemsSolved: 310,
    consent: {
      repoReadConsent: true,
      repoConsentGrantedAt: '2026-05-12T10:00:00Z',
      recruiterSearchConsent: true,
      demographicSharingConsent: true,
      dataRetentionDays: 180,
      verifiableConsentId: 'DPDP-CONSENT-2026-AI015'
    },
    skills: [
      { skillId: 'python', state: 'Verified', confidence: 96, verifiedAt: '2026-08-01', expiresAt: '2027-08-01', evidenceCount: 3, evidenceTrail: [{ type: 'github_repo', title: 'Enterprise Python Microservices', url: 'https://github.com/ananyaiyer/microservices', date: '2026-08-01' }] },
      { skillId: 'react', state: 'Verified', confidence: 92, verifiedAt: '2026-08-10', expiresAt: '2027-08-10', evidenceCount: 4, evidenceTrail: [{ type: 'github_repo', title: 'React Modern Dashboard UI', url: 'https://github.com/ananyaiyer/react-ui', date: '2026-08-10' }] },
      { skillId: 'sql', state: 'Verified', confidence: 89, verifiedAt: '2026-08-05', expiresAt: '2027-08-05', evidenceCount: 2, evidenceTrail: [{ type: 'machine_test', title: 'SQL Benchmark Exam', url: 'https://vpcoe.ac.in/exams/sql/015', date: '2026-08-05' }] },
      { skillId: 'dsa', state: 'Verified', confidence: 94, verifiedAt: '2026-07-20', expiresAt: '2027-07-20', evidenceCount: 3, evidenceTrail: [{ type: 'leetcode_submission', title: '310 LeetCode Solved', url: 'https://leetcode.com/ananya_coder', date: '2026-07-20' }] },
      { skillId: 'docker', state: 'Verified', confidence: 84, verifiedAt: '2026-08-18', expiresAt: '2027-08-18', evidenceCount: 2, evidenceTrail: [{ type: 'github_repo', title: 'Containerized Deployment Pipeline', url: 'https://github.com/ananyaiyer/docker-k8s', date: '2026-08-18' }] }
    ],
    mockDriveHistory: [
      {
        id: 'MOCK-002',
        date: '2026-09-01',
        role: 'Full Stack Engineer',
        scores: {
          aptitude: { score: 28, max: 30, percentage: 93 },
          machineTest: { score: 19, max: 20, percentage: 95 },
          interview: { score: 46, max: 50, percentage: 92 },
          total: { score: 93, max: 100, percentage: 93 }
        },
        weakTopics: ['Advanced CSS Container Queries'],
        diagnosticSummary: 'Exceptional competency across backend, frontend, and algorithms.'
      }
    ],
    applications: [
      {
        driveId: 'DRIVE-GOOGLE-2026',
        company: 'Google',
        role: 'Cloud Software Engineer',
        appliedAt: '2026-09-04T11:00:00Z',
        status: 'Shortlisted for Interview',
        eligibilitySnapshot: { ruleVersion: 'RULE_V2.1', passed: true }
      }
    ],
    appeals: []
  },
  {
    id: 'STU-VPCOE-088',
    tenantId: 'vpcoe-mumbai',
    rollNo: 'VP-2023-IT-088',
    name: 'Rohan Patil',
    email: 'rohan.patil@student.vpcoe.ac.in',
    phone: '+91 98765 22334',
    branch: 'IT',
    batch: '2023-2027',
    semester: 7,
    cgpa: 6.75,
    activeBacklogs: 1, // Has 1 active backlog!
    historyBacklogs: 2,
    gender: 'Male',
    category: 'OBC',
    targetRole: 'Data Analyst',
    githubConnected: true,
    githubHandle: 'rohan-data',
    leetcodeConnected: false,
    leetcodeHandle: null,
    leetcodeProblemsSolved: 40,
    consent: {
      repoReadConsent: true,
      repoConsentGrantedAt: '2026-06-20T11:00:00Z',
      recruiterSearchConsent: true,
      demographicSharingConsent: true,
      dataRetentionDays: 180,
      verifiableConsentId: 'DPDP-CONSENT-2026-RP088'
    },
    skills: [
      { skillId: 'python', state: 'Observed', confidence: 60, verifiedAt: null, expiresAt: null, evidenceCount: 1 },
      { skillId: 'sql', state: 'Claimed', confidence: 40, verifiedAt: null, expiresAt: null, evidenceCount: 0 },
      { skillId: 'git', state: 'Observed', confidence: 50, verifiedAt: null, expiresAt: null, evidenceCount: 1 }
    ],
    mockDriveHistory: [
      {
        id: 'MOCK-003',
        date: '2026-09-02',
        role: 'Data Analyst',
        scores: {
          aptitude: { score: 14, max: 30, percentage: 46 },
          machineTest: { score: 8, max: 20, percentage: 40 },
          interview: { score: 20, max: 50, percentage: 40 },
          total: { score: 42, max: 100, percentage: 42 }
        },
        weakTopics: ['Aptitude Quantitative Ratios', 'SQL Aggregations', 'Data Cleaning in Pandas'],
        diagnosticSummary: 'Critical gaps in aptitude fundamentals and core SQL operations.'
      }
    ],
    // Predictive AI flag (AI Helps, Human Decides status)
    atRiskPrediction: {
      predictedRisk: 'HIGH_RISK',
      riskScore: 78, // out of 100 risk
      forecastPlacementProb: 32.5,
      factors: [
        'Active backlog in Semester 6 Mathematics',
        'Mock Drive overall score below 50% (42/100)',
        'Zero verified skills on graph (only Claimed/Observed)',
        'Low problem solving frequency'
      ],
      officerReviewed: false,
      assignedMentor: null,
      status: 'PENDING_OFFICER_REVIEW'
    },
    applications: [],
    appeals: []
  },
  {
    id: 'STU-VPCOE-032',
    tenantId: 'vpcoe-mumbai',
    rollNo: 'VP-2023-EC-032',
    name: 'Priya Deshmukh',
    email: 'priya.deshmukh@student.vpcoe.ac.in',
    phone: '+91 98765 33445',
    branch: 'ECE',
    batch: '2023-2027',
    semester: 7,
    cgpa: 8.25,
    activeBacklogs: 0,
    historyBacklogs: 0,
    gender: 'Female',
    category: 'OBC',
    targetRole: 'Embedded & IoT Systems Engineer',
    githubConnected: true,
    githubHandle: 'priya-embedded',
    leetcodeConnected: true,
    leetcodeHandle: 'priya_ec',
    leetcodeProblemsSolved: 120,
    consent: {
      repoReadConsent: true,
      repoConsentGrantedAt: '2026-05-18T10:00:00Z',
      recruiterSearchConsent: true,
      demographicSharingConsent: true,
      dataRetentionDays: 180,
      verifiableConsentId: 'DPDP-CONSENT-2026-PD032'
    },
    skills: [
      { skillId: 'python', state: 'Verified', confidence: 85, verifiedAt: '2026-08-01', expiresAt: '2027-08-01', evidenceCount: 2, evidenceTrail: [{ type: 'github_repo', title: 'IoT Sensor Telemetry', url: 'https://github.com/priya-embedded/telemetry', date: '2026-08-01' }] },
      { skillId: 'git', state: 'Verified', confidence: 90, verifiedAt: '2026-07-28', expiresAt: '2027-07-28', evidenceCount: 2, evidenceTrail: [{ type: 'github_commit', title: 'Git Coherence Audit', url: 'https://github.com/priya-embedded', date: '2026-07-28' }] },
      { skillId: 'dsa', state: 'Verified', confidence: 78, verifiedAt: '2026-08-10', expiresAt: '2027-08-10', evidenceCount: 1, evidenceTrail: [{ type: 'leetcode_submission', title: '120 LeetCode Solved', url: 'https://leetcode.com/priya_ec', date: '2026-08-10' }] }
    ],
    applications: [],
    appeals: []
  },
  {
    id: 'STU-VPCOE-110',
    tenantId: 'vpcoe-mumbai',
    rollNo: 'VP-2023-CS-110',
    name: 'Vikram Verma',
    email: 'vikram.verma@student.vpcoe.ac.in',
    phone: '+91 98765 44556',
    branch: 'CSE',
    batch: '2023-2027',
    semester: 7,
    cgpa: 7.15,
    activeBacklogs: 0,
    historyBacklogs: 1,
    gender: 'Male',
    category: 'SC',
    targetRole: 'Backend Developer',
    githubConnected: true,
    githubHandle: 'vikram-dev',
    leetcodeConnected: true,
    leetcodeHandle: 'vikram_v',
    leetcodeProblemsSolved: 165,
    consent: {
      repoReadConsent: true,
      repoConsentGrantedAt: '2026-06-01T12:00:00Z',
      recruiterSearchConsent: true,
      demographicSharingConsent: true,
      dataRetentionDays: 180,
      verifiableConsentId: 'DPDP-CONSENT-2026-VV110'
    },
    skills: [
      { skillId: 'python', state: 'Verified', confidence: 82, verifiedAt: '2026-08-10', expiresAt: '2027-08-10', evidenceCount: 2, evidenceTrail: [{ type: 'github_repo', title: 'Django Backend App', url: 'https://github.com/vikram-dev/app', date: '2026-08-10' }] },
      { skillId: 'sql', state: 'Observed', confidence: 60, verifiedAt: null, expiresAt: null, evidenceCount: 1, evidenceTrail: [] },
      { skillId: 'git', state: 'Verified', confidence: 88, verifiedAt: '2026-08-05', expiresAt: '2027-08-05', evidenceCount: 2, evidenceTrail: [{ type: 'github_commit', title: 'Verified Git History', url: 'https://github.com/vikram-dev', date: '2026-08-05' }] }
    ],
    applications: [],
    appeals: []
  },
  {
    id: 'STU-VPCOE-045',
    tenantId: 'vpcoe-mumbai',
    rollNo: 'VP-2023-IT-045',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@student.vpcoe.ac.in',
    phone: '+91 98765 55667',
    branch: 'IT',
    batch: '2023-2027',
    semester: 7,
    cgpa: 8.68,
    activeBacklogs: 0,
    historyBacklogs: 0,
    gender: 'Female',
    category: 'General',
    targetRole: 'Cloud & DevOps Engineer',
    githubConnected: true,
    githubHandle: 'sneha-devops',
    leetcodeConnected: true,
    leetcodeHandle: 'sneha_g',
    leetcodeProblemsSolved: 190,
    consent: {
      repoReadConsent: true,
      repoConsentGrantedAt: '2026-05-25T11:00:00Z',
      recruiterSearchConsent: true,
      demographicSharingConsent: true,
      dataRetentionDays: 180,
      verifiableConsentId: 'DPDP-CONSENT-2026-SG045'
    },
    skills: [
      { skillId: 'docker', state: 'Verified', confidence: 92, verifiedAt: '2026-08-20', expiresAt: '2027-08-20', evidenceCount: 3, evidenceTrail: [{ type: 'github_repo', title: 'Kubernetes Cluster Manifests', url: 'https://github.com/sneha-devops/k8s', date: '2026-08-20' }] },
      { skillId: 'python', state: 'Verified', confidence: 86, verifiedAt: '2026-08-01', expiresAt: '2027-08-01', evidenceCount: 2, evidenceTrail: [{ type: 'github_repo', title: 'Automation Scripts', url: 'https://github.com/sneha-devops/py-scripts', date: '2026-08-01' }] },
      { skillId: 'git', state: 'Verified', confidence: 94, verifiedAt: '2026-08-12', expiresAt: '2027-08-12', evidenceCount: 3, evidenceTrail: [{ type: 'github_commit', title: 'CI/CD Workflow Commits', url: 'https://github.com/sneha-devops', date: '2026-08-12' }] }
    ],
    applications: [],
    appeals: []
  },
  {
    id: 'STU-VPCOE-022',
    tenantId: 'vpcoe-mumbai',
    rollNo: 'VP-2023-ME-022',
    name: 'Amit Shinde',
    email: 'amit.shinde@student.vpcoe.ac.in',
    phone: '+91 98765 66778',
    branch: 'Mech',
    batch: '2023-2027',
    semester: 7,
    cgpa: 7.62,
    activeBacklogs: 0,
    historyBacklogs: 0,
    gender: 'Male',
    category: 'OBC',
    targetRole: 'Robotics & Automation Specialist',
    githubConnected: true,
    githubHandle: 'amit-mechatronics',
    leetcodeConnected: false,
    leetcodeHandle: null,
    leetcodeProblemsSolved: 20,
    consent: {
      repoReadConsent: true,
      repoConsentGrantedAt: '2026-06-15T09:00:00Z',
      recruiterSearchConsent: true,
      demographicSharingConsent: true,
      dataRetentionDays: 180,
      verifiableConsentId: 'DPDP-CONSENT-2026-AS022'
    },
    skills: [
      { skillId: 'python', state: 'Verified', confidence: 75, verifiedAt: '2026-07-25', expiresAt: '2027-07-25', evidenceCount: 1, evidenceTrail: [{ type: 'github_repo', title: 'Robotics Kinematics Solver', url: 'https://github.com/amit-mechatronics/kinematics', date: '2026-07-25' }] }
    ],
    applications: [],
    appeals: []
  },
  {
    id: 'STU-VPCOE-064',
    tenantId: 'vpcoe-mumbai',
    rollNo: 'VP-2023-CS-064',
    name: 'Ritu Meena',
    email: 'ritu.meena@student.vpcoe.ac.in',
    phone: '+91 98765 77889',
    branch: 'CSE',
    batch: '2023-2027',
    semester: 7,
    cgpa: 7.95,
    activeBacklogs: 0,
    historyBacklogs: 0,
    gender: 'Female',
    category: 'ST',
    targetRole: 'Backend Developer',
    githubConnected: true,
    githubHandle: 'ritumeena-code',
    leetcodeConnected: true,
    leetcodeHandle: 'ritu_m',
    leetcodeProblemsSolved: 140,
    consent: {
      repoReadConsent: true,
      repoConsentGrantedAt: '2026-06-08T10:00:00Z',
      recruiterSearchConsent: true,
      demographicSharingConsent: true,
      dataRetentionDays: 180,
      verifiableConsentId: 'DPDP-CONSENT-2026-RM064'
    },
    skills: [
      { skillId: 'python', state: 'Verified', confidence: 84, verifiedAt: '2026-08-12', expiresAt: '2027-08-12', evidenceCount: 2, evidenceTrail: [{ type: 'github_repo', title: 'Data Pipelines', url: 'https://github.com/ritumeena-code/pipelines', date: '2026-08-12' }] },
      { skillId: 'sql', state: 'Verified', confidence: 78, verifiedAt: '2026-08-25', expiresAt: '2027-08-25', evidenceCount: 1, evidenceTrail: [{ type: 'machine_test', title: 'SQL Joins Exam', url: 'https://vpcoe.ac.in/exams/sql/064', date: '2026-08-25' }] },
      { skillId: 'git', state: 'Verified', confidence: 85, verifiedAt: '2026-08-10', expiresAt: '2027-08-10', evidenceCount: 2, evidenceTrail: [{ type: 'github_commit', title: 'Verified Git Tree', url: 'https://github.com/ritumeena-code', date: '2026-08-10' }] }
    ],
    applications: [],
    appeals: []
  }
];

// Declarative Versioned Eligibility Rules
let ELIGIBILITY_RULES = [
  {
    ruleId: 'RULE-VPCOE-2026-V1.0',
    version: '1.0',
    tenantId: 'vpcoe-mumbai',
    title: 'Standard Tier-1 IT Product Drive (Legacy V1.0)',
    description: 'Initial criteria with legacy CGPA cut-off without verified skill requirement',
    minCgpa: 8.0,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedBranches: ['CSE', 'IT'],
    mandatorySkills: [],
    maxActiveOffers: 1,
    active: false,
    createdAt: '2026-07-01T00:00:00Z',
    createdBy: 'Dr. Anil Kulkarni'
  },
  {
    ruleId: 'RULE-VPCOE-2026-V2.1',
    version: '2.1',
    tenantId: 'vpcoe-mumbai',
    title: 'Evidence-Based High-Bar Tech Drive (Current Active V2.1)',
    description: 'Declarative criteria enforcing both academic threshold and Verified Skill Graph evidence',
    minCgpa: 7.5,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedBranches: ['CSE', 'IT', 'ECE'],
    mandatorySkills: [
      { skillId: 'python', minState: 'Verified', minConfidence: 75 },
      { skillId: 'git', minState: 'Verified', minConfidence: 70 }
    ],
    maxActiveOffers: 1,
    active: true,
    createdAt: '2026-08-20T10:00:00Z',
    createdBy: 'Dr. Anil Kulkarni'
  },
  {
    ruleId: 'RULE-VPCOE-2026-V3.0-DRAFT',
    version: '3.0-RC1',
    tenantId: 'vpcoe-mumbai',
    title: 'Cloud & AI Specialization Drive (Draft Proposal)',
    description: 'Requires verified Docker and Cloud credentials in addition to core algorithms',
    minCgpa: 7.0,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    allowedBranches: ['CSE', 'IT', 'ECE', 'Mech'],
    mandatorySkills: [
      { skillId: 'python', minState: 'Verified', minConfidence: 80 },
      { skillId: 'docker', minState: 'Verified', minConfidence: 70 }
    ],
    maxActiveOffers: 1,
    active: false,
    createdAt: '2026-09-01T15:00:00Z',
    createdBy: 'Dr. Anil Kulkarni'
  }
];

// Campus Placement Drives
let DRIVES = [
  {
    id: 'DRIVE-GOOGLE-2026',
    tenantId: 'vpcoe-mumbai',
    company: 'Google India',
    logo: '🌐',
    role: 'Cloud Software Engineer (L3)',
    packageCtc: '28.5 LPA',
    jobLocation: 'Bengaluru / Hyderabad',
    registrationDeadline: '2026-10-05T23:59:59Z',
    driveDate: '2026-10-12',
    ruleVersion: '2.1',
    ruleId: 'RULE-VPCOE-2026-V2.1',
    minCgpa: 7.8,
    maxBacklogs: 0,
    allowedBranches: ['CSE', 'IT'],
    requiredSkills: ['python', 'dsa', 'git'],
    status: 'Scheduled',
    venue: 'Campus Lab A & Virtual Hangouts',
    stages: ['Declarative Eligibility Filter', 'Online Machine Coding', 'System Design Interview', 'HR & Offer Rollout'],
    applicantsCount: 68,
    shortlistedCount: 18,
    offersCount: 0
  },
  {
    id: 'DRIVE-BARCLAYS-2026',
    tenantId: 'vpcoe-mumbai',
    company: 'Barclays Global Service Centre',
    logo: '🏦',
    role: 'Backend Microservices Developer',
    packageCtc: '14.5 LPA',
    jobLocation: 'Pune / Mumbai',
    registrationDeadline: '2026-10-10T23:59:59Z',
    driveDate: '2026-10-18',
    ruleVersion: '2.1',
    ruleId: 'RULE-VPCOE-2026-V2.1',
    minCgpa: 7.5,
    maxBacklogs: 0,
    allowedBranches: ['CSE', 'IT', 'ECE'],
    requiredSkills: ['python', 'sql', 'git'],
    status: 'Scheduled',
    venue: 'Auditorium 2 & Cisco WebEx',
    stages: ['Declarative Eligibility Filter', 'Aptitude & Technical Round', 'Technical Interview', 'Managerial Interview'],
    applicantsCount: 112,
    shortlistedCount: 34,
    offersCount: 0
  },
  {
    id: 'DRIVE-TCS-DIGITAL-2026',
    tenantId: 'vpcoe-mumbai',
    company: 'Tata Consultancy Services (Digital)',
    logo: '💻',
    role: 'Digital Software Specialist',
    packageCtc: '9.0 LPA',
    jobLocation: 'Pan-India',
    registrationDeadline: '2026-10-18T23:59:59Z',
    driveDate: '2026-10-25',
    ruleVersion: '2.1',
    ruleId: 'RULE-VPCOE-2026-V2.1',
    minCgpa: 7.0,
    maxBacklogs: 0,
    allowedBranches: ['CSE', 'IT', 'ECE', 'Mech'],
    requiredSkills: ['python', 'git'],
    status: 'Open for Registration',
    venue: 'Central Computer Center',
    stages: ['National Qualifier Test', 'Machine Test', 'Technical & HR'],
    applicantsCount: 184,
    shortlistedCount: 0,
    offersCount: 0
  },
  {
    id: 'DRIVE-MICROSOFT-2026',
    tenantId: 'vpcoe-mumbai',
    company: 'Microsoft IDC',
    logo: '🪟',
    role: 'Software Development Engineer',
    packageCtc: '32.0 LPA',
    jobLocation: 'Hyderabad / Noida',
    registrationDeadline: '2026-10-28T23:59:59Z',
    driveDate: '2026-11-05',
    ruleVersion: '2.1',
    ruleId: 'RULE-VPCOE-2026-V2.1',
    minCgpa: 8.0,
    maxBacklogs: 0,
    allowedBranches: ['CSE', 'IT'],
    requiredSkills: ['dsa', 'system_design', 'python', 'git'],
    status: 'Pending Slot Confirmation',
    venue: 'Online Teams Assessment',
    stages: ['Coding Round (Codility)', 'Tech Round 1', 'Tech Round 2', 'AA Round'],
    applicantsCount: 52,
    shortlistedCount: 0,
    offersCount: 0
  }
];

// Target Companies & Skill Gap Benchmarks
const TARGET_COMPANIES = [
  {
    id: 'TC-1',
    company: 'Barclays',
    role: 'Backend Developer',
    package: '14.5 LPA',
    expectedSkills: [
      { skillId: 'python', weight: 30, minLevel: 'Verified' },
      { skillId: 'sql', weight: 25, minLevel: 'Verified' },
      { skillId: 'fastapi', weight: 20, minLevel: 'Verified' },
      { skillId: 'docker', weight: 15, minLevel: 'Verified' },
      { skillId: 'git', weight: 10, minLevel: 'Verified' }
    ]
  },
  {
    id: 'TC-2',
    company: 'Google',
    role: 'Cloud Software Engineer',
    package: '28.5 LPA',
    expectedSkills: [
      { skillId: 'dsa', weight: 35, minLevel: 'Verified' },
      { skillId: 'python', weight: 25, minLevel: 'Verified' },
      { skillId: 'system_design', weight: 20, minLevel: 'Verified' },
      { skillId: 'docker', weight: 10, minLevel: 'Verified' },
      { skillId: 'git', weight: 10, minLevel: 'Verified' }
    ]
  },
  {
    id: 'TC-3',
    company: 'Amazon AWS',
    role: 'Cloud Systems Engineer',
    package: '24.0 LPA',
    expectedSkills: [
      { skillId: 'aws_cloud', weight: 30, minLevel: 'Verified' },
      { skillId: 'docker', weight: 25, minLevel: 'Verified' },
      { skillId: 'python', weight: 20, minLevel: 'Verified' },
      { skillId: 'system_design', weight: 15, minLevel: 'Verified' },
      { skillId: 'git', weight: 10, minLevel: 'Verified' }
    ]
  }
];

// Mock Drive Aptitude Question Bank (30 High-Quality Questions across Quant, Logical, Verbal)
const APTITUDE_BANK = [
  // Quantitative (10 Questions)
  {
    id: 'APT-Q01',
    section: 'Quantitative',
    question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
    options: ['65 seconds', '89 seconds', '100 seconds', '75 seconds'],
    correct: 1, // 89 seconds: Speed = 240/24 = 10 m/s. Total dist = 240 + 650 = 890m. Time = 890/10 = 89s.
    explanation: 'Speed = Distance / Time = 240 / 24 = 10 m/s. Total distance to cross platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.'
  },
  {
    id: 'APT-Q02',
    section: 'Quantitative',
    question: 'If A can complete a work in 12 days and B in 18 days, they work together for 4 days. What fraction of the work remains?',
    options: ['4/9', '5/9', '1/3', '2/9'],
    correct: 0, // 4/9: Rate = 1/12 + 1/18 = 5/36 per day. In 4 days = 20/36 = 5/9 done. Remaining = 1 - 5/9 = 4/9.
    explanation: 'Combined rate = (1/12) + (1/18) = 5/36 per day. Work done in 4 days = 4 * (5/36) = 20/36 = 5/9. Remaining work = 1 - 5/9 = 4/9.'
  },
  {
    id: 'APT-Q03',
    section: 'Quantitative',
    question: 'A shopkeeper marks an article 30% above cost price and allows a 10% discount for cash payment. What is his actual profit percentage?',
    options: ['17%', '20%', '15%', '18%'],
    correct: 0, // 17%: CP=100 -> MP=130 -> SP=130 * 0.9 = 117. Profit = 17%.
    explanation: 'Let CP = 100. MP = 130. Discount = 10% of 130 = 13. SP = 117. Profit % = ((117 - 100)/100) * 100 = 17%.'
  },
  {
    id: 'APT-Q04',
    section: 'Quantitative',
    question: 'In how many different ways can the letters of the word "ENGINE" be arranged?',
    options: ['720', '360', '180', '120'],
    correct: 2, // 180: Total 6 letters, E appears twice, N appears twice. 6! / (2! * 2!) = 720 / 4 = 180.
    explanation: 'Total letters = 6. Repetitions: E appears 2 times, N appears 2 times. Arrangements = 6! / (2! * 2!) = 720 / 4 = 180.'
  },
  {
    id: 'APT-Q05',
    section: 'Quantitative',
    question: 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both are opened together, how much time will it take to fill the tank?',
    options: ['10 min', '12 min', '15 min', '25 min'],
    correct: 1, // 12 min: 1/20 + 1/30 = 5/60 = 1/12 -> 12 min.
    explanation: 'Combined flow = (1/20) + (1/30) = (3+2)/60 = 5/60 = 1/12 tank/min. Time required = 12 minutes.'
  },
  {
    id: 'APT-Q06',
    section: 'Quantitative',
    question: 'What is the compound interest on Rs. 10,000 for 2 years at 10% per annum compounded annually?',
    options: ['Rs. 2,000', 'Rs. 2,100', 'Rs. 2,200', 'Rs. 2,050'],
    correct: 1, // Rs. 2100: 10000 * 1.1^2 = 12100 -> CI = 2100.
    explanation: 'Amount = P(1 + r/100)^t = 10000 * (1.1)^2 = 10000 * 1.21 = Rs. 12,100. CI = 12,100 - 10,000 = Rs. 2,100.'
  },
  {
    id: 'APT-Q07',
    section: 'Quantitative',
    question: 'The average age of 24 students and their teacher is 15 years. If the teacher age is excluded, the average decreases by 1 year. What is the teacher age?',
    options: ['39 years', '40 years', '38 years', '45 years'],
    correct: 0, // 39 years: Sum(25) = 25*15 = 375. Sum(24) = 24*14 = 336. Teacher = 375 - 336 = 39.
    explanation: 'Total age of 25 persons = 25 * 15 = 375. Total age of 24 students = 24 * 14 = 336. Teacher age = 375 - 336 = 39 years.'
  },
  {
    id: 'APT-Q08',
    section: 'Quantitative',
    question: 'A bag contains 4 red, 5 green, and 6 blue balls. If two balls are drawn at random, what is the probability that both are green?',
    options: ['2/21', '1/3', '5/15', '4/105'],
    correct: 0, // 2/21: 5C2 / 15C2 = 10 / 105 = 2/21.
    explanation: 'Total balls = 15. Total ways to draw 2 = 15C2 = 105. Ways to draw 2 green = 5C2 = 10. Probability = 10 / 105 = 2/21.'
  },
  {
    id: 'APT-Q09',
    section: 'Quantitative',
    question: 'Find the greatest number that will divide 43, 91 and 183 so as to leave the same remainder in each case.',
    options: ['4', '7', '9', '13'],
    correct: 0, // 4: HCF(91-43, 183-91, 183-43) = HCF(48, 92, 140) = 4.
    explanation: 'Required number = HCF(|91-43|, |183-91|, |183-43|) = HCF(48, 92, 140) = 4.'
  },
  {
    id: 'APT-Q10',
    section: 'Quantitative',
    question: 'A boat moves downstream at the rate of 16 km/hr and upstream at 10 km/hr. What is the speed of the current?',
    options: ['3 km/hr', '6 km/hr', '13 km/hr', '4 km/hr'],
    correct: 0, // 3 km/hr: (16 - 10) / 2 = 3 km/hr.
    explanation: 'Speed of stream = (Downstream speed - Upstream speed) / 2 = (16 - 10) / 2 = 3 km/hr.'
  },

  // Logical Reasoning (10 Questions)
  {
    id: 'APT-Q11',
    section: 'Logical Reasoning',
    question: 'Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?',
    options: ['7', '10', '12', '13'],
    correct: 1, // 10: alternating +3, -2. 12 - 2 = 10.
    explanation: 'This is an alternating addition and subtraction series: 7 (+3)= 10 (-2)= 8 (+3)= 11 (-2)= 9 (+3)= 12 (-2)= 10.'
  },
  {
    id: 'APT-Q12',
    section: 'Logical Reasoning',
    question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: ['Brother', 'Uncle', 'Father', 'Cousin'],
    correct: 2, // Father: Mother only son = Suresh himself. Son of Suresh = Father.
    explanation: 'The only son of Suresh mother is Suresh himself. So the boy is Suresh son. Thus Suresh is his Father.'
  },
  {
    id: 'APT-Q13',
    section: 'Logical Reasoning',
    question: 'Statements: All mangoes are golden in color. No golden-colored things are cheap. Conclusions: I. All mangoes are cheap. II. Golden-colored mangoes are not cheap.',
    options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither I nor II follows'],
    correct: 1,
    explanation: 'Since all mangoes are golden and no golden things are cheap, mangoes cannot be cheap. Hence conclusion II strictly follows.'
  },
  {
    id: 'APT-Q14',
    section: 'Logical Reasoning',
    question: 'In a certain code language, "COMPUTER" is written as "RFUVQNPC". How is "MEDICINE" written in that code?',
    options: ['MFEDJJOE', 'EOJDEJFM', 'EOJDJEFM', 'MFEJDJOE'],
    correct: 1, // Reverse and shift +1 on inner: C->C at end, etc.
    explanation: 'The letters are reversed and each letter in between is shifted by +1. MEDICINE becomes EOJDEJFM.'
  },
  {
    id: 'APT-Q15',
    section: 'Logical Reasoning',
    question: 'A is to the West of B. C is to the South of A. D is to the East of C. In which direction is D with respect to B?',
    options: ['South-East', 'South-West', 'South', 'Cannot be determined without distance'],
    correct: 3,
    explanation: 'Because the exact distances between A-B and C-D are not given, D could be South, South-West, or South-East of B.'
  },
  {
    id: 'APT-Q16',
    section: 'Logical Reasoning',
    question: 'Choose the pair that has the same relationship: LIGHT : BLIND ::',
    options: ['SPEECH : DUMB', 'LANGUAGE : DEAF', 'TONGUE : SOUND', 'VOICE : VIBRATION'],
    correct: 0,
    explanation: 'Blind is a person who lacks the faculty of light/vision; Dumb is a person who lacks speech.'
  },
  {
    id: 'APT-Q17',
    section: 'Logical Reasoning',
    question: 'Find the odd one out from the following group: 27, 64, 125, 144, 216',
    options: ['27', '64', '144', '216'],
    correct: 2, // 144 is 12^2, others are cubes (3^3, 4^3, 5^3, 6^3).
    explanation: '27=3^3, 64=4^3, 125=5^3, 216=6^3 are perfect cubes. 144 is a square (12^2), not a cube.'
  },
  {
    id: 'APT-Q18',
    section: 'Logical Reasoning',
    question: 'If Monday falls on the 1st of a month, what date will be the 4th Saturday of that month?',
    options: ['24th', '26th', '27th', '28th'],
    correct: 2, // Mon 1, Sat 6, 13, 20, 27.
    explanation: '1st is Monday -> 6th is 1st Sat -> 13th is 2nd Sat -> 20th is 3rd Sat -> 27th is 4th Saturday.'
  },
  {
    id: 'APT-Q19',
    section: 'Logical Reasoning',
    question: 'Five executives J, K, L, M, N sit in a row. K is to the right of M. J is between L and M. Who is sitting in the middle if L is at the leftmost end?',
    options: ['J', 'M', 'K', 'L'],
    correct: 0, // L - J - M - K. Middle of L, J, M, K, N is J or M depending on N. J is between L and M -> L, J, M.
    explanation: 'L is at leftmost end. J is between L and M: L - J - M. K is to right of M: L - J - M - K - N. The executive in the middle is M or J depending on order.'
  },
  {
    id: 'APT-Q20',
    section: 'Logical Reasoning',
    question: 'Statement: Should technical colleges mandate continuous GitHub repositories for all programming courses? Arguments: I. Yes, it creates an unforgeable verified skill trail. II. No, it burdens students with version control overhead.',
    options: ['Only argument I is strong', 'Only argument II is strong', 'Either I or II is strong', 'Neither is strong'],
    correct: 0,
    explanation: 'Argument I addresses the core industry alignment and unforgeable evidence need directly, making it strong and valid.'
  },

  // Verbal Ability (10 Questions)
  {
    id: 'APT-Q21',
    section: 'Verbal Ability',
    question: 'Select the synonym for "EPHEMERAL":',
    options: ['Eternal', 'Transient', 'Celestial', 'Enigmatic'],
    correct: 1,
    explanation: 'Ephemeral means lasting for a very short time; Transient is an exact synonym.'
  },
  {
    id: 'APT-Q22',
    section: 'Verbal Ability',
    question: 'Select the antonym for "MITIGATE":',
    options: ['Alleviate', 'Aggravate', 'Abate', 'Assuage'],
    correct: 1,
    explanation: 'Mitigate means to make less severe. The opposite is Aggravate, which means to make worse or more severe.'
  },
  {
    id: 'APT-Q23',
    section: 'Verbal Ability',
    question: 'Identify the grammatically correct sentence:',
    options: [
      'Neither the professor nor the students was present in the auditorium.',
      'Neither the professor nor the students were present in the auditorium.',
      'Neither the professor or the students were present in the auditorium.',
      'Neither the professor nor the students has been present in the auditorium.'
    ],
    correct: 1,
    explanation: 'In "neither... nor" constructions, the verb agrees with the subject closest to it ("the students", which is plural, hence "were").'
  },
  {
    id: 'APT-Q24',
    section: 'Verbal Ability',
    question: 'Choose the correct idiom meaning: "To burn the midnight oil"',
    options: ['To waste fuel carelessly', 'To work or study late into the night', 'To ignite an argument', 'To destroy evidence'],
    correct: 1,
    explanation: '"To burn the midnight oil" means to study or work tirelessly late into the night.'
  },
  {
    id: 'APT-Q25',
    section: 'Verbal Ability',
    question: 'Fill in the blank: The candidate was praised for his _______ approach to solving concurrency deadlocks.',
    options: ['meticulous', 'negligent', 'cursory', 'ambiguous'],
    correct: 0,
    explanation: '"Meticulous" means showing great attention to detail, which fits the praised action.'
  },
  {
    id: 'APT-Q26',
    section: 'Verbal Ability',
    question: 'Identify the part of speech of the capitalized word: "The system runs EXCEPTIONALLY well under peak load."',
    options: ['Adjective', 'Adverb', 'Conjunction', 'Preposition'],
    correct: 1,
    explanation: '"Exceptionally" modifies the adverb/adjective "well", so it is an Adverb.'
  },
  {
    id: 'APT-Q27',
    section: 'Verbal Ability',
    question: 'Select the correctly spelled word:',
    options: ['Accomodation', 'Accommodation', 'Acommodation', 'Acomodation'],
    correct: 1,
    explanation: '"Accommodation" is spelled with double "c" and double "m".'
  },
  {
    id: 'APT-Q28',
    section: 'Verbal Ability',
    question: 'One word substitution: "A person who is fluent in multiple computer programming languages and systems"',
    options: ['Polyglot', 'Polymath', 'Protagonist', 'Philanthropist'],
    correct: 0,
    explanation: 'A Polyglot is someone who knows and uses several languages (applied widely to software engineering as a polyglot developer).'
  },
  {
    id: 'APT-Q29',
    section: 'Verbal Ability',
    question: 'Rearrange the parts into a coherent sentence: P: and verified competency trails / Q: replacing static PDF resumes / R: with live evidence / S: modern recruitment platforms prioritize',
    options: ['S-Q-R-P', 'P-Q-R-S', 'Q-R-P-S', 'R-P-S-Q'],
    correct: 0,
    explanation: 'Correct flow: "Modern recruitment platforms prioritize (S) replacing static PDF resumes (Q) with live evidence (R) and verified competency trails (P)."'
  },
  {
    id: 'APT-Q30',
    section: 'Verbal Ability',
    question: 'Choose the most appropriate preposition: "The student was exempted ______ taking the preliminary aptitude round due to verified national contest scores."',
    options: ['with', 'from', 'for', 'by'],
    correct: 1,
    explanation: 'The standard idiom is "exempted from".'
  }
];

// Machine Test Questions (2 Practical Coding Challenges, 10 marks each)
const MACHINE_TEST_BANK = [
  {
    id: 'CODE-Q1',
    title: 'SQL Relational Optimization: Top-K Active Customers with Window Functions',
    marks: 10,
    difficulty: 'Medium',
    category: 'SQL & Database Optimization',
    description: `Write a SQL query that retrieves the top 3 highest spending customers for each department in the current fiscal year.
Your query must compute:
1. customer_id, customer_name, department_name, total_spent
2. department_rank using DENSE_RANK() ordered by total_spent DESC
3. Filter out any customers whose account status is 'SUSPENDED'.
Optimized execution plan with index utilization is expected.`,
    starterCode: `-- Write your SQL query below
WITH CustomerSpending AS (
    SELECT 
        c.customer_id,
        c.customer_name,
        d.department_name,
        SUM(o.order_amount) AS total_spent,
        DENSE_RANK() OVER (
            PARTITION BY d.department_id 
            ORDER BY SUM(o.order_amount) DESC
        ) AS dept_rank
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN departments d ON c.department_id = d.department_id
    WHERE c.status != 'SUSPENDED'
    GROUP BY c.customer_id, c.customer_name, d.department_name, d.department_id
)
SELECT customer_id, customer_name, department_name, total_spent, dept_rank
FROM CustomerSpending
WHERE dept_rank <= 3
ORDER BY department_name, dept_rank;`,
    testCases: [
      {
        name: 'Standard Order Aggregation',
        expectedResult: 'Correctly partitions by department and calculates top 3 rank',
        passed: true
      },
      {
        name: 'Exclude Suspended Customers',
        expectedResult: 'Suspended customers properly filtered prior to rank partition',
        passed: true
      },
      {
        name: 'Dense Rank Handling for Tied Spending',
        expectedResult: 'Ties assign identical rank without skipping subsequent integer rank',
        passed: true
      }
    ]
  },
  {
    id: 'CODE-Q2',
    title: 'Algorithmic Concurrency: High-Throughput Sliding Window Rate Limiter',
    marks: 10,
    difficulty: 'Medium-Hard',
    category: 'Algorithms & Concurrency',
    description: `Implement a memory-efficient Sliding Window Rate Limiter in Python.
Requirements:
1. Class \`SlidingWindowRateLimiter(max_requests: int, window_seconds: int)\`
2. Method \`allow_request(client_id: str, timestamp_ms: int) -> bool\`
3. Must maintain accurate rate limiting over arbitrary sliding windows while evicting stale timestamps to avoid unbounded memory growth.
4. Time Complexity per request must be O(log N) or better.`,
    starterCode: `from collections import deque
import bisect

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_ms = window_seconds * 1000
        self.client_windows = {}

    def allow_request(self, client_id: str, timestamp_ms: int) -> bool:
        if client_id not in self.client_windows:
            self.client_windows[client_id] = deque()
            
        timestamps = self.client_windows[client_id]
        cutoff = timestamp_ms - self.window_ms
        
        # Evict timestamps older than the sliding window cutoff
        while timestamps and timestamps[0] <= cutoff:
            timestamps.popleft()
            
        if len(timestamps) < self.max_requests:
            timestamps.append(timestamp_ms)
            return True
        return False
`,
    testCases: [
      {
        name: 'Burst allowance within limit',
        input: '5 requests at t=100ms with max=5',
        expected: 'All 5 return True',
        passed: true
      },
      {
        name: 'Rejection on 6th request within window',
        input: '6th request at t=200ms with max=5, window=10s',
        expected: 'Returns False',
        passed: true
      },
      {
        name: 'Sliding eviction after window elapses',
        input: 'Request at t=10,500ms after initial burst at t=100ms',
        expected: 'Returns True due to eviction of t=100ms',
        passed: true
      }
    ]
  }
];

// AI Interview Rubrics by Role
const AI_INTERVIEW_BANK = {
  'Backend Developer': [
    {
      id: 'INT-Q1',
      question: 'Explain how you approach database connection pooling, transaction isolation, and deadlock prevention in high-concurrency microservices.',
      keywords: ['connection pool', 'max connections', 'isolation levels', 'read committed', 'deadlock', 'transaction order', 'timeouts'],
      idealAnswerSummary: 'Candidate should explain pooling to prevent socket exhaustion, define isolation levels (Read Committed vs Serializable), and highlight lock acquisition order consistency and query timeout mechanisms.'
    },
    {
      id: 'INT-Q2',
      question: 'Walk me through how your FastAPI event streamer handles dropped broker or database connections without losing in-flight HTTP requests.',
      keywords: ['exponential backoff', 'circuit breaker', 'retry queue', 'dead letter queue', 'idempotency', 'fastapi middleware'],
      idealAnswerSummary: 'Should articulate retry queues with exponential backoff, dead letter queue (DLQ) pattern, idempotency keys, and graceful service degradation.'
    },
    {
      id: 'INT-Q3',
      question: 'How do you design a database indexing strategy for an analytics table with millions of rows that suffers from slow range queries?',
      keywords: ['composite index', 'b-tree', 'explain analyze', 'cardinality', 'covering index', 'partitioning'],
      idealAnswerSummary: 'Explains analyzing EXPLAIN output, ordering composite indices by highest cardinality equality columns followed by range columns, and using table partitioning.'
    }
  ],
  'Full Stack Engineer': [
    {
      id: 'INT-FS-Q1',
      question: 'How do you optimize state management and avoid redundant re-renders in a complex React dashboard with high-frequency live websocket updates?',
      keywords: ['react memo', 'usememo', 'usecallback', 'selective subscriptions', 'virtualization', 'batching'],
      idealAnswerSummary: 'Discusses using selective Zustand/Redux selectors, throttling websocket dispatch, memoizing heavy subtrees, and windowing lists.'
    }
  ]
};

// Recruiter Directory for Talent Discovery & Bulk Mailing
let RECRUITERS = [
  {
    id: 'REC-01',
    company: 'Google India',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@google.com',
    role: 'University Talent Acquisition Lead',
    status: 'ACTIVE_APPROVED',
    domain: 'Product & Cloud',
    lastContactDate: '2026-08-25',
    campaignStatus: 'REPLIED_CONFIRMED'
  },
  {
    id: 'REC-02',
    company: 'Barclays GSC',
    name: 'Vikramaditya Roy',
    email: 'v.roy@barclays.com',
    role: 'Campus Relations Director',
    status: 'ACTIVE_APPROVED',
    domain: 'FinTech & Banking',
    lastContactDate: '2026-08-28',
    campaignStatus: 'REPLIED_CONFIRMED'
  },
  {
    id: 'REC-03',
    company: 'Tata Consultancy Services',
    name: 'Manish Verma',
    email: 'm.verma@tcs.com',
    role: 'Western Region Campus Head',
    status: 'ACTIVE_APPROVED',
    domain: 'Enterprise Services',
    lastContactDate: '2026-08-20',
    campaignStatus: 'DELIVERED'
  },
  {
    id: 'REC-04',
    company: 'Microsoft IDC',
    name: 'Pooja Hegde',
    email: 'phegde@microsoft.com',
    role: 'Senior Technical Recruiter',
    status: 'ACTIVE_APPROVED',
    domain: 'Cloud & AI Platform',
    lastContactDate: '2026-08-29',
    campaignStatus: 'OPENED'
  },
  {
    id: 'REC-05',
    company: 'Larsen & Toubro Infotech',
    name: 'Karan Malhotra',
    email: 'karan.m@lntinfotech.com',
    role: 'Campus Hiring Manager',
    status: 'ACTIVE_APPROVED',
    domain: 'Digital Transformation',
    lastContactDate: '2026-08-15',
    campaignStatus: 'DELIVERED'
  }
];

// Bulk Mail Templates
let MAIL_TEMPLATES = [
  {
    id: 'TMPL-CAMPUS-INVITE-2026',
    title: 'VPCOE & VA Campus Placement Season 2026-27 Official Invitation',
    subject: "Invitation to Campus Placement Drive 2026-27 | Vasantdada Patil Pratishthan's College of Engineering (VPCOE & VA)",
    body: `Respected Campus Hiring Leader,

Greetings from Vasantdada Patil Pratishthan's College of Engineering & Visual Arts (VPCOE & VA), Mumbai!

We are pleased to invite your esteemed organization for the Campus Recruitment Season 2026-27 for our graduating batch of B.Tech engineers (CSE, IT, ECE, Mechanical, and AI).

Key Batch Highlights:
- 100% of candidate profiles are backed by our Verified Skill Graph with live GitHub commits, LeetCode performance, and practical benchmark assessments.
- Verified Skill Coverage: 82.5% across Cloud, Backend, Algorithms, and DevOps.
- Declarative versioned eligibility and seamless clash-free drive scheduling via our centralized portal.

Please reply with your preferred visit dates or login to our Recruiter Talent Portal to browse verified candidate portfolios.

Warm Regards,
Dr. Anil Kulkarni
Head - Training & Placement Cell
VPCOE & VA, Mumbai`
  }
];

// AI Agent Recommendations & Interventions Log
let AGENT_PROPOSALS = [
  {
    id: 'PROP-AGENT-01',
    agent: 'IndustrySkillGapProfilerAgent',
    title: 'Rising Industry Demand: Docker & Containerization Bootcamp',
    date: '2026-09-02',
    urgency: 'HIGH',
    summary: '44% of analyzed Q3-Q4 job descriptions demand Docker & container orchestration, but only 14% of the CSE/IT cohort has verified proof on record. Gap = -30%.',
    recommendation: 'Schedule a 3-Day Intensive Docker & Microservice Deployment Workshop before October drives.',
    status: 'APPROVED_BY_OFFICER',
    officerNotes: 'Approved by Dr. Anil Kulkarni. Scheduled for Sept 15-17 in Lab A.',
    impactForecast: 'Increases batch verified Docker coverage from 14% to 48% and improves shortlisting rate by estimated 22%.'
  },
  {
    id: 'PROP-AGENT-02',
    agent: 'PredictivePlacementAnalyticsAgent',
    title: 'Pre-Season At-Risk Cohort Triage (45 Students Flagged)',
    date: '2026-09-03',
    urgency: 'CRITICAL',
    summary: 'Predictive model forecasts 68.4% batch placement baseline. 45 students are currently flagged as at-risk due to low mock test scores and zero verified skills on record.',
    recommendation: 'Assign senior faculty mentors early and enroll flagged students in the Remedial Problem Solving & SQL Sprint.',
    status: 'IN_REVIEW',
    officerNotes: 'Review in progress. 12 mentors assigned so far.',
    impactForecast: 'Closes skill gaps early to lift batch placement rate to projected 82.5%.'
  }
];

// Student Appeals Queue
let APPEALS_QUEUE = [
  {
    id: 'APP-001',
    studentId: 'STU-VPCOE-042',
    studentName: 'Rahul Sharma',
    driveId: 'DRIVE-BARCLAYS-2026',
    company: 'Barclays',
    reason: 'Requesting manual review of SQL verified skill status after completing 2 practice sets and submitting Query Profiler mini project repo.',
    submittedAt: '2026-09-04T16:20:00Z',
    status: 'PENDING_OFFICER_REVIEW',
    evidenceLink: 'https://github.com/rahulsharma-dev/sql-profiler',
    officerDecision: null
  }
];

// Helper to seed initial audit ledger blocks
function seedInitialAudit() {
  auditLedger.addEntry('vpcoe-mumbai', 'RULE_VERSION_PUBLISHED', 'Dr. Anil Kulkarni', {
    ruleId: 'RULE-VPCOE-2026-V2.1',
    version: '2.1',
    minCgpa: 7.5,
    mandatorySkills: ['python', 'git']
  });
  auditLedger.addEntry('vpcoe-mumbai', 'EVIDENCE_VERIFIED', 'AUTOMATED_INGESTION_AGENT', {
    studentId: 'STU-VPCOE-042',
    skillId: 'python',
    source: 'github_repo',
    confidence: 94
  });
  auditLedger.addEntry('vpcoe-mumbai', 'CONSENT_GRANTED', 'Rahul Sharma', {
    verifiableConsentId: 'DPDP-CONSENT-2026-RS042',
    scope: ['read_github_repos', 'recruiter_search']
  });
}
seedInitialAudit();

module.exports = {
  TAXONOMY,
  TENANTS,
  STUDENTS,
  ELIGIBILITY_RULES,
  DRIVES,
  TARGET_COMPANIES,
  APTITUDE_BANK,
  MACHINE_TEST_BANK,
  AI_INTERVIEW_BANK,
  RECRUITERS,
  MAIL_TEMPLATES,
  AGENT_PROPOSALS,
  APPEALS_QUEUE
};
