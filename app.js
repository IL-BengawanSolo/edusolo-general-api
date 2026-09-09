import { PORT } from "./config/env.js";
import passport from "./config/passport.js";

import authRouter from "./routes/auth.routes.js";
import destinationRouter from "./routes/destination.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import chatbotRouter from "./routes/chatbot.routes.js";

import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,http://localhost:3000,https://edusolo-fe.vercel.app,https://edusolo.vercel.app,https://edusolo-fe-git-main-boyaditya.vercel.app"
)
  .split(",")
  .map((o) => o.trim());

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());
app.use(passport.initialize());


const staticUploadDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "uploads");

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    next();
  },
  express.static(staticUploadDir),
  express.static(path.join(process.cwd(), "uploads")),
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/destinations", destinationRouter);
app.use("/api/v1/recommendations", recommendationRouter);

app.use("/api/v1/chatbot", chatbotRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the EduSolo API!");
});

app.get("/health", (req, res) => {
  res.json({ success: true, message: "OK", uptime: process.uptime() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON" });
  }
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: "File too large. Max 5MB" });
  }
  if (err.message && err.message.startsWith("Invalid file")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({ success: false, message: "Internal server error" });
});

// Start server locally (Vercel imports app without listening)
if (!process.env.VERCEL) {
  const port = PORT || 5500;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;