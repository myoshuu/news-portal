import Category from "@/models/Category";
import type { ICategory } from "@/models/Category";

export class CategoryRepository {
  create(data: Partial<ICategory>) {
    return Category.create(data);
  }

  findAll(options?: { includeInactive?: boolean }) {
    const filter = options?.includeInactive ? {} : { isActive: true };
    return Category.find(filter).sort({ name: 1 }).populate("createdBy", "username fullName");
  }

  findById(id: string) {
    return Category.findById(id);
  }

  findBySlug(slug: string) {
    return Category.findOne({ slug });
  }

  findByName(name: string) {
    return Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
  }

  update(id: string, data: Partial<ICategory>) {
    return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  delete(id: string) {
    return Category.findByIdAndDelete(id);
  }

  toggleActive(id: string) {
    return Category.findByIdAndUpdate(
      id,
      [{ $set: { isActive: { $not: "$isActive" } } }],
      { new: true }
    );
  }
}
