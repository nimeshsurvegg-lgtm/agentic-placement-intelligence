// Master Authentication Routes for Agentic Placement Intelligence Platform
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const dbService = require('../services/db');
const { requireAuth } = require('../middleware/auth');

// Demo Accounts Registry for Section 1.1 Accordion
const DEMO_ACCOUNTS = [
  {
    role: 'STUDENT',
    name: 'Rahul Sharma',
    email: 'rahul@vppcoe.demo',
    password: 'Demo@1234',
    tenantId: 'vpcoe-mumbai',
    collegeName: "Vasantdada Patil Pratishthan's College of Engineering & VA",
    description: 'Final Year CSE student, 8.42 CGPA, 230 LeetCode, targeting Backend Developer'
  },
  {
    role: 'TP_OFFICER',
    name: 'Dr. Anil Kulkarni',
    email: 'anil.kulkarni@vppcoe.demo',
    password: 'Demo@1234',
    tenantId: 'vpcoe-mumbai',
    collegeName: "Vasantdada Patil Pratishthan's College of Engineering & VA",
    description: 'Head Training & Placement Officer: Drives, Rules v2.1, Approval Queue, Campaigns'
  },
  {
    role: 'DEPARTMENT_HEAD',
    name: 'Prof. S. Rane',
    email: 'hod.cs@vppcoe.demo',
    password: 'Demo@1234',
    tenantId: 'vpcoe-mumbai',
    collegeName: "Vasantdada Patil Pratishthan's College of Engineering & VA",
    description: 'Head of Computer Science: Departmental cohort analytics & mentor attestations'
  },
  {
    role: 'RECRUITER',
    name: 'Sarah Jenkins (Google)',
    email: 'recruiter@google.demo',
    password: 'Demo@1234',
    tenantId: 'vpcoe-mumbai',
    collegeName: "Google India Talent Acquisition",
    description: 'Approved Recruiter: Semantic talent search, match explanations, candidate dossiers'
  },
  {
    role: 'RECRUITER',
    name: 'Vikramaditya Roy (Barclays)',
    email: 'recruiter@barclays.demo',
    password: 'Demo@1234',
    tenantId: 'vpcoe-mumbai',
    collegeName: "Barclays Talent Team",
    description: 'Pending Approval Recruiter: Demonstrates officer approval gate screen'
  },
  {
    role: 'UNIVERSITY_ADMIN',
    name: 'Dr. Suhas Pednekar',
    email: 'chancellor@univ.demo',
    password: 'Demo@1234',
    tenantId: 'mumbai-univ',
    collegeName: 'University of Mumbai (Chancellor Office)',
    description: 'State University Chancellor: Cross-college NIRF/NAAC comparative intelligence'
  },
  {
    role: 'TP_OFFICER',
    name: 'Dr. Sunita Deshpande',
    email: 'officer@coep.demo',
    password: 'Demo@1234',
    tenantId: 'coep-pune',
    collegeName: 'COEP Technological University',
    description: 'T&P Officer at College B: Verifies tenant data isolation'
  }
];

