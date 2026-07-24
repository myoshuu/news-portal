import slugify from "slugify";
import { NewsRepository } from "@/repositories/news.repository";
import { UserRepository } from "@/repositories/user.repository";
import type { NewsQuery } from "@/repositories/news.repository";

interface CreateNewsInput {
  title: string;
  artikel: string;
  authorId: string;
  foto?: string;
  category?: string;
  tags?: string[];
}

interface UpdateNewsInput {
  title?: string;
  artikel?: string;
  foto?: string | null;
  category?: string | null;
  tags?: string[];
}

export class NewsService {
  private repository = new NewsRepository();
  private userRepository = new UserRepository();

  private generateSlug(title: string): string {
    return slugify(title, { lower: true, strict: true, locale: "id" });
  }

  async create(input: CreateNewsInput) {
    const { title, artikel, authorId, foto, category, tags } = input;

    // Check if user is a writer or admin
    const user = await this.userRepository.findById(authorId);
    if (!user) {
      throw new Error("Pengguna tidak ditemukan");
    }
    if (user.role !== "writer" && user.role !== "admin") {
      throw new Error("Hanya writer atau admin yang dapat membuat berita");
    }

    const slug = this.generateSlug(title);

    // Ensure slug uniqueness by appending a timestamp if it already exists
    const existing = await this.repository.findBySlug(slug);
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    return this.repository.create({
      title,
      slug: finalSlug,
      artikel,
      foto,
      category: category as any || undefined,
      tags,
      author: authorId as any,
      deleteStatus: "none",
    });
  }

  async findByIdNoIncrement(id: string) {
    const news = await this.repository.findById(id);
    if (!news) throw new Error("Berita tidak ditemukan");
    return news;
  }

  async findAll(query: NewsQuery) {
    return this.repository.findAll(query);
  }

  async findById(id: string) {
    const news = await this.repository.findById(id);
    if (!news) throw new Error("Berita tidak ditemukan");
    // Increment views asynchronously (fire and forget)
    this.repository.incrementViews(id).catch(() => {});
    return news;
  }

  async findBySlug(slug: string) {
    const news = await this.repository.findBySlug(slug);
    if (!news) throw new Error("Berita tidak ditemukan");
    // Increment views asynchronously (fire and forget)
    this.repository.incrementViews((news._id as any).toString()).catch(() => {});
    return news;
  }

  async update(id: string, input: UpdateNewsInput, requesterId: string, requesterRole: string) {
    const existingNews = await this.repository.findById(id);
    if (!existingNews) {
      throw new Error("Berita tidak ditemukan");
    }

    // Check authorization: only author (writer) or admin can update
    const authorId = typeof existingNews.author === "string"
      ? existingNews.author
      : existingNews.author._id?.toString?.() ?? (existingNews.author as any).toString();

    if (authorId !== requesterId && requesterRole !== "admin") {
      throw new Error("Anda tidak memiliki izin untuk memperbarui berita ini");
    }

    const updateData: Partial<typeof input & { slug?: string }> = { ...input };

    if (input.title) {
      const slug = this.generateSlug(input.title);
      const existing = await this.repository.findBySlug(slug);
      const isSameDoc = existing && (existing._id as any).toString() === id;
      updateData.slug = isSameDoc || !existing ? slug : `${slug}-${Date.now()}`;
    }

    const news = await this.repository.findByIdAndUpdate(id, updateData as any);
    if (!news) throw new Error("Berita tidak ditemukan");
    return news;
  }

  // ===== DELETE REQUEST METHODS =====

  async requestDelete(id: string, requesterId: string, reason: string) {
    const existingNews = await this.repository.findById(id);
    if (!existingNews) {
      throw new Error("Berita tidak ditemukan");
    }

    // Only author can request delete
    const authorId = typeof existingNews.author === "string"
      ? existingNews.author
      : existingNews.author._id?.toString?.() ?? (existingNews.author as any).toString();

    if (authorId !== requesterId) {
      throw new Error("Hanya penulis berita yang dapat meminta penghapusan");
    }

    // Check if already has pending request
    if (existingNews.deleteStatus === "pending") {
      throw new Error("Request hapus untuk berita ini sedang menunggu persetujuan");
    }

    const news = await this.repository.requestDelete(id, requesterId, reason);
    if (!news) throw new Error("Berita tidak ditemukan");

    return news;
  }

