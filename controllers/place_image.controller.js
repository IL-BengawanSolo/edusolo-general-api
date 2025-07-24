import {
  uploadImage,
  getImagesByPlaceId,
} from "../services/place_image.service.js";

export const uploadPlaceImage = async (req, res) => {
  try {
    const filePath = `/uploads/images/${req.file.filename}`;
    const placeId = req.placeId;
    // Ambil is_primary dari form-data, default false
    const isPrimary =
      req.body.is_primary === "true" || req.body.is_primary === true ? 1 : 0;

    const image = await uploadImage(placeId, filePath, isPrimary);

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

// export const getPlaceImages = async (req, res) => {
//   try {
//     const placeId = req.placeId; // Dapatkan place_id dari middleware validateUuid

//     // Ambil semua gambar terkait destinasi
//     const images = await getImagesByPlaceId(placeId);

//     res.json({ success: true, data: images });
//   } catch (error) {
//     console.error("Error fetching images:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

export const getPlaceImages = async (req, res) => {
  try {
    const placeId = req.placeId;
    const images = await getImagesByPlaceId(placeId);

    // Ambil base URL dari request
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Ubah image_url menjadi absolute URL
    const imagesWithFullUrl = images.map((img) => ({
      ...img,
      image_url: img.image_url.startsWith("http")
        ? img.image_url
        : baseUrl + img.image_url,
    }));

    res.json({ success: true, data: imagesWithFullUrl });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const uploadPlaceImagesBulk = async (req, res) => {
  try {
    const placeId = req.placeId;
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }

    // req.body.is_primary bisa string ("true"/"false") atau array
    let isPrimaryArr = req.body.is_primary || [];
    if (!Array.isArray(isPrimaryArr)) isPrimaryArr = [isPrimaryArr];

    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const filePath = `/uploads/images/${file.filename}`;
      // Ambil is_primary sesuai urutan file
      const isPrimary =
        isPrimaryArr[i] === "true" || isPrimaryArr[i] === true ? 1 : 0;
      const image = await uploadImage(placeId, filePath, isPrimary);
      images.push(image);
    }

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data: images,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
