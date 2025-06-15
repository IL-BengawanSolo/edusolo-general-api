import { Router } from "express";
import {
  getAllDestinations,
  // getDestinationById,
  getDestinationBySlug,
  createDestination,

} from "../controllers/destination.controller.js";

const destinationRouter = Router();

destinationRouter.get("/", getAllDestinations);

// destinationRouter.get("/:id", getDestinationById);

destinationRouter.get("/:slug", getDestinationBySlug);

destinationRouter.post("/", createDestination);

// destinationRouter.put("/:id", (req, res) => {
//     res.send({ title: "UPDATE destination" });
// });

// destinationRouter.delete("/:id", (req, res) => {
//   res.send({ title: "DELETE destination" });
// });

export default destinationRouter;
