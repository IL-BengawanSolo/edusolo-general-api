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

 async findDestinationsBySessionId(session_id) {
    const [rows] = await db.query(
      `SELECT 
        rr.id AS recommendation_result_id,
        rr.session_id,
        rr.place_id,
        rr.score,
        tp.uuid,
        tp.slug,
        tp.name,
        tp.ticket_price_min,
        tp.ticket_price_max,
        r.name AS region_name,
        GROUP_CONCAT(DISTINCT pt.name) AS place_types,
        GROUP_CONCAT(DISTINCT c.name) AS categories,
        GROUP_CONCAT(DISTINCT ac.name) AS age_categories
      FROM ${table} rr
      JOIN tourist_places tp ON rr.place_id = tp.id
      LEFT JOIN regions r ON tp.region_id = r.id
      LEFT JOIN tourist_place_types tpt ON tp.id = tpt.place_id
      LEFT JOIN place_types pt ON tpt.place_type_id = pt.id
      LEFT JOIN tourist_place_categories tpc ON tp.id = tpc.place_id
      LEFT JOIN categories c ON tpc.category_id = c.id
      LEFT JOIN tourist_place_age_categories tpac ON tp.id = tpac.place_id
      LEFT JOIN age_categories ac ON tpac.age_category_id = ac.id
      WHERE rr.session_id = ?
      GROUP BY rr.id
      ORDER BY rr.score DESC`,
      [session_id]
    );
    return rows;
  },
};

export default RecommendationResultRepository;