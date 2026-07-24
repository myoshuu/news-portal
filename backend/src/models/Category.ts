import { Schema, model, Types } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, default: null },
    createdBy:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index untuk optimasi query
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });

export default model<ICategory>("Category", categorySchema);
