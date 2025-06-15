import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import DestinationRepository from "../repository/destination.repository.js";

/**
 * Service for getting all destinations
 */
export const getAllDestinations = async () => {
  return await DestinationRepository.findAll();
};

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
  return await DestinationRepository.findBySlug(slug);
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
