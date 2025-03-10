// tests/products.test.js
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('Productos API', () => {
  let adminToken;
  let testProduct;

  
  beforeAll(async () => {
   
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });

    adminToken = response.body.token;


    await db.query("DELETE FROM products WHERE name LIKE 'Test Product%'");
  });

  afterAll(async () => {
    
    if (testProduct) {
      await db.query('DELETE FROM products WHERE id = $1', [testProduct.id]);
    }
    await db.query("DELETE FROM products WHERE name LIKE 'Test Product%'");
  });

  describe('POST /api/products', () => {
    it('debería crear un nuevo producto si es admin', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          quantity: 10,
          short_description: 'Producto de prueba corto',
          full_description: 'Esta es una descripción completa del producto de prueba'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('id');
      expect(response.body.product.name).toBe('Test Product');
      expect(response.body.product.price).toBe('99.99');

      testProduct = response.body.product;
    });

    it('debería rechazar la creación si faltan campos', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product Incomplete',
          price: 99.99
          
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/products', () => {
    it('debería obtener una lista de productos', async () => {
      const response = await request(app).get('/api/products');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('debería obtener un producto por ID', async () => {
      const response = await request(app).get(`/api/products/${testProduct.id}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product.id).toBe(testProduct.id);
      expect(response.body.product.name).toBe(testProduct.name);
    });

    it('debería devolver 404 para un ID que no existe', async () => {
      const response = await request(app).get('/api/products/9999999');

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('debería actualizar un producto existente si es admin', async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product Updated',
          price: 89.99
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe('Test Product Updated');
      expect(response.body.product.price).toBe('89.99');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('debería eliminar un producto existente si es admin', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testProduct.id.toString());

     
      testProduct = null;
    });
  });
});