// tests/users.test.js
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('Usuarios API', () => {
  let adminToken;
  let userToken;
  let testUserId;

  
  beforeAll(async () => {
    
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });

    adminToken = adminResponse.body.token;

   
    const testUserResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser123',
        email: 'testuser123@example.com',
        password: 'password123'
      });

    testUserId = testUserResponse.body.user.id;
    userToken = testUserResponse.body.token;
  });

  afterAll(async () => {
    
    if (testUserId) {
      await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    await db.query("DELETE FROM users WHERE email = 'testuser123@example.com'");
    await db.query("DELETE FROM users WHERE email = 'updated-test@example.com'");
  });

  describe('GET /api/users', () => {
    it('debería obtener todos los usuarios si es admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('debería rechazar la petición si no es admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /api/users/:id', () => {
    it('debería obtener un usuario por ID si es propietario', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(testUserId);
    });

    it('debería obtener cualquier usuario si es admin', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('user');
    });

    it('debería devolver 403 si no es propietario ni admin', async () => {
      
      const anotherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'another@example.com',
          password: 'password123'
        });

      const anotherUserId = anotherUserResponse.body.user.id;
      const anotherUserToken = anotherUserResponse.body.token;

     
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`);

      expect(response.statusCode).toBe(403);

     
      await db.query('DELETE FROM users WHERE id = $1', [anotherUserId]);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('debería actualizar un usuario si es propietario', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          username: 'updated-testuser',
          email: 'updated-test@example.com'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('updated-testuser');
      expect(response.body.user.email).toBe('updated-test@example.com');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('debería eliminar un usuario si es admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testUserId.toString());

      
      testUserId = null;
    });
  });
});