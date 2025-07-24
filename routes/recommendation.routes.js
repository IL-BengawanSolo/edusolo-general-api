import { Router } from "express";
import passport from "../config/passport.js";
import { checkUserRecommendationSession } from "../controllers/recommendation.controller.js";
import { getQuestions } from "../controllers/question.controller.js";
import { postRecommendationSession } from "../controllers/recommendation.controller.js";
import { getAIRecommendations } from "../controllers/recommendation.controller.js";
import { getDestinationsFromRecommendationResult } from "../controllers/recommendation.controller.js";
import { getLastRecommendationSession } from "../controllers/recommendation.controller.js";


const recommendationRouter = Router();

recommendationRouter.get(
  "/has-session",
  passport.authenticate("jwt", { session: false }),
  checkUserRecommendationSession
);

recommendationRouter.get("/questions", getQuestions);

recommendationRouter.post(
  "/sessions",
  passport.authenticate("jwt", { session: false }),
  postRecommendationSession
);

recommendationRouter.post(
  "/ai",
  passport.authenticate("jwt", { session: false }),
  getAIRecommendations
);

recommendationRouter.get(
  "/results/:session_id",
  passport.authenticate("jwt", { session: false }),
  getDestinationsFromRecommendationResult
);

recommendationRouter.get(
  "/last-session",
  passport.authenticate("jwt", { session: false }),
  getLastRecommendationSession
);


export default recommendationRouter;