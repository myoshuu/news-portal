import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Reply, Edit2, MessageSquare, CornerDownRight } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { DiscussionItem } from "@/types/news";
import { api, getCurrentUser, getToken } from "@/lib/api";

interface CommentSectionProps {
  newsId: string;
}

export function CommentSection({ newsId }: CommentSectionProps) {
  const [comments, setComments] = useState<DiscussionItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State untuk Replying & Editing
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyTargetRootId, setReplyTargetRootId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // State untuk Dropdown Menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const token = getToken();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadDiscussions = async () => {
    if (!newsId) return;
    try {
      const res = await api.getDiscussions(newsId);
      if (res.sukses && Array.isArray(res.data)) {
        setComments(res.data);
      } else if (Array.isArray(res as any)) {
        setComments(res as any);
      }
    } catch (error) {
      console.error("Gagal mengambil komentar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, [newsId]);

  // Submit Utama (Komentar Baru)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!token) {
      toast.error("Akses Ditolak", "Silakan login terlebih dahulu untuk mengirim komentar.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createDiscussion(newsId, newComment.trim());
      if (res.sukses) {
        setNewComment("");
        toast.success("Berhasil", "Komentar terkirim!");
        await loadDiscussions();
      } else {
        toast.error("Gagal Mengirim", res.pesan || "Terjadi kesalahan");
      }
    } catch (error: any) {
      toast.error("Error", error.message || "Koneksi gagal.");
    } finally {
      setSubmitting(false);
    }
  }

  // Submit Reply
  async function handleReplySubmit() {
    if (!replyText.trim() || !replyTargetRootId) return;
    if (!token) {
      toast.error("Akses Ditolak", "Silakan login terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      // Pass root comment ID as parentId so backend stores and includes it in replies thread
      const res = await api.createDiscussion(newsId, replyText.trim(), replyTargetRootId);
      if (res.sukses) {
        setReplyText("");
        setReplyParentId(null);
        setReplyTargetRootId(null);
        toast.success("Berhasil", "Balasan terkirim!");
        await loadDiscussions();
      } else {
        toast.error("Gagal Mengirim Balasan", res.pesan || "Terjadi kesalahan");
      }
    } catch (error: any) {
      toast.error("Error", error.message || "Koneksi gagal.");
    } finally {
      setSubmitting(false);
    }
  }

  // Submit Edit Comment
  async function handleEditSubmit(commentId: string) {
    if (!editText.trim()) return;

    try {
      const res = await api.updateDiscussion(commentId, editText.trim());
      if (res.sukses) {
        setEditingId(null);
        setEditText("");
        toast.success("Berhasil", "Komentar diperbarui!");
        await loadDiscussions();
      } else {
        toast.error("Gagal Edit", res.pesan || "Terjadi kesalahan");
      }
    } catch (error: any) {
      toast.error("Error", error.message || "Koneksi gagal.");
    }
  }

  // Delete Comment
  async function handleDeleteComment(commentId: string) {
    if (!token) return;

    try {
      const res = await api.deleteDiscussion(commentId);
      if (res.sukses) {
        setActiveMenuId(null);
        toast.success("Berhasil", "Komentar berhasil dihapus!");
        await loadDiscussions();
      } else {
        toast.error("Gagal Menghapus", res.pesan || "Akses ditolak");
      }
    } catch (error: any) {
      toast.error("Error", error.message || "Koneksi gagal.");
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render Comment Item Component (recursive for nested replies)
  const renderCommentItem = (item: DiscussionItem, isReply = false, rootId?: string) => {
    const rootCommentId = rootId || item._id;
    const commentUserId = typeof item.userId === "object" ? item.userId?._id : item.userId;
    const commentUsername = typeof item.userId === "object" ? item.userId?.username : undefined;
    const commentFullName = typeof item.userId === "object" ? item.userId?.fullName : undefined;

    const isOwner = Boolean(
      currentUser &&
        ((commentUserId && currentUser._id && String(commentUserId) === String(currentUser._id)) ||
         (commentUsername && currentUser.username && commentUsername === currentUser.username) ||
         (commentFullName && currentUser.fullName && commentFullName === currentUser.fullName))
    );
    const canDelete = isOwner || isAdmin;
    const canEdit = isOwner;

    return (
      <div key={item._id} className={`group relative ${isReply ? "ml-6 sm:ml-10 mt-3 pt-3 border-l-2 border-primary/20 pl-4" : "pt-4"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-8 w-8 border shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {(commentFullName || commentUsername || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-foreground">
                  {commentFullName || commentUsername || "Pengguna"}
                </span>
                {isOwner && (
                  <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                    Anda
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDate(item.createdAt)}
                </span>
              </div>

              {/* Editing Form vs Comment Content */}
              {editingId === item._id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSubmit(item._id)} className="h-7 text-xs px-3">
                      Simpan
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs px-3">
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pt-0.5">
                  {item.comment}
                </p>
              )}

              {/* Action Buttons: Reply */}
              {token && editingId !== item._id && (
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      if (replyParentId === item._id) {
                        setReplyParentId(null);
                        setReplyTargetRootId(null);
                        setReplyText("");
                      } else {
                        setReplyParentId(item._id);
                        setReplyTargetRootId(rootCommentId);
                        setReplyText(isReply ? `@${commentUsername || commentFullName || "user"} ` : "");
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <Reply className="w-3 h-3" />
                    Balas
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Menu Dropdown (Edit / Delete) */}
          {(canEdit || canDelete) && (
            <div className="relative shrink-0" ref={activeMenuId === item._id ? menuRef : null}>
              <button
                onClick={() => setActiveMenuId(activeMenuId === item._id ? null : item._id)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {activeMenuId === item._id && (
                <div className="absolute right-0 mt-1 w-36 rounded-xl bg-card border border-border shadow-lg py-1 z-30 animate-in fade-in zoom-in-95">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        setEditingId(item._id);
                        setEditText(item.comment);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-muted-foreground" />
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        toast.confirm({
                          title: "Hapus Komentar?",
                          message: "Menghapus komentar ini juga akan menghapus semua balasannya.",
                          variant: "destructive",
                          confirmText: "Ya, Hapus",
                          cancelText: "Batal",
                          icon: <Trash2 className="w-5 h-5 text-destructive" />,
                          onConfirm: () => handleDeleteComment(item._id),
                        });
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Box for Reply */}
        {replyParentId === item._id && (
          <div className="mt-3 ml-4 sm:ml-8 pl-3 border-l-2 border-primary/30 flex items-start gap-2">
            <CornerDownRight className="w-4 h-4 text-primary shrink-0 mt-2" />
            <div className="flex-1 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Balas ${commentFullName || commentUsername || "komentar"}...`}
                rows={2}
                className="w-full rounded-lg border border-input bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setReplyParentId(null); setReplyTargetRootId(null); }} className="h-7 text-xs px-3">
                  Batal
                </Button>
                <Button
                  size="sm"
                  disabled={submitting || !replyText.trim()}
                  onClick={handleReplySubmit}
                  className="h-7 text-xs px-3"
                >
                  {submitting ? "Kirim..." : "Kirim Balasan"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Render Nested Replies */}
        {item.replies && item.replies.length > 0 && (
          <div className="space-y-2">
            {item.replies.map((reply) => renderCommentItem(reply, true, rootCommentId))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-6 pt-8 border-t border-border/60 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Diskusi ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* Input Komentar Utama */}
      {token ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 border shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {(currentUser?.fullName || currentUser?.username || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tuliskan ide, pemikiran, atau pandangan Anda mengenai berita ini..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs sm:text-sm focus:ring-1 focus:ring-primary focus:outline-none leading-relaxed"
              />
              <div className="flex justify-end">
                <Button size="sm" type="submit" disabled={submitting || !newComment.trim()} className="rounded-full px-5 text-xs">
                  {submitting ? "Mengirim..." : "Kirim Komentar"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl border border-border/60 bg-muted/30 text-center space-y-2">
          <p className="text-xs text-muted-foreground">Ingin bergabung dalam diskusi berita ini?</p>
          <Link to="/login">
            <Button size="sm" variant="outline" className="rounded-full text-xs">
              Login untuk Berkomentar
            </Button>
          </Link>
        </div>
      )}

      {/* Daftar Komentar */}
      {loading ? (
        <div className="py-10 text-center text-xs text-muted-foreground animate-pulse">
          Memuat diskusi...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center border border-border/40 rounded-2xl bg-card/30">
          <p className="text-sm font-semibold text-foreground">Belum Ada Diskusi</p>
          <p className="text-xs text-muted-foreground mt-1">Jadilah yang pertama memberikan pendapat pada berita ini!</p>
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-border/40">
          {comments.map((item) => renderCommentItem(item, false))}
        </div>
      )}
    </section>
  );
}
