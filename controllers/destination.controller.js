import {
  getDestinationBySlug as getDestinationBySlugService,
  getDestinationByUuid as getDestinationByUuidService,
  createDestination as createDestinationService,
  createDestinationBulk as createDestinationBulkService,
  getAllDestinations as getAllDestinationsService,
  searchAndFilterDestinations as searchAndFilterDestinationsService,
  getSimilarDestinations as getSimilarDestinationsService,
  updateDestination as updateDestinationService,
  deleteDestination as deleteDestinationService,
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
    const withUrl = addAbsoluteImageUrl([destination], req);
    return res.status(200).json({
      success: true,
      data: withUrl[0],
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
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const destinations = await getAllDestinationsService({ page, limit });
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

export const createDestination = async (req, res) => {
  try {
    const result = await createDestinationService(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.message === "name is required") {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Error creating destination:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
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
    const result = await searchAndFilterDestinationsService({
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

    // Handle both old (array) and new (paged) return
    const isPaged = result && typeof result === "object" && Array.isArray(result.data);
    const rows = isPaged ? result.data : result;
    const pagination = isPaged ? { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages } : undefined;

    const resultsWithUrl = addAbsoluteImageUrl(rows, req);
    if (pagination) {
      res.json({ success: true, data: resultsWithUrl, pagination });
    } else {
      res.json({ success: true, data: resultsWithUrl });
    }
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

export const getDestinationByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const dest = await getDestinationByUuidService(uuid);
    if (!dest) return res.status(404).json({ success: false, message: "Destination not found" });
    const withUrl = addAbsoluteImageUrl([dest], req);
    return res.json({ success: true, data: withUrl[0] });
  } catch (error) {
    console.error("Error fetching by uuid:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateDestination = async (req, res) => {
  try {
    const { uuid } = req.params;
    const updated = await updateDestinationService(uuid, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Destination not found" });
    const withUrl = addAbsoluteImageUrl([updated], req);
    return res.json({ success: true, data: withUrl[0] });
  } catch (error) {
    console.error("Error updating:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteDestination = async (req, res) => {
  try {
    const { uuid } = req.params;
    const ok = await deleteDestinationService(uuid);
    if (!ok) return res.status(404).json({ success: false, message: "Destination not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Error deleting:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
