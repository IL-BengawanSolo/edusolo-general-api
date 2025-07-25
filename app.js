import { PORT } from "./config/env.js";
import passport from "./config/passport.js";

import authRouter from "./routes/auth.routes.js";
import destinationRouter from "./routes/destination.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import chatbotRouter from "./routes/chatbot.routes.js";

import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(passport.initialize());


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/destinations", destinationRouter);
app.use("/api/v1/recommendations", recommendationRouter);

app.use("/api/v1/chatbot", chatbotRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the EduSolo API!");
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port http://localhost:${PORT}`);
// });

export default app;