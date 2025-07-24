import PlaceTypeRepository from "../repository/place_type.repository.js";

export const getAllPlaceTypes = async () => {
  return await PlaceTypeRepository.findAll();
};