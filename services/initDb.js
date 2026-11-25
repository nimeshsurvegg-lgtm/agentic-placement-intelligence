// Agentic Placement Intelligence Platform
// Safe, Non-Destructive, Idempotent Database Initialization Engine
// Ensures all demo tenants, users, students, taxonomy, drives, and V2 features
// exist without ever wiping or mutating existing records during normal startup.

const bcrypt = require('bcryptjs');

function initDb(rawDb) {
  if (!rawDb) throw new Error('initDb requires an active sqlite DatabaseSync instance.');

  const NOW = new Date().toISOString();
  // Pre-hash password for Demo@1234
  const HASH_PASSWORD = bcrypt.hashSync('Demo@1234', 10);

  // 1. TENANTS
  const tenantsStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO tenants (id, name, code, university, location, tier, parent_tenant_id, config_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  tenantsStmt.run('mumbai-univ', 'University of Mumbai (Chancellor Office)', 'MU', 'State University', 'Fort, Mumbai', 'Parent University', null, '{}', NOW, NOW);
  tenantsStmt.run('vpcoe-mumbai', "Vasantdada Patil Pratishthan's College of Engineering & Visual Arts (VPCOE & VA)", 'VPCOE', 'University of Mumbai', 'Sion, Mumbai', 'Tier 2', 'mumbai-univ', '{"maxOffers":1,"placementSeason":"2026-2027"}', NOW, NOW);
  tenantsStmt.run('coep-pune', 'COEP Technological University (Demo College B)', 'COEP', 'Autonomous State University', 'Shivajinagar, Pune', 'Tier 1', 'mumbai-univ', '{"maxOffers":2}', NOW, NOW);

  // 2. USERS & CREDENTIALS
  const usersStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO users (id, tenant_id, name, email, password_hash, role, status, require_otp, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  usersStmt.run('USR-STU-042', 'vpcoe-mumbai', 'Rahul Sharma', 'rahul@vppcoe.demo', HASH_PASSWORD, 'STUDENT', 'ACTIVE', 0, NOW, NOW);
  usersStmt.run('USR-TPO-001', 'vpcoe-mumbai', 'Dr. Anil Kulkarni', 'anil.kulkarni@vppcoe.demo', HASH_PASSWORD, 'TP_OFFICER', 'ACTIVE', 0, NOW, NOW);
  usersStmt.run('USR-HOD-001', 'vpcoe-mumbai', 'Prof. S. Rane', 'hod.cs@vppcoe.demo', HASH_PASSWORD, 'DEPARTMENT_HEAD', 'ACTIVE', 0, NOW, NOW);
  usersStmt.run('USR-REC-001', 'vpcoe-mumbai', 'Sarah Jenkins (Google)', 'recruiter@google.demo', HASH_PASSWORD, 'RECRUITER', 'ACTIVE', 0, NOW, NOW);
  usersStmt.run('USR-REC-002', 'vpcoe-mumbai', 'Vikramaditya Roy (Barclays)', 'recruiter@barclays.demo', HASH_PASSWORD, 'RECRUITER', 'PENDING_APPROVAL', 0, NOW, NOW);
  usersStmt.run('USR-UNIV-001', 'mumbai-univ', 'Dr. Suhas Pednekar', 'chancellor@univ.demo', HASH_PASSWORD, 'UNIVERSITY_ADMIN', 'ACTIVE', 0, NOW, NOW);
  usersStmt.run('USR-COEP-001', 'coep-pune', 'Dr. Sunita Deshpande', 'officer@coep.demo', HASH_PASSWORD, 'TP_OFFICER', 'ACTIVE', 0, NOW, NOW);

  // 3. SKILL TAXONOMY (ESCO, O*NET, NSQF)
  const skills = [
    ['python', 'Python', 'Backend & Systems', '2512.1.4', '15-1252.00', 'Level 7', 'Object-oriented programming, data structures, asyncio, APIs'],
    ['sql', 'SQL & Relational DBs', 'Databases & Storage', '2521.1.2', '15-1242.00', 'Level 6', 'Relational modeling, indexing, window functions, query plan optimization'],
    ['docker', 'Docker & Containers', 'Cloud & DevOps', '2519.2.1', '15-1251.00', 'Level 7', 'Container isolation, Dockerfile multi-stage builds, networking'],
    ['fastapi', 'FastAPI / Async Python', 'Backend & Systems', '2512.2.3', '15-1252.00', 'Level 7', 'High-throughput async APIs, Pydantic validation, OpenAPI'],
    ['dsa', 'Data Structures & Algorithms', 'Core Computer Science', '2512.1.1', '15-1252.00', 'Level 7', 'Time-space complexity, trees, graphs, dynamic programming'],
    ['react', 'React.js & Frontend', 'Frontend Engineering', '2513.1.1', '15-1254.00', 'Level 6', 'Component design, state management, hooks, DOM reconciliation'],
    ['git', 'Git Version Control', 'Engineering Practices', '2519.1.4', '15-1252.00', 'Level 6', 'Commit coherence, branching models, PR review, git hygiene'],
    ['aws_cloud', 'AWS Cloud Services', 'Cloud & DevOps', '2529.2.2', '15-1244.00', 'Level 7', 'IAM policies, EC2, S3, RDS, VPC network architecture'],
    ['kubernetes', 'Kubernetes Orchestration', 'Cloud & DevOps', '2519.2.2', '15-1251.00', 'Level 8', 'K8s pods, deployments, ingress controllers, Helm charts'],
    ['system_design', 'Distributed System Design', 'Architecture & Systems', '2511.1.5', '15-1251.00', 'Level 8', 'CAP theorem, microservice consensus, rate limiting, queues']
  ];
  const skillStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO skills (id, name, category, esco_code, onet_code, nsqf_level, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  skills.forEach(s => skillStmt.run(...s));

  // 4. DEMO HERO STUDENT: RAHUL SHARMA (STU-VPCOE-042)
  const stuStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO students (id, user_id, tenant_id, roll_no, name, email, phone, branch, batch, semester, cgpa, active_backlogs, history_backlogs, gender, category, target_role, github_handle, leetcode_handle, leetcode_solved, at_risk_flag, officer_approved_risk, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stuStmt.run(
    'STU-VPCOE-042', 'USR-STU-042', 'vpcoe-mumbai', 'VP-2023-CS-042', 'Rahul Sharma',
    'rahul@vppcoe.demo', '+91 98765 43210', 'CSE', '2023-2027', 7, 8.42, 0, 0,
    'Male', 'General', 'Backend Developer', 'rahulsharma-dev', 'rahul_code2026', 230,
    0, 0, NOW, NOW
  );

  // Consent for Rahul Sharma
  rawDb.prepare(`
    INSERT OR IGNORE INTO consents (id, student_id, tenant_id, repo_read_consent, recruiter_search_consent, demographic_sharing_consent, verifiable_consent_id, is_under_18, parental_consent_verified, granted_at, updated_at)
    VALUES ('CON-042', 'STU-VPCOE-042', 'vpcoe-mumbai', 1, 1, 1, 'DPDP-CONSENT-2026-RS042', 0, 1, ?, ?)
  `).run(NOW, NOW);

  // Student Skills for Rahul Sharma
  const studentSkillStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO student_skills (id, student_id, tenant_id, skill_id, state, confidence, verified_at, expires_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const evidenceStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO evidence (id, student_skill_id, student_id, tenant_id, type, source, title, url, checksum, metadata_json, date, verified_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. Python -> Verified
  studentSkillStmt.run('SS-042-PY', 'STU-VPCOE-042', 'vpcoe-mumbai', 'python', 'Verified', 96, '2026-08-14', '2027-08-14', NOW, NOW);
  evidenceStmt.run('EV-01', 'SS-042-PY', 'STU-VPCOE-042', 'vpcoe-mumbai', 'github_repo', 'github', 'Distributed Event Streamer in FastAPI', 'https://github.com/rahulsharma-dev/event-streamer', 'sha256-a8f94', '{"commits":18,"astPassed":true}', '2026-08-14', 'AUTOMATED_INGESTION_AGENT', NOW);
  evidenceStmt.run('EV-02', 'SS-042-PY', 'STU-VPCOE-042', 'vpcoe-mumbai', 'mentor_attestation', 'faculty', 'Prof. S. Rane (Systems Lab Endorsement)', null, 'sha256-c3b21', '{"notes":"Validated async lock logic"}', '2026-08-15', 'Prof. S. Rane', NOW);

  // 2. FastAPI -> Evidence-linked
  studentSkillStmt.run('SS-042-FA', 'STU-VPCOE-042', 'vpcoe-mumbai', 'fastapi', 'Evidence-linked', 85, '2026-08-14', '2027-08-14', NOW, NOW);
  evidenceStmt.run('EV-03', 'SS-042-FA', 'STU-VPCOE-042', 'vpcoe-mumbai', 'github_commit', 'github', 'FastAPI Pydantic Router Implementation', 'https://github.com/rahulsharma-dev/event-streamer/commit/7f29a', 'sha256-fa399', '{"linesChanged":420}', '2026-08-14', 'GIT_PARSER', NOW);

  // 3. DSA -> Verified
  studentSkillStmt.run('SS-042-DSA', 'STU-VPCOE-042', 'vpcoe-mumbai', 'dsa', 'Verified', 88, '2026-08-20', '2027-08-20', NOW, NOW);
  evidenceStmt.run('EV-04', 'SS-042-DSA', 'STU-VPCOE-042', 'vpcoe-mumbai', 'leetcode_submission', 'leetcode', 'LeetCode 230 Problems Solved (Top 15%)', 'https://leetcode.com/rahul_code2026', 'sha256-lc991', '{"rating":1740}', '2026-08-20', 'LEETCODE_AGENT', NOW);

  // 4. Git -> Verified
  studentSkillStmt.run('SS-042-GIT', 'STU-VPCOE-042', 'vpcoe-mumbai', 'git', 'Verified', 92, '2026-08-10', '2027-08-10', NOW, NOW);
  evidenceStmt.run('EV-05', 'SS-042-GIT', 'STU-VPCOE-042', 'vpcoe-mumbai', 'github_commit', 'github', 'Verified 142 Commit Coherence History', 'https://github.com/rahulsharma-dev', 'sha256-gt441', '{"coherence":"High"}', '2026-08-10', 'COHERENCE_ENGINE', NOW);

  // 5. Docker -> Observed
  studentSkillStmt.run('SS-042-DK', 'STU-VPCOE-042', 'vpcoe-mumbai', 'docker', 'Observed', 50, null, null, NOW, NOW);
  evidenceStmt.run('EV-06', 'SS-042-DK', 'STU-VPCOE-042', 'vpcoe-mumbai', 'github_repo', 'github', 'event-streamer/Dockerfile multi-stage manifest', 'https://github.com/rahulsharma-dev/event-streamer/blob/main/Dockerfile', 'sha256-dk201', '{}', '2026-08-10', null, NOW);

  // 6. SQL -> Claimed
  studentSkillStmt.run('SS-042-SQL', 'STU-VPCOE-042', 'vpcoe-mumbai', 'sql', 'Claimed', 40, null, null, NOW, NOW);

  // 7. React -> Expired
  studentSkillStmt.run('SS-042-RCT', 'STU-VPCOE-042', 'vpcoe-mumbai', 'react', 'Expired', 35, '2025-06-01', '2026-06-01', NOW, NOW);
  evidenceStmt.run('EV-07', 'SS-042-RCT', 'STU-VPCOE-042', 'vpcoe-mumbai', 'contest_cert', 'hackathon', 'Frontend Hackathon 2025 Certificate', 'https://credentials.vpcoe.ac.in/cert/fe-2025-441', 'sha256-ex991', '{"expired":true}', '2025-06-01', 'Prof. S. Rane', NOW);

  // 5. COHORT STUDENTS (~119 students for realistic distribution)
  const branches = ['CSE', 'IT', 'ECE', 'Mech'];
  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
  const cohortRoles = ['Backend Developer', 'Frontend Developer', 'Full Stack Engineer', 'Cloud & DevOps Specialist', 'Data Analyst'];
  const firstNames = ['Ananya', 'Rohan', 'Priya', 'Vikram', 'Sneha', 'Amit', 'Neha', 'Tanmay', 'Fatima', 'Siddharth', 'Ritu', 'Karan', 'Pooja', 'Aditya', 'Meera', 'Arjun', 'Simran', 'Varun', 'Deepika', 'Kunal'];
  const lastNames = ['Iyer', 'Patil', 'Deshmukh', 'Verma', 'Gupta', 'Shinde', 'Kapoor', 'Joshi', 'Sheikh', 'Rao', 'Meena', 'Malhotra', 'Nair', 'Kulkarni', 'Bhat', 'Bansal', 'Choudhury', 'Sawant', 'Pawar', 'More'];

  for (let i = 0; i < 119; i++) {
    const sId = `STU-VPCOE-${100 + i}`;
    const uId = `USR-STU-${100 + i}`;
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const branch = branches[i % branches.length];
    const gender = (i % 3 === 0) ? 'Female' : 'Male';
    const category = categories[i % categories.length];
    const targetRole = cohortRoles[i % cohortRoles.length];
    const cgpa = Math.round((6.4 + (Math.sin(i) + 1) * 1.6) * 100) / 100;
    const backlogs = (i % 14 === 0) ? 1 : 0;
    const leetcodeSolved = Math.floor(40 + (i * 7) % 280);
    const isAtRisk = (i === 0 || (cgpa < 6.8 && backlogs > 0));
    const email = (i === 0) ? 'rohan.patil@vppcoe.demo' : `${fn.toLowerCase()}.${ln.toLowerCase()}${i + 1}@vppcoe.demo`;
    const github = (i === 0) ? 'rohanpatil-dev' : `${fn.toLowerCase()}-${ln.toLowerCase()}-${i + 1}`;
    const leetcode = (i === 0) ? 'rohan_code' : `${fn.toLowerCase()}_code_${i + 1}`;

    usersStmt.run(uId, 'vpcoe-mumbai', `${fn} ${ln}`, email, HASH_PASSWORD, 'STUDENT', 'ACTIVE', 0, NOW, NOW);
    stuStmt.run(
      sId, uId, 'vpcoe-mumbai', `VP-2023-${branch}-${String(i + 1).padStart(3, '0')}`,
      `${fn} ${ln}`, email, `+91 98000 ${10000 + i}`,
      branch, '2023-2027', 7, cgpa, backlogs, (backlogs > 0 ? 1 : 0),
      gender, category, targetRole, github,
      leetcode, leetcodeSolved, isAtRisk ? 1 : 0, 0, NOW, NOW
    );

    rawDb.prepare(`
      INSERT OR IGNORE INTO consents (id, student_id, tenant_id, repo_read_consent, recruiter_search_consent, demographic_sharing_consent, verifiable_consent_id, is_under_18, parental_consent_verified, granted_at, updated_at)
      VALUES (?, ?, 'vpcoe-mumbai', 1, 1, 1, ?, 0, 1, ?, ?)
    `).run(`CON-${100 + i}`, sId, `DPDP-CONSENT-2026-${100 + i}`, NOW, NOW);

    studentSkillStmt.run(`SS-${100 + i}-PY`, sId, 'vpcoe-mumbai', 'python', 'Verified', 80 + (i % 18), '2026-08-01', '2027-08-01', NOW, NOW);
    evidenceStmt.run(`EV-${200 + i * 2}`, `SS-${100 + i}-PY`, sId, 'vpcoe-mumbai', 'github_repo', 'github', `${targetRole} Portfolio Project`, `https://github.com/${fn.toLowerCase()}-dev/portfolio`, 'sha256-seed', '{}', '2026-08-01', 'AUTOMATION', NOW);

    if (i % 2 === 0) {
      studentSkillStmt.run(`SS-${100 + i}-SQL`, sId, 'vpcoe-mumbai', 'sql', 'Verified', 78 + (i % 16), '2026-08-05', '2027-08-05', NOW, NOW);
      evidenceStmt.run(`EV-${201 + i * 2}`, `SS-${100 + i}-SQL`, sId, 'vpcoe-mumbai', 'machine_test', 'test_engine', 'SQL Benchmark Exam', `https://vpcoe.ac.in/exams/sql/${100 + i}`, 'sha256-sql', '{}', '2026-08-05', 'OFFICER', NOW);
    }
  }

  // 6. QUESTION BANK (310 Aptitude Questions)
  const qStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO mock_questions (id, section, topic, question, options_json, correct_option, explanation, difficulty, tags_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const quantTopics = ['Time and Work', 'Speed and Distance', 'Profit and Loss', 'Permutations & Combinations', 'Probability', 'Pipes and Cisterns', 'Simple & Compound Interest', 'Averages & Ratios', 'Number Theory'];
  const logicalTopics = ['Number Series', 'Blood Relations', 'Syllogisms', 'Coding-Decoding', 'Direction Sense', 'Seating Arrangement', 'Data Sufficiency', 'Statement & Assumption'];
  const verbalTopics = ['Synonyms & Antonyms', 'Sentence Correction', 'Idioms & Phrases', 'Reading Comprehension', 'Spotting Errors', 'Para Jumbles', 'Subject-Verb Agreement'];

  let qCount = 0;
  for (let i = 1; i <= 110; i++) {
    const top = quantTopics[i % quantTopics.length];
    qStmt.run(
      `APT-Q-${String(++qCount).padStart(3, '0')}`, 'Quantitative', top,
      `Question ${qCount} [${top}]: A train passes a stationary pole in ${20 + (i % 10)} seconds. If speed is ${54 + (i % 18)} km/h, calculate length of the train.`,
      JSON.stringify([`${250 + i * 2} m`, `${300 + i * 2} m`, `${350 + i * 2} m`, `${400 + i * 2} m`]),
      (i % 4),
      `Speed in m/s = (Speed * 5)/18. Distance = Speed * Time. Length is accurately computed.`,
      i % 3 === 0 ? 'Hard' : (i % 2 === 0 ? 'Medium' : 'Easy'),
      JSON.stringify([top, 'Formulas'])
    );
  }
  for (let i = 1; i <= 110; i++) {
    const top = logicalTopics[i % logicalTopics.length];
    qStmt.run(
      `APT-Q-${String(++qCount).padStart(3, '0')}`, 'Logical Reasoning', top,
      `Question ${qCount} [${top}]: Find the next term in the alternating series: ${10 + i}, ${14 + i}, ${12 + i}, ${16 + i}, ...`,
      JSON.stringify([`${14 + i}`, `${18 + i}`, `${13 + i}`, `${15 + i}`]),
      0,
      `The pattern alternates (+4, -2). Next term is ${16 + i - 2} = ${14 + i}.`,
      i % 2 === 0 ? 'Medium' : 'Easy',
      JSON.stringify([top, 'Series'])
    );
  }
  for (let i = 1; i <= 90; i++) {
    const top = verbalTopics[i % verbalTopics.length];
    qStmt.run(
      `APT-Q-${String(++qCount).padStart(3, '0')}`, 'Verbal Ability', top,
      `Question ${qCount} [${top}]: Identify the grammatically correct sentence regarding concurrency handling in production:`,
      JSON.stringify([
        'Neither the microservice nor the message queues was responding.',
        'Neither the microservice nor the message queues were responding.',
        'Neither the microservice or the message queues was responding.',
        'Neither the microservice and the message queues are responding.'
      ]),
      1,
      `In 'neither... nor' constructs, the verb agrees with the closer plural subject ('message queues').`,
      'Medium',
      JSON.stringify([top, 'Grammar'])
    );
  }

  // 7. MOCK CODING PROBLEMS
  const codeStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO mock_coding_problems (id, title, category, difficulty, marks, description, starter_code_json, test_cases_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  codeStmt.run(
    'CODE-01', 'SQL Window Function Optimization: Top-K Spenders per Dept',
    'SQL & Database Optimization', 'Medium', 10,
    'Write a query using DENSE_RANK() OVER (PARTITION BY department_id ORDER BY total_spent DESC) to extract top 3 customers per department, excluding SUSPENDED accounts.',
    JSON.stringify({
      sql: `-- Write query below\nSELECT customer_id, customer_name, department_id, total_spent, DENSE_RANK() OVER (PARTITION BY department_id ORDER BY total_spent DESC) as dept_rank\nFROM customer_orders\nWHERE status != 'SUSPENDED';`
    }),
    JSON.stringify([
      { name: 'Partition by Department', visible: true, expected: 'PASS' },
      { name: 'Filter SUSPENDED Accounts', visible: true, expected: 'PASS' },
      { name: 'Dense Rank on Ties', visible: false, expected: 'PASS' }
    ])
  );
  codeStmt.run(
    'CODE-02', 'High-Throughput Sliding Window Rate Limiter',
    'Algorithms & Concurrency', 'Medium-Hard', 10,
    'Implement SlidingWindowRateLimiter(max_requests, window_seconds) with deque timestamp eviction to prevent memory leak.',
    JSON.stringify({
      python: `from collections import deque\n\nclass SlidingWindowRateLimiter:\n    def __init__(self, max_requests: int, window_seconds: int):\n        self.max_requests = max_requests\n        self.window_ms = window_seconds * 1000\n        self.clients = {}\n\n    def allow_request(self, client_id: str, ts_ms: int) -> bool:\n        # Write logic\n        return True\n`
    }),
    JSON.stringify([
      { name: 'Burst capacity allowed', visible: true, expected: 'True' },
      { name: 'Over-limit rejected', visible: true, expected: 'False' },
      { name: 'Eviction after window expiry', visible: false, expected: 'True' }
    ])
  );

  // 8. COMPANIES (12 Enterprise Leaders)
  const companyStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO companies (id, tenant_id, name, domain, contact_name, contact_email, status, notes, last_contacted_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const companiesList = [
    ['COMP-01', 'vpcoe-mumbai', 'Google India', 'Cloud & AI Platform', 'Sarah Jenkins', 'sarah.jenkins@google.com', 'APPROVED', 'Annual Tier-1 Partner', NOW],
    ['COMP-02', 'vpcoe-mumbai', 'Barclays Global Service Centre', 'FinTech & Banking', 'Vikramaditya Roy', 'v.roy@barclays.com', 'APPROVED', 'Backend & Cloud Microservices', NOW],
    ['COMP-03', 'vpcoe-mumbai', 'Microsoft IDC', 'Operating Systems & Cloud', 'Pooja Hegde', 'phegde@microsoft.com', 'APPROVED', 'Super Dream Tier', NOW],
    ['COMP-04', 'vpcoe-mumbai', 'Amazon Web Services', 'Cloud Infrastructure', 'Karan Malhotra', 'karan@amazon.com', 'APPROVED', 'AWS Systems & DevOps', NOW],
    ['COMP-05', 'vpcoe-mumbai', 'Tata Consultancy Services', 'Digital & IT Services', 'Manish Verma', 'm.verma@tcs.com', 'APPROVED', 'Mass Hiring & Digital Elite', NOW],
    ['COMP-06', 'vpcoe-mumbai', 'Morgan Stanley', 'Investment Banking Tech', 'Sneha Singhania', 'sneha@morganstanley.com', 'APPROVED', 'Low Latency Java/C++', NOW],
    ['COMP-07', 'vpcoe-mumbai', 'JPMorgan Chase & Co', 'Financial Engineering', 'Aditya Sen', 'aditya@jpmorgan.com', 'APPROVED', 'FinTech Full Stack', NOW],
    ['COMP-08', 'vpcoe-mumbai', 'Cisco Systems', 'Networking & Cloud', 'Priya Menon', 'pmenon@cisco.com', 'APPROVED', 'SDN & Network Systems', NOW],
    ['COMP-09', 'vpcoe-mumbai', 'Qualcomm India', 'Semiconductors & Embedded', 'Raghavan Iyer', 'riyer@qualcomm.com', 'APPROVED', 'ECE & Embedded C', NOW],
    ['COMP-10', 'vpcoe-mumbai', 'NVIDIA Corporation', 'AI Compute & Graphics', 'David Miller', 'dmiller@nvidia.com', 'APPROVED', 'CUDA & Deep Learning', NOW],
    ['COMP-11', 'vpcoe-mumbai', 'Larsen & Toubro Infotech', 'Enterprise Consulting', 'Ritu Saxena', 'ritu@lti.com', 'APPROVED', 'Cloud Transformations', NOW],
    ['COMP-12', 'vpcoe-mumbai', 'Infosys Limited (Power Programmer)', 'Digital Innovation', 'Anand Murthy', 'anand@infosys.com', 'APPROVED', 'Specialist Programmer Tier', NOW]
  ];
  companiesList.forEach(c => companyStmt.run(...c, NOW));

  // 9. PLACEMENT DRIVES
  const driveStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO drives (id, tenant_id, company_id, company_name, role, package_ctc, drive_date, venue, rule_version, min_cgpa, max_backlogs, allowed_branches_json, required_skills_json, status, stages_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  driveStmt.run('DRIVE-GOOGLE-2026', 'vpcoe-mumbai', 'COMP-01', 'Google India', 'Cloud Software Engineer (L3)', '28.5 LPA', '2026-10-12', 'Campus Lab A & Virtual Hangouts', '2.1', 7.8, 0, '["CSE","IT"]', '["python","dsa","git"]', 'Scheduled', '["Eligibility Filter","Machine Coding","System Design","Offer"]', NOW);
  driveStmt.run('DRIVE-BARCLAYS-2026', 'vpcoe-mumbai', 'COMP-02', 'Barclays Global Service Centre', 'Backend Developer', '14.5 LPA', '2026-10-18', 'Auditorium 2 & Cisco WebEx', '2.1', 7.5, 0, '["CSE","IT","ECE"]', '["python","sql","git"]', 'Scheduled', '["Eligibility Filter","Aptitude","Technical Round","HR"]', NOW);
  driveStmt.run('DRIVE-MSFT-2026', 'vpcoe-mumbai', 'COMP-03', 'Microsoft IDC', 'Software Development Engineer', '32.0 LPA', '2026-11-05', 'Central Computer Center', '2.1', 8.0, 0, '["CSE","IT"]', '["dsa","system_design","git"]', 'Proposed', '["Codility Test","Tech Interview 1","Tech Interview 2","Offer"]', NOW);
  driveStmt.run('DRIVE-TCS-2026', 'vpcoe-mumbai', 'COMP-05', 'Tata Consultancy Services', 'Digital Software Specialist', '9.0 LPA', '2026-10-25', 'Campus Main Auditorium', '2.1', 7.0, 0, '["CSE","IT","ECE","Mech"]', '["python","git"]', 'In Progress', '["NQT Round","Coding Assessment","Interview"]', NOW);
  driveStmt.run('DRIVE-AWS-2026', 'vpcoe-mumbai', 'COMP-04', 'Amazon Web Services', 'Cloud Support Engineer', '24.0 LPA', '2026-11-12', 'Lab B & Chime', '2.1', 7.5, 0, '["CSE","IT","ECE"]', '["aws_cloud","docker","python"]', 'Proposed', '["Assessment","Loop Interviews"]', NOW);
  driveStmt.run('DRIVE-LTI-2026', 'vpcoe-mumbai', 'COMP-11', 'Larsen & Toubro Infotech', 'Cloud Solutions Consultant', '8.0 LPA', '2026-09-28', 'Virtual Assessment Center', '2.1', 6.8, 0, '["CSE","IT","ECE","Mech"]', '["python"]', 'Completed', '["Completed Drive"]', NOW);

  // 10. ELIGIBILITY RULE SETS
  const ruleSetStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO eligibility_rule_sets (id, tenant_id, rule_id, version, title, description, min_cgpa, max_active_backlogs, max_history_backlogs, allowed_branches_json, mandatory_skills_json, max_offers, is_active, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  ruleSetStmt.run('RULESET-V1', 'vpcoe-mumbai', 'RULE-VPCOE-2026', '1.0', 'Legacy Spreadsheet Criteria (V1.0)', 'Old CGPA cut-off without verified proof requirement', 8.0, 0, 0, '["CSE","IT"]', '[]', 1, 0, 'Dr. Anil Kulkarni', '2026-06-01T00:00:00Z');
  ruleSetStmt.run('RULESET-V2', 'vpcoe-mumbai', 'RULE-VPCOE-2026', '2.0', 'Competency Beta Criteria (V2.0)', 'Preliminary rule requiring Python proof', 7.5, 0, 1, '["CSE","IT","ECE"]', '[{"skillId":"python","minState":"Verified","minConfidence":70}]', 1, 0, 'Dr. Anil Kulkarni', '2026-07-15T00:00:00Z');
  ruleSetStmt.run('RULESET-V21', 'vpcoe-mumbai', 'RULE-VPCOE-2026', '2.1', 'Evidence-Based High-Bar Tech Drive (Active V2.1)', 'Mandates verified Python and Git proof on record', 7.5, 0, 1, '["CSE","IT","ECE"]', '[{"skillId":"python","minState":"Verified","minConfidence":75},{"skillId":"git","minState":"Verified","minConfidence":70}]', 1, 1, 'Dr. Anil Kulkarni', NOW);

  // 11. MOCK ATTEMPT & LEARNING PATH FOR RAHUL SHARMA
  rawDb.prepare(`
    INSERT OR IGNORE INTO mock_attempts (id, student_id, tenant_id, role, aptitude_score, machine_score, interview_score, total_score, percentile, weak_topics_json, diagnostic_summary, status, started_at, completed_at)
    VALUES ('MOCK-RS-001', 'STU-VPCOE-042', 'vpcoe-mumbai', 'Backend Developer', 21, 12, 28, 61, 74.5,
    '["SQL Window Functions & Subqueries","System Deadlock & Transaction Isolation"]',
    'Strong in Core Python and API conventions. Weak in SQL relational query tuning, subqueries, and concurrency problem solving.',
    'COMPLETED', '2026-09-02T10:00:00Z', '2026-09-02T11:30:00Z')
  `).run();

  rawDb.prepare(`
    INSERT OR IGNORE INTO learning_paths (id, student_id, tenant_id, target_role, completed_tasks, total_tasks, generated_at, updated_at)
    VALUES ('LP-042', 'STU-VPCOE-042', 'vpcoe-mumbai', 'Backend Developer', 1, 4, ?, ?)
  `).run(NOW, NOW);

  const taskStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO learning_tasks (id, learning_path_id, student_id, tenant_id, title, type, estimated_hours, status, verifiable_outcome, produces_skill_id, completed_at, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  taskStmt.run('TASK-01', 'LP-042', 'STU-VPCOE-042', 'vpcoe-mumbai', 'SQL Practice Set 1: Joins & Aggregations', 'practice_set', 4, 'completed', 'Passed 15/15 practice queries on interactive engine', 'sql', NOW, '2026-09-10');
  taskStmt.run('TASK-02', 'LP-042', 'STU-VPCOE-042', 'vpcoe-mumbai', 'SQL Practice Set 2: Window Functions (DENSE_RANK, LEAD, LAG)', 'practice_set', 6, 'pending', 'Solves 10 advanced window function queries', 'sql', null, '2026-09-15');
  taskStmt.run('TASK-03', 'LP-042', 'STU-VPCOE-042', 'vpcoe-mumbai', 'Build Mini Project: SQL Query Performance Profiler Repo', 'mini_project', 12, 'pending', 'Push repository with schema migrations, indexes, EXPLAIN ANALYZE benchmarks producing verified evidence trail', 'sql', null, '2026-09-22');
  taskStmt.run('TASK-04', 'LP-042', 'STU-VPCOE-042', 'vpcoe-mumbai', 'Retake Mock Drive Machine Coding Test', 'assessment', 2, 'pending', 'Score >= 16/20 on SQL & problem solving machine round', 'sql', null, '2026-09-25');

  // 12. APPROVAL QUEUE
  const appQStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO approval_queue (id, tenant_id, item_type, title, proposed_action, evidence_json, confidence, affected_entity_id, affected_student_name, status, officer_id, officer_notes, created_at, resolved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  appQStmt.run(
    'APPQ-01', 'vpcoe-mumbai', 'AT_RISK_LABEL', 'Pre-Season At-Risk Classification Flag',
    'Flag candidate as at-risk and assign faculty mentor for problem solving remediation',
    JSON.stringify({ factors: ['Active backlog in Mathematics', 'Mock score 42%', '0 verified skills on graph'] }),
    82, 'STU-VPCOE-100', 'Rohan Patil', 'PENDING_HUMAN_DECISION', null, null, NOW, null
  );
  appQStmt.run(
    'APPQ-02', 'vpcoe-mumbai', 'STUDENT_APPEAL', 'Declarative Eligibility Appeal: Barclays Backend Role',
    'Candidate appeals ineligibility after pushing verified Query Profiler project repo',
    JSON.stringify({ appealReason: 'Completed 2 practice sets and submitted query profiler repo' }),
    89, 'STU-VPCOE-042', 'Rahul Sharma', 'PENDING_HUMAN_DECISION', null, null, NOW, null
  );
  appQStmt.run(
    'APPQ-03', 'vpcoe-mumbai', 'RECRUITER_APPROVAL', 'Recruiter Portal Registration Approval',
    'Grant candidate search access to Barclays Talent Team',
    JSON.stringify({ recruiterName: 'Vikramaditya Roy', company: 'Barclays' }),
    95, 'USR-REC-002', null, 'PENDING_HUMAN_DECISION', null, null, NOW, null
  );

  // 13. V2 READINESS SCORES
  rawDb.prepare(`
    INSERT OR IGNORE INTO readiness_scores (
      id, student_id, tenant_id, overall_score, technical_score, aptitude_score,
      communication_score, resume_score, projects_score, interview_score,
      breakdown_json, history_json, recommendations_json, updated_at
    ) VALUES (
      'RS-SCORE-042', 'STU-VPCOE-042', 'vpcoe-mumbai',
      84.5, 92.0, 78.5, 82.0, 88.0, 90.0, 76.5,
      '{"technical": 92, "aptitude": 79, "communication": 82, "resume": 88, "projects": 90, "interview": 77}',
      '[{"month": "Aug", "score": 68.0}, {"month": "Sep", "score": 75.5}, {"month": "Oct", "score": 84.5}]',
      '["Retake SQL subqueries assessment to boost score above 90%", "Schedule mock interview practice on system scalability", "Sync latest Docker container commits to evidence graph"]',
      ?
    )
  `).run(NOW);

  // 14. V2 CAREER ROLES
  const careerRoles = [
    {
      id: 'ROLE-FS',
      title: 'Full Stack Developer',
      category: 'Software Engineering',
      required_skills: ['JavaScript', 'React.js', 'Node.js', 'SQL', 'Git', 'Docker'],
      salary_range: '₹8 - 18 LPA',
      demand_level: 'High Demand',
      desc: 'Designs and builds end-to-end web applications with modern client frameworks and cloud microservices.',
      roadmap: {
        '30_day': ['Master React 18 hooks & state machines', 'Build REST APIs with Node.js & Express', 'SQL schema normalization and indexing'],
        '60_day': ['Implement JWT authentication & RBAC', 'Docker containerization & multi-stage builds', 'Full-stack deployment on AWS/Vercel'],
        '90_day': ['Distributed caching with Redis', 'System design for 100k daily active users', 'End-to-end automated testing with Jest & Cypress']
      }
    },
    {
      id: 'ROLE-BE',
      title: 'Backend Systems Engineer',
      category: 'Software Engineering',
      required_skills: ['Python', 'FastAPI', 'SQL', 'PostgreSQL', 'Docker', 'Redis', 'Kafka'],
      salary_range: '₹12 - 24 LPA',
      demand_level: 'Very High Demand',
      desc: 'Architects robust, high-throughput distributed microservices, databases, and message queues.',
      roadmap: {
        '30_day': ['Advanced asynchronous Python with AsyncIO', 'PostgreSQL query optimization & window functions', 'FastAPI production service structure'],
        '60_day': ['Message streaming with Apache Kafka / RabbitMQ', 'Docker Compose microservices with rate limiting', 'Database transactions & 2-phase commit'],
        '90_day': ['Distributed consensus & sharding patterns', 'High availability Kubernetes setup', 'Observability with Prometheus & OpenTelemetry']
      }
    },
    {
      id: 'ROLE-AIML',
      title: 'AI & Machine Learning Engineer',
      category: 'Artificial Intelligence',
      required_skills: ['Python', 'PyTorch', 'TensorFlow', 'NumPy', 'Pandas', 'Scikit-Learn', 'Docker'],
      salary_range: '₹14 - 28 LPA',
      demand_level: 'Critical Shortage',
      desc: 'Trains, fine-tunes, and deploys scalable machine learning models and LLM agent pipelines in production.',
      roadmap: {
        '30_day': ['Deep learning fundamentals & PyTorch tensors', 'Feature engineering & data pipeline automation', 'Supervised and unsupervised model training'],
        '60_day': ['Transformer architectures & LLM prompt orchestration', 'Model evaluation metrics, bias detection, and SHAP', 'Vector databases & RAG pipelines with Pinecone/Qdrant'],
        '90_day': ['Model quantization & TensorRT inference acceleration', 'MLOps pipelines with MLflow and BentoML', 'Edge model deployment and monitoring']
      }
    },
    {
      id: 'ROLE-DATA',
      title: 'Data Analyst & BI Specialist',
      category: 'Data & Analytics',
      required_skills: ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel', 'Statistics'],
      salary_range: '₹7 - 14 LPA',
      demand_level: 'High Demand',
      desc: 'Transforms complex multi-source organizational data into strategic dashboards, KPIs, and executive reports.',
      roadmap: {
        '30_day': ['Advanced SQL window functions, CTEs & pivots', 'Data wrangling with Pandas and Seaborn', 'Exploratory data analysis frameworks'],
        '60_day': ['Interactive dashboard architecture in Power BI/Tableau', 'Statistical significance testing & A/B testing', 'Automated reporting scripts with Python'],
        '90_day': ['Data warehouse modeling (Star & Snowflake schemas)', 'Predictive regression modeling in production', 'Executive narrative presentation and storytelling']
      }
    },
    {
      id: 'ROLE-CLOUD',
      title: 'Cloud & DevOps Engineer',
      category: 'Cloud & Infrastructure',
      required_skills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Bash'],
      salary_range: '₹10 - 22 LPA',
      demand_level: 'High Demand',
      desc: 'Automates continuous deployment pipelines, container orchestration, and multi-region cloud infrastructure.',
      roadmap: {
        '30_day': ['Linux kernel internals, shell scripting & networking', 'Docker multi-stage container optimization', 'GitLab/GitHub Actions automated CI/CD'],
        '60_day': ['Infrastructure as Code with Terraform on AWS', 'Kubernetes pods, deployments, services & ingress', 'Secret management with HashiCorp Vault'],
        '90_day': ['Service mesh architecture with Istio', 'Site Reliability Engineering (SRE) SLO/SLA tracking', 'Cost optimization & cloud security hardening']
      }
    }
  ];

  const insertRole = rawDb.prepare(`
    INSERT OR IGNORE INTO career_roles (
      id, title, category, required_skills_json, salary_range, demand_level, description, roadmap_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  careerRoles.forEach(r => {
    insertRole.run(r.id, r.title, r.category, JSON.stringify(r.required_skills), r.salary_range, r.demand_level, r.desc, JSON.stringify(r.roadmap));
  });

  // 15. V2 CAREER PATHS
  const paths = [
    {
      id: 'PATH-SE',
      title: 'Software Engineering Leadership',
      category: 'Engineering',
      entry_role: 'Graduate Software Engineer (SDE-1)',
      mid_role: 'Senior Software Engineer (SDE-2 / Lead)',
      senior_role: 'Principal Staff Engineer / Architect',
      leadership_role: 'VP of Engineering / CTO',
      avg_starting_salary: '₹10 LPA',
      avg_mid_salary: '₹24 LPA',
      certs: ['AWS Solutions Architect', 'CKAD Kubernetes Developer', 'MongoDB Certified Professional'],
      market_outlook: 'Strong Long-Term Growth (+22% YoY)',
      growth_rate: '22%'
    },
    {
      id: 'PATH-AI',
      title: 'AI Research & Production Engineering',
      category: 'AI & Data Science',
      entry_role: 'Junior ML / Data Engineer',
      mid_role: 'Lead Applied AI Scientist',
      senior_role: 'Head of Machine Learning / Principal AI Architect',
      leadership_role: 'Chief AI Officer (CAIO)',
      avg_starting_salary: '₹14 LPA',
      avg_mid_salary: '₹32 LPA',
      certs: ['DeepLearning.AI TensorFlow Specialist', 'AWS Certified Machine Learning', 'NVIDIA DLI Certificate'],
      market_outlook: 'Exponential Industry Adoption (+38% YoY)',
      growth_rate: '38%'
    },
    {
      id: 'PATH-DEVOPS',
      title: 'Cloud Architecture & SRE',
      category: 'Infrastructure',
      entry_role: 'Cloud Support / Junior DevOps Engineer',
      mid_role: 'Senior SRE / DevOps Lead',
      senior_role: 'Cloud Enterprise Architect',
      leadership_role: 'Head of Infrastructure & Security',
      avg_starting_salary: '₹9 LPA',
      avg_mid_salary: '₹22 LPA',
      certs: ['Certified Kubernetes Administrator (CKA)', 'HashiCorp Certified Terraform Associate', 'AWS DevOps Engineer Professional'],
      market_outlook: 'Essential Mission-Critical Demand (+25% YoY)',
      growth_rate: '25%'
    }
  ];

  const insertPath = rawDb.prepare(`
    INSERT OR IGNORE INTO career_paths (
      id, title, category, entry_role, mid_role, senior_role, leadership_role,
      avg_starting_salary, avg_mid_salary, key_certifications_json, market_outlook, growth_rate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  paths.forEach(p => {
    insertPath.run(p.id, p.title, p.category, p.entry_role, p.mid_role, p.senior_role, p.leadership_role, p.avg_starting_salary, p.avg_mid_salary, JSON.stringify(p.certs), p.market_outlook, p.growth_rate);
  });

  // 16. V2 ALUMNI MENTORS
  const mentors = [
    {
      id: 'ALUM-01',
      name: 'Pooja Hegde',
      company: 'Microsoft IDC',
      role: 'Senior Software Engineer (Azure)',
      batch: 'Class of 2021',
      branch: 'Computer Engineering',
      avatar_color: '#3b82f6',
      bio: 'Alumna with 5+ years experience building low-latency microservices at Microsoft. Specialized in distributed databases and system design interviews.',
      skills: ['System Design', 'C# / .NET Core', 'Azure', 'Microservices', 'Resume Review'],
      slots: ['Friday 6:00 PM', 'Saturday 11:00 AM', 'Sunday 4:00 PM']
    },
    {
      id: 'ALUM-02',
      name: 'Rohan Deshmukh',
      company: 'Google India',
      role: 'Site Reliability Engineer',
      batch: 'Class of 2020',
      branch: 'Information Technology',
      avatar_color: '#10b981',
      bio: 'Passionate about distributed consensus, Kubernetes, and Linux internals. Happy to mentor students on Google OA and technical rounds.',
      skills: ['Kubernetes', 'Go', 'Linux Internals', 'SRE', 'Coding Rounds'],
      slots: ['Saturday 2:00 PM', 'Sunday 11:00 AM']
    },
    {
      id: 'ALUM-03',
      name: 'Sneha Kulkarni',
      company: 'Barclays GSC',
      role: 'Lead FinTech Architect',
      batch: 'Class of 2019',
      branch: 'Computer Engineering',
      avatar_color: '#8b5cf6',
      bio: 'Specialized in high-frequency trading pipelines, relational query optimization, and banking compliance. Active mentor for female engineering cohorts.',
      skills: ['SQL Optimization', 'Python', 'FastAPI', 'Banking Tech', 'Mock HR Rounds'],
      slots: ['Thursday 7:00 PM', 'Saturday 5:00 PM']
    }
  ];

  const insertMentor = rawDb.prepare(`
    INSERT OR IGNORE INTO alumni_mentors (
      id, tenant_id, name, company, role, batch, branch, avatar_color, bio, skills_json, available_slots_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  mentors.forEach(m => {
    insertMentor.run(m.id, 'vpcoe-mumbai', m.name, m.company, m.role, m.batch, m.branch, m.avatar_color, m.bio, JSON.stringify(m.skills), JSON.stringify(m.slots));
  });

  rawDb.prepare(`
    INSERT OR IGNORE INTO mentorship_requests (
      id, student_id, mentor_id, tenant_id, topic, status, scheduled_at, meeting_link, student_notes, created_at
    ) VALUES (
      'REQ-042-01', 'STU-VPCOE-042', 'ALUM-01', 'vpcoe-mumbai',
      'System Design Review & Microsoft SDE Interview Preparation',
      'SCHEDULED', '2026-10-15T18:00:00Z', 'https://meet.google.com/xyz-edtech-prep',
      'Reviewing distributed event-streamer architecture and O(1) LRU cache implementation.',
      ?
    )
  `).run(NOW);

  // 17. V2 OPPORTUNITIES
  const opps = [
    {
      id: 'OPP-01',
      title: 'Cloud Software Engineer (L3)',
      company: 'Google India',
      type: 'Full-Time Campus',
      location: 'Bengaluru / Mumbai',
      work_mode: 'Hybrid',
      compensation: '₹28.5 LPA',
      min_cgpa: 7.8,
      required_skills: ['Python', 'DSA', 'Git', 'Distributed Systems'],
      deadline: '2026-10-12',
      source_url: 'https://careers.google.com',
      desc: 'Build next-generation planetary scale compute and AI infrastructure with Google Cloud Platform.'
    },
    {
      id: 'OPP-02',
      title: 'Backend Software Developer',
      company: 'Barclays Global Service Centre',
      type: 'Full-Time Campus',
      location: 'Pune / Mumbai',
      work_mode: 'Hybrid',
      compensation: '₹14.5 LPA',
      min_cgpa: 7.5,
      required_skills: ['Python', 'SQL', 'Git', 'FastAPI'],
      deadline: '2026-10-18',
      source_url: 'https://barclays.com/careers',
      desc: 'Develop mission-critical banking microservices, ledger integrations, and real-time transaction processing.'
    },
    {
      id: 'OPP-03',
      title: 'Summer SDE Research Intern 2027',
      company: 'Microsoft Research India',
      type: 'Internship',
      location: 'Bengaluru',
      work_mode: 'Hybrid',
      compensation: '₹1.25 Lakh / month',
      min_cgpa: 8.0,
      required_skills: ['Python', 'DSA', 'Algorithms', 'Research'],
      deadline: '2026-10-30',
      source_url: 'https://careers.microsoft.com',
      desc: 'Work alongside world-class researchers on systems, AI models, and algorithmic verification.'
    },
    {
      id: 'OPP-04',
      title: 'Distributed Systems Graduate Fellow',
      company: 'Amazon Web Services (AWS)',
      type: 'Off-Campus',
      location: 'Hyderabad / Pune',
      work_mode: 'Remote',
      compensation: '₹24.0 LPA',
      min_cgpa: 7.5,
      required_skills: ['AWS', 'Docker', 'Python', 'Linux'],
      deadline: '2026-11-15',
      source_url: 'https://amazon.jobs',
      desc: 'Deep dive into high-availability cloud networking, hypervisors, and container runtime orchestration.'
    }
  ];

  const insertOpp = rawDb.prepare(`
    INSERT OR IGNORE INTO opportunities (
      id, tenant_id, title, company, type, location, work_mode, compensation,
      min_cgpa, required_skills_json, deadline, source_url, description, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  opps.forEach(o => {
    insertOpp.run(
      o.id, 'vpcoe-mumbai', o.title, o.company, o.type, o.location, o.work_mode,
      o.compensation, o.min_cgpa, JSON.stringify(o.required_skills), o.deadline,
      o.source_url, o.desc, NOW
    );
  });

  rawDb.prepare(`
    INSERT OR IGNORE INTO saved_opportunities (id, student_id, opportunity_id, tenant_id, status, saved_at)
    VALUES ('SAVE-01', 'STU-VPCOE-042', 'OPP-01', 'vpcoe-mumbai', 'Applied', ?)
  `).run(NOW);
  rawDb.prepare(`
    INSERT OR IGNORE INTO saved_opportunities (id, student_id, opportunity_id, tenant_id, status, saved_at)
    VALUES ('SAVE-02', 'STU-VPCOE-042', 'OPP-03', 'vpcoe-mumbai', 'Saved', ?)
  `).run(NOW);

  // 18. V2 PORTFOLIO PROJECTS
  const projects = [
    {
      id: 'PROJ-01',
      title: 'Distributed Event Streamer in FastAPI',
      problem: 'Traditional synchronous HTTP endpoints block under concurrent 50k RPS event bursts, causing latency spikes and data drops.',
      desc: 'Architected an asynchronous event-streaming pipeline utilizing Redis streams, Kafka partitions, and FastAPI. Includes AST-verified code with zero security vulnerabilities.',
      tech_stack: ['FastAPI', 'Python', 'Kafka', 'Redis', 'Docker'],
      github: 'https://github.com/rahulsharma-dev/event-streamer',
      demo: 'https://event-streamer.demo.edtech.ac.in',
      metrics: 'Processed 85,000 events/sec with < 8ms p99 latency',
      commits: 18
    },
    {
      id: 'PROJ-02',
      title: 'SQL Query Performance Profiler & Auto-Tuner',
      problem: 'Suboptimal database queries and missing composite indexes degrade relational database throughput during recruitment drives.',
      desc: 'Automated PostgreSQL execution plan analyzer that detects sequential table scans, N+1 query patterns, and generates optimized DENSE_RANK() window functions.',
      tech_stack: ['PostgreSQL', 'Python', 'Docker', 'SQLAlchemy'],
      github: 'https://github.com/rahulsharma-dev/sql-profiler',
      demo: 'https://sql-profiler.demo.edtech.ac.in',
      metrics: 'Achieved 4.2x speedup on complex multi-join analytical queries',
      commits: 24
    },
    {
      id: 'PROJ-03',
      title: 'Decentralized Tamper-Evident Credential Ledger',
      problem: 'Placement CV fraud and unverified skill claims erode trust between academic institutions and hiring enterprise recruiters.',
      desc: 'Append-only cryptographic SHA-256 blockchain ledger that anchors student verified skills, git commit checksums, and W3C verifiable credentials.',
      tech_stack: ['Node.js', 'Cryptography', 'SQLite', 'Express'],
      github: 'https://github.com/rahulsharma-dev/credential-ledger',
      demo: 'https://ledger.demo.edtech.ac.in',
      metrics: '100% cryptographic tamper detection with zero false positives',
      commits: 36
    }
  ];

  const insertProj = rawDb.prepare(`
    INSERT OR IGNORE INTO portfolio_projects (
      id, student_id, tenant_id, title, problem_statement, description,
      tech_stack_json, github_url, live_demo_url, key_metrics, commit_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  projects.forEach(p => {
    insertProj.run(
      p.id, 'STU-VPCOE-042', 'vpcoe-mumbai', p.title, p.problem, p.desc,
      JSON.stringify(p.tech_stack), p.github, p.demo, p.metrics, p.commits, NOW
    );
  });

  // 19. V2 HACKATHONS
  const hacks = [
    {
      id: 'HACK-01',
      title: 'Quasar 5.0 National EdTech Hackathon',
      organizer: 'National Technical Education Council',
      category: 'AI Hackathon',
      prize_pool: '₹5,00,000',
      deadline: '2026-11-28',
      tags: ['EdTech', 'AI Agents', 'Open Innovation', 'Placement'],
      status: 'Open'
    },
    {
      id: 'HACK-02',
      title: 'Mumbai Inter-College Algorithmic Cup',
      organizer: 'University of Mumbai & ACM Student Chapter',
      category: 'Coding Challenge',
      prize_pool: '₹1,50,000',
      deadline: '2026-10-22',
      tags: ['Algorithms', 'Data Structures', 'Competitive Coding'],
      status: 'Open'
    },
    {
      id: 'HACK-03',
      title: 'AWS GenAI Enterprise Hackathon',
      organizer: 'Amazon Web Services India',
      category: 'Cloud Challenge',
      prize_pool: '₹3,00,000 + Cloud Credits',
      deadline: '2026-11-08',
      tags: ['Bedrock', 'AWS Lambda', 'Vector DB', 'Serverless'],
      status: 'Open'
    }
  ];

  const insertHack = rawDb.prepare(`
    INSERT OR IGNORE INTO hackathons (
      id, tenant_id, title, organizer, category, prize_pool, deadline, tags_json, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  hacks.forEach(h => {
    insertHack.run(
      h.id, 'vpcoe-mumbai', h.title, h.organizer, h.category, h.prize_pool,
      h.deadline, JSON.stringify(h.tags), h.status, NOW
    );
  });

  // 20. V2 AGENTIC WORKFLOW AUTOMATION RUN
  rawDb.prepare(`
    INSERT OR IGNORE INTO agentic_workflows (
      id, tenant_id, workflow_type, initiator_role, trigger_event,
      steps_json, status, human_approval_required, logs_json, created_at
    ) VALUES (
      'WF-STU-042', 'vpcoe-mumbai', 'STUDENT_PREPARATION', 'STUDENT',
      'Target Company Barclays Selected',
      '["1. Analyzed student profile against Barclays JD", "2. Calculated 100% eligibility on Rule V2.1", "3. Detected SQL window functions deficit (-12%)", "4. Created 3-Day SQL Practice Sprint in Roadmap", "5. Pre-filled 1-Click ATS Resume with verified evidence"]',
      'COMPLETED_WAITING_HUMAN_APPROVAL', 1,
      '["Workflow started 10:14:02", "AST evidence cross-referenced with 54 git commits", "Pre-flight checks passed", "Proposal queued for T&P Officer review"]',
      ?
    )
  `).run(NOW);

  // 21. V2 TPO INTERVENTIONS
  const interventionStmt = rawDb.prepare(`
    INSERT OR IGNORE INTO tpo_interventions (
      id, student_id, tenant_id, risk_category, severity, recommended_action,
      assigned_officer, status, action_notes, created_at, resolved_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  interventionStmt.run(
    'INT-01', 'STU-VPCOE-100', 'vpcoe-mumbai', 'Backlog Risk', 'High',
    'Assign remedial tutoring for Applied Mathematics and schedule mandatory faculty mentor session',
    'Dr. Anil Kulkarni', 'Active', 'Candidate flagged at risk before placement season commences', NOW, null
  );
  interventionStmt.run(
    'INT-02', 'STU-VPCOE-042', 'vpcoe-mumbai', 'Skill Gap', 'Low',
    'Recommend SQL window functions practice set prior to Barclays campus round',
    'Dr. Anil Kulkarni', 'Resolved', 'Candidate successfully submitted Query Profiler project repo', NOW, NOW
  );

  return { success: true, timestamp: NOW };
}

module.exports = { initDb };
