// Append-only tamper-evident cryptographic audit ledger for Agentic Placement Intelligence Platform
const crypto = require('crypto');

class AuditLedger {
  constructor() {
    this.chain = [];
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: new Date('2026-08-01T00:00:00Z').toISOString(),
      tenantId: 'SYSTEM',
      eventType: 'GENESIS_BLOCK',
      actor: 'SECURITY_KERNEL',
      details: { message: 'Agentic Placement Platform Tamper-Evident Ledger Initialized' },
      previousHash: '0'.repeat(64),
      hash: ''
    };
    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
  }

  calculateHash(block) {
    const content = `${block.index}|${block.timestamp}|${block.tenantId}|${block.eventType}|${block.actor}|${JSON.stringify(block.details)}|${block.previousHash}`;
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  addEntry(tenantId, eventType, actor, details) {
    const prevBlock = this.chain[this.chain.length - 1];
    const newBlock = {
      index: this.chain.length,
      timestamp: new Date().toISOString(),
      tenantId: tenantId || 'GLOBAL',
      eventType,
      actor,
      details,
      previousHash: prevBlock.hash,
      hash: ''
    };
    newBlock.hash = this.calculateHash(newBlock);
    this.chain.push(newBlock);
    return newBlock;
  }

  getEntries(tenantId = null, limit = 50) {
    let filtered = this.chain;
    if (tenantId && tenantId !== 'ALL') {
      filtered = this.chain.filter(b => b.tenantId === tenantId || b.tenantId === 'SYSTEM' || b.tenantId === 'GLOBAL');
    }
    return filtered.slice(-limit).reverse();
  }

  verifyIntegrity(tenantId = null) {
    const issues = [];
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const prev = this.chain[i - 1];

      // Check hash calculation
      const recalculatedHash = this.calculateHash(current);
      if (current.hash !== recalculatedHash) {
        issues.push({
          blockIndex: i,
          reason: 'HASH_MISMATCH',
          expected: recalculatedHash,
          actual: current.hash
        });
      }

      // Check chain linkage
      if (current.previousHash !== prev.hash) {
        issues.push({
          blockIndex: i,
          reason: 'BROKEN_CHAIN_LINK',
          expectedPrevHash: prev.hash,
          actualPrevHash: current.previousHash
        });
      }
    }

    return {
      valid: issues.length === 0,
      totalBlocks: this.chain.length,
      lastBlockHash: this.chain[this.chain.length - 1].hash,
      lastVerifiedAt: new Date().toISOString(),
      issues,
      status: issues.length === 0 ? 'CRYPTOGRAPHICALLY_VERIFIED_TAMPER_FREE' : 'TAMPER_DETECTED'
    };
  }
}

module.exports = new AuditLedger();
