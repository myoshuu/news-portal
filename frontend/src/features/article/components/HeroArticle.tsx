import { Link } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, ThumbsUp } from "lucide-react";
import { formatTime as defaultFormatTime } from "@/lib/utils";
import type { NewsArticle } from "@/types/news";

interface HeroArticleProps {
  article: NewsArticle;
  formatDate: (dateString: string) => string;
  formatTime?: (dateString: string) => string;
}

export function HeroArticle({ article, formatDate, formatTime }: HeroArticleProps) {
  const timeFormatter = formatTime || defaultFormatTime;
  const realTime = timeFormatter(article.createdAt);
  const categoryName = typeof article.category === "object" ? article.category?.name : article.category;
  const articlePath = `/news/${article.slug || article._id}`;

  return (
    <Link to={articlePath} className="group block">
      <div className="relative overflow-hidden rounded-3xl transition-all duration-300 border border-border/40 p-4 sm:p-6 bg-card/60 shadow-sm hover:shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 aspect-[16/10] w-full overflow-hidden rounded-2xl relative">
            {categoryName && (
              <Badge className="absolute top-4 left-4 z-10 font-semibold bg-primary text-primary-foreground border-none rounded-md px-3 py-1 text-xs shadow-md">
                {categoryName}
              </Badge>
            )}
            <img
              src={article.foto || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000"}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
          </div>

          <div className="lg:col-span-5 space-y-4 lg:pr-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Headline News
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-extrabold tracking-tight leading-snug text-foreground group-hover:text-primary transition-colors">
              {article.title}
            </h1>

            <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-3 font-normal">
              {article.artikel?.replace(/<[^>]*>?/gm, "")}
            </p>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {(article.author?.fullName || article.author?.username || "A").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold text-foreground leading-none">
                    {article.author?.fullName || article.author?.username || "Penulis"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {formatDate(article.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {(article.clapCount ?? article.clapsCount ?? 0) > 0 && (
                  <span className="flex items-center gap-1 font-medium text-primary">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {article.clapCount ?? article.clapsCount}
                  </span>
                )}
                {realTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {realTime}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
