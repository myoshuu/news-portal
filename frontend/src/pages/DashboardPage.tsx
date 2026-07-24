import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  FileText,
  SquarePen,
  Globe,
  ArrowLeft,
  Eye,
  Trash2,
  Plus,
  TrendingUp,
  FolderKanban,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Bookmark,
  UserCog,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArticleCard } from "@/features/article/components/ArticleCard";
import { toast } from "@/components/ui/toast";
import type { Category, NewsArticle, UserProfile } from "@/types/news";
import { api, getCurrentUser, getToken, setCurrentUser } from "@/lib/api";

type TabType =
  | "overview"
  | "my-articles"
  | "all-articles"
  | "write-article"
  | "categories"
  | "users-role"
  | "delete-requests"
  | "saved-articles"
  | "clapped-articles"
  | "profile-settings";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Auth User & Token
  const token = getToken();
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role || "user";
  const isAdmin = userRole === "admin";
  const isWriter = userRole === "writer" || isAdmin;

  // Data State
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [deleteRequestsList, setDeleteRequestsList] = useState<NewsArticle[]>([]);
  const [savedArticles, setSavedArticles] = useState<NewsArticle[]>([]);
  const [clappedArticles, setClappedArticles] = useState<NewsArticle[]>([]);
  const [myArticlesState, setMyArticlesState] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State untuk Write/Edit Article
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState<string>("");
  const [formFoto, setFormFoto] = useState("");
  const [formTags, setFormTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State untuk Update Profile
  const [profileFullName, setProfileFullName] = useState(currentUser?.fullName || "");
  const [profileUsername, setProfileUsername] = useState(currentUser?.username || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Form State untuk Ganti Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Modal State untuk Category Create/Edit
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Modal State untuk Role Change
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<"writer" | "user">("writer");
  const [roleReason, setRoleReason] = useState("");

  // Modal State untuk Request Delete (Writer)
  const [reqDeleteModalOpen, setReqDeleteModalOpen] = useState(false);
  const [targetArticleId, setTargetArticleId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Modal State untuk Review Delete (Admin)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewArticleId, setReviewArticleId] = useState<string | null>(null);
  const [reviewActionType, setReviewActionType] = useState<"approve" | "reject">("approve");
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    if (!token || !currentUser) {
      toast.error("Akses Ditolak", "Silakan login terlebih dahulu untuk mengakses Dashboard.");
      navigate("/login");
      return;
    }
  }, [token, currentUser, navigate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Articles
      const resNews = await api.getNews({ limit: 100 });
      if (resNews.sukses) {
        const list = Array.isArray(resNews.data)
          ? resNews.data
          : (resNews.data && Array.isArray((resNews.data as any).data))
          ? (resNews.data as any).data
          : [];
        setArticles(list);
      } else if (Array.isArray(resNews as any)) {
        setArticles(resNews as any);
      }

      // 2. Fetch My Articles directly from /api/news/my/list
      if (isWriter) {
        const resMy = await api.getMyNews({ limit: 100 });
        if (resMy.sukses) {
          const listMy = Array.isArray(resMy.data)
            ? resMy.data
            : (resMy.data && Array.isArray((resMy.data as any).data))
            ? (resMy.data as any).data
            : [];
          setMyArticlesState(listMy);
        }
      }

      // 3. Fetch Categories
      const resCat = await api.getCategories(isAdmin);
      if (resCat.sukses && Array.isArray(resCat.data)) {
        setCategories(resCat.data);
      }

      // 4. Admin specific: Users & Delete Requests
      if (isAdmin) {
        const resUsers = await api.getUsers({ limit: 100 });
        if (resUsers.sukses) {
          const listUsers = Array.isArray(resUsers.data)
            ? resUsers.data
            : (resUsers.data && Array.isArray((resUsers.data as any).data))
            ? (resUsers.data as any).data
            : [];
          setUserList(listUsers);
        }

        const resDelReqs = await api.getAdminDeleteRequests({ limit: 100 });
        if (resDelReqs.sukses) {
          const listDel = Array.isArray(resDelReqs.data)
            ? resDelReqs.data
            : (resDelReqs.data && Array.isArray((resDelReqs.data as any).data))
            ? (resDelReqs.data as any).data
            : [];
          setDeleteRequestsList(listDel);
        }
      } else if (isWriter) {
        const resMyDelReqs = await api.getMyDeleteRequests({ limit: 100 });
        if (resMyDelReqs.sukses) {
          const listMyDel = Array.isArray(resMyDelReqs.data)
            ? resMyDelReqs.data
            : (resMyDelReqs.data && Array.isArray((resMyDelReqs.data as any).data))
            ? (resMyDelReqs.data as any).data
            : [];
          setDeleteRequestsList(listMyDel);
        }
      }

      // 5. Saved & Clapped articles for user
      const resSaved = await api.getSavedNews();
      if (resSaved.sukses && Array.isArray(resSaved.data)) {
        setSavedArticles(resSaved.data);
      }

      const resClapped = await api.getClappedNews();
      if (resClapped.sukses && Array.isArray(resClapped.data)) {
        setClappedArticles(resClapped.data);
      }
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadInitialData();
    }
  }, [token, isAdmin, isWriter]);

  // Robust Author Matching Fallback
  const fallbackMyArticles = articles.filter((a) => {
    if (!currentUser) return false;
    const authorId = typeof a.author === "object" ? a.author?._id : a.author;
    const authorUsername = typeof a.author === "object" ? a.author?.username : undefined;
    const authorFullName = typeof a.author === "object" ? a.author?.fullName : undefined;

    return (
      (authorId && currentUser._id && String(authorId) === String(currentUser._id)) ||
      (authorUsername && currentUser.username && authorUsername === currentUser.username) ||
      (authorFullName && currentUser.fullName && authorFullName === currentUser.fullName)
    );
  });

  const myArticles = myArticlesState.length > 0 ? myArticlesState : fallbackMyArticles;

  const targetArticles = isAdmin ? articles : myArticles;
  const totalViews = targetArticles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClaps = targetArticles.reduce((acc, curr) => acc + (curr.clapCount ?? curr.clapsCount ?? 0), 0);
  const publishedCount = targetArticles.length;
  const topArticles = targetArticles.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

  // Profile Update Handler
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profileFullName.trim() && !profileUsername.trim()) {
      toast.warning("Form Kosong", "Isi nama lengkap atau username yang ingin diperbarui.");
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await api.updateProfile({
        fullName: profileFullName.trim() || undefined,
        username: profileUsername.trim() || undefined,
      });

      if (res.sukses && res.data) {
        setCurrentUser(res.data);
        toast.success("Profil Diperbarui!", "Data profil Anda berhasil diperbarui di database.");
      } else {
        toast.error("Gagal Memperbarui Profil", res.pesan || "Terjadi kesalahan.");
      }
    } catch (e: any) {
      toast.error("Error", e.message || "Gagal memperbarui profil.");
    } finally {
      setUpdatingProfile(false);
    }
  }

  // Change Password Handler
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.warning("Form Belum Lengkap", "Password lama dan password baru wajib diisi.");
      return;
    }
    if (newPassword.length < 8) {
      toast.warning("Password Terlalu Pendek", "Password baru minimal 8 karakter.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.sukses) {
        toast.success("Password Diubah!", "Password Anda berhasil diperbarui.");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error("Gagal Ubah Password", res.pesan || "Password saat ini tidak valid.");
      }
    } catch (e: any) {
      toast.error("Error", e.message || "Gagal memperbarui password.");
    } finally {
      setChangingPassword(false);
    }
  }

  // Image Upload Handler
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format Salah", "Harap pilih file gambar (JPG, PNG, dll).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File Terlalu Besar", "Ukuran maksimal gambar adalah 5MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const t = getToken();
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      // If baseUrl already ends with /api, we just append /upload
      const endpoint = baseUrl.endsWith("/api") ? `${baseUrl}/upload` : `${baseUrl}/api/upload`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.sukses) {
        throw new Error(data.pesan || "Gagal mengunggah gambar");
      }

      setFormFoto(data.url);
      toast.success("Berhasil", "Gambar berhasil diunggah!");
    } catch (e: any) {
      toast.error("Error Upload", e.message);
    } finally {
      setUploadingImage(false);
    }
  }

  // Submit Handler: Write / Edit News
  async function handleSubmitArticle(e: React.FormEvent) {
    e.preventDefault();

    if (!isWriter) {
      toast.error(
        "Akses Ditolak",
        "Role Anda saat ini adalah 'user'. Minta Admin untuk mengubah role Anda menjadi 'writer' di menu User & Role terlebih dahulu."
      );
      return;
    }

    if (!formTitle.trim()) {
      toast.warning("Form Belum Lengkap", "Judul berita wajib diisi!");
      return;
    }
    if (formTitle.trim().length < 5) {
      toast.warning("Judul Terlalu Pendek", "Judul berita minimal 5 karakter.");
      return;
    }
    if (!formContent.trim()) {
      toast.warning("Form Belum Lengkap", "Isi artikel berita wajib diisi!");
      return;
    }
    if (formContent.trim().length < 20) {
      toast.warning("Isi Artikel Terlalu Pendek", "Isi artikel berita minimal 20 karakter.");
      return;
    }

    setSubmitting(true);
    try {
      const tagsArray = formTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        title: formTitle.trim(),
        artikel: formContent.trim(),
        category: formCategory || undefined,
        foto: formFoto.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000",
        tags: tagsArray,
      };

      const res = editingId
        ? await api.updateNews(editingId, payload)
        : await api.createNews(payload);

      if (res.sukses) {
        toast.success(
          editingId ? "Berhasil Memperbarui!" : "Berhasil Menerbitkan!",
          editingId ? "Artikel berhasil diperbarui di database." : "Artikel baru telah diterbitkan."
        );
        resetArticleForm();
        await loadInitialData();
        setActiveTab("my-articles");
      } else {
        let detailError = res.pesan || "Terjadi kesalahan saat menyimpan artikel.";
        if (res.kesalahan && typeof res.kesalahan === "object") {
          const errorMessages: string[] = [];
          Object.entries(res.kesalahan).forEach(([field, value]: [string, any]) => {
            if (value?._errors && Array.isArray(value._errors)) {
              errorMessages.push(`${field}: ${value._errors.join(", ")}`);
            } else if (typeof value === "string") {
              errorMessages.push(value);
            }
          });
          if (errorMessages.length > 0) {
            detailError = errorMessages.join(" | ");
          }
        }
        toast.error("Gagal Menyimpan", detailError);
      }
    } catch (error: any) {
      toast.error("Terjadi Kesalahan", error.message || "Gagal terhubung ke server database.");
    } finally {
      setSubmitting(false);
    }
  }

  // Delete Request Workflow (Writer)
  const handleOpenRequestDelete = (id: string) => {
    setTargetArticleId(id);
    setDeleteReason("");
    setReqDeleteModalOpen(true);
  };

  const handleSendDeleteRequest = async () => {
    if (!targetArticleId || !deleteReason.trim()) {
      toast.warning("Alasan Wajib Diisi", "Berikan alasan pengajuan hapus artikel (min. 10 karakter).");
      return;
    }

    try {
      const res = await api.requestDeleteNews(targetArticleId, deleteReason.trim());
      if (res.sukses) {
        toast.success("Request Terkirim", "Pengajuan hapus telah dikirim ke Admin untuk ditinjau.");
        setReqDeleteModalOpen(false);
        await loadInitialData();
      } else {
        toast.error("Gagal Mengajukan", res.pesan || "Terjadi kesalahan.");
      }
    } catch (e: any) {
      toast.error("Error", e.message || "Gagal mengirim request.");
    }
  };

  const handleCancelDeleteRequest = async (id: string) => {
    try {
      const res = await api.cancelDeleteRequest(id);
      if (res.sukses) {
        toast.success("Dibatalkan", "Pengajuan hapus berita berhasil dibatalkan.");
        await loadInitialData();
      } else {
        toast.error("Gagal", res.pesan || "Gagal membatalkan request.");
      }
    } catch (e: any) {
      toast.error("Error", e.message || "Gagal membatalkan request.");
    }
  };

  // Admin Review Delete Request (Approve / Reject)
  const handleOpenReviewDelete = (id: string, action: "approve" | "reject") => {
    setReviewArticleId(id);
    setReviewActionType(action);
    setReviewNote("");
    setReviewModalOpen(true);
  };

  const handleExecuteReviewDelete = async () => {
    if (!reviewArticleId) return;

    try {
      const res =
        reviewActionType === "approve"
          ? await api.approveDeleteRequest(reviewArticleId, reviewNote.trim())
          : await api.rejectDeleteRequest(reviewArticleId, reviewNote.trim());

      if (res.sukses) {
        toast.success(
          reviewActionType === "approve" ? "Disetujui" : "Ditolak",
          res.pesan || "Status request hapus berhasil diperbarui."
        );
        setReviewModalOpen(false);
        await loadInitialData();
      } else {
        toast.error("Gagal", res.pesan || "Terjadi kesalahan.");
      }
    } catch (e: any) {
      toast.error("Error", e.message || "Gagal mengeksekusi peninjauan.");
    }
  };

  // Category Management Handlers (Admin)
  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      toast.warning("Nama Kategori", "Nama kategori wajib diisi!");
      return;
    }

    try {
      const res = editingCatId
        ? await api.updateCategory(editingCatId, { name: catName.trim(), description: catDesc.trim() })
        : await api.createCategory({ name: catName.trim(), description: catDesc.trim() });

      if (res.sukses) {
        toast.success("Berhasil", editingCatId ? "Kategori diperbarui!" : "Kategori baru dibuat!");
        setCatModalOpen(false);
        await loadInitialData();
      } else {
        toast.error("Gagal", res.pesan || "Terjadi kesalahan.");
      }
    } catch (e: any) {
      toast.error("Error", e.message || "Gagal menyimpan kategori.");
    }
  };

  const handleToggleCategory = async (id: string) => {
    try {
      const res = await api.toggleCategory(id);
      if (res.sukses) {
        toast.success("Berhasil", "Status aktif kategori diperbarui!");
        await loadInitialData();
      } else {
        toast.error("Gagal", res.pesan || "Gagal mengubah status kategori.");
      }
    } catch (e: any) {
      toast.error("Error", e.message || "Gagal mengubah status kategori.");
    }
  };

  // User Role Management Handler (Admin)
  const handleSaveUserRole = async () => {
    if (!targetUserId) return;

    try {
      const res = await api.updateUserRole({
        userId: targetUserId,
        role: newRole,
        reason: roleReason.trim() || undefined,
      });

      if (res.sukses) {
        toast.success("Role Diperbarui", `Role pengguna berhasil diubah menjadi ${newRole.toUpperCase()}.`);
        setRoleModalOpen(false);
        await loadInitialData();
      } else {
        toast.error("Gagal", res.pesan || "Gagal mengubah role.");
      }
    } catch (e: any) {
      toast.error("Error", e.message || "Gagal mengubah role.");
    }
  };

  function handleStartEdit(article: NewsArticle) {
    setEditingId(article._id);
    setFormTitle(article.title);
    setFormContent(article.artikel);
    const catId = typeof article.category === "object" ? article.category?._id : article.category || "";
    setFormCategory(catId);
    setFormFoto(article.foto || "");
    setFormTags(article.tags?.join(", ") || "");
    setActiveTab("write-article");
  }

  function resetArticleForm() {
    setEditingId(null);
    setFormTitle("");
    setFormContent("");
    setFormCategory("");
    setFormFoto("");
    setFormTags("");
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* SIDEBAR KIRI */}
      <aside className="w-64 border-r border-border/60 bg-card/40 p-6 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="space-y-1.5 border-b border-border/40 pb-4">
            <h2 className="font-extrabold text-lg tracking-tight text-foreground">
              Dashboard Panel
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium truncate">
                {currentUser?.fullName}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 py-0">
                {userRole}
              </Badge>
            </div>
          </div>

          {/* Menu Navigasi Utama */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>

            {isWriter && (
              <>
                <button
                  onClick={() => setActiveTab("my-articles")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "my-articles"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Artikel Saya ({myArticles.length})
                </button>

                <button
                  onClick={() => {
                    resetArticleForm();
                    setActiveTab("write-article");
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "write-article"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <SquarePen className="w-4 h-4" />
                  {editingId ? "Edit Artikel" : "Tulis Artikel"}
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab("saved-articles")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "saved-articles"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Tersimpan ({savedArticles.length})
            </button>

            <button
              onClick={() => setActiveTab("clapped-articles")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "clapped-articles"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              Di-Clap Saya ({clappedArticles.length})
            </button>

            <button
              onClick={() => setActiveTab("profile-settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "profile-settings"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <UserCog className="w-4 h-4" />
              Profil & Keamanan
            </button>
          </div>

          {/* Menu Khusus Admin */}
          {isAdmin && (
            <div className="space-y-1.5 pt-4 border-t border-border/40">
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                ADMIN CONTROL
              </p>
              <button
                onClick={() => setActiveTab("categories")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "categories"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                Kelola Kategori
              </button>

              <button
                onClick={() => setActiveTab("users-role")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "users-role"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Users className="w-4 h-4" />
                User & Role
              </button>

              <button
                onClick={() => setActiveTab("delete-requests")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "delete-requests"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Request Hapus ({deleteRequestsList.length})
              </button>

              <button
                onClick={() => setActiveTab("all-articles")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "all-articles"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Globe className="w-4 h-4" />
                Semua Berita ({articles.length})
              </button>
            </div>
          )}
        </div>

        {/* Back to Portal */}
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="w-full rounded-xl justify-center text-xs font-semibold gap-2 border-border/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Ke Portal Berita
        </Button>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto overflow-y-auto">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground animate-pulse flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-xs font-medium">Memuat data dashboard...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ringkasan Statistik</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    {isAdmin
                      ? "Ringkasan statistik platform dan publikasi berita."
                      : "Statistik performa artikel dan aktivitas Anda."}
                  </p>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-medium">Total Pembaca (Views)</span>
                      <Eye className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">{totalViews.toLocaleString()}</span>
                      <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> views
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-medium">Artikel Diterbitkan</span>
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">{publishedCount}</span>
                      <span className="text-xs font-medium text-emerald-600">terbit</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-medium">Total Tepukan (Claps)</span>
                      <ThumbsUp className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">{totalClaps.toLocaleString()}</span>
                      <span className="text-xs font-medium text-muted-foreground">claps</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-border/60 bg-card/60 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-medium">Tersimpan</span>
                      <Bookmark className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">{savedArticles.length}</span>
                      <span className="text-xs font-medium text-muted-foreground">koleksi</span>
                    </div>
                  </div>
                </div>

                {/* Top Articles */}
                <div className="space-y-4 pt-4">
                  <h2 className="text-lg font-bold tracking-tight">Artikel Paling Populer</h2>
                  {topArticles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Belum ada artikel yang diterbitkan.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {topArticles.map((item) => (
                        <ArticleCard key={item._id} news={item} formatDate={formatDate} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MY ARTICLES TAB */}
            {activeTab === "my-articles" && isWriter && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Artikel Saya</h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                      Kelola dan buat berita atau artikel baru Anda.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      resetArticleForm();
                      setActiveTab("write-article");
                    }}
                    className="rounded-full gap-2 text-xs font-semibold px-4 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Tulis Artikel Baru
                  </Button>
                </div>

                {myArticles.length === 0 ? (
                  <div className="py-20 text-center border border-border/60 rounded-2xl bg-card/30 space-y-3">
                    <p className="text-base font-bold">Belum Ada Artikel</p>
                    <p className="text-xs text-muted-foreground">
                      Anda belum pernah menerbitkan artikel. Klik tombol di atas untuk menulis berita pertama Anda!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {myArticles.map((item) => (
                      <div key={item._id} className="space-y-3 border border-border/60 rounded-2xl p-4 bg-card/40">
                        <ArticleCard news={item} formatDate={formatDate} />
                        
                        {item.deleteRequest?.status === "pending" && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 flex items-center justify-between">
                            <span className="font-semibold">Dalam Peninjauan Request Hapus</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelDeleteRequest(item._id)}
                              className="h-6 text-[11px] px-2 text-amber-700 hover:bg-amber-500/20"
                            >
                              Batal
                            </Button>
                          </div>
                        )}

                        <div className="pt-3 border-t border-border/40 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEdit(item)}
                            className="h-8 text-xs rounded-lg gap-1.5 cursor-pointer"
                          >
                            <SquarePen className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={item.deleteRequest?.status === "pending"}
                            onClick={() => handleOpenRequestDelete(item._id)}
                            className="h-8 text-xs rounded-lg gap-1.5 text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Request Hapus
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE SETTINGS & CHANGE PASSWORD TAB */}
            {activeTab === "profile-settings" && (
              <div className="space-y-8 max-w-2xl">
                <div className="border-b border-border/60 pb-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Profil & Keamanan</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    Kelola identitas diri dan kata sandi akun Anda.
                  </p>
                </div>

                {/* Form Update Profile */}
                <form onSubmit={handleUpdateProfile} className="border border-border/60 rounded-2xl p-6 bg-card/60 space-y-4 shadow-sm">
                  <h3 className="font-bold text-sm flex items-center gap-2 border-b border-border/40 pb-3">
                    <UserCog className="w-4 h-4 text-primary" /> Pengaturan Profil
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Nama Lengkap</label>
                      <Input
                        value={profileFullName}
                        onChange={(e) => setProfileFullName(e.target.value)}
                        placeholder="Nama Lengkap..."
                        className="mt-1 h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Username</label>
                      <Input
                        value={profileUsername}
                        onChange={(e) => setProfileUsername(e.target.value)}
                        placeholder="Username..."
                        className="mt-1 h-10 text-xs rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button size="sm" type="submit" disabled={updatingProfile} className="text-xs rounded-xl font-medium px-4">
                      {updatingProfile ? "Memperbarui..." : "Simpan Profil"}
                    </Button>
                  </div>
                </form>

                {/* Form Change Password */}
                <form onSubmit={handleChangePassword} className="border border-border/60 rounded-2xl p-6 bg-card/60 space-y-4 shadow-sm">
                  <h3 className="font-bold text-sm flex items-center gap-2 border-b border-border/40 pb-3">
                    <KeyRound className="w-4 h-4 text-primary" /> Ganti Kata Sandi
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Kata Sandi Saat Ini</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="mt-1 h-10 text-xs rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Kata Sandi Baru</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="•••••••• (min 8 karakter, huruf besar, kecil & angka)"
                        className="mt-1 h-10 text-xs rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button size="sm" type="submit" disabled={changingPassword} className="text-xs rounded-xl font-medium px-4">
                      {changingPassword ? "Memproses..." : "Ubah Kata Sandi"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* WRITE / EDIT ARTICLE TAB */}
            {activeTab === "write-article" && isWriter && (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {editingId ? "Edit Artikel" : "Tulis Artikel Baru"}
                    </h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                      Publikasikan tulisan dan berita berkualitas di MenteriKebenaran.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("my-articles")} className="rounded-full text-xs">
                      Batal
                    </Button>
                    <Button onClick={handleSubmitArticle} disabled={submitting} className="rounded-full px-5 text-xs">
                      {submitting ? "Menyimpan..." : editingId ? "Perbarui Artikel" : "Terbitkan Artikel"}
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSubmitArticle} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Judul Berita</label>
                      <Input
                        type="text"
                        placeholder="Contoh: Perkembangan Terbaru Inovasi Teknologi 2026..."
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="h-11 rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Isi Artikel / Berita</label>
                      <textarea
                        rows={14}
                        placeholder="Tuliskan lengkap isi berita Anda di sini..."
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background p-4 text-xs sm:text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="border border-border/60 rounded-2xl p-5 bg-card/60 space-y-5 shadow-sm">
                      <h3 className="font-bold text-sm border-b border-border/40 pb-3">Pengaturan Publikasi</h3>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Kategori</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">Pilih Kategori...</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Gambar Cover</label>
                        
                        <div className="flex gap-2 mb-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="h-9 rounded-xl text-xs flex-1 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px bg-border flex-1"></div>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">ATAU GUNAKAN URL</span>
                          <div className="h-px bg-border flex-1"></div>
                        </div>
                        <Input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={formFoto}
                          onChange={(e) => setFormFoto(e.target.value)}
                          className="h-9 rounded-xl text-xs"
                        />
                        
                        {uploadingImage && <div className="text-xs text-primary mt-2">Mengunggah gambar...</div>}
                        
                        {formFoto && !uploadingImage && (
                          <div className="aspect-video w-full rounded-xl overflow-hidden border mt-2">
                            <img src={formFoto} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Tags (Pisahkan dengan koma)</label>
                        <Input
                          type="text"
                          placeholder="politik, berita, inovasi"
                          value={formTags}
                          onChange={(e) => setFormTags(e.target.value)}
                          className="h-9 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* CATEGORIES TAB (ADMIN) */}
            {activeTab === "categories" && isAdmin && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Kelola Kategori</h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                      Tambah, edit, atau nonaktifkan kategori berita di platform.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingCatId(null);
                      setCatName("");
                      setCatDesc("");
                      setCatModalOpen(true);
                    }}
                    className="rounded-full text-xs font-semibold px-4 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Kategori
                  </Button>
                </div>

                <div className="border border-border/60 rounded-2xl overflow-hidden bg-card/40">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-3.5">Nama Kategori</th>
                        <th className="p-3.5">Deskripsi</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {categories.map((cat) => (
                        <tr key={cat._id} className="hover:bg-muted/20">
                          <td className="p-3.5 font-bold text-foreground">{cat.name}</td>
                          <td className="p-3.5 text-muted-foreground">{cat.description || "-"}</td>
                          <td className="p-3.5">
                            <Badge
                              variant={cat.isActive !== false ? "default" : "secondary"}
                              className="text-[10px] rounded-full"
                            >
                              {cat.isActive !== false ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCatId(cat._id);
                                setCatName(cat.name);
                                setCatDesc(cat.description || "");
                                setCatModalOpen(true);
                              }}
                              className="h-7 text-xs rounded-md"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleCategory(cat._id)}
                              className="h-7 text-xs rounded-md"
                            >
                              {cat.isActive !== false ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS ROLE TAB (ADMIN) */}
            {activeTab === "users-role" && isAdmin && (
              <div className="space-y-6">
                <div className="border-b border-border/60 pb-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Manajemen User & Role</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    Ubah role pengguna biasa menjadi Writer untuk mengizinkan penerbitan artikel.
                  </p>
                </div>

                <div className="border border-border/60 rounded-2xl overflow-hidden bg-card/40">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-3.5">Nama Lengkap</th>
                        <th className="p-3.5">Username / Email</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5 text-right">Ubah Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {userList.map((user) => (
                        <tr key={user._id} className="hover:bg-muted/20">
                          <td className="p-3.5 font-bold text-foreground">{user.fullName}</td>
                          <td className="p-3.5 text-muted-foreground">
                            @{user.username} <span className="text-xs">({user.email})</span>
                          </td>
                          <td className="p-3.5">
                            <Badge
                              variant={user.role === "admin" ? "default" : user.role === "writer" ? "secondary" : "outline"}
                              className="text-[10px] uppercase font-bold rounded-full"
                            >
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-right">
                            {user.role !== "admin" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setTargetUserId(user._id);
                                  setNewRole(user.role === "writer" ? "user" : "writer");
                                  setRoleReason("");
                                  setRoleModalOpen(true);
                                }}
                                className="h-7 text-xs rounded-md"
                              >
                                Ubah ke {user.role === "writer" ? "User" : "Writer"}
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Admin Utama</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DELETE REQUESTS TAB (ADMIN / WRITER) */}
            {activeTab === "delete-requests" && (
              <div className="space-y-6">
                <div className="border-b border-border/60 pb-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Request Hapus Berita</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    {isAdmin
                      ? "Daftar pengajuan hapus berita dari Writer yang memerlukan persetujuan Admin."
                      : "Daftar pengajuan hapus berita yang Anda kirimkan."}
                  </p>
                </div>

                {deleteRequestsList.length === 0 ? (
                  <div className="py-20 text-center border border-border/60 rounded-2xl bg-card/30">
                    <p className="text-base font-bold">Tidak Ada Request Pending</p>
                    <p className="text-xs text-muted-foreground">Saat ini tidak ada pengajuan hapus berita.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deleteRequestsList.map((item) => (
                      <div key={item._id} className="p-4 rounded-2xl border border-border/60 bg-card/60 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-sm sm:text-base text-foreground">{item.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Penulis: {item.author?.fullName || item.author?.username || "Writer"}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-500/30 text-xs">
                            Request Pending
                          </Badge>
                        </div>

                        {item.deleteRequest && (
                          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs space-y-1">
                            <span className="font-semibold text-foreground">Alasan Pengajuan Hapus:</span>
                            <p className="text-muted-foreground">{item.deleteRequest.reason}</p>
                          </div>
                        )}

                        {isAdmin && (
                          <div className="pt-2 flex justify-end gap-2 border-t border-border/40">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReviewDelete(item._id, "reject")}
                              className="h-8 text-xs rounded-lg gap-1.5 text-destructive"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Tolak Request
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleOpenReviewDelete(item._id, "approve")}
                              className="h-8 text-xs rounded-lg gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Setujui & Hapus Berita
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SAVED ARTICLES TAB */}
            {activeTab === "saved-articles" && (
              <div className="space-y-6">
                <div className="border-b border-border/60 pb-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Koleksi Berita Tersimpan</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    Daftar berita yang Anda simpan untuk dibaca kembali.
                  </p>
                </div>

                {savedArticles.length === 0 ? (
                  <div className="py-20 text-center border border-border/60 rounded-2xl bg-card/30">
                    <p className="text-base font-bold">Belum Ada Berita Tersimpan</p>
                    <p className="text-xs text-muted-foreground">Buka detail berita dan tekan tombol Simpan untuk menambahkannya ke koleksi.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedArticles.map((item) => (
                      <ArticleCard key={item._id} news={item} formatDate={formatDate} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CLAPPED ARTICLES TAB */}
            {activeTab === "clapped-articles" && (
              <div className="space-y-6">
                <div className="border-b border-border/60 pb-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Berita Ditepuk (Clapped)</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    Daftar berita yang Anda berikan tepuk tangan (claps).
                  </p>
                </div>

                {clappedArticles.length === 0 ? (
                  <div className="py-20 text-center border border-border/60 rounded-2xl bg-card/30">
                    <p className="text-base font-bold">Belum Ada Berita Ditepuk</p>
                    <p className="text-xs text-muted-foreground">Buka detail berita dan berikan tepuk tangan (clap) untuk menambahkannya ke sini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clappedArticles.map((item) => (
                      <ArticleCard key={item._id} news={item} formatDate={formatDate} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ALL ARTICLES TAB (ADMIN) */}
            {activeTab === "all-articles" && isAdmin && (
              <div className="space-y-6">
                <div className="border-b border-border/60 pb-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Semua Berita Platform</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    Akses penuh Admin untuk mengelola seluruh publikasi berita.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((item) => (
                    <ArticleCard key={item._id} news={item} formatDate={formatDate} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL CATEGORY CREATE / EDIT */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-bold text-lg">{editingCatId ? "Edit Kategori" : "Tambah Kategori Baru"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Nama Kategori</label>
                <Input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Politik, Teknologi"
                  className="mt-1 h-10 text-xs rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Deskripsi (Opsional)</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Deskripsi singkat..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setCatModalOpen(false)} className="text-xs rounded-lg">
                Batal
              </Button>
              <Button size="sm" onClick={handleSaveCategory} className="text-xs rounded-lg">
                Simpan Kategori
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL USER ROLE */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-bold text-lg">Konfirmasi Ubah Role User</h3>
            <p className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin mengubah role pengguna ini menjadi <span className="font-bold text-foreground uppercase">{newRole}</span>?
            </p>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Alasan (Opsional)</label>
              <Input
                value={roleReason}
                onChange={(e) => setRoleReason(e.target.value)}
                placeholder="Alasan perubahan role..."
                className="mt-1 h-10 text-xs rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setRoleModalOpen(false)} className="text-xs rounded-lg">
                Batal
              </Button>
              <Button size="sm" onClick={handleSaveUserRole} className="text-xs rounded-lg">
                Ya, Ubah Role
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REQUEST DELETE (WRITER) */}
      {reqDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-destructive">Pengajuan Hapus Artikel</h3>
            <p className="text-xs text-muted-foreground">
              Sesuai aturan platform, penghapusan artikel oleh Writer memerlukan persetujuan Admin. Berikan alasan pengajuan Anda di bawah ini:
            </p>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Alasan Hapus (Min. 10 Karakter)</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Jelaskan alasan mengapa berita ini harus dihapus..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setReqDeleteModalOpen(false)} className="text-xs rounded-lg">
                Batal
              </Button>
              <Button size="sm" variant="destructive" onClick={handleSendDeleteRequest} className="text-xs rounded-lg">
                Kirim Request Hapus
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REVIEW DELETE (ADMIN) */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border/60 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-bold text-lg">
              {reviewActionType === "approve" ? "Setujui Request Hapus" : "Tolak Request Hapus"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {reviewActionType === "approve"
                ? "Menyetujui request ini akan langsung menghapus artikel secara permanen dari database."
                : "Menolak request ini akan membatalkan pengajuan hapus dan artikel tetap publik."}
            </p>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Catatan Review (Opsional)</label>
              <Input
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Catatan untuk penulis..."
                className="mt-1 h-10 text-xs rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setReviewModalOpen(false)} className="text-xs rounded-lg">
                Batal
              </Button>
              <Button
                size="sm"
                variant={reviewActionType === "approve" ? "destructive" : "default"}
                onClick={handleExecuteReviewDelete}
                className="text-xs rounded-lg"
              >
                {reviewActionType === "approve" ? "Setujui & Hapus" : "Tolak Request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
