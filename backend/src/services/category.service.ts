import slugify from "slugify";
import { CategoryRepository } from "@/repositories/category.repository";

export class CategoryService {
  private repository = new CategoryRepository();

  private generateSlug(name: string): string {
    return slugify(name, { lower: true, strict: true, locale: "id" });
  }

  async create(data: { name: string; description?: string }, createdBy: string) {
    // Check if category name already exists
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      throw new Error("Kategori dengan nama tersebut sudah ada");
    }

    const slug = this.generateSlug(data.name);

    return this.repository.create({
      name: data.name.trim(),
      slug,
      description: data.description?.trim(),
      createdBy: createdBy as any,
    });
  }

  async findAll(includeInactive = false) {
    return this.repository.findAll({ includeInactive });
  }

  async findById(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new Error("Kategori tidak ditemukan");
    }
    return category;
  }

  async update(id: string, data: { name?: string; description?: string }) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new Error("Kategori tidak ditemukan");
    }

    // If name is being updated, check for duplicates
    if (data.name) {
      const existing = await this.repository.findByName(data.name);
      if (existing && existing._id.toString() !== id) {
        throw new Error("Kategori dengan nama tersebut sudah ada");
      }
      data.name = data.name.trim();
    }

    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = this.generateSlug(data.name);
    }

    const updated = await this.repository.update(id, updateData);
    if (!updated) {
      throw new Error("Gagal memperbarui kategori");
    }

    return updated;
  }

  async delete(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new Error("Kategori tidak ditemukan");
    }

    await this.repository.delete(id);
    return { message: "Kategori berhasil dihapus" };
  }

  async toggleActive(id: string) {
    const category = await this.repository.toggleActive(id);
    if (!category) {
      throw new Error("Kategori tidak ditemukan");
    }

    return {
      message: category.isActive ? "Kategori berhasil diaktifkan" : "Kategori berhasil dinonaktifkan",
      isActive: category.isActive,
    };
  }
}
