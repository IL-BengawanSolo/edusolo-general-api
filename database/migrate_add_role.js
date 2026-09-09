import db from "./db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function migrate() {
  try {
    await db.query(`ALTER TABLE users ADD COLUMN role ENUM('user','admin','super_admin') NOT NULL DEFAULT 'user'`);
    console.log("role column added");
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME") {
      console.log("role column already exists — ensuring super_admin enum");
      try {
        await db.query(`ALTER TABLE users MODIFY COLUMN role ENUM('user','admin','super_admin') NOT NULL DEFAULT 'user'`);
        console.log("role enum updated to include super_admin");
      } catch (e2) { console.error("modify error", e2.message); }
    } else console.error("alter error", e.message);
  }
  // Ensure enum includes super_admin even if column already existed
  try {
    await db.query(`ALTER TABLE users MODIFY COLUMN role ENUM('user','admin','super_admin') NOT NULL DEFAULT 'user'`);
  } catch { /* ignore if already correct */ }
  try {
    await db.query(`CREATE INDEX idx_users_role ON users (role)`);
    console.log("index added");
  } catch (e) {
    if (e.code === "ER_DUP_KEYNAME") console.log("index exists");
    else console.error("index error", e.message);
  }
  const adminEmail = process.env.ADMIN_EMAIL || "admin@edusolo.local";
  const adminPass = process.env.ADMIN_INITIAL_PASSWORD;
  if (!adminPass) {
    console.warn("ADMIN_INITIAL_PASSWORD not set — skipping admin seed. Set it in .env to create super_admin.");
    process.exit(0);
  }
  const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [adminEmail]);
  if (rows.length) {
    await db.query("UPDATE users SET role='super_admin' WHERE email = ?", [adminEmail]);
    console.log(`super_admin role ensured for ${adminEmail}`);
  } else {
    const hash = await bcrypt.hash(adminPass, 10);
    const uuid = uuidv4();
    await db.query("INSERT INTO users (uuid, first_name, last_name, email, password_hash, role) VALUES (?,?,?,?,?,?)", [uuid, "Admin", "EduSolo", adminEmail, hash, "super_admin"]);
    console.log(`super_admin created ${adminEmail}`);
  }
  process.exit(0);
}
migrate();
