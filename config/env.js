import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
config(); // fallback to .env

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not set — refusing to start with insecure default");
  } else {
    console.warn("[env] JWT_SECRET not set — using insecure dev default. Set JWT_SECRET in .env for production!");
    process.env.JWT_SECRET = "dev-secret-please-change-in-production";
  }
}

export const {
  PORT,
  NODE_ENV,
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  GROQ_API_KEY
} = process.env;
