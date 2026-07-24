import type { ApiResponse, Category, DiscussionItem, NewsArticle, UserProfile } from "../types/news";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getCurrentUser(): UserProfile | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user: UserProfile) {
  localStorage.setItem("user", JSON.stringify(user));
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json();
    return json;
  } catch (error: any) {
    return {
      sukses: false,
      pesan: error.message || "Gagal terhubung ke server",
    };
  }
}

export const api = {
  // Auth
  login: (data: any) => request<{ token: string; user: UserProfile }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: any) => request<{ user: UserProfile }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  changePassword: (data: any) => request("/auth/change-password", { method: "POST", body: JSON.stringify(data) }),

  // User Profile & Management
  getProfile: () => request<UserProfile>("/users/profile"),
  updateProfile: (data: any) => request<UserProfile>("/users/profile", { method: "PUT", body: JSON.stringify(data) }),
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<UserProfile[]>(`/users${query ? `?${query}` : ""}`);
  },
  updateUserRole: (data: { userId: string; role: string; reason?: string }) =>
    request<UserProfile>("/users/role", { method: "PUT", body: JSON.stringify(data) }),

  // User Interactions (Clap & Save)
  clapNews: (newsId: string) => request(`/news/${newsId}/clap`, { method: "POST" }),
  unclapNews: (newsId: string) => request(`/news/${newsId}/clap`, { method: "DELETE" }),
  getClappedNews: () => request<NewsArticle[]>("/users/clapped"),
  
  saveNews: (newsId: string) => request(`/news/${newsId}/save`, { method: "POST" }),
  unsaveNews: (newsId: string) => request(`/news/${newsId}/save`, { method: "DELETE" }),
  getSavedNews: () => request<NewsArticle[]>("/users/saved"),

  // Categories
  getCategories: (includeInactive = false) =>
    request<Category[]>(`/categories${includeInactive ? "?includeInactive=true" : ""}`),
  getCategoryById: (id: string) => request<Category>(`/categories/${id}`),
  createCategory: (data: { name: string; description?: string }) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: { name?: string; description?: string }) =>
    request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggleCategory: (id: string) => request<Category>(`/categories/${id}`, { method: "DELETE" }),

  // News
  getNews: (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.category) queryParams.category = params.category;
    if (params?.search) queryParams.search = params.search;
    const query = new URLSearchParams(queryParams).toString();
    return request<NewsArticle[]>(`/news${query ? `?${query}` : ""}`);
  },
  getNewsById: (id: string) => request<NewsArticle>(`/news/${id}`),
  getNewsBySlug: (slug: string) => request<NewsArticle>(`/news/slug/${slug}`),
  getMyNews: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<NewsArticle[]>(`/news/my/list${query ? `?${query}` : ""}`);
  },
  createNews: (data: any) => request<NewsArticle>("/news", { method: "POST", body: JSON.stringify(data) }),
  updateNews: (id: string, data: any) => request<NewsArticle>(`/news/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  
  // Delete Request Workflow (Writer & Admin)
  requestDeleteNews: (id: string, reason: string) =>
    request(`/news/${id}/request-delete`, { method: "POST", body: JSON.stringify({ reason }) }),
  cancelDeleteRequest: (id: string) =>
    request(`/news/${id}/request-delete`, { method: "DELETE" }),
  getMyDeleteRequests: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<NewsArticle[]>(`/news/my/delete-requests${query ? `?${query}` : ""}`);
  },
  getAdminDeleteRequests: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<NewsArticle[]>(`/news/admin/delete-requests${query ? `?${query}` : ""}`);
  },
  approveDeleteRequest: (id: string, reviewNote?: string) =>
    request(`/news/admin/delete-requests/${id}/approve`, { method: "POST", body: JSON.stringify({ reviewNote }) }),
  rejectDeleteRequest: (id: string, reviewNote?: string) =>
    request(`/news/admin/delete-requests/${id}/reject`, { method: "POST", body: JSON.stringify({ reviewNote }) }),

  // Discussions (Threaded Comments)
  getDiscussions: (newsId: string) => request<DiscussionItem[]>(`/news/${newsId}/discussions`),
  createDiscussion: (newsId: string, comment: string, parentId?: string) =>
    request<DiscussionItem>(`/news/${newsId}/discussions`, {
      method: "POST",
      body: JSON.stringify({ comment, parentId: parentId || undefined }),
    }),
  updateDiscussion: (id: string, comment: string) =>
    request<DiscussionItem>(`/discussions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ comment }),
    }),
  deleteDiscussion: (id: string) => request(`/discussions/${id}`, { method: "DELETE" }),
};