  async getPendingDeleteRequests(query?: { page?: number; limit?: number }) {
    return this.repository.findPendingDeletes(query);
  }

  async getMyDeleteRequests(userId: string, query?: { page?: number; limit?: number }) {
    return this.repository.findDeleteRequestsByUser(userId, query);
  }

  async approveDelete(id: string, adminId: string, reviewNote?: string) {
    const existingNews = await this.repository.findById(id);
    if (!existingNews) {
      throw new Error("Berita tidak ditemukan");
    }

    if (existingNews.deleteStatus !== "pending") {
      throw new Error("Request sudah diproses");
    }

    // Update status to approved first
    await this.repository.approveDelete(id, adminId, reviewNote);

    // Then delete the news
    await this.repository.findByIdAndDelete(id);

    return { message: "Request disetujui. Berita berhasil dihapus." };
  }

  async rejectDelete(id: string, adminId: string, reviewNote?: string) {
    const existingNews = await this.repository.findById(id);
    if (!existingNews) {
      throw new Error("Berita tidak ditemukan");
    }

    if (existingNews.deleteStatus !== "pending") {
      throw new Error("Request sudah diproses");
    }

    const news = await this.repository.rejectDelete(id, adminId, reviewNote);
    if (!news) throw new Error("Berita tidak ditemukan");

    return news;
  }

  async cancelDeleteRequest(id: string, userId: string) {
    const existingNews = await this.repository.findById(id);
    if (!existingNews) {
      throw new Error("Berita tidak ditemukan");
    }

    // Only the requester can cancel
    const requesterId = existingNews.deleteRequestedBy
      ? (typeof existingNews.deleteRequestedBy === "string"
        ? existingNews.deleteRequestedBy
        : existingNews.deleteRequestedBy._id?.toString?.() ?? (existingNews.deleteRequestedBy as any).toString())
      : null;

    if (requesterId !== userId) {
      throw new Error("Hanya pembuat request yang dapat membatalkan");
    }

    if (existingNews.deleteStatus !== "pending") {
      throw new Error("Request sudah diproses, tidak dapat dibatalkan");
    }

    const news = await this.repository.cancelDeleteRequest(id);
    if (!news) throw new Error("Berita tidak ditemukan");

    return { message: "Request berhasil dibatalkan" };
  }

  // ===== CLAP & SAVE METHODS =====

  async clap(newsId: string, userId: string) {
    const news = await this.repository.findById(newsId);
    if (!news) {
      throw new Error("Berita tidak ditemukan");
    }

    await this.userRepository.addClap(userId, newsId);
    await this.repository.incrementClapCount(newsId);

    return { message: "Tepuk tangan berhasil" };
  }

  async unclap(newsId: string, userId: string) {
    const news = await this.repository.findById(newsId);
    if (!news) {
      throw new Error("Berita tidak ditemukan");
    }

    await this.userRepository.removeClap(userId, newsId);
    await this.repository.decrementClapCount(newsId);

    return { message: "Tepuk tangan berhasil dihapus" };
  }

  async save(newsId: string, userId: string) {
    const news = await this.repository.findById(newsId);
    if (!news) {
      throw new Error("Berita tidak ditemukan");
    }

    await this.userRepository.addSavedNews(userId, newsId);
    await this.repository.incrementSaveCount(newsId);

    return { message: "Berita berhasil disimpan" };
  }

  async unsave(newsId: string, userId: string) {
    const news = await this.repository.findById(newsId);
    if (!news) {
      throw new Error("Berita tidak ditemukan");
    }

    await this.userRepository.removeSavedNews(userId, newsId);
    await this.repository.decrementSaveCount(newsId);

    return { message: "Berita berhasil dihapus dari tersimpan" };
  }

  async findByAuthor(authorId: string, query?: { page?: number; limit?: number }) {
    return this.repository.findByAuthor(authorId, query);
  }

  // Admin: delete news directly
  async adminDelete(id: string) {
    const news = await this.repository.findByIdAndDelete(id);
    if (!news) throw new Error("Berita tidak ditemukan");
    return news;
  }
}
