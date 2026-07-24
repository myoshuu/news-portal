import { Schema, model, Types } from "mongoose";

export type UserRole = "admin" | "writer" | "user";

export interface IUser {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  savedNews: Types.ObjectId[];
  claps: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["admin", "writer", "user"], default: "user" },
    savedNews: { type: [Schema.Types.ObjectId], ref: "News", default: [] },
    claps:    { type: [Schema.Types.ObjectId], ref: "News", default: [] },
  },
  { timestamps: true }
);

// Index untuk optimasi query (email dan username otomatis dibuat unik/indeks)
userSchema.index({ role: 1 });

export default model<IUser>("User", userSchema);
