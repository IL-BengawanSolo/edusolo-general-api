import db from "../database/db.js";

const table = "tourist_places";

function getBaseSelect() {
  return `
    SELECT 
      tp.uuid,
      tp.slug,
      tp.name,
      tp.address,
      tp.region_id,
      tp.latitude,
      tp.longitude,
      tp.description,
      tp.ticket_price_min,
      tp.ticket_price_max,
      tp.ticket_price_info,
      GROUP_CONCAT(DISTINCT a.name) AS activities,
      GROUP_CONCAT(DISTINCT f.name) AS facilities,
      tp.review_count,
      tp.average_rating,
      tp.website_url,
      r.name AS region_name,
      pt.place_types,
      c.categories,
      ac.age_categories,
      oh.opening_hours,
      pi.thumbnail_url
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
    LEFT JOIN (
      SELECT place_id, MIN(image_url) AS thumbnail_url
      FROM place_images
      WHERE is_primary = 1
      GROUP BY place_id
    ) pi ON tp.id = pi.place_id
    LEFT JOIN tourist_place_activities tpa ON tp.id = tpa.place_id
    LEFT JOIN activities a ON tpa.activity_id = a.id
    LEFT JOIN tourist_place_facilities tpf ON tp.id = tpf.place_id
    LEFT JOIN facilities f ON tpf.facility_id = f.id
  `;
}

