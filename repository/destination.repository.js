import db from "../database/db.js";

const table = "tourist_places";

const Destination = {
  async findAll() {
    const [rows] = await db.query(`SELECT * FROM ${table}`);
    return rows;
  },

  // async findById(id) {
  //   const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  //   return rows[0];
  // },

  async findAllWithRelations() {
    const [rows] = await db.query(`
    SELECT 
      tp.slug,
      tp.name,
      tp.address,
      tp.latitude,
      tp.longitude,
      tp.place_type,
      tp.ticket_price_min,
      tp.ticket_price_max,
      r.name AS region_name,
      GROUP_CONCAT(DISTINCT c.name) AS categories,
      GROUP_CONCAT(DISTINCT ac.name) AS age_categories
    FROM tourist_places tp
    LEFT JOIN regions r ON tp.region_id = r.id
    LEFT JOIN tourist_place_categories tpc ON tp.id = tpc.place_id
    LEFT JOIN categories c ON tpc.category_id = c.id
    LEFT JOIN tourist_place_age_categories tpac ON tp.id = tpac.place_id
    LEFT JOIN age_categories ac ON tpac.age_category_id = ac.id
    GROUP BY tp.id
  `);
    // Optionally, split categories and age_categories into arrays
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await db.query(
      `
    SELECT 
      tp.name,
      tp.address,
      tp.latitude,
      tp.longitude,
      tp.place_type,
      tp.ticket_price_min,
      tp.ticket_price_max,
      tp.description,
      tp.opening_hours,
      tp.ticket_price_info,
      tp.activities,
      tp.facilities,
      tp.website_url,
      r.name AS region_name,
      GROUP_CONCAT(DISTINCT c.name) AS categories,
      GROUP_CONCAT(DISTINCT ac.name) AS age_categories
    FROM tourist_places tp
    LEFT JOIN regions r ON tp.region_id = r.id
    LEFT JOIN tourist_place_categories tpc ON tp.id = tpc.place_id
    LEFT JOIN categories c ON tpc.category_id = c.id
    LEFT JOIN tourist_place_age_categories tpac ON tp.id = tpac.place_id
    LEFT JOIN age_categories ac ON tpac.age_category_id = ac.id
    WHERE tp.slug = ?
    GROUP BY tp.id
  `,
      [slug]
    );
    const row = rows[0];
    if (!row) return null;
    return row;
  },

  async create(data) {
    const {
      uuid,
      slug,
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
      (uuid, slug, name, address, region_id, latitude, longitude, place_type, description, opening_hours, ticket_price_info, ticket_price_min, ticket_price_max, activities, facilities, review_count, average_rating, website_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid,
        slug,
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
        activities,
        facilities,
        review_count || 0,
        average_rating || 0,
        website_url,
      ]
    );
    return { id: result.insertId, ...data };
  },

  async createBulk(destinations) {
    if (!Array.isArray(destinations) || destinations.length === 0) return [];

    const values = destinations.map((data) => [
      data.uuid,
      data.slug,
      data.name,
      data.address,
      data.region_id,
      data.latitude,
      data.longitude,
      data.place_type,
      data.description,
      JSON.stringify(data.opening_hours),
      JSON.stringify(data.ticket_price_info),
      data.ticket_price_min,
      data.ticket_price_max,
      data.activities,
      data.facilities,
      data.review_count || 0,
      data.average_rating || 0,
      data.website_url,
    ]);

    const [result] = await db.query(
      `INSERT INTO ${table} 
    (uuid, slug, name, address, region_id, latitude, longitude, place_type, description, opening_hours, ticket_price_info, ticket_price_min, ticket_price_max, activities, facilities, review_count, average_rating, website_url)
    VALUES ?`,
      [values]
    );
    return { inserted: result.affectedRows };
  },
};

export default Destination;
