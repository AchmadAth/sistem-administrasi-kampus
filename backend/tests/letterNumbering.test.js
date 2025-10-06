const request = require('supertest');
const app = require('../server');
const { syncDatabase, User, Letter } = require('../models');
const { generateLetterNumber } = require('../utils/letterNumbering');

let supervisorToken, studentToken, studentId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await syncDatabase(true);

  // Create supervisor
  const supervisorResponse = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'supervisor@test.com',
      password: 'SupervisorPass123!',
      name: 'Test Supervisor',
      role: 'supervisor',
      nip: 'SUP001',
    });
  supervisorToken = supervisorResponse.body.data.token;

  // Create student
  const studentResponse = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'student@test.com',
      password: 'StudentPass123!',
      name: 'Test Student',
      role: 'student',
      nim: '2021001',
    });
  studentToken = studentResponse.body.data.token;
  studentId = studentResponse.body.data.user.id;
});

afterAll(async () => {
  await Letter.destroy({ where: {} });
  await User.destroy({ where: {} });
});

describe('Letter Numbering System Tests', () => {
  describe('Automatic Letter Number Generation', () => {
    test('Should generate letter number in correct format', async () => {
      const letterNumber = await generateLetterNumber('SKA');
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      expect(letterNumber).toMatch(new RegExp(`^${year}/${month}/SKA/\\d{3}$`));
      expect(letterNumber).toContain('/001'); // First letter should be 001
    });

    test('Should increment sequential number correctly', async () => {
      // Create first letter with number
      const firstNumber = await generateLetterNumber('SKPI');
      await Letter.create({
        letterType: 'SKPI',
        userId: studentId,
        status: 'approved',
        letterNumber: firstNumber,
        additionalData: {},
      });
      
      // Generate second number
      const secondNumber = await generateLetterNumber('SKPI');
      
      expect(firstNumber).toContain('/001');
      expect(secondNumber).toContain('/002');
    });

    test('Should reset numbering for different letter types', async () => {
      const skaNumber = await generateLetterNumber('SKA');
      const skpiNumber = await generateLetterNumber('SKPI');
      
      // Both should have their own sequence
      expect(skaNumber).toContain('SKA');
      expect(skpiNumber).toContain('SKPI');
    });
  });

  describe('Auto-assign Number on Approval', () => {
    let letterId;

    beforeEach(async () => {
      // Create a letter
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

    test('Should auto-assign letter number when approved', async () => {
      const response = await request(app)
        .put(`/api/letters/${letterId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.data.letter.letterNumber).toBeDefined();
      expect(response.body.data.letter.letterNumber).toMatch(/^\d{4}\/\d{2}\/SKMHS\/\d{3}$/);
    });

    test('Should not assign number when rejected', async () => {
      const response = await request(app)
        .put(`/api/letters/${letterId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          status: 'rejected',
          rejectionReason: 'Test rejection',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.letter.letterNumber).toBeNull();
    });
  });

  describe('Letter Number Management', () => {
    let letterId;

    beforeEach(async () => {
      // Create and approve a letter
      const createResponse = await request(app)
        .post('/api/letters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          letterType: 'SKMHS',
          purpose: 'Test',
          additionalData: { keperluan: 'Test' },
        });
      letterId = createResponse.body.data.letter.id;

      await request(app)
        .put(`/api/letters/${letterId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ status: 'approved' });
    });

    test('Supervisor should cancel letter number', async () => {
      const response = await request(app)
        .put(`/api/letters/${letterId}/number/cancel`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.letter.letterNumber).toBeNull();
    });

    test('Supervisor should edit letter number', async () => {
      const newNumber = '2025/12/SKMHS/999';
      
      const response = await request(app)
        .put(`/api/letters/${letterId}/number/edit`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ letterNumber: newNumber });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.letter.letterNumber).toBe(newNumber);
    });

    test('Should not allow duplicate letter numbers', async () => {
      // Get the current letter number
      const letterResponse = await request(app)
        .get(`/api/letters/${letterId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);
      
      const existingNumber = letterResponse.body.data.letter.letterNumber;

      // Create another letter
      const createResponse = await request(app)
        .post('/api/letters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          letterType: 'SKA',
          purpose: 'Test',
          additionalData: { semester: '5', tahun_akademik: '2024/2025' },
        });
      const newLetterId = createResponse.body.data.letter.id;

      await request(app)
        .put(`/api/letters/${newLetterId}/status`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ status: 'approved' });

      // Try to set duplicate number
      const response = await request(app)
        .put(`/api/letters/${newLetterId}/number/edit`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ letterNumber: existingNumber });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already in use');
    });

    test('Student should not be able to edit letter number', async () => {
      const response = await request(app)
        .put(`/api/letters/${letterId}/number/edit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ letterNumber: '2025/12/SKMHS/888' });

      expect(response.status).toBe(403);
    });
  });

  describe('Numbering Statistics', () => {
    beforeAll(async () => {
      // Create multiple letters for statistics
      for (let i = 0; i < 3; i++) {
        const createResponse = await request(app)
          .post('/api/letters')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            letterType: 'SKA',
            purpose: 'Test',
            additionalData: { semester: '5', tahun_akademik: '2024/2025' },
          });

        await request(app)
          .put(`/api/letters/${createResponse.body.data.letter.id}/status`)
          .set('Authorization', `Bearer ${supervisorToken}`)
          .send({ status: 'approved' });
      }
    });

    test('Should get numbering statistics', async () => {
      const response = await request(app)
        .get('/api/letters/stats/numbering')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('year');
      expect(response.body.data).toHaveProperty('totalLetters');
      expect(response.body.data).toHaveProperty('byType');
      expect(response.body.data.totalLetters).toBeGreaterThan(0);
    });

    test('Should filter statistics by year', async () => {
      const currentYear = new Date().getFullYear();
      
      const response = await request(app)
        .get(`/api/letters/stats/numbering?year=${currentYear}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.year).toBe(currentYear);
    });

    test('Student should not access numbering statistics', async () => {
      const response = await request(app)
        .get('/api/letters/stats/numbering')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });
});
