import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Clock, ThumbsUp, Bookmark } from "lucide-react";
import { formatTime as defaultFormatTime } from "@/lib/utils";
import type { NewsArticle } from "@/types/news";

interface ArticleCardProps {
  news: NewsArticle;
  formatDate: (dateString: string) => string;
  formatTime?: (dateString: string) => string;
}

export function ArticleCard({ news, formatDate, formatTime }: ArticleCardProps) {
  const timeFormatter = formatTime || defaultFormatTime;
  const realTime = timeFormatter(news.createdAt);
  const categoryName = typeof news.category === "object" ? news.category?.name : news.category;
  const articlePath = `/news/${news.slug || news._id}`;

  return (
    <Link to={articlePath} className="group block">
      <div className="space-y-3.5">
        <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl relative shadow-sm">
          {categoryName && (
            <Badge className="absolute top-3 left-3 z-10 font-semibold bg-slate-900/90 text-white border-none rounded-md px-2.5 py-1 text-xs shadow-sm">
              {categoryName}
            </Badge>
          )}
          <img
            src={news.foto || "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1000"}
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-lg sm:text-xl leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {news.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-xs sm:text-sm leading-relaxed font-normal">
            {news.artikel?.replace(/<[^>]*>?/gm, "")}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{news.author?.fullName || news.author?.username || "Writer"}</span>
              <span>•</span>
              <span>{formatDate(news.createdAt)}</span>
              {realTime && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {realTime}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
              {(news.clapCount ?? news.clapsCount ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-primary" />
                  {news.clapCount ?? news.clapsCount}
                </span>
              )}
              {(news.saveCount ?? news.savesCount ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-amber-500" />
                  {news.saveCount ?? news.savesCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
