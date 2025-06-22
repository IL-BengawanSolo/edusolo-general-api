import { PORT } from "./config/env.js";

import destinationRouter from "./routes/destination.routes.js";
import placeTypeRouter from "./routes/place_type.routes.js";
import categoryRouter from "./routes/category.routes.js";

import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "1mb" }));

app.use("/api/v1/destinations", destinationRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/place-types", placeTypeRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
