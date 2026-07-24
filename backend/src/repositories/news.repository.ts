import News from "@/models/News";
import type { INews, DeleteStatus } from "@/models/News";

export interface NewsQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export class NewsRepository {
  async create(data: Partial<INews>) {
    return News.create(data);
  }

  async findAll(query: NewsQuery) {
    const { page = 1, limit = 10, category, search } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (category) filter["category"] = category;
    if (search) filter["title"] = { $regex: search, $options: "i" };

    const [data, total] = await Promise.all([
      News.find(filter)
        .populate("author", "username fullName")
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      News.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: string) {
    return News.findById(id)
      .populate("author", "username fullName")
      .populate("category", "name slug");
  }

  findBySlug(slug: string) {
    return News.findOne({ slug })
      .populate("author", "username fullName")
      .populate("category", "name slug");
  }

  findByIdAndUpdate(id: string, data: Partial<INews>) {
    return News.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate("author", "username fullName")
      .populate("category", "name slug");
  }

  incrementViews(id: string) {
    return News.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
  }

  // Clap methods
  incrementClapCount(id: string) {
    return News.findByIdAndUpdate(id, { $inc: { clapCount: 1 } }, { new: true });
  }

  decrementClapCount(id: string) {
    return News.findByIdAndUpdate(
      id,
      { $inc: { clapCount: -1 } },
      { new: true }
    );
  }

  // Save methods
  incrementSaveCount(id: string) {
    return News.findByIdAndUpdate(id, { $inc: { saveCount: 1 } }, { new: true });
  }

  decrementSaveCount(id: string) {
    return News.findByIdAndUpdate(id, { $inc: { saveCount: -1 } }, { new: true });
  }

  findByIdAndDelete(id: string) {
    return News.findByIdAndDelete(id);
  }

  // Find news by author
  findByAuthor(authorId: string, query?: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    return News.find({ author: authorId })
      .populate("author", "username fullName")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  // Delete request methods
  requestDelete(id: string, requestedBy: string, reason: string) {
    return News.findByIdAndUpdate(
      id,
      {
        deleteStatus: "pending",
        deleteRequestedBy: requestedBy,
        deleteReason: reason,
        deleteReviewedBy: null,
        deleteReviewedAt: null,
        deleteReviewNote: null,
      },
      { new: true }
    ).populate("author", "username fullName").populate("category", "name slug");
  }

  approveDelete(id: string, reviewedBy: string, reviewNote?: string) {
    return News.findByIdAndUpdate(
      id,
      {
        deleteStatus: "approved",
        deleteReviewedBy: reviewedBy,
        deleteReviewedAt: new Date(),
        deleteReviewNote: reviewNote || null,
      },
      { new: true }
    );
  }

  rejectDelete(id: string, reviewedBy: string, reviewNote?: string) {
    return News.findByIdAndUpdate(
      id,
      {
        deleteStatus: "rejected",
        deleteReviewedBy: reviewedBy,
        deleteReviewedAt: new Date(),
        deleteReviewNote: reviewNote || null,
      },
      { new: true }
    );
  }

  cancelDeleteRequest(id: string) {
    return News.findByIdAndUpdate(
      id,
      {
        deleteStatus: "none",
        deleteRequestedBy: null,
        deleteReason: null,
      },
      { new: true }
    );
  }

  // Find pending delete requests (for admin)
  findPendingDeletes(query?: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    return Promise.all([
      News.find({ deleteStatus: "pending" })
        .populate("author", "username fullName")
        .populate("category", "name slug")
        .populate("deleteRequestedBy", "username fullName")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      News.countDocuments({ deleteStatus: "pending" }),
    ]).then(([data, total]) => ({ data, total, page, limit, totalPages: Math.ceil(total / limit) }));
  }

  // Find delete requests by user
  findDeleteRequestsByUser(userId: string, query?: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    return Promise.all([
      News.find({
        deleteRequestedBy: userId,
        deleteStatus: { $in: ["pending", "approved", "rejected"] },
      })
        .populate("author", "username fullName")
        .populate("category", "name slug")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      News.countDocuments({
        deleteRequestedBy: userId,
        deleteStatus: { $in: ["pending", "approved", "rejected"] },
      }),
    ]).then(([data, total]) => ({ data, total, page, limit, totalPages: Math.ceil(total / limit) }));
  }
}
