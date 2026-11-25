// Agentic Placement Intelligence Platform - Authentication & Authorization Service
// Implements bcrypt (cost 12), JWT with httpOnly cookies, rate limiting, and OTP 2FA
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dbService = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'edtech-agentic-placement-security-key-2026';
const JWT_EXPIRES_IN = '8h';
const SESSION_INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes auto-logout
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout window

// In-memory rate limiting map: ip:email -> { attempts, firstAttempt, lockedUntil }
const loginAttempts = new Map();

// In-memory OTP store: userId -> { otp, expiresAt, userPayload }
const pendingOtps = new Map();

class AuthService {
  // 1. Password Hashing & Verification
  hashPassword(plaintext) {
    return bcrypt.hashSync(plaintext, 12);
  }

  comparePassword(plaintext, hash) {
    if (!plaintext || !hash) return false;
    return bcrypt.compareSync(plaintext, hash);
  }

  // 2. Rate Limiting Check
  checkRateLimit(identifier) {
    const now = Date.now();
    const record = loginAttempts.get(identifier);

    if (!record) {
      return { allowed: true, remainingAttempts: RATE_LIMIT_MAX };
    }

    if (record.lockedUntil && record.lockedUntil > now) {
      const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return {
        allowed: false,
        locked: true,
        message: `Account temporarily locked due to excessive failed attempts. Try again in ${waitMinutes} minute(s).`
      };
    }

    // Reset window if expired
    if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
      loginAttempts.delete(identifier);
      return { allowed: true, remainingAttempts: RATE_LIMIT_MAX };
    }

    if (record.attempts >= RATE_LIMIT_MAX) {
      record.lockedUntil = now + RATE_LIMIT_WINDOW_MS;
      return {
        allowed: false,
        locked: true,
        message: `Too many failed attempts (5/15 min). Account locked for 15 minutes.`
      };
    }

    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX - record.attempts };
  }

  recordFailedAttempt(identifier) {
    const now = Date.now();
    const record = loginAttempts.get(identifier) || { attempts: 0, firstAttempt: now };
    record.attempts += 1;
    if (record.attempts >= RATE_LIMIT_MAX) {
      record.lockedUntil = now + RATE_LIMIT_WINDOW_MS;
    }
    loginAttempts.set(identifier, record);
    return record.attempts;
  }

  clearFailedAttempts(identifier) {
    loginAttempts.delete(identifier);
  }

  // 3. Token Generation & Verification
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenant_id,
      status: user.status
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  }

  // 4. Session Persistence in SQLite (Hashed Tokens via SHA-256)
  createSession(user, token, userAgent = '', ipAddress = '') {
    const sessionId = 'SESS-' + crypto.randomBytes(8).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 8 * 3600 * 1000).toISOString();

    dbService.db.prepare(`
      INSERT INTO sessions (id, user_id, tenant_id, token_hash, ip_address, user_agent, last_active_at, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, user.id, user.tenant_id || 'vpcoe-mumbai', tokenHash, ipAddress, userAgent, now, expiresAt, now);

    return sessionId;
  }

  validateSession(token) {
    if (!token) return null;
    const decoded = this.verifyToken(token);
    if (!decoded) return null;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = dbService.db.prepare(`
      SELECT s.*, u.name, u.email, u.role, u.status, u.tenant_id
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token_hash = ?
    `).get(tokenHash);

    if (!session) return null;

    // Check inactivity timeout (30 min)
    const lastActive = new Date(session.last_active_at).getTime();
    if (Date.now() - lastActive > SESSION_INACTIVITY_MS) {
      this.destroySession(token);
      return null;
    }

    // Touch session activity
    const now = new Date().toISOString();
    dbService.db.prepare('UPDATE sessions SET last_active_at = ? WHERE id = ?').run(now, session.id);

    return session;
  }

  destroySession(token) {
    if (!token) return;
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      dbService.db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    } catch (e) {}
  }

  // 5. High-Privilege OTP Generator
  generateOtp(user) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    pendingOtps.set(user.id, { otp, expiresAt, user });
    
    console.log(`\n🔑 [2FA OTP GENERATED] For ${user.email} (${user.role}): ${otp} (Expires in 5 min)\n`);
    return otp;
  }

  verifyOtp(userId, inputOtp) {
    const record = pendingOtps.get(userId);
    if (!record) return { valid: false, message: 'No OTP requested or session expired.' };
    if (Date.now() > record.expiresAt) {
      pendingOtps.delete(userId);
      return { valid: false, message: 'OTP has expired. Please log in again.' };
    }
    if (record.otp !== inputOtp.trim()) {
      return { valid: false, message: 'Invalid 6-digit OTP code.' };
    }
    pendingOtps.delete(userId);
    return { valid: true, user: record.user };
  }

  // 6. Password Reset Token Flow
  createPasswordResetToken(email) {
    const user = dbService.db.prepare('SELECT id, email, name FROM users WHERE email = ?').get(email);
    if (!user) return null;

    const token = crypto.randomBytes(24).toString('hex');
    const resetId = 'PR-' + crypto.randomBytes(8).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins
    const now = new Date().toISOString();

    dbService.db.prepare(`
      INSERT INTO password_resets (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(resetId, user.id, token, expiresAt, now);

    const resetLink = `/reset-password?token=${token}`;
    console.log(`\n🔒 [PASSWORD RESET REQUEST] Email: ${email} | Link: ${resetLink} (Expires in 15 mins)\n`);
    return { token, resetLink, user };
  }

  resetPasswordWithToken(token, newPassword) {
    const reset = dbService.db.prepare(`
      SELECT * FROM password_resets
      WHERE token = ? AND used_at IS NULL
    `).get(token);

    if (!reset) return { success: false, message: 'Invalid or already used password reset link.' };

    const expiresAt = new Date(reset.expires_at).getTime();
    if (Date.now() > expiresAt) {
      return { success: false, message: 'Reset token has expired. Please request a new one.' };
    }

    const newHash = this.hashPassword(newPassword);
    const now = new Date().toISOString();

    dbService.db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, now, reset.user_id);
    dbService.db.prepare('UPDATE password_resets SET used_at = ? WHERE id = ?').run(now, reset.id);

    return { success: true };
  }
}

module.exports = new AuthService();
