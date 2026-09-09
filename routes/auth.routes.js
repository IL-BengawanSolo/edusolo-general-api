import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middlewares/rateLimit.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../utils/validators.js";

const authRouter = Router();

authRouter.post("/login", authRateLimiter, validate(loginSchema), login);
authRouter.post("/register", authRateLimiter, validate(registerSchema), register);
authRouter.get("/me", me);

export default authRouter;