import User from "@/models/User";
import type { IUser, UserRole } from "@/models/User";

export interface UserQuery {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export class UserRepository {
  create(data: Partial<IUser>) {
    return User.create(data);
  }

  findByEmail(email: string) {
    return User.findOne({ email });
  }

  findByUsername(username: string) {
    return User.findOne({ username });
  }

  findById(id: string) {
    return User.findById(id).select("-password");
  }

  async findAll(query: UserQuery) {
    const { page = 1, limit = 10, role, search } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (role) filter["role"] = role;
    if (search) {
      filter["$or"] = [
        { fullName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  updateRole(id: string, role: UserRole) {
    return User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select("-password");
  }

  // Save news methods
  addSavedNews(userId: string, newsId: string) {
    return User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedNews: newsId } },
      { new: true }
    ).select("-password");
  }

  removeSavedNews(userId: string, newsId: string) {
    return User.findByIdAndUpdate(
      userId,
      { $pull: { savedNews: newsId } },
      { new: true }
    ).select("-password");
  }

  isNewsSaved(userId: string, newsId: string) {
    return User.findOne({ _id: userId, savedNews: newsId });
  }

  getSavedNews(userId: string) {
    return User.findById(userId)
      .select("savedNews")
      .populate({
        path: "savedNews",
        populate: { path: "author", select: "username fullName" },
      });
  }

  // Clap methods
  addClap(userId: string, newsId: string) {
    return User.findByIdAndUpdate(
      userId,
      { $addToSet: { claps: newsId } },
      { new: true }
    ).select("-password");
  }

  removeClap(userId: string, newsId: string) {
    return User.findByIdAndUpdate(
      userId,
      { $pull: { claps: newsId } },
      { new: true }
    ).select("-password");
  }

  hasClapped(userId: string, newsId: string) {
    return User.findOne({ _id: userId, claps: newsId });
  }

  getClappedNews(userId: string) {
    return User.findById(userId)
      .select("claps")
      .populate({
        path: "claps",
        populate: { path: "author", select: "username fullName" },
      });
  }

  // Profile update
  updateProfile(id: string, data: Partial<IUser>) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select("-password");
  }

  // Change password
  updatePassword(id: string, hashedPassword: string) {
    return User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
  }
}
