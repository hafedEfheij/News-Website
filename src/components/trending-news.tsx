'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ExternalLink, TrendingUp, RefreshCw } from 'lucide-react';
import ClientLink from '@/components/client-link';
import { fetchAllNews, RssItem } from '@/lib/api/rss-feed';
import { fetchTopHeadlines } from '@/lib/api/news-api';

export function TrendingNews() {
  const [trendingNews, setTrendingNews] = useState<RssItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from both sources in parallel
      const [rssNews, newsApiArticles] = await Promise.allSettled([
        fetchAllNews(),
        fetchTopHeadlines('us', 'general', 5)
      ]);

      // Process RSS news
      let combinedNews: RssItem[] = [];

      if (rssNews.status === 'fulfilled' && rssNews.value.length > 0) {
        combinedNews = [...rssNews.value];
      }

      // Process NewsAPI articles and convert them to RssItem format
      if (newsApiArticles.status === 'fulfilled' && newsApiArticles.value.length > 0) {
        const convertedArticles: RssItem[] = newsApiArticles.value.map(article => ({
          title: article.title,
          link: article.url,
          description: article.description || '',
          pubDate: article.publishedAt,
          source: article.source.name,
          imageUrl: article.urlToImage
        }));

        combinedNews = [...combinedNews, ...convertedArticles];
      }

      // Sort by date (newest first) and limit to 10 items
      const sortedNews = combinedNews
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, 10);

      if (sortedNews.length === 0) {
        throw new Error('No news items found from any source');
      }

      setTrendingNews(sortedNews);
    } catch (err) {
      console.error('Error fetching trending news:', err);
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

  // Strip HTML tags from text
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Truncate text to a certain length
  const truncateText = (text: string, maxLength: number = 150) => {
    const strippedText = stripHtml(text);
    if (strippedText.length <= maxLength) return strippedText;
    return strippedText.substring(0, maxLength) + '...';
  };

  return (
    <Card className="w-full shadow-lg border border-border/50 rounded-xl overflow-hidden bg-card">
      <CardHeader className="bg-card-foreground/5 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-lg sm:text-xl font-semibold">الأخبار العاجلة</CardTitle> {/* Breaking News */}
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
          آخر الأخبار العاجلة من المصادر الموثوقة
        </CardDescription> {/* Latest breaking news from trusted sources */}
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
          ) : trendingNews.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>لا توجد أخبار متاحة حاليًا</p> {/* No news available at the moment */}
              <p className="mt-2 text-sm">جاري تحميل البيانات المخزنة...</p>
              {/* Loading cached data... */}
            </div>
          ) : (
            <div className="space-y-4">
              {trendingNews.map((item, index) => (
                <div key={index} className="pb-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-base sm:text-lg">
                      <ClientLink
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors flex items-start gap-1"
                      >
                        {item.title}
                        <ExternalLink className="h-3 w-3 mt-1 flex-shrink-0" />
                      </ClientLink>
                    </h3>

                    {item.imageUrl && (
                      <div className="relative w-full h-40 overflow-hidden rounded-md bg-muted my-2">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // Hide image on error
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      {truncateText(item.description)}
                    </p>

                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {item.source}
                      </Badge>
                      <span>{formatDate(item.pubDate)}</span>
                    </div>
                  </div>
                  {index < trendingNews.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="bg-card-foreground/5 p-3 sm:p-4 border-t text-xs text-muted-foreground">
        <p>يتم تحديث الأخبار العاجلة تلقائيًا من مصادر متعددة</p>
        {/* Breaking news is automatically updated from multiple sources */}
      </CardFooter>
    </Card>
  );
}
