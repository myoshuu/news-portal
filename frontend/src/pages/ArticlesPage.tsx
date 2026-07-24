import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/features/article/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { Category, NewsArticle } from "@/types/news";
import { api } from "@/lib/api";

export default function ArticlesPage() {
  const [articlesList, setArticlesList] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (res.sukses && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (e) {
        console.error("Gagal memuat kategori:", e);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        const res = await api.getNews({
          limit: 12,
          category: selectedCategory || undefined,
          search: searchTerm.trim() || undefined,
        });

        if (res.sukses) {
          const list = Array.isArray(res.data)
            ? res.data
            : (res.data && Array.isArray((res.data as any).data))
            ? (res.data as any).data
            : [];
          setArticlesList(list);
        } else if (Array.isArray(res as any)) {
          setArticlesList(res as any);
        } else {
          setArticlesList([]);
        }
      } catch (error) {
        console.error("Gagal memuat artikel dari database:", error);
        setArticlesList([]);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const formatDate = (dateString: string) => {
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 space-y-8">
        <div className="border-b border-border/60 pb-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Kumpulan Artikel
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Opini mendalam, tulisan edukasi, ulasan teknologi, dan sudut pandang dari database MenteriKebenaran.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Cari artikel berdasarkan judul atau kata kunci..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-xl bg-muted/30 pl-11 pr-4 text-base focus-visible:ring-1 border"
              />
            </div>

            {categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <Badge
                  onClick={() => setSelectedCategory("")}
                  className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === ""
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Semua Kategori
                </Badge>
                {categories.map((cat) => (
                  <Badge
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedCategory === cat._id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground animate-pulse flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs">Memuat daftar artikel...</p>
          </div>
        ) : articlesList.length === 0 ? (
          <div className="py-20 text-center space-y-2 border border-border/60 rounded-2xl bg-card/30">
            <p className="text-lg font-semibold text-foreground">Artikel Tidak Ditemukan</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm.trim()
                ? `Tidak ada artikel yang cocok dengan kata kunci "${searchTerm}".`
                : "Belum ada artikel pada kategori ini."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articlesList.map((item) => (
              <ArticleCard key={item._id} news={item} formatDate={formatDate} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
