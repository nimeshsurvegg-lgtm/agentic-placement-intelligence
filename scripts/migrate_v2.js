// Agentic Placement Intelligence Platform - V2 Feature Suite Database Migration
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'placement.db');
const db = new DatabaseSync(dbPath);

console.log('🚀 Running V2 Enterprise Feature Database Migration...');

// 1. READINESS SCORES TABLE
db.exec(`
  CREATE TABLE IF NOT EXISTS readiness_scores (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL UNIQUE,
    tenant_id TEXT NOT NULL,
    overall_score REAL NOT NULL,
    technical_score REAL NOT NULL,
    aptitude_score REAL NOT NULL,
    communication_score REAL NOT NULL,
    resume_score REAL NOT NULL,
    projects_score REAL NOT NULL,
    interview_score REAL NOT NULL,
    breakdown_json TEXT NOT NULL,
    history_json TEXT NOT NULL,
    recommendations_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );
`);

// 2. CAREER ROLES & 30-60-90 ROADMAPS
db.exec(`
  CREATE TABLE IF NOT EXISTS career_roles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    required_skills_json TEXT NOT NULL,
    salary_range TEXT NOT NULL,
    demand_level TEXT NOT NULL,
    description TEXT NOT NULL,
    roadmap_json TEXT NOT NULL
  );
`);

// 3. CAREER PATHS EXPLORER
db.exec(`
  CREATE TABLE IF NOT EXISTS career_paths (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    entry_role TEXT NOT NULL,
    mid_role TEXT NOT NULL,
    senior_role TEXT NOT NULL,
    leadership_role TEXT NOT NULL,
    avg_starting_salary TEXT NOT NULL,
    avg_mid_salary TEXT NOT NULL,
    key_certifications_json TEXT NOT NULL,
    market_outlook TEXT NOT NULL,
    growth_rate TEXT NOT NULL
  );
`);

// 4. ALUMNI MENTORS & SESSIONS
db.exec(`
  CREATE TABLE IF NOT EXISTS alumni_mentors (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    batch TEXT NOT NULL,
    branch TEXT NOT NULL,
    avatar_color TEXT NOT NULL DEFAULT '#4f46e5',
    bio TEXT NOT NULL,
    skills_json TEXT NOT NULL,
    available_slots_json TEXT NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 1
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS mentorship_requests (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    mentor_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED', -- PENDING, SCHEDULED, COMPLETED, CANCELLED
    scheduled_at TEXT NOT NULL,
    meeting_link TEXT,
    student_notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES alumni_mentors(id) ON DELETE CASCADE
  );
`);

// 5. UNIFIED OPPORTUNITIES (CAMPUS, OFF-CAMPUS, INTERNSHIPS, HACKATHONS)
db.exec(`
  CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    type TEXT NOT NULL, -- Full-Time Campus, Off-Campus, Internship, Hackathon
    location TEXT NOT NULL,
    work_mode TEXT NOT NULL DEFAULT 'Hybrid', -- Onsite, Hybrid, Remote
    compensation TEXT NOT NULL,
    min_cgpa REAL NOT NULL DEFAULT 7.0,
    required_skills_json TEXT NOT NULL,
    deadline TEXT NOT NULL,
    source_url TEXT,
    is_verified INTEGER NOT NULL DEFAULT 1,
    verified_by TEXT,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS saved_opportunities (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    opportunity_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Saved', -- Saved, Applied, In Review
    saved_at TEXT NOT NULL,
    UNIQUE(student_id, opportunity_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
  );
`);

// 6. PORTFOLIO PROJECTS
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio_projects (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_stack_json TEXT NOT NULL,
    github_url TEXT,
    live_demo_url TEXT,
    key_metrics TEXT,
    ast_verified INTEGER NOT NULL DEFAULT 1,
    commit_count INTEGER NOT NULL DEFAULT 18,
    created_at TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );
