const request = require('supertest');
const app = require('../server');
const { syncDatabase, User } = require('../models');

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPass123!',
  name: 'Test User',
  role: 'student',
  nim: '2021001',
};

const adminUser = {
  email: 'admin@example.com',
  password: 'AdminPass123!',
  name: 'Admin User',
  role: 'admin',
};

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  // Sync database with force to clear data
  await syncDatabase(true);
});

afterAll(async () => {
  // Clean up
  await User.destroy({ where: {} });
});

describe('Authentication Tests', () => {
  describe('POST /api/auth/register', () => {
    test('TC-AUTH-001: Should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');
    });

    test('TC-AUTH-002: Should not register user with duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already registered');
    });

    test('TC-AUTH-003: Should not register user with invalid data', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: '123', // too short
        name: '',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    test('TC-AUTH-010: Should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    test('TC-AUTH-014: Should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('TC-AUTH-015: Should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      authToken = response.body.data.token;
    });

    test('TC-AUTH-020: Should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    test('TC-AUTH-021: Should not access protected route without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    test('TC-AUTH-023: Should not access protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      authToken = response.body.data.token;
    });

    test('TC-AUTH-030: Should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout successful');
    });

    test('TC-AUTH-031: Should not logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Role-Based Access Control', () => {
    let studentToken, adminToken;

    beforeAll(async () => {
      // Register admin
      const adminResponse = await request(app)
        .post('/api/auth/register')
        .send(adminUser);
      adminToken = adminResponse.body.data.token;

      // Login student
      const studentResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      studentToken = studentResponse.body.data.token;
    });

    test('TC-RBAC-001: Student should access their own profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('student');
    });

    test('TC-RBAC-004: Admin should access their profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('admin');
    });
  });
});

describe('Health Check', () => {
  test('Should return server status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Server is running');
  });
});
