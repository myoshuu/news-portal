import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommentSection } from "@/features/comment/components/CommentSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Eye, ThumbsUp, Bookmark } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { NewsArticle } from "@/types/news";
import { api, getToken } from "@/lib/api";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [clapped, setClapped] = useState(false);
  const [clapsCount, setClapsCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(0);
  const token = getToken();

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;

      try {
        let res = await api.getNewsBySlug(slug);
        if (!res.sukses || !res.data) {
          // Fallback to get by ID if slug lookup fails
          res = await api.getNewsById(slug);
        }

        if (res.sukses && res.data) {
          const art = res.data;
          setArticle(art);
          setClapsCount(art.clapCount ?? art.clapsCount ?? 0);
          setSavesCount(art.saveCount ?? art.savesCount ?? 0);

          if (token) {
            try {
              const [resClapped, resSaved] = await Promise.all([
                api.getClappedNews(),
                api.getSavedNews(),
              ]);

              if (resClapped.sukses && Array.isArray(resClapped.data)) {
                const isClapped = resClapped.data.some((c) => String(c._id) === String(art._id));
                setClapped(isClapped);
              }

              if (resSaved.sukses && Array.isArray(resSaved.data)) {
                const isSaved = resSaved.data.some((s) => String(s._id) === String(art._id));
                setSaved(isSaved);
              }
            } catch (err) {
              console.error("Error checking user clap/save status:", err);
            }
          }
        } else {
          setArticle(null);
        }
      } catch (error) {
        console.error("Gagal mengambil detail berita:", error);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  const handleClap = async () => {
    if (!token) {
      toast.error("Akses Ditolak", "Silakan login terlebih dahulu untuk tepuk tangan berita.");
      return;
    }
    if (!article) return;

    try {
      if (clapped) {
        const res = await api.unclapNews(article._id);
        if (res.sukses) {
          setClapped(false);
          setClapsCount((prev) => Math.max(0, prev - 1));
          toast.success("Info", "Tepuk tangan dibatalkan");
        }
      } else {
        const res = await api.clapNews(article._id);
        if (res.sukses) {
          setClapped(true);
          setClapsCount((prev) => prev + 1);
          toast.success("Terima Kasih!", "Anda memberikan tepuk tangan untuk berita ini!");
        }
      }
    } catch (e: any) {
      toast.error("Error", e.message || "Gagal memproses tepuk tangan.");
    }
  };

  const handleSave = async () => {
    if (!token) {
      toast.error("Akses Ditolak", "Silakan login terlebih dahulu untuk menyimpan berita.");
      return;
    }
    if (!article) return;

    try {
      if (saved) {
        const res = await api.unsaveNews(article._id);
        if (res.sukses) {
          setSaved(false);
          setSavesCount((prev) => Math.max(0, prev - 1));
          toast.success("Info", "Berita dihapus dari simpanan.");
        }
      } else {
        const res = await api.saveNews(article._id);
        if (res.sukses) {
          setSaved(true);
          setSavesCount((prev) => prev + 1);
          toast.success("Tersimpan", "Berita telah disimpan ke koleksi Anda.");
        }
      }
    } catch (e: any) {
      toast.error("Error", e.message || "Gagal menyimpan berita.");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Memuat detail berita...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-extrabold">Artikel Tidak Ditemukan</h1>
          <p className="text-muted-foreground text-sm">
            Maaf, artikel yang Anda cari tidak ditemukan di database atau telah dihapus.
          </p>
          <div className="pt-2">
            <Link to="/">
              <Button className="rounded-full">Kembali ke Beranda</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryName = typeof article.category === "object" ? article.category?.name : article.category;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-10 space-y-8">
        {/* Navigasi Kembali */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>

        {/* Header Artikel */}
        <div className="space-y-4">
          {categoryName && (
            <div className="flex items-center gap-3">
              <Badge className="rounded-full px-3 py-1 font-semibold text-xs bg-primary text-primary-foreground border-none">
                {categoryName}
              </Badge>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
            {article.title}
          </h1>

          {/* Meta Info Penulis & Tanggal & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground pt-3 border-b border-border/60 pb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                    {(article.author?.fullName || article.author?.username || "A").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground">
                  {article.author?.fullName || article.author?.username || "Penulis"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(article.createdAt)}</span>
              </div>

              {article.views !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span>{article.views} pembaca</span>
                </div>
              )}
            </div>

            {/* Interactive Actions (Clap & Save) */}
            <div className="flex items-center gap-2">
              <Button
                variant={clapped ? "default" : "outline"}
                size="sm"
                onClick={handleClap}
                className="rounded-full text-xs gap-1.5 h-8 px-3"
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${clapped ? "fill-current" : ""}`} />
                <span>{clapsCount}</span>
              </Button>

              <Button
                variant={saved ? "default" : "outline"}
                size="sm"
                onClick={handleSave}
                className="rounded-full text-xs gap-1.5 h-8 px-3"
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
                <span>{saved ? `Tersimpan (${savesCount})` : `Simpan (${savesCount})`}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Gambar Utama Artikel */}
        {article.foto && (
          <div className="aspect-video w-full rounded-3xl overflow-hidden border border-border/40 shadow-sm">
            <img
              src={article.foto}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Isi Artikel */}
        <article className="prose prose-slate dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-foreground/95 space-y-6 pt-2">
          {article.artikel.split("\n\n").map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </article>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border/40">
            <span className="text-xs font-semibold text-muted-foreground">Tags:</span>
            {article.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="rounded-md text-xs font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Forum Komentar */}
        <div className="pt-8">
          <CommentSection newsId={article._id} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
