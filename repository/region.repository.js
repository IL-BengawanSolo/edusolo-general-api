import db from "../database/db.js";

const table = "regions";

const Region = {
  async findAll() {
    const [rows] = await db.query(`SELECT id, name FROM ${table} ORDER BY id`);
    return rows;
  },
};

export default Region;