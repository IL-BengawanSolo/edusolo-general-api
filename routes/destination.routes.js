import { Router } from "express";
import {
  // getAllDestinations,
  // getDestinationById,
  getDestinationBySlug,
  createDestination,
  createDestinationBulk,
  getAllDestinationsWithRelations,

} from "../controllers/destination.controller.js";

const destinationRouter = Router();

destinationRouter.get("/", getAllDestinationsWithRelations);

// destinationRouter.get("/:id", getDestinationById);

destinationRouter.get("/:slug", getDestinationBySlug);

destinationRouter.post("/", createDestination);

destinationRouter.post("/bulk", createDestinationBulk);

// destinationRouter.put("/:id", (req, res) => {
//     res.send({ title: "UPDATE destination" });
// });

// destinationRouter.delete("/:id", (req, res) => {
//   res.send({ title: "DELETE destination" });
// });

export default destinationRouter;
