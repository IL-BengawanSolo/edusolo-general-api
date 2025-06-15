import db from "../database/db.js";

const table = "tourist_places";

const Destination = {
  async findAll() {
    const [rows] = await db.query(`SELECT * FROM ${table}`);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return rows[0];
  },

  async create(data) {
    const {
      uuid, // already generated from service
      name,
      address,
      region_id,
      latitude,
      longitude,
      place_type,
      description,
      opening_hours,
      ticket_price_info,
      ticket_price_min,
      ticket_price_max,
      activities,
      facilities,
      review_count,
      average_rating,
      website_url,
    } = data;

    const [result] = await db.query(
      `INSERT INTO ${table} 
      (uuid, name, address, region_id, latitude, longitude, place_type, description, opening_hours, ticket_price_info, ticket_price_min, ticket_price_max, activities, facilities, review_count, average_rating, website_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid,
        name,
        address,
        region_id,
        latitude,
        longitude,
        place_type,
        description,
        JSON.stringify(opening_hours),
        JSON.stringify(ticket_price_info),
        ticket_price_min,
        ticket_price_max,
        JSON.stringify(activities),
        JSON.stringify(facilities),
        review_count || 0,
        average_rating || 0,
        website_url,
      ]
    );
    return { id: result.insertId, ...data };
  },
};

export default Destination;