// GET /api/auth/demo-accounts
router.get('/demo-accounts', (req, res) => {
  res.json({ success: true, demoAccounts: DEMO_ACCOUNTS });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.json({ success: true, authenticated: false, user: null });
  }

  const tenant = dbService.db.prepare('SELECT id, name, code, tier FROM tenants WHERE id = ?').get(req.user.tenantId);
  let studentRecord = null;
  let consentRecord = null;

  if (req.user.role === 'STUDENT') {
    studentRecord = dbService.db.prepare('SELECT * FROM students WHERE user_id = ?').get(req.user.id);
    if (studentRecord) {
      consentRecord = dbService.db.prepare('SELECT * FROM consents WHERE student_id = ?').get(studentRecord.id);
    }
  }

  res.json({
    success: true,
    authenticated: true,
    user: req.user,
    tenant,
    student: studentRecord,
    consent: consentRecord
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password, tenantId, rememberMe } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const rateLimitKey = `${clientIp}:${(email || '').toLowerCase().trim()}`;

  // 1. Rate Limiting Check
  const rateLimitStatus = authService.checkRateLimit(rateLimitKey);
  if (!rateLimitStatus.allowed) {
    return res.status(429).json({
      success: false,
      locked: true,
      message: rateLimitStatus.message
    });
  }

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.'
    });
  }

  // 2. Query user from DB
  const user = dbService.db.prepare(`
    SELECT u.*, t.name as tenant_name
    FROM users u
    JOIN tenants t ON u.tenant_id = t.id
    WHERE LOWER(u.email) = LOWER(?)
  `).get(email.trim());

  if (!user) {
    const attempts = authService.recordFailedAttempt(rateLimitKey);
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Please verify your email and password.',
      remainingAttempts: Math.max(0, 5 - attempts)
    });
  }

  // 3. Verify password
  const isValid = authService.comparePassword(password, user.password_hash);
  if (!isValid) {
    const attempts = authService.recordFailedAttempt(rateLimitKey);
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Please verify your email and password.',
      remainingAttempts: Math.max(0, 5 - attempts)
    });
  }

  // Clear rate limits on valid login
  authService.clearFailedAttempts(rateLimitKey);

  // 4. Optional 2FA OTP for high privilege roles if configured
  if (user.require_otp === 1 || req.body.forceOtp === true) {
    const otp = authService.generateOtp(user);
    return res.json({
      success: true,
      requiresOtp: true,
      userId: user.id,
      email: user.email,
      role: user.role,
      devOtp: otp, // Returned in dev mode for seamless testing
      message: `2FA OTP code generated and logged to console for ${user.email}`
    });
  }

  // 5. Issue Token & Session
  const token = authService.generateToken(user);
  const userAgent = req.headers['user-agent'] || 'Web Browser';
  authService.createSession(user, token, userAgent, clientIp);

  // 6. Set httpOnly Cookie
  const cookieMaxAge = rememberMe ? 30 * 24 * 3600 * 1000 : 8 * 3600 * 1000;
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: cookieMaxAge
  });

  // Log in Tamper-Evident Ledger
  dbService.logAudit(user.tenant_id, 'USER_LOGIN', { id: user.id, name: user.name, role: user.role }, {
    ip: clientIp,
    userAgent
  });

  // Determine redirect URL based on role
  let redirectUrl = '/student';
  if (user.role === 'TP_OFFICER' || user.role === 'COLLEGE_ADMIN' || user.role === 'DEPARTMENT_HEAD') {
    redirectUrl = '/admin';
  } else if (user.role === 'RECRUITER') {
    redirectUrl = '/recruiter';
  } else if (user.role === 'UNIVERSITY_ADMIN') {
    redirectUrl = '/university';
  }

  return res.json({
    success: true,
    token,
    redirectUrl,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      tenantId: user.tenant_id,
      tenantName: user.tenant_name
    }
  });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: 'User ID and OTP code required.' });
  }

  const result = authService.verifyOtp(userId, otp);
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message });
  }

  const user = result.user;
  const token = authService.generateToken(user);
  const userAgent = req.headers['user-agent'] || 'Web Browser';
  authService.createSession(user, token, userAgent);

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 3600 * 1000
  });

  let redirectUrl = '/admin';
  if (user.role === 'UNIVERSITY_ADMIN') redirectUrl = '/university';
  if (user.role === 'RECRUITER') redirectUrl = '/recruiter';

  return res.json({
    success: true,
    token,
    redirectUrl,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      tenantId: user.tenant_id
    }
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const token = (req.cookies && req.cookies.auth_token) || 
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);

  if (token) {
    authService.destroySession(token);
  }

  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/register (Student self-registration)
