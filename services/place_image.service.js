import PlaceImageRepository from "../repository/place_image.repository.js";

export const uploadImage = async (placeId, filePath, isPrimary = false) => {
  return await PlaceImageRepository.create({
    place_id: placeId,
    image_url: filePath,
    is_primary: isPrimary,
  });
};

export const getImagesByPlaceId = async (placeId) => {
  return await PlaceImageRepository.findByPlaceId(placeId);
};