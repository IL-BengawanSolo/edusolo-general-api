import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import DestinationRepository from "../repository/destination.repository.js";
import { splitCommaString } from "../utils/string.js";

const DAY_MAP = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

function preprocessOpeningHours(opening_hours) {
  if (!opening_hours) return [];
  let arr = opening_hours;
  if (typeof opening_hours === "string") {
    try {
      arr = JSON.parse(opening_hours);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => ({
    ...item,
    day_of_week_int: item.day_of_week,
    // Convert day_of_week to Indonesian name
    day_of_week: DAY_MAP[item.day_of_week] || "",
    is_closed: item.is_closed === 1 || item.is_closed === true,
    open_time: item.open_time ? item.open_time.slice(0, 5) : null,
    close_time: item.close_time ? item.close_time.slice(0, 5) : null,
  }));
}




export const getDestinationBySlug = async (slug) => {
  const row = await DestinationRepository.findBySlug(slug);
  if (!row) return null;
  return {
    ...row,
    place_types: splitCommaString(row.place_types),
    categories: splitCommaString(row.categories),
    age_categories: splitCommaString(row.age_categories),
    activities: splitCommaString(row.activities),
    facilities: splitCommaString(row.facilities),
    opening_hours: preprocessOpeningHours(row.opening_hours),
  };
};

export const getAllDestinations = async ({ page = 1, limit = 20 } = {}) => {
  const rows = await DestinationRepository.findAll({ page, limit });
  return rows.map((row) => ({
    ...row,
    place_types: splitCommaString(row.place_types),
    categories: splitCommaString(row.categories),
    age_categories: splitCommaString(row.age_categories),
    activities: splitCommaString(row.activities),
    facilities: splitCommaString(row.facilities),
  }));
};

export const createDestination = async (data) => {
  if (!data.name) throw new Error("name is required");
  const uuid = uuidv4();
  const baseSlug = slugify(data.name, { lower: true, strict: true });
  const slug = `${baseSlug}-${uuid.slice(0, 6)}`;
  const payload = { ...data, uuid, slug };
  const result = await DestinationRepository.create(payload);
  return result;
};

export const createDestinationBulk = async (dataArray) => {
  const destinations = dataArray.map((data) => {
    const uuid = uuidv4();
    let baseSlug = slugify(data.name, { lower: true, strict: true });
    let slug = `${baseSlug}-${uuid.slice(0, 6)}`;
    return { ...data, uuid, slug };
  });
  return await DestinationRepository.createBulk(destinations);
};

export const searchAndFilterDestinations = async (params) => {
  const result = await DestinationRepository.searchAndFilter(params);
  const isPaged = result && typeof result === "object" && Array.isArray(result.rows);
  const rows = isPaged ? result.rows : result;
  const mapped = rows.map((row) => ({
    ...row,
    place_types: splitCommaString(row.place_types),
    categories: splitCommaString(row.categories),
    age_categories: splitCommaString(row.age_categories),
    activities: splitCommaString(row.activities),
    facilities: splitCommaString(row.facilities),
  }));
  if (isPaged) {
    return { data: mapped, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages };
  }
  return mapped;
};

export const getSimilarDestinations = async (slug, limit = 10) => {
  const rows = await DestinationRepository.findSimilarBySlug(slug, limit);
  return rows.map((row) => ({
    ...row,
    place_types: splitCommaString(row.place_types),
    categories: splitCommaString(row.categories),
    age_categories: splitCommaString(row.age_categories),
    activities: splitCommaString(row.activities),
    facilities: splitCommaString(row.facilities),
    opening_hours: row.opening_hours ? preprocessOpeningHours(row.opening_hours) : [],
  }));
};

export const getDestinationByUuid = async (uuid) => {
  const row = await DestinationRepository.findByUuidFull(uuid);
  if (!row) return null;
  return {
    ...row,
    place_types: splitCommaString(row.place_types),
    categories: splitCommaString(row.categories),
    age_categories: splitCommaString(row.age_categories),
    activities: splitCommaString(row.activities),
    facilities: splitCommaString(row.facilities),
    opening_hours: preprocessOpeningHours(row.opening_hours),
  };
};

export const updateDestination = async (uuid, data) => {
  const existing = await DestinationRepository.findByUuidFull(uuid);
  if (!existing) return null;
  if (data.name && data.name !== existing.name) {
    const baseSlug = slugify(data.name, { lower: true, strict: true });
    data.slug = `${baseSlug}-${uuid.slice(0, 6)}`;
  }
  return await DestinationRepository.updateByUuid(uuid, data);
};

export const deleteDestination = async (uuid) => {
  const existing = await DestinationRepository.findByUuidFull(uuid);
  if (!existing) return false;
  const { default: PlaceImageRepository } = await import("../repository/place_image.repository.js");
  const images = await PlaceImageRepository.findByPlaceId(existing.id);
  const fs = await import("fs");
  const path = await import("path");
  for (const img of images) {
    for (const base of [process.cwd(), "/tmp"]) {
      try {
        const p = path.join(base, img.image_url.replace(/^\//, ""));
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch {}
    }
  }
  return await DestinationRepository.deleteByUuid(uuid);
};



