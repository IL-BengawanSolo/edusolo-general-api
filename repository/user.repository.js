import db from "../database/db.js";

const users_table = "users";

const UserRepository = {
  async findByEmail(email) {
    const [rows] = await db.query(`SELECT * FROM ${users_table} WHERE email = ?`, [
      email,
    ]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${users_table} WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async create({ uuid, first_name, last_name, email, password_hash }) {
    await db.query(
      `INSERT INTO ${users_table} (uuid, first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?, ?)`,
      [uuid, first_name, last_name || null, email, password_hash]
    );
  },

  async updateLastLoginAt(id, date) {
    await db.query(`UPDATE ${users_table} SET last_login_at = ? WHERE id = ?`, [
      date,
      id,
    ]);
  },

  async hasRecommendationSession(userId) {
    const [rows] = await db.query(
      "SELECT 1 FROM recommendation_sessions WHERE user_id = ? LIMIT 1",
      [userId]
    );
    return rows.length > 0;
  },
};
export default UserRepository;
