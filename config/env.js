import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
config(); // fallback to .env

// Alias DB_* (TiDB dashboard) -> MYSQL_* (app)
if (process.env.DB_HOST && !process.env.MYSQL_HOST) process.env.MYSQL_HOST = process.env.DB_HOST;
if (process.env.DB_PORT && !process.env.MYSQL_PORT) process.env.MYSQL_PORT = process.env.DB_PORT;
if (process.env.DB_USERNAME && !process.env.MYSQL_USER) process.env.MYSQL_USER = process.env.DB_USERNAME.replace(/^'|'$/g, "");
if (process.env.DB_PASSWORD && !process.env.MYSQL_PASSWORD) process.env.MYSQL_PASSWORD = process.env.DB_PASSWORD.replace(/^'|'$/g, "");
if (process.env.DB_DATABASE && !process.env.MYSQL_DATABASE) process.env.MYSQL_DATABASE = process.env.DB_DATABASE;

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
  DATABASE_URL,
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  GROQ_API_KEY,
  ALLOWED_ORIGINS,
  BASE_URL
} = process.env;
