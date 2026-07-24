import { Schema, model, Types } from "mongoose";

export type DeleteStatus = "none" | "pending" | "approved" | "rejected";

export interface INews {
  title: string;
  slug: string;
  foto?: string;
  artikel: string;
  author: Types.ObjectId;
  category?: Types.ObjectId;
  tags?: string[];
  views: number;
  clapCount: number;
  saveCount: number;
  // Delete request fields
  deleteStatus: DeleteStatus;
  deleteRequestedBy?: Types.ObjectId;
  deleteReason?: string;
  deleteReviewedBy?: Types.ObjectId;
  deleteReviewedAt?: Date;
  deleteReviewNote?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const newsSchema = new Schema<INews>(
  {
    title:    { type: String, required: true, trim: true },
    slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    foto:     { type: String, default: null },
    artikel:  { type: String, required: true },
    author:   { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    tags:     { type: [String], default: [] },
    views:    { type: Number, default: 0 },
    clapCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    // Delete request fields
    deleteStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
    deleteRequestedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    deleteReason: { type: String, default: null },
    deleteReviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    deleteReviewedAt: { type: Date, default: null },
    deleteReviewNote: { type: String, default: null },
  },
  { timestamps: true }
);

// Index untuk optimasi query
newsSchema.index({ author: 1 });
newsSchema.index({ category: 1 });
// (slug is indexed automatically via unique: true)
newsSchema.index({ createdAt: -1 });
newsSchema.index({ deleteStatus: 1 });

export default model<INews>("News", newsSchema);
