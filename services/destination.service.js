import { v4 as uuidv4 } from "uuid";
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
 * Service for creating a new destination
 */
export const createDestination = async (data) => {
  const uuid = uuidv4();
  return await DestinationRepository.create({ uuid, ...data });
};
