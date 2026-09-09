import RegionRepository from "../repository/region.repository.js";
import { getCache, setCache } from "../utils/cache.js";

export const getAllRegions = async () => {
  const key = "regions:all";
  const cached = getCache(key);
  if (cached) return cached;
  const data = await RegionRepository.findAll();
  setCache(key, data, 5 * 60 * 1000);
  return data;
};