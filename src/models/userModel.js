const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await db.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async create({ username, email, password, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, hashedPassword, role]
    );
    
    return result.rows[0];
  }

  static async update(id, userData) {
    const { username, email, password, role } = userData;
    let query = 'UPDATE users SET ';
    const values = [];
    const queryParts = [];
    
    let paramIndex = 1;
    
    if (username) {
      queryParts.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    
    if (email) {
      queryParts.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      queryParts.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }
    
    if (role) {
      queryParts.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    
    queryParts.push(`updated_at = NOW()`);
    
    query += queryParts.join(', ');
    query += ` WHERE id = $${paramIndex} RETURNING id, username, email, role, created_at, updated_at`;
    values.push(id);
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    return { id };
  }

  static async validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
}

module.exports = User;