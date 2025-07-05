import { uploadImage, getImagesByPlaceId } from "../services/place_image.service.js";

export const uploadPlaceImage = async (req, res) => {
  try {
    const filePath = `/uploads/images/${req.file.filename}`;
    const placeId = req.placeId; // Dapatkan place_id dari middleware validateUuid

    // Simpan metadata gambar ke database
    const image = await uploadImage(placeId, filePath);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: image,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPlaceImages = async (req, res) => {
  try {
    const placeId = req.placeId; // Dapatkan place_id dari middleware validateUuid

    // Ambil semua gambar terkait destinasi
    const images = await getImagesByPlaceId(placeId);

    res.json({ success: true, data: images });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};