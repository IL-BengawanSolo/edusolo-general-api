import {
  getDestinationById as getDestinationByIdService,
  createDestination as createDestinationService,
  getDestinationBySlug as getDestinationBySlugService,
  createDestinationBulk as createDestinationBulkService,
  getAllDestinationsWithRelations as getAllDestinationsWithRelationsService,
  searchAndFilterDestinations as searchAndFilterDestinationsService,
} from "../services/destination.service.js";

export const getDestinationById = async (req, res) => {
  const { id } = req.params;
  try {
    const destination = await getDestinationByIdService(id);
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

export const getAllDestinationsWithRelations = async (req, res) => {
  try {
    const destinations = await getAllDestinationsWithRelationsService();
    return res.status(200).json({
      success: true,
      data: destinations,
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
    const newDestination = await createDestinationService(req.body);
    return res.status(201).json({
      success: true,
      data: newDestination,
    });
  } catch (error) {
    console.error("Error creating destination:", error);
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
    const { search, region_id, category_id, place_type_id } = req.query;
    const results = await searchAndFilterDestinationsService({
      search,
      region_id,
      category_id,
      place_type_id,
    });
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Error searching destinations:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
