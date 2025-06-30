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
};

export default RecommendationSessionRepository;