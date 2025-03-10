const db = require('../config/database');

class Product {
  static async findById(id) {
    const result = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findLatest() {
    const result = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC
       LIMIT 1`
    );
    return result.rows[0];
  }

  static async findAll(limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async findByCategory(categorySlug, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE c.slug = $1
       ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
      [categorySlug, limit, offset]
    );
    return result.rows;
  }

  static async create({ name, price, quantity, short_description, full_description, image_url, category_id, brand, game_type }) {
    const result = await db.query(
      `INSERT INTO products (name, price, quantity, short_description, full_description, image_url, category_id, brand, game_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, price, quantity, short_description, full_description, image_url, category_id, brand, game_type]
    );
    return result.rows[0];
  }

  static async update(id, productData) {
    const { name, price, quantity, short_description, full_description, image_url, category_id, brand, game_type } = productData;
    let query = 'UPDATE products SET ';
    const values = [];
    const queryParts = [];

    let paramIndex = 1;

    if (name) {
      queryParts.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (price !== undefined) {
      queryParts.push(`price = $${paramIndex++}`);
      values.push(price);
    }

    if (quantity !== undefined) {
      queryParts.push(`quantity = $${paramIndex++}`);
      values.push(quantity);
    }

    if (short_description) {
      queryParts.push(`short_description = $${paramIndex++}`);
      values.push(short_description);
    }

    if (full_description) {
      queryParts.push(`full_description = $${paramIndex++}`);
      values.push(full_description);
    }

    if (image_url) {
      queryParts.push(`image_url = $${paramIndex++}`);
      values.push(image_url);
    }

    if (category_id !== undefined) {
      queryParts.push(`category_id = $${paramIndex++}`);
      values.push(category_id);
    }

    if (brand !== undefined) {
      queryParts.push(`brand = $${paramIndex++}`);
      values.push(brand);
    }

    if (game_type !== undefined) {
      queryParts.push(`game_type = $${paramIndex++}`);
      values.push(game_type);
    }

    queryParts.push(`updated_at = NOW()`);

    query += queryParts.join(', ');
    query += ` WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    return { id };
  }

  static async findByBrand(brand, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.brand = $1
       ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
      [brand, limit, offset]
    );
    return result.rows;
  }

  static async findByGameType(gameType, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.game_type = $1
       ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
      [gameType, limit, offset]
    );
    return result.rows;
  }

  static async findAllBrands() {
    const result = await db.query(
      'SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL ORDER BY brand'
    );
    return result.rows.map(row => row.brand);
  }

  static async findAllGameTypes() {
    const result = await db.query(
      'SELECT DISTINCT game_type FROM products WHERE game_type IS NOT NULL ORDER BY game_type'
    );
    return result.rows.map(row => row.game_type);
  }
}

module.exports = Product;