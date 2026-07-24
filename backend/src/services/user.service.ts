import slugify from "slugify";
import { UserRepository } from "@/repositories/user.repository";
import type { UserRole } from "@/models/User";

export class UserService {
  private repository = new UserRepository();

  async findAll(query: { page?: number; limit?: number; role?: UserRole; search?: string }) {
    return this.repository.findAll(query);
  }

  async findById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error("Pengguna tidak ditemukan");
    }
    return user;
  }

  async updateRole(userId: string, newRole: UserRole, adminId: string) {
    // Check if user exists
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error("Pengguna tidak ditemukan");
    }

    // Check if trying to change admin role
    if (user.role === "admin" && newRole !== "admin") {
      throw new Error("Tidak dapat mengubah role admin");
    }

    // Cannot set role to admin
    if (newRole === "admin") {
      throw new Error("Tidak dapat menjadikan pengguna sebagai admin");
    }

    // Update role
    const updatedUser = await this.repository.updateRole(userId, newRole);
    if (!updatedUser) {
      throw new Error("Gagal memperbarui role");
    }

    return updatedUser;
  }

  async updateProfile(userId: string, data: { fullName?: string; username?: string }) {
    // If username is being updated, check for duplicates
    if (data.username) {
      const existingUsername = await this.repository.findByUsername(data.username);
      if (existingUsername && existingUsername._id.toString() !== userId) {
        throw new Error("Username sudah digunakan");
      }
    }

    const updatedUser = await this.repository.updateProfile(userId, data);
    if (!updatedUser) {
      throw new Error("Gagal memperbarui profil");
    }

    return updatedUser;
  }

  async saveNews(userId: string, newsId: string) {
    // Check if already saved
    const existing = await this.repository.isNewsSaved(userId, newsId);
    if (existing) {
      throw new Error("Berita sudah disimpan");
    }

    await this.repository.addSavedNews(userId, newsId);
    return { message: "Berita berhasil disimpan" };
  }

  async unsaveNews(userId: string, newsId: string) {
    // Check if not saved
    const existing = await this.repository.isNewsSaved(userId, newsId);
    if (!existing) {
      throw new Error("Berita belum disimpan");
    }

    await this.repository.removeSavedNews(userId, newsId);
    return { message: "Berita berhasil dihapus dari tersimpan" };
  }

  async getSavedNews(userId: string) {
    const user = await this.repository.getSavedNews(userId);
    if (!user) {
      throw new Error("Pengguna tidak ditemukan");
    }
    return user.savedNews;
  }

  async clapNews(userId: string, newsId: string) {
    // Check if already clapped
    const existing = await this.repository.hasClapped(userId, newsId);
    if (existing) {
      throw new Error("Anda sudah memberi tepuk tangan pada berita ini");
    }

    await this.repository.addClap(userId, newsId);
    return { message: "Tepuk tangan berhasil" };
  }

  async unclapNews(userId: string, newsId: string) {
    // Check if not clapped
    const existing = await this.repository.hasClapped(userId, newsId);
    if (!existing) {
      throw new Error("Anda belum memberi tepuk tangan pada berita ini");
    }

    await this.repository.removeClap(userId, newsId);
    return { message: "Tepuk tangan berhasil dihapus" };
  }

  async getClappedNews(userId: string) {
    const user = await this.repository.getClappedNews(userId);
    if (!user) {
      throw new Error("Pengguna tidak ditemukan");
    }
    return user.claps;
  }

  async hasClapped(userId: string, newsId: string) {
    const existing = await this.repository.hasClapped(userId, newsId);
    return !!existing;
  }

  async isNewsSaved(userId: string, newsId: string) {
    const existing = await this.repository.isNewsSaved(userId, newsId);
    return !!existing;
  }
}
