import db from "../database/db.js";

const table = "tourist_places";

function getBaseSelect() {
  return `
    SELECT 
      tp.uuid,
      tp.slug,
      tp.name,
      tp.address,
      tp.latitude,
      tp.longitude,
      tp.description,
      tp.ticket_price_min,
      tp.ticket_price_max,
      tp.ticket_price_info,
      tp.activities,
      tp.facilities,
      tp.review_count,
      tp.average_rating,
      tp.website_url,
      r.name AS region_name,
      pt.place_types,
      c.categories,
      ac.age_categories,
      oh.opening_hours
    FROM tourist_places tp
    LEFT JOIN regions r ON tp.region_id = r.id
    LEFT JOIN (
      SELECT tpt.place_id, GROUP_CONCAT(DISTINCT pt.name) AS place_types
      FROM tourist_place_types tpt
      LEFT JOIN place_types pt ON tpt.place_type_id = pt.id
      GROUP BY tpt.place_id
    ) pt ON tp.id = pt.place_id
    LEFT JOIN (
      SELECT tpc.place_id, GROUP_CONCAT(DISTINCT c.name) AS categories
      FROM tourist_place_categories tpc
      LEFT JOIN categories c ON tpc.category_id = c.id
      GROUP BY tpc.place_id
    ) c ON tp.id = c.place_id
    LEFT JOIN (
      SELECT tpac.place_id, GROUP_CONCAT(DISTINCT ac.name) AS age_categories
      FROM tourist_place_age_categories tpac
      LEFT JOIN age_categories ac ON tpac.age_category_id = ac.id
      GROUP BY tpac.place_id
    ) ac ON tp.id = ac.place_id
    LEFT JOIN (
      SELECT 
        oh.place_id, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oh.id,
            'day_of_week', oh.day_of_week,
            'open_time', oh.open_time,
            'close_time', oh.close_time,
            'is_closed', oh.is_closed
          )
        ) AS opening_hours
      FROM opening_hours oh
      GROUP BY oh.place_id
    ) oh ON tp.id = oh.place_id
  `;
}

const Destination = {
  async findAll() {
    const sql = getBaseSelect() + " GROUP BY tp.id";
    const [rows] = await db.query(sql);
    return rows;
  },

  async findBySlug(slug) {
    const sql = getBaseSelect() + " WHERE tp.slug = ? GROUP BY tp.id";
    const [rows] = await db.query(sql, [slug]);
    const row = rows[0];
    if (!row) return null;
    return row;
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
      data.description,
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
      (uuid, slug, name, address, region_id, latitude, longitude, description, ticket_price_info, ticket_price_min, ticket_price_max, activities, facilities, review_count, average_rating, website_url)
      VALUES ?`,
      [values]
    );
    return { inserted: result.affectedRows };
  },

  async searchAndFilter({
    search,
    region_id,
    category_id,
    place_type_id,
    age_category_id,
    price_range,
    sort_by,
  }) {
    let sql = getBaseSelect() + " WHERE 1=1\n";
    const params = [];

    if (search) {
      sql += " AND tp.name LIKE ?";
      params.push(`%${search}%`);
    }
    if (region_id) {
      sql += " AND tp.region_id = ?";
      params.push(region_id);
    }

    if (category_id && Array.isArray(category_id) && category_id.length > 0) {
      const placeholders = category_id.map(() => "?").join(",");
      sql += `
      AND EXISTS (
        SELECT 1 FROM tourist_place_categories tpc
        WHERE tpc.place_id = tp.id AND tpc.category_id IN (${placeholders})
      )
      `;
      params.push(...category_id);
    } else if (category_id) {
      sql += `
      AND EXISTS (
        SELECT 1 FROM tourist_place_categories tpc
        WHERE tpc.place_id = tp.id AND tpc.category_id = ?
      )
      `;
      params.push(category_id);
    }

    if (place_type_id) {
      sql += `
      AND EXISTS (
        SELECT 1 FROM tourist_place_types tpt
        WHERE tpt.place_id = tp.id AND tpt.place_type_id = ?
      )
    `;
      params.push(place_type_id);
    }
    if (age_category_id) {
      sql += `
      AND EXISTS (
        SELECT 1 FROM tourist_place_age_categories tpac
        WHERE tpac.place_id = tp.id AND tpac.age_category_id = ?
      )
    `;
      params.push(age_category_id);
    }

    if (price_range) {
      switch (price_range) {
        case "free":
          sql +=
            " AND (tp.ticket_price_min = 0 OR tp.ticket_price_min IS NULL)";
          break;
        case "lt-10k":
          sql += " AND tp.ticket_price_min > 0 AND tp.ticket_price_min < 10000";
          break;
        case "10-30":
          sql +=
            " AND tp.ticket_price_min >= 10000 AND tp.ticket_price_min <= 30000";
          break;
        case "30-100":
          sql +=
            " AND tp.ticket_price_min > 30000 AND tp.ticket_price_min <= 100000";
          break;
        case "gt-100k":
          sql += " AND tp.ticket_price_min > 100000";
          break;
      }
    }

    let orderBy = "";
    switch (sort_by) {
      case "highest-price":
        orderBy = " ORDER BY tp.ticket_price_min DESC";
        break;
      case "lowest-price":
        orderBy = " ORDER BY tp.ticket_price_min ASC";
        break;
      case "highest-rating":
        orderBy = " ORDER BY tp.average_rating DESC";
        break;
      case "review-count":
        orderBy = " ORDER BY tp.review_count DESC";
        break;
      default:
        orderBy = "";
    }

    sql += " GROUP BY tp.id" + orderBy + " LIMIT 100";

    const [rows] = await db.query(sql, params);
    return rows;
  },
};

export default Destination;
