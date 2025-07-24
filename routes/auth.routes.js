import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get("/me", me);

export default authRouter;