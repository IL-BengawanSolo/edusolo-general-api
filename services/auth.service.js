import UserRepository from "../repository/user.repository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const authenticateUser = async (email, password) => {
  const user = await UserRepository.findByEmail(email);
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;
  return user;
};

export const generateJwtToken = (user) => {
  const payload = { id: user.id, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
};

export const registerUser = async ({ first_name, last_name, email, password }) => {
  if (!first_name || !email || !password) {
    throw new Error("Missing required fields");
  }
  const existing = await UserRepository.findByEmail(email);
  if (existing) {
    throw new Error("Email already registered");
  }
  const password_hash = await bcrypt.hash(password, 10);
  const uuid = uuidv4();
  await UserRepository.create({
    uuid,
    first_name,
    last_name,
    email,
    password_hash,
  });
};