/**
 * Admin Seeder
 * Run with: bun run seed:admin
 *
 * Creates a default admin account if it doesn't already exist.
 * Bun automatically loads .env from the working directory.
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User";

const ADMIN_DATA = {
  fullName: "Administrator",
  username: "admin",
  email: "admin@menterikebenaran.com",
  password: "Admin@12345",
  role: "admin" as const,
};

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  console.log("Menghubungkan ke database...");
  console.log("   URI:", uri.substring(0, 40) + "...");
  await mongoose.connect(uri);
  console.log("Berhasil terhubung ke database");

  try {
    // Check if admin already exists
    const existing = await User.findOne({
      $or: [{ email: ADMIN_DATA.email }, { username: ADMIN_DATA.username }],
    });

    if (existing) {
      console.log("Admin sudah ada:");
      console.log("   - Username : " + existing.username);
      console.log("   - Email    : " + existing.email);
      console.log("   - Role     : " + existing.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 12);

    // Create admin user
    const admin = await User.create({
      ...ADMIN_DATA,
      password: hashedPassword,
    });

    console.log("Akun admin berhasil dibuat!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("   Nama Lengkap : " + admin.fullName);
    console.log("   Username    : " + admin.username);
    console.log("   Email       : " + admin.email);
    console.log("   Password     : " + ADMIN_DATA.password + "  ← ubah setelah login!");
    console.log("   Role         : " + admin.role);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("Catatan: Untuk menjadikan pengguna menjadi writer,");
    console.log("login sebagai admin dan gunakan endpoint:");
    console.log("PUT /api/users/role");
  } finally {
    await mongoose.disconnect();
    console.log("Berhasil disconnect dari database");
  }
}

seedAdmin().catch((err) => {
  console.error("Seeder gagal:", err);
  process.exit(1);
});
