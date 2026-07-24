import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroArticle } from "@/features/article/components/HeroArticle";
import { ArticleCard } from "@/features/article/components/ArticleCard";
import { TrendingSection } from "@/features/article/components/TrendingSection";
import type { NewsArticle } from "@/types/news";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function HomePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await api.getNews({ limit: 10 });
        if (res.sukses) {
          const list = Array.isArray(res.data)
            ? res.data
            : (res.data && Array.isArray((res.data as any).data))
            ? (res.data as any).data
            : [];
          setArticles(list);
        } else if (Array.isArray(res as any)) {
          setArticles(res as any);
        }
      } catch (error) {
        console.error("Gagal mengambil berita dari database:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Memuat berita terbaru...</p>
      </div>
    );
  }

  const heroArticle = articles[0];
  const latestNews = articles.length > 1 ? articles.slice(1, 5) : articles;
  const trendingNews = articles.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 space-y-16">
        {articles.length === 0 ? (
          <div className="py-24 text-center border border-border/60 rounded-3xl bg-card/40 space-y-4 max-w-xl mx-auto p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold">Belum Ada Berita di Database</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Database saat ini masih kosong. Silakan login dan masuk ke Dashboard untuk menerbitkan berita pertama Anda!
            </p>
            <div className="pt-2">
              <Link to="/dashboard">
                <Button className="rounded-full px-6">Buka Dashboard</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {heroArticle && (
              <HeroArticle article={heroArticle} formatDate={formatDate} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  <h2 className="text-2xl font-bold tracking-tight">Berita Terbaru</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {latestNews.map((news) => (
                    <ArticleCard key={news._id} news={news} formatDate={formatDate} />
                  ))}
                </div>
              </div>

              <TrendingSection articles={trendingNews} formatDate={formatDate} />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
