import db from "../database/db.js";

const table = "recommendation_sessions";

const RecommendationSessionRepository = {
  async create({ user_id }) {
    const [result] = await db.query(
      `INSERT INTO ${table} (user_id) VALUES (?)`,
      [user_id]
    );
    return { id: result.insertId, user_id };
  },

  async findLastByUserId(user_id) {
    const [rows] = await db.query(
      `SELECT * FROM ${table} WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [user_id]
    );
    return rows[0] || null;
  },
};

export default RecommendationSessionRepository;
