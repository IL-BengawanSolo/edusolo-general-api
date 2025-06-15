import { PORT } from "./config/env.js";

import destinationRouter from "./routes/destination.routes.js";
import cookieParser from "cookie-parser";
import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1/destinations", destinationRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
