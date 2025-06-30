import db from "../database/db.js";

const table = "recommendation_results";

const RecommendationResultRepository = {
  async create({ session_id, place_id, score }) {
    const [result] = await db.query(
      `INSERT INTO ${table} (session_id, place_id, score) VALUES (?, ?, ?)`,
      [session_id, place_id, score]
    );
    return { id: result.insertId, session_id, place_id, score };
  },
};

export default RecommendationResultRepository;
