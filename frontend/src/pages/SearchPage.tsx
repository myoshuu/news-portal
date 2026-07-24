import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/features/article/components/ArticleCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { NewsArticle } from "@/types/news";
import { api } from "@/lib/api";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.getNews({ search: query });
        if (res.sukses) {
          const list = Array.isArray(res.data)
            ? res.data
            : (res.data && Array.isArray((res.data as any).data))
            ? (res.data as any).data
            : [];
          setResults(list);
        } else if (Array.isArray(res as any)) {
          setResults(res as any);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Gagal melakukan pencarian:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

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

      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 space-y-10">
        <div className="border-b border-border/60 pb-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              Hasil Pencarian <Search className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {query ? (
                <>Menampilkan hasil pencarian untuk kata kunci <span className="font-semibold text-foreground">&quot;{query}&quot;</span></>
              ) : (
                "Ketikkan kata kunci di kolom pencarian untuk mencari berita atau artikel."
              )}
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari berita atau artikel..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-12 w-full rounded-xl bg-muted/30 pl-11 pr-4 text-base focus-visible:ring-1 border"
            />
          </form>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground animate-pulse flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs">Mencari berita...</p>
          </div>
        ) : !query.trim() ? (
          <div className="py-20 text-center text-muted-foreground">
            Silakan masukkan kata kunci pencarian pada kolom pencarian di atas.
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-xl font-bold text-foreground">Tidak Ada Hasil</p>
            <p className="text-muted-foreground text-sm">
              Tidak ditemukan berita yang cocok dengan kata kunci &quot;{query}&quot;. Cobalah kata kunci yang lain!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((item) => (
              <ArticleCard key={item._id} news={item} formatDate={formatDate} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
