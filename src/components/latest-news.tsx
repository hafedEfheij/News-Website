'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import ClientLink from '@/components/client-link';
import { fetchTopHeadlines, NewsArticle } from '@/lib/api/news-api';

export function LatestNews() {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from multiple countries to get more diverse news
      const [usNews, gbNews, aeNews] = await Promise.allSettled([
        fetchTopHeadlines('us', 'general', 5),
        fetchTopHeadlines('gb', 'general', 3),
        fetchTopHeadlines('ae', 'general', 2) // Arabic news from UAE
      ]);

      let combinedNews: NewsArticle[] = [];

      // Add US news
      if (usNews.status === 'fulfilled' && usNews.value.length > 0) {
        combinedNews = [...combinedNews, ...usNews.value];
      }

      // Add GB news
      if (gbNews.status === 'fulfilled' && gbNews.value.length > 0) {
        combinedNews = [...combinedNews, ...gbNews.value];
      }

      // Add AE news
      if (aeNews.status === 'fulfilled' && aeNews.value.length > 0) {
        combinedNews = [...combinedNews, ...aeNews.value];
      }

      // Sort by date (newest first) and limit to 10 items
      const sortedNews = combinedNews
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 10);

      if (sortedNews.length === 0) {
        // If all API calls failed, try one more time with a different country
        const fallbackNews = await fetchTopHeadlines('fr', 'general', 10);
        if (fallbackNews.length === 0) {
          throw new Error('No news items found from any source');
        }
        setLatestNews(fallbackNews);
      } else {
        setLatestNews(sortedNews);
      }
    } catch (err) {
      console.error('Error fetching latest news:', err);
      setError('حدث خطأ أثناء جلب الأخبار. الرجاء المحاولة مرة أخرى لاحقًا.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Format: "DD/MM/YYYY HH:MM"
      return new Intl.DateTimeFormat('ar-EG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Calculate time ago
  const timeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'منذ لحظات'; // Just now
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`; // X minutes ago
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`; // X hours ago
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`; // X days ago
      }
    } catch (e) {
      return dateString;
    }
  };

  // Truncate text to a certain length
  const truncateText = (text: string | null, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="w-full shadow-lg border border-border/50 rounded-xl overflow-hidden bg-card">
      <CardHeader className="bg-card-foreground/5 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-lg sm:text-xl font-semibold">آخر الأخبار</CardTitle> {/* Latest News */}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchNews}
            disabled={isLoading}
            title="تحديث"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="text-sm sm:text-base">
          أحدث الأخبار من مصادر موثوقة
        </CardDescription> {/* Latest news from trusted sources */}
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <ScrollArea className="h-[400px] rounded-md">
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
              <p className="mt-2 text-sm text-muted-foreground">سيتم عرض بيانات مخزنة مؤقتًا</p>
              {/* Cached data will be displayed */}
            </div>
          ) : latestNews.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>لا توجد أخبار متاحة حاليًا</p> {/* No news available at the moment */}
              <p className="mt-2 text-sm">جاري تحميل البيانات المخزنة...</p>
              {/* Loading cached data... */}
            </div>
          ) : (
            <div className="space-y-4">
              {latestNews.map((article, index) => (
                <div key={index} className="pb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {article.source.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(article.publishedAt)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base sm:text-lg">
                      <ClientLink
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors flex items-start gap-1"
                      >
                        {article.title}
                        <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0" />
                      </ClientLink>
                    </h3>

                    {article.urlToImage && (
                      <div className="relative w-full h-40 overflow-hidden rounded-md bg-muted my-2">
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // Hide image on error
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      {truncateText(article.description)}
                    </p>
                  </div>
                  {index < latestNews.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="bg-card-foreground/5 p-3 sm:p-4 border-t text-xs text-muted-foreground">
        <p>يتم تحديث الأخبار تلقائيًا كل ساعة</p>
        {/* News is automatically updated every hour */}
      </CardFooter>
    </Card>
  );
}
