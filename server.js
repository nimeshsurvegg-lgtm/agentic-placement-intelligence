// Agentic Placement Intelligence Platform - Express Server
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { authenticate } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Enable CORS, Cookies, and JSON parsing
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Authentication & Tenant Resolution Middleware
app.use(authenticate);

// Mount Auth & API routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for Single Page Application navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`=================================================================`);
  console.log(`🚀 Agentic Placement Intelligence Platform running on http://localhost:${PORT}`);
  console.log(`🏛️ Tenant Context: Premier Technological Institute (Institutional Node)`);
  console.log(`🔒 Security Layer: India DPDP Act 2023 + SHA-256 Tamper-Evident Ledger`);
  console.log(`🤖 AI Engine: "AI Helps, Human Decides" Governance Active`);
  console.log(`=================================================================`);
});

module.exports = { app, server };
