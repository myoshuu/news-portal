import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, LogOut, Search } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { Category } from "@/types/news";
import { api } from "@/lib/api";

interface UserProfile {
  fullName: string;
  email: string;
  username: string;
  role: string;
}

export function Navbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (res.sukses && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (e) {
        console.error("Gagal memuat kategori di navbar:", e);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/news?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        setCurrentUser(JSON.parse(userJson));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setIsMenuOpen(false);
    toast.confirm({
      title: "Konfirmasi Keluar",
      message: "Apakah Anda yakin ingin keluar dari akun MenteriKebenaran? Anda harus login kembali untuk mengakses fitur akun.",
      variant: "destructive",
      confirmText: "Ya, Keluar Akun",
      cancelText: "Batal",
      icon: <LogOut className="w-6 h-6" />,
      onConfirm: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setCurrentUser(null);
        toast.success("Berhasil Keluar", "Anda telah keluar dari akun.");
        navigate("/");
      },
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="font-extrabold text-xl tracking-tight text-foreground hover:text-primary transition-colors shrink-0">
          MenteriKebenaran<span className="text-primary">.</span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors font-semibold">
            Beranda
          </Link>
          {categories.slice(0, 4).map((cat) => (
            <Link key={cat._id} to={`/news?category=${cat._id}`} className="hover:text-foreground transition-colors whitespace-nowrap">
              {cat.name}
            </Link>
          ))}
          <Link to="/news" className="hover:text-foreground transition-colors font-semibold">
            Lainnya
          </Link>
        </nav>



        {/* Right: Auth Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center relative">
            <input 
              type="text" 
              placeholder="Cari berita..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-40 lg:w-56 rounded-full border border-border bg-muted/40 px-4 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all pr-8"
            />
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {currentUser ? (
            /* POPUP AVATAR SAAT SUDAH LOGIN */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-transform active:scale-95 cursor-pointer"
                title={currentUser.fullName}
              >
                <Avatar className="h-9 w-9 border border-border shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {currentUser.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* POPUP MENU MINIMALIS & NATURAL */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card border border-border shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                  {/* Nama & Email */}
                  <div className="px-4 py-2.5 border-b border-border/40">
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">
                      {currentUser.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/dashboard");
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                      Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TOMBOL LOGIN & DAFTAR SAAT BELUM LOGIN */
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-8 text-xs rounded-full px-3">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-8 text-xs rounded-full px-3">
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
