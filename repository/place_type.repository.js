import db from "../database/db.js";

const table = "place_types";

const PlaceType = {
  async findAll() {
    const [rows] = await db.query(`SELECT id, name FROM ${table} ORDER BY id`);
    return rows;
  },
};

export default PlaceType;