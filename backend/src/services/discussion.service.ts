import { DiscussionRepository } from "@/repositories/discussion.repository";
import { NewsRepository } from "@/repositories/news.repository";

interface CreateDiscussionInput {
  newsId: string;
  userId: string;
  comment: string;
  parentId?: string;
}

interface UpdateDiscussionInput {
  comment: string;
}

export class DiscussionService {
  private repository = new DiscussionRepository();
  private newsRepository = new NewsRepository();

  private getOwnerId(discussion: any): string | null {
    if (!discussion?.userId) return null;

    if (typeof discussion.userId === "string") {
      return discussion.userId;
    }

    if (typeof discussion.userId === "object") {
      const populatedUserId = discussion.userId._id?.toString?.();
      if (populatedUserId) return populatedUserId;
      return discussion.userId.toString?.();
    }

    return discussion.userId?.toString?.() ?? null;
  }

  async create(input: CreateDiscussionInput) {
    const { newsId, userId, comment, parentId } = input;

    // Validate the referenced news article exists
    const news = await this.newsRepository.findById(newsId);
    if (!news) throw new Error("Berita tidak ditemukan");

    if (!comment || comment.trim().length === 0) {
      throw new Error("Komentar tidak boleh kosong");
    }

    // If replying, validate parent comment exists
    if (parentId) {
      const parentComment = await this.repository.findById(parentId);
      if (!parentComment) {
        throw new Error("Komentar induk tidak ditemukan");
      }
      if (parentComment.newsId.toString() !== newsId) {
        throw new Error("Komentar tidak belongs to berita ini");
      }
    }

    return this.repository.create({
      newsId: newsId as any,
      userId: userId as any,
      comment: comment.trim(),
      parentId: parentId as any || undefined,
    });
  }

  async findByNewsId(newsId: string) {
    // Validate the referenced news article exists
    const news = await this.newsRepository.findById(newsId);
    if (!news) throw new Error("Berita tidak ditemukan");

    // Get main comments
    const comments = await this.repository.findByNewsId(newsId);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this.repository.findReplies(comment._id.toString());
        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    return commentsWithReplies;
  }

  async update(discussionId: string, input: UpdateDiscussionInput, requesterId: string) {
    const discussion = await this.repository.findById(discussionId);
    if (!discussion) throw new Error("Komentar tidak ditemukan");

    const ownerId = this.getOwnerId(discussion);
    if (!ownerId) {
      throw new Error("Data pemilik komentar tidak valid");
    }

    // Only the comment owner can update their comment
    if (ownerId !== requesterId) {
      throw new Error("Anda tidak memiliki izin untuk memperbarui komentar ini");
    }

    if (!input.comment || input.comment.trim().length === 0) {
      throw new Error("Komentar tidak boleh kosong");
    }

    const updated = await this.repository.findByIdAndUpdate(
      discussionId,
      { comment: input.comment.trim() },
    );
    if (!updated) throw new Error("Gagal memperbarui komentar");

    return updated;
  }

  async delete(discussionId: string, requesterId: string, requesterRole: string) {
    const discussion = await this.repository.findById(discussionId);
    if (!discussion) throw new Error("Komentar tidak ditemukan");

    const ownerId = this.getOwnerId(discussion);
    if (!ownerId) {
      throw new Error("Data pemilik komentar tidak valid");
    }

    const isOwner = ownerId === requesterId;
    const isAdmin = requesterRole === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Anda tidak memiliki izin untuk menghapus komentar ini");
    }

    // Delete replies first
    await this.repository.deleteReplies(discussionId);

    // Delete the comment
    await this.repository.findByIdAndDelete(discussionId);
    return { message: "Komentar berhasil dihapus" };
  }
}
