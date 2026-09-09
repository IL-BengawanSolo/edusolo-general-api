import db from "./db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function migrate() {
  try {
    await db.query(`ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user'`);
    console.log("role column added");
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME") console.log("role column already exists");
    else console.error("alter error", e.message);
  }
  try {
    await db.query(`CREATE INDEX idx_users_role ON users (role)`);
    console.log("index added");
  } catch (e) {
    if (e.code === "ER_DUP_KEYNAME") console.log("index exists");
    else console.error("index error", e.message);
  }
  const [rows] = await db.query("SELECT id FROM users WHERE email = ?", ["admin@edusolo.local"]);
  if (rows.length) {
    await db.query("UPDATE users SET role='admin' WHERE email = ?", ["admin@edusolo.local"]);
    console.log("admin role updated");
  } else {
    const hash = await bcrypt.hash("Admin123!", 10);
    const uuid = uuidv4();
    await db.query("INSERT INTO users (uuid, first_name, last_name, email, password_hash, role) VALUES (?,?,?,?,?,?)", [uuid, "Admin", "EduSolo", "admin@edusolo.local", hash, "admin"]);
    console.log("admin created admin@edusolo.local / Admin123!");
  }
  process.exit(0);
}
migrate();
