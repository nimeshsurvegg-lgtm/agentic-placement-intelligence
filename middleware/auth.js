// Agentic Placement Intelligence Platform - Authentication & Authorization Middleware
const authService = require('../services/authService');
const dbService = require('../services/db');

// Role-Based Access Control Permission Matrix
const PERMISSIONS = {
  UNIVERSITY_ADMIN: ['*'], // Full cross-college access
  COLLEGE_ADMIN: [
    'students:read', 'students:write', 'drives:read', 'drives:write', 'approvals:read',
    'approvals:write', 'audit:read', 'reports:read', 'campaigns:read', 'campaigns:write'
  ],
  TP_OFFICER: [
    'students:read', 'students:write', 'drives:read', 'drives:write', 'approvals:read',
    'approvals:write', 'audit:read', 'reports:read', 'campaigns:read', 'campaigns:write',
    'eligibility:read', 'eligibility:write'
  ],
  DEPARTMENT_HEAD: [
    'students:read', 'drives:read', 'approvals:read', 'reports:read', 'audit:read'
  ],
  RECRUITER: [
    'candidates:search', 'candidates:read', 'drives:read'
  ],
  STUDENT: [
    'profile:read', 'profile:write', 'skills:read', 'skills:write', 'mock:take',
    'drives:read', 'learning:read', 'learning:write', 'consent:write'
  ]
};

// Main Auth Middleware: extracts user & attaches scoped DB DAL
function authenticate(req, res, next) {
  // 1. Get token from cookie or Authorization header
  const token = (req.cookies && req.cookies.auth_token) || 
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
      ? req.headers.authorization.substring(7) 
      : null);

  if (token) {
    const session = authService.validateSession(token);
    if (session) {
      req.user = {
        id: session.user_id,
        name: session.name,
        email: session.email,
        role: session.role,
        status: session.status,
        tenantId: session.tenant_id
      };
      // Student details if student
      if (session.role === 'STUDENT') {
        const student = dbService.db.prepare('SELECT * FROM students WHERE user_id = ?').get(session.user_id);
        if (student) req.student = student;
      }
    }
  }

  // 2. Resolve Tenant: user's tenant if logged in, else header, else query, else default
  const requestedTenant = req.headers['x-tenant-id'] || req.query.tenantId;
  if (req.user && req.user.role === 'UNIVERSITY_ADMIN') {
    // University Admin can explicitly switch view to any tenant
    req.tenantId = requestedTenant || req.user.tenantId || 'vpcoe-mumbai';
  } else if (req.user) {
    // Strictly isolate user to their assigned tenant!
    req.tenantId = req.user.tenantId;
  } else {
    // Unauthenticated requests (e.g. login/demo selection)
    req.tenantId = requestedTenant || 'vpcoe-mumbai';
  }

  // 3. Attach tenant-isolated DAL
  req.db = dbService.forTenant(req.tenantId, req.user ? req.user.role : 'STUDENT');

  next();
}

// Guard: Require authenticated user
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to continue.'
    });
  }
  next();
}

// Guard: Require specific roles
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'UNIVERSITY_ADMIN') {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Your role (${req.user.role}) does not have permission to access this resource.`,
        requiredRoles: allowedRoles
      });
    }
    next();
  };
}

// Guard: Recruiter approval check
function requireApprovedRecruiter(req, res, next) {
  if (req.user.role === 'RECRUITER' && req.user.status !== 'ACTIVE') {
    return res.status(403).json({
      success: false,
      isPendingApproval: true,
      message: 'Access Pending: Your recruiter account is currently awaiting verification and approval by the T&P Officer.'
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireAuth,
  requireRole,
  requireApprovedRecruiter,
  PERMISSIONS
};
