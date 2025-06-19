import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import DestinationRepository from "../repository/destination.repository.js";

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

function splitCommaString(str) {
  if (Array.isArray(str)) return str;
  if (typeof str === "string") {
    return str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export const getDestinationById = async (id) => {
  return await DestinationRepository.findById(id);
};

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

export const getAllDestinationsWithRelations = async () => {
  const rows = await DestinationRepository.findAllWithRelations();
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
  const uuid = uuidv4();
  let baseSlug = slugify(data.name, { lower: true, strict: true });
  let slug = `${baseSlug}-${uuid.slice(0, 6)}`;

  return await DestinationRepository.create({ ...data, uuid, slug });
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
