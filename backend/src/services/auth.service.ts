import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "@/repositories/user.repository";
import { env } from "@/config/env";
import type { RegisterInput, LoginInput } from "@news-portal/shared";

export class AuthService {
  private repository = new UserRepository();

  async register(data: RegisterInput) {
    // Check if email is already taken
    const existingEmail = await this.repository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error("Email sudah terdaftar");
    }

    // Check if username is already taken
    const existingUsername = await this.repository.findByUsername(data.username);
    if (existingUsername) {
      throw new Error("Username sudah digunakan");
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.repository.create({ ...data, password: hashedPassword });

    // Return user without password
    const { password: _pw, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async login(data: LoginInput) {
    const user = await this.repository.findByEmail(data.email);
    if (!user) {
      throw new Error("Email atau password salah");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _pw, ...userWithoutPassword } = user.toObject();
    return { token, user: userWithoutPassword };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error("Pengguna tidak ditemukan");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Password saat ini salah");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.repository.updatePassword(userId, hashedPassword);

    return { message: "Password berhasil diubah" };
  }
}
