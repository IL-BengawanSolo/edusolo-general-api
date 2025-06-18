import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import DestinationRepository from "../repository/destination.repository.js";

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

/**
 * Service for getting all destinations
 */
// export const getAllDestinations = async () => {
//   return await DestinationRepository.findAll();
// };

/**
 * Service for getting a destination by ID
 */
export const getDestinationById = async (id) => {
  return await DestinationRepository.findById(id);
};

/**
 * Service for getting a destination by slug
 */

export const getDestinationBySlug = async (slug) => {
  const row = await DestinationRepository.findBySlug(slug);
  if (!row) return null;
  return {
    ...row,
    categories: splitCommaString(row.categories),
    age_categories: splitCommaString(row.age_categories),
    activities: splitCommaString(row.activities),
    facilities: splitCommaString(row.facilities),
  };
};

/**
 * Service for getting all destinations with relations
 */

export const getAllDestinationsWithRelations = async () => {
  const rows = await DestinationRepository.findAllWithRelations();
  return rows.map((row) => ({
    ...row,
    categories: splitCommaString(row.categories),
    age_categories: splitCommaString(row.age_categories),
    activities: splitCommaString(row.activities),
    facilities: splitCommaString(row.facilities),
  }));
};

/**
 * Service for creating a new destination
 */
export const createDestination = async (data) => {
  const uuid = uuidv4();
  let baseSlug = slugify(data.name, { lower: true, strict: true });
  let slug = `${baseSlug}-${uuid.slice(0, 6)}`;

  return await DestinationRepository.create({ ...data, uuid, slug });
};

/**
 * Service for creating multiple destinations in bulk
 */
export const createDestinationBulk = async (dataArray) => {
  const destinations = dataArray.map((data) => {
    const uuid = uuidv4();
    let baseSlug = slugify(data.name, { lower: true, strict: true });
    let slug = `${baseSlug}-${uuid.slice(0, 6)}`;
    return { ...data, uuid, slug };
  });
  return await DestinationRepository.createBulk(destinations);
};
