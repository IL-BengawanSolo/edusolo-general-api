import {
  getAllDestinations as getAllDestinationsService,
  getDestinationById as getDestinationByIdService,
  createDestination as createDestinationService,
} from "../services/destination.service.js";

/**
 * Get all destinations
 */
export const getAllDestinations = async (req, res) => {
  try {
    const destinations = await getAllDestinationsService();
    return res.status(200).json({
      success: true,
      data: destinations,
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get destination by ID
 */
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

/**
 * Create a new destination
 */

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
}
;