router.post('/register', (req, res) => {
  const { name, email, password, rollNo, branch, tenantId, phone } = req.body;
  if (!name || !email || !password || !rollNo || !branch) {
    return res.status(400).json({ success: false, message: 'Please complete all required fields.' });
  }

  const targetTenant = tenantId || 'vpcoe-mumbai';
  const existing = dbService.db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const userId = 'USR-STU-' + Math.floor(1000 + Math.random() * 9000);
  const studentId = 'STU-' + Math.floor(1000 + Math.random() * 9000);
  const hash = authService.hashPassword(password);
  const now = new Date().toISOString();

  // Create User
  dbService.db.prepare(`
    INSERT INTO users (id, tenant_id, name, email, password_hash, role, status, require_otp, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'STUDENT', 'ACTIVE', 0, ?, ?)
  `).run(userId, targetTenant, name, email, hash, now, now);

  // Create Student Profile
  dbService.db.prepare(`
    INSERT INTO students (id, user_id, tenant_id, roll_no, name, email, phone, branch, batch, semester, cgpa, backlogs, gender, category, target_role, leetcode_solved, is_at_risk, placement_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, '2023-2027', 7, 7.5, 0, 'Not Specified', 'General', 'Software Engineer', 50, 0, 0, ?, ?)
  `).run(studentId, userId, targetTenant, rollNo, name, email, phone || '+91 98000 00000', branch, now, now);

  // Create Consent Record
  const consentId = 'CON-' + Math.floor(1000 + Math.random() * 9000);
  dbService.db.prepare(`
    INSERT INTO consents (id, student_id, tenant_id, repo_read_consent, recruiter_search_consent, demographic_sharing_consent, verifiable_consent_id, is_under_18, parental_consent_verified, granted_at, updated_at)
    VALUES (?, ?, ?, 1, 1, 1, ?, 0, 1, ?, ?)
  `).run(consentId, studentId, targetTenant, `DPDP-${Date.now()}`, now, now);

  const newUser = { id: userId, name, email, role: 'STUDENT', tenant_id: targetTenant, status: 'ACTIVE' };
  const token = authService.generateToken(newUser);
  authService.createSession(newUser, token, req.headers['user-agent'] || '');

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 3600 * 1000
  });

  dbService.logAudit(targetTenant, 'STUDENT_REGISTERED', { id: userId, name, role: 'STUDENT' }, { rollNo, branch });

  res.json({
    success: true,
    message: 'Registration successful!',
    token,
    user: newUser,
    redirectUrl: '/student'
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email address required.' });

  const result = authService.createPasswordResetToken(email);
  if (!result) {
    // Return positive response anyway for security
    return res.json({
      success: true,
      message: 'If an account exists with that email, a 15-minute reset link has been dispatched.'
    });
  }

  res.json({
    success: true,
    message: 'Reset link generated! Link is valid for 15 minutes.',
    devResetLink: result.resetLink, // Shown in dev UI toast for effortless demonstration
    token: result.token
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Valid token and minimum 6 character password required.' });
  }

  const result = authService.resetPasswordWithToken(token, newPassword);
  if (!result.success) {
    return res.status(400).json({ success: false, message: result.message });
  }

  res.json({ success: true, message: 'Password has been updated successfully. Please sign in.' });
});

// POST /api/auth/consent (Update DPDP granular toggles)
router.post('/consent', requireAuth, (req, res) => {
  const { repoReadConsent, recruiterSearchConsent, demographicSharingConsent } = req.body;
  const student = dbService.db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student record not found.' });
  }

  const now = new Date().toISOString();
  dbService.db.prepare(`
    UPDATE consents
    SET repo_read_consent = ?, recruiter_search_consent = ?, demographic_sharing_consent = ?, updated_at = ?
    WHERE student_id = ?
  `).run(
    repoReadConsent ? 1 : 0,
    recruiterSearchConsent ? 1 : 0,
    demographicSharingConsent ? 1 : 0,
    now,
    student.id
  );

  dbService.logAudit(req.user.tenantId, 'DPDP_CONSENT_UPDATED', { id: req.user.id, name: req.user.name, role: req.user.role }, {
    repoReadConsent,
    recruiterSearchConsent,
    demographicSharingConsent
  });

  res.json({ success: true, message: 'Privacy preferences saved under DPDP Act 2023.' });
});

module.exports = router;
