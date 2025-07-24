import RegionRepository from "../repository/region.repository.js";

export const getAllRegions = async () => {
  return await RegionRepository.findAll();
};