import {
  // getAllDestinations as getAllDestinationsService,
  getDestinationById as getDestinationByIdService,
  createDestination as createDestinationService,
  getDestinationBySlug as getDestinationBySlugService,
  createDestinationBulk as createDestinationBulkService,
  getAllDestinationsWithRelations as getAllDestinationsWithRelationsService,
} from "../services/destination.service.js";

/**
 * Get all destinations
 */
// export const getAllDestinations = async (req, res) => {
//   try {
//     const destinations = await getAllDestinationsService();
//     return res.status(200).json({
//       success: true,
//       data: destinations,
//     });
//   } catch (error) {
//     console.error("Error fetching destinations:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

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
 * Get destination by slug
 */
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

/**
 * Get all destinations with relations
 */

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
};

/**
 * Create multiple destinations in bulk
 */

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
