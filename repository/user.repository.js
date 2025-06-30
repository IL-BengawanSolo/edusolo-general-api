import db from "../database/db.js";

const table = "users";

const UserRepository = {
  async findByEmail(email) {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [
      email,
    ]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async create({ uuid, first_name, last_name, email, password_hash }) {
    await db.query(
      `INSERT INTO ${table} (uuid, first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?, ?)`,
      [uuid, first_name, last_name || null, email, password_hash]
    );
  },

  async updateLastLoginAt(id, date) {
    await db.query(`UPDATE ${table} SET last_login_at = ? WHERE id = ?`, [
      date,
      id,
    ]);
  },
};
export default UserRepository;
