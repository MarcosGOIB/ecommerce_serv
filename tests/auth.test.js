// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('Autenticación API', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    
    await db.query("DELETE FROM users WHERE email = 'test@example.com'");
  });

  afterAll(async () => {
    await db.query("DELETE FROM users WHERE email = 'test@example.com'");
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.username).toBe('testuser');

      testUser = response.body.user;
      authToken = response.body.token;
    });

    it('debería rechazar un registro con email duplicado', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('email ya está registrado');
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería iniciar sesión con credenciales correctas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('debería rechazar el inicio de sesión con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Credenciales inválidas');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('debería obtener el perfil del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('debería rechazar solicitudes sin token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.statusCode).toBe(403);
    });
  });
});