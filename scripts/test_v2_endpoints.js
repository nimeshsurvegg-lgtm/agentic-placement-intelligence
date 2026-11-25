const http = require('http');

const endpoints = [
  '/api/students/STU-VPCOE-042/readiness-score',
  '/api/career-roles',
  '/api/students/STU-VPCOE-042/portfolio',
  '/api/interview/questions?role=backend',
  '/api/opportunities',
  '/api/students/STU-VPCOE-042/applications-kanban',
  '/api/alumni/mentors',
  '/api/students/STU-VPCOE-042/calendar-events',
  '/api/tpo/risk-queue',
  '/api/crm/companies',
  '/api/workflows/history'
];

async function check() {
  for (const ep of endpoints) {
    try {
      const res = await fetch('http://localhost:3000' + ep);
      const json = await res.json();
      console.log(ep, '=> Status:', res.status, 'Success:', json.success);
    } catch (e) {
      console.error(ep, '=> Error:', e.message);
    }
  }
}

check();
