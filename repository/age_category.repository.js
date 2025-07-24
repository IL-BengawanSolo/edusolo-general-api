import db from "../database/db.js";

const table = "age_categories";

const AgeCategory = {
  async findAll() {
    const [rows] = await db.query(`SELECT id, name FROM ${table} ORDER BY id`);
    return rows;
  },
};

export default AgeCategory;