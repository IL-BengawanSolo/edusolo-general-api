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

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async setPrimary(place_id, imageId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`UPDATE ${table} SET is_primary = 0 WHERE place_id = ?`, [place_id]);
      const [result] = await conn.query(`UPDATE ${table} SET is_primary = 1 WHERE id = ? AND place_id = ?`, [imageId, place_id]);
      await conn.commit();
      return result.affectedRows > 0;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },
};

export default PlaceImageRepository;
