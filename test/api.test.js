const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

// Set test environment
process.env.NODE_ENV = 'test';
const TEST_DB_PATH = path.join(__dirname, 'test.db');
process.env.DB_PATH = TEST_DB_PATH;

const createApp = require('../src/app');
const { getDatabase, closeDatabase } = require('../src/db/database');
const { seedDatabase } = require('../seed');

let server;
let baseUrl;

describe('Internship Board REST API Test Suite', () => {
  before(async () => {
    // Clean up test db if left over
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch (e) {}
    }

    // Seed test database
    seedDatabase(TEST_DB_PATH);

    // Start test server on random free port
    const app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch (e) {}
    }
  });

  describe('Health Check Endpoint', () => {
    test('GET /api/health returns 200 and healthy status', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.status, 'success');
      assert.equal(body.data.status, 'healthy');
      assert.ok(typeof body.data.uptime === 'number');
      assert.ok(body.data.timestamp);
    });
  });

  describe('GET /api/internships (List & Filters)', () => {
    test('returns standard envelope with pagination and 5 seeded records', async () => {
      const res = await fetch(`${baseUrl}/api/internships`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.status, 'success');
      assert.ok(Array.isArray(body.data));
      assert.equal(body.data.length, 5);

      // Verify pagination envelope
      assert.deepEqual(body.pagination, {
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1
      });

      // Verify record structure
      const item = body.data[0];
      assert.ok(item.id.startsWith('INT-'));
      assert.ok(Array.isArray(item.skills));
      assert.ok(typeof item.openings === 'number');
    });

    test('supports pagination with page and limit parameters', async () => {
      const res = await fetch(`${baseUrl}/api/internships?page=1&limit=2`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.length, 2);
      assert.equal(body.pagination.page, 1);
      assert.equal(body.pagination.limit, 2);
      assert.equal(body.pagination.total, 5);
      assert.equal(body.pagination.totalPages, 3);
    });

    test('filters by domain', async () => {
      const res = await fetch(`${baseUrl}/api/internships?domain=Full%20Stack%20Development`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.length, 2);
      assert.ok(body.data.every(d => d.domain === 'Full Stack Development'));
    });

    test('filters by mode', async () => {
      const res = await fetch(`${baseUrl}/api/internships?mode=Remote`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.length, 3);
      assert.ok(body.data.every(d => d.mode === 'Remote'));
    });

    test('searches by keyword in title/skills/location', async () => {
      const res = await fetch(`${baseUrl}/api/internships?search=Figma`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.length, 1);
      assert.equal(body.data[0].id, 'INT-103');
    });

    test('filters by specific skill', async () => {
      const res = await fetch(`${baseUrl}/api/internships?skill=SQL`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.length, 2); // INT-102 and INT-104 have SQL
      assert.ok(body.data.some(d => d.id === 'INT-102'));
      assert.ok(body.data.some(d => d.id === 'INT-104'));
    });
  });

  describe('GET /api/internships/:id', () => {
    test('returns single internship for valid ID', async () => {
      const res = await fetch(`${baseUrl}/api/internships/INT-101`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.status, 'success');
      assert.equal(body.data.id, 'INT-101');
      assert.equal(body.data.title, 'Frontend Intern');
      assert.deepEqual(body.data.skills, ['HTML', 'CSS', 'JavaScript']);
      assert.equal(body.data.openings, 3);
    });

    test('returns 404 error envelope when ID not found', async () => {
      const res = await fetch(`${baseUrl}/api/internships/INT-999`);
      const body = await res.json();

      assert.equal(res.status, 404);
      assert.equal(body.status, 'error');
      assert.ok(body.message.includes('not found'));
    });
  });

  describe('POST /api/internships (Create)', () => {
    test('creates new internship with auto-generated ID', async () => {
      const newRole = {
        title: 'Cloud DevOps Intern',
        domain: 'Cloud Computing',
        mode: 'Remote',
        location: 'Bengaluru',
        skills: ['AWS', 'Docker', 'Terraform'],
        openings: 2
      };

      const res = await fetch(`${baseUrl}/api/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      });
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.status, 'success');
      assert.equal(body.data.id, 'INT-106');
      assert.equal(body.data.title, 'Cloud DevOps Intern');
      assert.deepEqual(body.data.skills, ['AWS', 'Docker', 'Terraform']);
      assert.equal(body.data.openings, 2);
    });

    test('creates new internship with explicit custom ID', async () => {
      const customRole = {
        id: 'INT-200',
        title: 'Machine Learning Intern',
        domain: 'Artificial Intelligence',
        mode: 'Hybrid',
        location: 'Hyderabad',
        skills: ['Python', 'PyTorch', 'NumPy'],
        openings: 1
      };

      const res = await fetch(`${baseUrl}/api/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customRole)
      });
      const body = await res.json();

      assert.equal(res.status, 201);
      assert.equal(body.data.id, 'INT-200');
    });

    test('fails with 409 Conflict if ID already exists', async () => {
      const duplicateRole = {
        id: 'INT-101',
        title: 'Another Role',
        domain: 'UI/UX',
        mode: 'Remote',
        location: 'India',
        skills: ['Figma'],
        openings: 1
      };

      const res = await fetch(`${baseUrl}/api/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateRole)
      });
      const body = await res.json();

      assert.equal(res.status, 409);
      assert.equal(body.status, 'error');
    });

    test('fails with 400 Bad Request if validation errors exist', async () => {
      const invalidRole = {
        title: '',
        mode: 'InvalidMode',
        skills: []
      };

      const res = await fetch(`${baseUrl}/api/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRole)
      });
      const body = await res.json();

      assert.equal(res.status, 400);
      assert.equal(body.status, 'error');
      assert.equal(body.message, 'Validation failed');
      assert.ok(Array.isArray(body.errors));
      assert.ok(body.errors.some(e => e.field === 'title'));
      assert.ok(body.errors.some(e => e.field === 'mode'));
      assert.ok(body.errors.some(e => e.field === 'location'));
      assert.ok(body.errors.some(e => e.field === 'skills'));
    });
  });

  describe('PUT /api/internships/:id (Full Update)', () => {
    test('updates all fields of an existing internship', async () => {
      const updatedData = {
        title: 'Lead Frontend Intern',
        domain: 'Full Stack Development',
        mode: 'Remote',
        location: 'Remote, India',
        skills: ['React', 'TypeScript', 'Next.js'],
        openings: 5
      };

      const res = await fetch(`${baseUrl}/api/internships/INT-101`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.status, 'success');
      assert.equal(body.data.id, 'INT-101');
      assert.equal(body.data.title, 'Lead Frontend Intern');
      assert.deepEqual(body.data.skills, ['React', 'TypeScript', 'Next.js']);
      assert.equal(body.data.openings, 5);
    });

    test('returns 404 when updating non-existent internship', async () => {
      const res = await fetch(`${baseUrl}/api/internships/INT-999`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Not Found',
          domain: 'Tech',
          mode: 'Remote',
          location: 'Anywhere',
          skills: ['Coding'],
          openings: 1
        })
      });
      const body = await res.json();

      assert.equal(res.status, 404);
      assert.equal(body.status, 'error');
    });
  });

  describe('PATCH /api/internships/:id (Partial Update)', () => {
    test('partially updates only specified fields', async () => {
      const patchData = {
        openings: 8,
        mode: 'Hybrid'
      };

      const res = await fetch(`${baseUrl}/api/internships/INT-102`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData)
      });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.status, 'success');
      assert.equal(body.data.id, 'INT-102');
      assert.equal(body.data.openings, 8);
      assert.equal(body.data.mode, 'Hybrid');
      // Preserved original title and domain
      assert.equal(body.data.title, 'API Engineering Intern');
      assert.equal(body.data.domain, 'Full Stack Development');
    });

    test('returns 400 if PATCH body is empty', async () => {
      const res = await fetch(`${baseUrl}/api/internships/INT-102`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const body = await res.json();

      assert.equal(res.status, 400);
      assert.equal(body.status, 'error');
    });
  });

  describe('DELETE /api/internships/:id', () => {
    test('deletes internship by ID', async () => {
      const res = await fetch(`${baseUrl}/api/internships/INT-105`, {
        method: 'DELETE'
      });
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.status, 'success');
      assert.equal(body.data.id, 'INT-105');
      assert.equal(body.data.deleted, true);

      // Verify it is gone
      const checkRes = await fetch(`${baseUrl}/api/internships/INT-105`);
      assert.equal(checkRes.status, 404);
    });

    test('returns 404 when deleting already deleted or non-existent ID', async () => {
      const res = await fetch(`${baseUrl}/api/internships/INT-105`, {
        method: 'DELETE'
      });
      const body = await res.json();

      assert.equal(res.status, 404);
      assert.equal(body.status, 'error');
    });
  });

  describe('404 & Centralized Error Envelope', () => {
    test('returns predictable 404 envelope for non-existent route', async () => {
      const res = await fetch(`${baseUrl}/api/unknown-route`);
      const body = await res.json();

      assert.equal(res.status, 404);
      assert.equal(body.status, 'error');
      assert.ok(body.message.includes('Route not found'));
    });
  });
});
