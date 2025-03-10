const db = require('../config/database');

class Category {
  static async findAll() {
    const result = await db.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const result = await db.query(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );
    return result.rows[0];
  }
}

module.exports = Category;