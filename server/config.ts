import dotenv from "dotenv";
dotenv.config();

export const PORT = 3000;
export const ADMIN_SECRET = process.env.ADMIN_SECRET || "nakla-admin-2025";
