import { Schema, model, Types } from "mongoose";

export interface IDiscussion {
  newsId: Types.ObjectId;
  userId: Types.ObjectId;
  parentId?: Types.ObjectId;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const discussionSchema = new Schema<IDiscussion>(
  {
    newsId:   { type: Schema.Types.ObjectId, ref: "News", required: true },
    userId:   { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Discussion", default: null },
    comment:  { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Index untuk optimasi query
discussionSchema.index({ newsId: 1, createdAt: -1 });
discussionSchema.index({ parentId: 1 });
discussionSchema.index({ userId: 1 });

export default model<IDiscussion>("Discussion", discussionSchema);