const Destination = {
  async findAll({ page = 1, limit = 20 } = {}) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;
    const sql = getBaseSelect() + " GROUP BY tp.id LIMIT ? OFFSET ?";
    const [rows] = await db.query(sql, [safeLimit, offset]);
    return rows;
  },

  async findByUuid(uuid) {
    const [rows] = await db.query(
      `SELECT id, slug FROM ${table} WHERE uuid = ? LIMIT 1`,
      [uuid]
    );
    return rows[0] || null;
  },

  async findByUuidFull(uuid) {
    const sql = getBaseSelect() + " WHERE tp.uuid = ? GROUP BY tp.id";
    const [rows] = await db.query(sql, [uuid]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const sql = getBaseSelect() + " WHERE tp.slug = ? GROUP BY tp.id";
    const [rows] = await db.query(sql, [slug]);
    const row = rows[0];
    if (!row) return null;
    return row;
  },

  async updateByUuid(uuid, data) {
    const allowed = ["name", "slug", "address", "region_id", "latitude", "longitude", "description", "ticket_price_info", "ticket_price_min", "ticket_price_max", "review_count", "average_rating", "website_url"];
    const fields = [];
    const vals = [];
    for (const k of allowed) {
      if (data[k] !== undefined) {
        fields.push(`${k} = ?`);
        vals.push(k === "ticket_price_info" ? JSON.stringify(data[k]) : data[k]);
      }
    }
    if (!fields.length) return this.findByUuidFull(uuid);
    vals.push(uuid);
    await db.query(`UPDATE ${table} SET ${fields.join(", ")} WHERE uuid = ?`, vals);
    return this.findByUuidFull(uuid);
  },

  async deleteByUuid(uuid) {
    const [result] = await db.query(`DELETE FROM ${table} WHERE uuid = ?`, [uuid]);
    return result.affectedRows > 0;
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO ${table}
      (uuid, slug, name, address, region_id, latitude, longitude, description, ticket_price_info, ticket_price_min, ticket_price_max, review_count, average_rating, website_url)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.uuid,
        data.slug,
        data.name,
        data.address,
        data.region_id,
        data.latitude,
        data.longitude,
        data.description,
        JSON.stringify(data.ticket_price_info || null),
        data.ticket_price_min ?? null,
        data.ticket_price_max ?? null,
        data.review_count || 0,
        data.average_rating || 0,
        data.website_url || null,
      ]
    );
    return { id: result.insertId, uuid: data.uuid, slug: data.slug };
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
      JSON.stringify(data.ticket_price_info || null),
      data.ticket_price_min ?? null,
      data.ticket_price_max ?? null,
      data.review_count || 0,
      data.average_rating || 0,
      data.website_url || null,
    ]);

    const [result] = await db.query(
      `INSERT INTO ${table}
      (uuid, slug, name, address, region_id, latitude, longitude, description, ticket_price_info, ticket_price_min, ticket_price_max, review_count, average_rating, website_url)
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
    open_days,
    page = 1, // Default halaman pertama
    limit = 10, // Default jumlah data per halaman
  }) {
    let sql = getBaseSelect() + " WHERE 1=1\n";
    const params = [];

    if (search) {
      const safeSearch = String(search).slice(0, 100).replace(/[%_]/g, "\\$&");
      sql += " AND tp.name LIKE ? ESCAPE '\\\\'";
      params.push(`%${safeSearch}%`);
    }

    if (region_id && Array.isArray(region_id) && region_id.length > 0) {
      const placeholders = region_id.map(() => "?").join(",");
      sql += ` AND tp.region_id IN (${placeholders})`;
      params.push(...region_id);
    } else if (region_id) {
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

    if (
      place_type_id &&
      Array.isArray(place_type_id) &&
      place_type_id.length > 0
    ) {
      const placeholders = place_type_id.map(() => "?").join(",");
      sql += `
      AND EXISTS (
        SELECT 1 FROM tourist_place_types tpt
        WHERE tpt.place_id = tp.id AND tpt.place_type_id IN (${placeholders})
      )
      `;
      params.push(...place_type_id);
    } else if (place_type_id) {
      sql += `
      AND EXISTS (
        SELECT 1 FROM tourist_place_types tpt
        WHERE tpt.place_id = tp.id AND tpt.place_type_id = ?
      )
      `;
      params.push(place_type_id);
    }

    // Filter opening hours (hari buka)
    if (open_days && Array.isArray(open_days) && open_days.length > 0) {
      const placeholders = open_days.map(() => "?").join(",");
      sql += `
      AND EXISTS (
        SELECT 1 FROM opening_hours oh
        WHERE oh.place_id = tp.id
          AND oh.day_of_week IN (${placeholders})
          AND oh.is_closed = 0
      )
    `;
      params.push(...open_days);
    } else if (open_days) {
      sql += `
      AND EXISTS (
        SELECT 1 FROM opening_hours oh
        WHERE oh.place_id = tp.id
          AND oh.day_of_week = ?
          AND oh.is_closed = 0
      )
    `;
      params.push(open_days);
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

    // Sorting logic
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
      case "name-asc":
        orderBy = " ORDER BY tp.name ASC";
        break;
      case "name-desc":
        orderBy = " ORDER BY tp.name DESC";
        break;
      case "newest":
        orderBy = " ORDER BY tp.id DESC";
        break;
      case "oldest":
        orderBy = " ORDER BY tp.id ASC";
        break;
      default:
        orderBy = "";
    }

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 1000);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    // Count total for pagination
    let countSql = "SELECT COUNT(DISTINCT tp.id) as total FROM tourist_places tp WHERE 1=1";
    const countParams = [];
    // Rebuild count where clauses (same as above, without GROUP BY/ORDER)
    if (search) {
      const safeSearch2 = String(search).slice(0, 100).replace(/[%_]/g, "\\$&");
      countSql += " AND tp.name LIKE ? ESCAPE '\\\\'";
      countParams.push(`%${safeSearch2}%`);
    }
    if (region_id && Array.isArray(region_id) && region_id.length > 0) {
      const placeholders = region_id.map(() => "?").join(",");
      countSql += ` AND tp.region_id IN (${placeholders})`;
      countParams.push(...region_id);
    } else if (region_id) {
      countSql += " AND tp.region_id = ?";
      countParams.push(region_id);
    }
    if (category_id && Array.isArray(category_id) && category_id.length > 0) {
      const placeholders = category_id.map(() => "?").join(",");
      countSql += ` AND EXISTS (SELECT 1 FROM tourist_place_categories tpc WHERE tpc.place_id = tp.id AND tpc.category_id IN (${placeholders}))`;
      countParams.push(...category_id);
    } else if (category_id) {
      countSql += ` AND EXISTS (SELECT 1 FROM tourist_place_categories tpc WHERE tpc.place_id = tp.id AND tpc.category_id = ?)`;
      countParams.push(category_id);
    }
    if (place_type_id && Array.isArray(place_type_id) && place_type_id.length > 0) {
      const placeholders = place_type_id.map(() => "?").join(",");
      countSql += ` AND EXISTS (SELECT 1 FROM tourist_place_types tpt WHERE tpt.place_id = tp.id AND tpt.place_type_id IN (${placeholders}))`;
      countParams.push(...place_type_id);
    } else if (place_type_id) {
      countSql += ` AND EXISTS (SELECT 1 FROM tourist_place_types tpt WHERE tpt.place_id = tp.id AND tpt.place_type_id = ?)`;
      countParams.push(place_type_id);
    }
    if (open_days && Array.isArray(open_days) && open_days.length > 0) {
      const placeholders = open_days.map(() => "?").join(",");
      countSql += ` AND EXISTS (SELECT 1 FROM opening_hours oh WHERE oh.place_id = tp.id AND oh.day_of_week IN (${placeholders}) AND oh.is_closed = 0)`;
      countParams.push(...open_days);
    } else if (open_days) {
      countSql += ` AND EXISTS (SELECT 1 FROM opening_hours oh WHERE oh.place_id = tp.id AND oh.day_of_week = ? AND oh.is_closed = 0)`;
      countParams.push(open_days);
    }
    if (age_category_id) {
      countSql += ` AND EXISTS (SELECT 1 FROM tourist_place_age_categories tpac WHERE tpac.place_id = tp.id AND tpac.age_category_id = ?)`;
      countParams.push(age_category_id);
    }
    if (price_range) {
      switch (price_range) {
        case "free": countSql += " AND (tp.ticket_price_min = 0 OR tp.ticket_price_min IS NULL)"; break;
        case "lt-10k": countSql += " AND tp.ticket_price_min > 0 AND tp.ticket_price_min < 10000"; break;
        case "10-30": countSql += " AND tp.ticket_price_min >= 10000 AND tp.ticket_price_min <= 30000"; break;
        case "30-100": countSql += " AND tp.ticket_price_min > 30000 AND tp.ticket_price_min <= 100000"; break;
        case "gt-100k": countSql += " AND tp.ticket_price_min > 100000"; break;
      }
    }
    const [countRows] = await db.query(countSql, countParams);
    const total = countRows[0]?.total || 0;

    sql += " GROUP BY tp.id" + orderBy + ` LIMIT ? OFFSET ?`;
    params.push(safeLimit, offset);

    const [rows] = await db.query(sql, params);
    return { rows, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  },

  // ---------------------------------------------------------------
  async findSimilarBySlug(slug, limit = 10) {
    // Ambil kategori dan place_type dari destinasi utama
    const [mainRows] = await db.query(
      `
    SELECT 
      tp.id,
      GROUP_CONCAT(DISTINCT tpc.category_id) AS category_ids,
      GROUP_CONCAT(DISTINCT tpt.place_type_id) AS place_type_ids
    FROM tourist_places tp
    LEFT JOIN tourist_place_categories tpc ON tp.id = tpc.place_id
    LEFT JOIN tourist_place_types tpt ON tp.id = tpt.place_id
    WHERE tp.slug = ?
    GROUP BY tp.id
    `,
      [slug]
    );
    const main = mainRows[0];
    if (!main) return [];

    // Siapkan array id
    const categoryIds = main.category_ids
      ? main.category_ids.split(",").map(Number)
      : [];
    const placeTypeIds = main.place_type_ids
      ? main.place_type_ids.split(",").map(Number)
      : [];
    if (categoryIds.length === 0 && placeTypeIds.length === 0) return [];

    // Query destinasi serupa (kecuali dirinya sendiri)
    let sql =
      getBaseSelect() +
      `
    WHERE tp.slug != ?
  `;
    const params = [slug];

    if (categoryIds.length > 0) {
      const placeholders = categoryIds.map(() => "?").join(",");
      sql += `
      AND EXISTS (
        SELECT 1 FROM tourist_place_categories tpc
        WHERE tpc.place_id = tp.id AND tpc.category_id IN (${placeholders})
      )
    `;
      params.push(...categoryIds);
    }
    if (placeTypeIds.length > 0) {
      const placeholders = placeTypeIds.map(() => "?").join(",");
      sql += `
      AND EXISTS (
        SELECT 1 FROM tourist_place_types tpt
        WHERE tpt.place_id = tp.id AND tpt.place_type_id IN (${placeholders})
      )
    `;
      params.push(...placeTypeIds);
    }

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 20);
    sql += " GROUP BY tp.id LIMIT ?";
    params.push(safeLimit);

    const [rows] = await db.query(sql, params);
    return rows;
  },
};

export default Destination;
