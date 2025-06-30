import { Router } from "express";
import passport from "../config/passport.js";
import { checkUserRecommendationSession } from "../controllers/recommendation.controller.js";

const recommendationRouter = Router();

recommendationRouter.get(
  "/has-session",
  passport.authenticate("jwt", { session: false }),
  checkUserRecommendationSession
);

export default recommendationRouter;