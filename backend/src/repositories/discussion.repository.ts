import Discussion from "@/models/Discussion";
import type { IDiscussion } from "@/models/Discussion";

export class DiscussionRepository {
  create(data: Partial<IDiscussion>) {
    return Discussion.create(data);
  }

  findByNewsId(newsId: string) {
    return Discussion.find({ newsId, parentId: null })
      .populate("userId", "username fullName")
      .sort({ createdAt: -1 });
  }

  findReplies(parentId: string) {
    return Discussion.find({ parentId })
      .populate("userId", "username fullName")
      .sort({ createdAt: 1 });
  }

  findById(id: string) {
    return Discussion.findById(id).populate("userId", "username fullName");
  }

  findByIdAndUpdate(id: string, data: Partial<IDiscussion>) {
    return Discussion.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate("userId", "username fullName");
  }

  findByIdAndDelete(id: string) {
    return Discussion.findByIdAndDelete(id);
  }

  // Delete all replies when parent comment is deleted
  deleteReplies(parentId: string) {
    return Discussion.deleteMany({ parentId });
  }

  // Count comments for a news
  countByNewsId(newsId: string) {
    return Discussion.countDocuments({ newsId, parentId: null });
  }
}
