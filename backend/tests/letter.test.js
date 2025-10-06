const request = require('supertest');
const app = require('../server');
const { syncDatabase, User, Letter } = require('../models');

// Test users
const studentUser = {
  email: 'student@test.com',
  password: 'StudentPass123!',
  name: 'Test Student',
  role: 'student',
  nim: '2021001',
};

const supervisorUser = {
  email: 'supervisor@test.com',
  password: 'SupervisorPass123!',
  name: 'Test Supervisor',
  role: 'supervisor',
  nip: 'SUP001',
};

let studentToken, supervisorToken, studentId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await syncDatabase(true);

  // Register student
  const studentResponse = await request(app)
    .post('/api/auth/register')
    .send(studentUser);
  studentToken = studentResponse.body.data.token;
  studentId = studentResponse.body.data.user.id;

  // Register supervisor
  const supervisorResponse = await request(app)
    .post('/api/auth/register')
    .send(supervisorUser);
  supervisorToken = supervisorResponse.body.data.token;
});

afterAll(async () => {
  await Letter.destroy({ where: {} });
  await User.destroy({ where: {} });
});

describe('Letter Management Tests', () => {
  describe('GET /api/letters/types', () => {
    test('Should get all letter types', async () => {
      const response = await request(app)
        .get('/api/letters/types')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.letterTypes).toBeInstanceOf(Array);
      expect(response.body.data.letterTypes.length).toBeGreaterThan(30);
    });

    test('Should not get letter types without authentication', async () => {
      const response = await request(app)
        .get('/api/letters/types');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/letters', () => {
    test('Should create letter request successfully', async () => {
      const letterData = {
        letterType: 'SKA',
        purpose: 'Untuk keperluan beasiswa',
        additionalData: {
          semester: '5',
          tahun_akademik: '2024/2025',
        },
      };

      const response = await request(app)
        .post('/api/letters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(letterData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.letter.letterType).toBe('SKA');
      expect(response.body.data.letter.status).toBe('pending');
      expect(response.body.data.letterTypeInfo).toBeDefined();
    });

    test('Should not create letter with missing required fields', async () => {
      const letterData = {
        letterType: 'SKA',
        purpose: 'Test',
        additionalData: {
          // Missing semester and tahun_akademik
        },
      };

      const response = await request(app)
        .post('/api/letters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(letterData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.missingFields).toBeDefined();
    });

    test('Should not create letter with invalid type', async () => {
      const letterData = {
        letterType: 'INVALID',
        purpose: 'Test',
      };

      const response = await request(app)
        .post('/api/letters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(letterData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid letter type');
    });

    test('Should not allow non-student to create letter', async () => {
      const letterData = {
        letterType: 'SKA',
        purpose: 'Test',
        additionalData: {
          semester: '5',
          tahun_akademik: '2024/2025',
        },
      };

      const response = await request(app)
        .post('/api/letters')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send(letterData);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/letters', () => {
    test('Student should get their own letters', async () => {
      const response = await request(app)
        .get('/api/letters')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.letters).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('Supervisor should get all letters', async () => {
      const response = await request(app)
        .get('/api/letters')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.letters).toBeInstanceOf(Array);
    });

    test('Should filter letters by status', async () => {
      const response = await request(app)
        .get('/api/letters?status=pending')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/letters/:id', () => {
    let letterId;

    beforeAll(async () => {
      // Create a letter for testing
      const response = await request(app)
        .post('/api/letters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          letterType: 'SKMHS',
          purpose: 'Test purpose',
          additionalData: {
            keperluan: 'Testing',
          },
        });
      letterId = response.body.data.letter.id;
    });

    test('Should get letter by ID', async () => {
      const response = await request(app)
        .get(`/api/letters/${letterId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.letter.id).toBe(letterId);
    });

    test('Should return 404 for non-existent letter', async () => {
      const response = await request(app)
        .get('/api/letters/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/letters/:id/status', () => {
    let letterId;

    beforeEach(async () => {
      // Create a new letter for each test
      const response = await request(app)
        .post('/api/letters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          letterType: 'SKMHS',
          purpose: 'Test purpose',
          additionalData: {
            keperluan: 'Testing',
          },
        });
      letterId = response.body.data.letter.id;
    });

    test('Supervisor should approve letter', async () => {
      const response = await request(app)
        .put(`/api/letters/${letterId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.letter.status).toBe('approved');
      expect(response.body.data.letter.approvedBy).toBeDefined();
    });

    test('Supervisor should reject letter with reason', async () => {
      const response = await request(app)
        .put(`/api/letters/${letterId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          status: 'rejected',
          rejectionReason: 'Data tidak lengkap',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.letter.status).toBe('rejected');
      expect(response.body.data.letter.rejectionReason).toBe('Data tidak lengkap');
    });

    test('Should not reject without reason', async () => {
      const response = await request(app)
        .put(`/api/letters/${letterId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ status: 'rejected' });

      expect(response.status).toBe(400);
    });

    test('Student should not be able to approve letter', async () => {
      const response = await request(app)
        .put(`/api/letters/${letterId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/letters/:id', () => {
    let letterId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/letters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          letterType: 'SKMHS',
          purpose: 'Test purpose',
          additionalData: {
            keperluan: 'Testing',
          },
        });
      letterId = response.body.data.letter.id;
    });

    test('Student should delete their own pending letter', async () => {
      const response = await request(app)
        .delete(`/api/letters/${letterId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Should not delete approved letter', async () => {
      // First approve the letter
      await request(app)
        .put(`/api/letters/${letterId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ status: 'approved' });

      // Try to delete
      const response = await request(app)
        .delete(`/api/letters/${letterId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('pending');
    });
  });
});
