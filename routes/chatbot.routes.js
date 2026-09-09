import { Router } from "express";
import { chatWithGroq } from "../controllers/chatbot.controller.js";
import { chatbotRateLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { chatbotSchema } from "../utils/validators.js";

const router = Router();
router.post("/chat", chatbotRateLimiter, validate(chatbotSchema), chatWithGroq);
export default router;