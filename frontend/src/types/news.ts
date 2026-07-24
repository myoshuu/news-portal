export type UserRole = "admin" | "writer" | "user";

export interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeleteRequest {
  requestedBy?: string | UserProfile;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
  reviewedBy?: string | UserProfile;
  createdAt?: string;
}

export interface NewsArticle {
  _id: string;
  title: string;
  slug?: string;
  artikel: string;
  foto?: string;
  category?: Category | string;
  tags?: string[];
  author?: {
    _id: string;
    fullName: string;
    username: string;
  };
  views?: number;
  clapCount?: number;
  clapsCount?: number;
  saveCount?: number;
  savesCount?: number;
  deleteRequest?: DeleteRequest;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionItem {
  _id: string;
  newsId: string;
  userId: {
    _id: string;
    fullName: string;
    username: string;
  };
  parentId?: string | null;
  comment: string;
  createdAt: string;
  updatedAt: string;
  replies?: DiscussionItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  sukses: boolean;
  pesan: string;
  data?: T;
  pagination?: PaginationMeta;
  kesalahan?: Record<string, any>;
}

export interface NewsResponse {
  sukses?: boolean;
  pesan?: string;
  data?: NewsArticle[];
  news?: NewsArticle[];
  pagination?: PaginationMeta;
  total?: number;
  page?: number;
  totalPages?: number;
  pages?: number;
}
