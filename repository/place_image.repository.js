import db from "../database/db.js";

const table = "place_images";

const PlaceImageRepository = {
  async findByPlaceId(place_id) {
    const [rows] = await db.query(
      `SELECT id, image_url, is_primary FROM ${table} WHERE place_id = ? ORDER BY is_primary DESC, uploaded_at ASC`,
      [place_id]
    );
    return rows;
  },

  async create({ place_id, image_url, is_primary = false }) {
    const [result] = await db.query(
      `INSERT INTO ${table} (place_id, image_url, is_primary) VALUES (?, ?, ?)`,
      [place_id, image_url, is_primary]
    );
    return { id: result.insertId, place_id, image_url, is_primary };
  },

  async deleteById(id) {
    const [result] = await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  },

  async deleteByPlaceId(place_id) {
    const [result] = await db.query(`DELETE FROM ${table} WHERE place_id = ?`, [
      place_id,
    ]);
    return result.affectedRows > 0;
  },
};

export default PlaceImageRepository;
