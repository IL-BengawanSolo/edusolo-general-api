import {
  getDestinationBySlug as getDestinationBySlugService,
  createDestinationBulk as createDestinationBulkService,
  getAllDestinations as getAllDestinationsService,
  searchAndFilterDestinations as searchAndFilterDestinationsService,
  getSimilarDestinations as getSimilarDestinationsService,

} from "../services/destination.service.js";

import { addAbsoluteImageUrl } from "../utils/url_image.js";

export const getDestinationBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const destination = await getDestinationBySlugService(slug);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    console.error("Error fetching destination:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllDestinations = async (req, res) => {
  try {
    const destinations = await getAllDestinationsService();
    const destinationsWithUrl = addAbsoluteImageUrl(destinations, req);
    return res.status(200).json({
      success: true,
      data: destinationsWithUrl,
    });
  } catch (error) {
    console.error("Error fetching destinations with relations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createDestinationBulk = async (req, res) => {
  try {
    const result = await createDestinationBulkService(req.body);
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating destinations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const searchAndFilter = async (req, res) => {
  try {
    const {
      search,
      category_id,
      place_type_id,
      region_id,
      open_days,
      age_category_id,
      price_range,
      sort_by,
      page,
      limit,
    } = req.query;
    const results = await searchAndFilterDestinationsService({
      search,
      category_id,
      place_type_id,
      region_id,
      open_days,
      age_category_id,
      price_range,
      sort_by,
      page,
      limit,
    });

    const resultsWithUrl = addAbsoluteImageUrl(results, req);
    res.json({ success: true, data: resultsWithUrl });
  } catch (error) {
    console.error("Error searching and filtering destinations:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getSimilarDestinations = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit } = req.query;
    const results = await getSimilarDestinationsService(
      slug,
      Number(limit) || 10
    );
    const resultsWithUrl = addAbsoluteImageUrl(results, req);

    res.json({ success: true, data: resultsWithUrl });
  } catch (error) {
    console.error("Error fetching similar destinations:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
