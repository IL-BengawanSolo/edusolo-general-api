import PlaceTypeRepository from "../repository/place_type.repository.js";
import { getCache, setCache } from "../utils/cache.js";

export const getAllPlaceTypes = async () => {
  const key = "place_types:all";
  const cached = getCache(key);
  if (cached) return cached;
  const data = await PlaceTypeRepository.findAll();
  setCache(key, data, 5 * 60 * 1000);
  return data;
};