`);

// 7. TPO INTERVENTIONS & RISK QUEUE
db.exec(`
  CREATE TABLE IF NOT EXISTS tpo_interventions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    risk_category TEXT NOT NULL, -- Low Assessment, Weak Skills, Incomplete Profile, Backlog Risk
    severity TEXT NOT NULL DEFAULT 'Medium', -- Low, Medium, High
    recommended_action TEXT NOT NULL,
    assigned_officer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active', -- Active, In_Progress, Resolved
    action_notes TEXT,
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  );
`);

// 8. HACKATHONS & CHALLENGES
db.exec(`
  CREATE TABLE IF NOT EXISTS hackathons (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    organizer TEXT NOT NULL,
    category TEXT NOT NULL, -- Coding Challenge, AI Hackathon, Web3, Case Study
    prize_pool TEXT NOT NULL,
    deadline TEXT NOT NULL,
    tags_json TEXT NOT NULL,
    registered_count INTEGER NOT NULL DEFAULT 45,
    status TEXT NOT NULL DEFAULT 'Open', -- Open, In Progress, Closed
    created_at TEXT NOT NULL
  );
`);

// 9. AGENTIC WORKFLOW AUTOMATION RUNS
db.exec(`
  CREATE TABLE IF NOT EXISTS agentic_workflows (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    workflow_type TEXT NOT NULL, -- STUDENT_PREPARATION, TPO_DRIVE_DISPATCH, RECRUITER_SHORTLISTING
    initiator_role TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    steps_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED_WAITING_HUMAN_APPROVAL',
    human_approval_required INTEGER NOT NULL DEFAULT 1,
    logs_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

console.log('✅ All 9 V2 Tables Created Successfully.');

// SEED SAMPLE RECORDS
const now = new Date().toISOString();

// Seed Readiness Score for Rahul Sharma
db.exec(`
  INSERT OR REPLACE INTO readiness_scores (
    id, student_id, tenant_id, overall_score, technical_score, aptitude_score,
    communication_score, resume_score, projects_score, interview_score,
    breakdown_json, history_json, recommendations_json, updated_at
  ) VALUES (
    'RS-SCORE-042', 'STU-VPCOE-042', 'vpcoe-mumbai',
    84.5, 92.0, 78.5, 82.0, 88.0, 90.0, 76.5,
    '{"technical": 92, "aptitude": 79, "communication": 82, "resume": 88, "projects": 90, "interview": 77}',
    '[{"month": "Aug", "score": 68.0}, {"month": "Sep", "score": 75.5}, {"month": "Oct", "score": 84.5}]',
    '["Retake SQL subqueries assessment to boost score above 90%", "Schedule mock interview practice on system scalability", "Sync latest Docker container commits to evidence graph"]',
    '${now}'
  );
`);

// Seed Career Roles
const roles = [
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

const insertRole = db.prepare(`
  INSERT OR REPLACE INTO career_roles (
    id, title, category, required_skills_json, salary_range, demand_level, description, roadmap_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
roles.forEach(r => {
  insertRole.run(
    r.id, r.title, r.category,
    JSON.stringify(r.required_skills),
    r.salary_range, r.demand_level, r.desc,
    JSON.stringify(r.roadmap)
  );
});

// Seed Career Paths
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

const insertPath = db.prepare(`
  INSERT OR REPLACE INTO career_paths (
    id, title, category, entry_role, mid_role, senior_role, leadership_role,
    avg_starting_salary, avg_mid_salary, key_certifications_json, market_outlook, growth_rate
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
paths.forEach(p => {
  insertPath.run(
    p.id, p.title, p.category, p.entry_role, p.mid_role, p.senior_role, p.leadership_role,
    p.avg_starting_salary, p.avg_mid_salary, JSON.stringify(p.certs), p.market_outlook, p.growth_rate
  );
});

// Seed Alumni Mentors
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

const insertMentor = db.prepare(`
  INSERT OR REPLACE INTO alumni_mentors (
    id, tenant_id, name, company, role, batch, branch, avatar_color, bio, skills_json, available_slots_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
mentors.forEach(m => {
  insertMentor.run(
    m.id, 'vpcoe-mumbai', m.name, m.company, m.role, m.batch, m.branch,
    m.avatar_color, m.bio, JSON.stringify(m.skills), JSON.stringify(m.slots)
  );
});

// Seed Sample Mentorship Request for Rahul Sharma
db.exec(`
  INSERT OR REPLACE INTO mentorship_requests (
    id, student_id, mentor_id, tenant_id, topic, status, scheduled_at, meeting_link, student_notes, created_at
  ) VALUES (
    'REQ-042-01', 'STU-VPCOE-042', 'ALUM-01', 'vpcoe-mumbai',
    'System Design Review & Microsoft SDE Interview Preparation',
    'SCHEDULED', '2026-10-15T18:00:00Z', 'https://meet.google.com/xyz-edtech-prep',
    'Reviewing distributed event-streamer architecture and O(1) LRU cache implementation.',
    '${now}'
  );
`);

// Seed Unified Opportunities (Campus, Off-Campus, Internships, Hackathons)
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

const insertOpp = db.prepare(`
  INSERT OR REPLACE INTO opportunities (
    id, tenant_id, title, company, type, location, work_mode, compensation,
    min_cgpa, required_skills_json, deadline, source_url, description, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
opps.forEach(o => {
  insertOpp.run(
    o.id, 'vpcoe-mumbai', o.title, o.company, o.type, o.location, o.work_mode,
    o.compensation, o.min_cgpa, JSON.stringify(o.required_skills), o.deadline,
    o.source_url, o.desc, now
  );
});

// Seed Saved Opportunities for Rahul Sharma
db.exec(`
  INSERT OR REPLACE INTO saved_opportunities (id, student_id, opportunity_id, tenant_id, status, saved_at)
  VALUES ('SAVE-01', 'STU-VPCOE-042', 'OPP-01', 'vpcoe-mumbai', 'Applied', '${now}');
  INSERT OR REPLACE INTO saved_opportunities (id, student_id, opportunity_id, tenant_id, status, saved_at)
  VALUES ('SAVE-02', 'STU-VPCOE-042', 'OPP-03', 'vpcoe-mumbai', 'Saved', '${now}');
`);

// Seed Portfolio Projects for Rahul Sharma
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

const insertProj = db.prepare(`
  INSERT OR REPLACE INTO portfolio_projects (
    id, student_id, tenant_id, title, problem_statement, description,
    tech_stack_json, github_url, live_demo_url, key_metrics, commit_count, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
projects.forEach(p => {
  insertProj.run(
    p.id, 'STU-VPCOE-042', 'vpcoe-mumbai', p.title, p.problem, p.desc,
    JSON.stringify(p.tech_stack), p.github, p.demo, p.metrics, p.commits, now
  );
});

// Seed Hackathons
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

const insertHack = db.prepare(`
  INSERT OR REPLACE INTO hackathons (
    id, tenant_id, title, organizer, category, prize_pool, deadline, tags_json, status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
hacks.forEach(h => {
  insertHack.run(
    h.id, 'vpcoe-mumbai', h.title, h.organizer, h.category, h.prize_pool,
    h.deadline, JSON.stringify(h.tags), h.status, now
  );
});

// Seed Agentic Workflows Execution
db.exec(`
  INSERT OR REPLACE INTO agentic_workflows (
    id, tenant_id, workflow_type, initiator_role, trigger_event,
    steps_json, status, human_approval_required, logs_json, created_at
  ) VALUES (
    'WF-STU-042', 'vpcoe-mumbai', 'STUDENT_PREPARATION', 'STUDENT',
    'Target Company Barclays Selected',
    '["1. Analyzed student profile against Barclays JD", "2. Calculated 100% eligibility on Rule V2.1", "3. Detected SQL window functions deficit (-12%)", "4. Created 3-Day SQL Practice Sprint in Roadmap", "5. Pre-filled 1-Click ATS Resume with verified evidence"]',
    'COMPLETED_WAITING_HUMAN_APPROVAL', 1,
    '["Workflow started 10:14:02", "AST evidence cross-referenced with 54 git commits", "Pre-flight checks passed", "Proposal queued for T&P Officer review"]',
    '${now}'
  );
`);

console.log('🎉 Database V2 Migration and Seed Completed Successfully!');
