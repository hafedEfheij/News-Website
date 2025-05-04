'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  TrendingUp,
  Newspaper,
  BarChart3,
  Briefcase,
  Cpu,
  Film,
  Dumbbell,
  FlaskConical,
  Heart
} from 'lucide-react';
import ClientLink from '@/components/client-link';
import {
  fetchNewsByCategories,
  fetchTopHeadlines,
  NewsArticle,
  NewsCategory,
  NEWS_CATEGORIES
} from '@/lib/api/news-api';

export function CategorizedNews() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('general');
  const [newsByCategory, setNewsByCategory] = useState<Record<NewsCategory, NewsArticle[]>>({} as Record<NewsCategory, NewsArticle[]>);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Category icons mapping
  const categoryIcons = {
    general: <Newspaper className="h-4 w-4" />,
    business: <Briefcase className="h-4 w-4" />,
    technology: <Cpu className="h-4 w-4" />,
    entertainment: <Film className="h-4 w-4" />,
    sports: <Dumbbell className="h-4 w-4" />,
    science: <FlaskConical className="h-4 w-4" />,
    health: <Heart className="h-4 w-4" />
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // Try to fetch news for all categories from multiple countries
        const [usNews, gbNews] = await Promise.allSettled([
          fetchNewsByCategories('us', 3),
          fetchNewsByCategories('gb', 2)
        ]);

        // Start with empty categories
        const combinedNews: Record<NewsCategory, NewsArticle[]> = {} as Record<NewsCategory, NewsArticle[]>;

        // Initialize all categories with empty arrays
        Object.keys(NEWS_CATEGORIES).forEach(category => {
          combinedNews[category as NewsCategory] = [];
        });

        // Add US news
        if (usNews.status === 'fulfilled') {
          Object.entries(usNews.value).forEach(([category, articles]) => {
            combinedNews[category as NewsCategory] = [
              ...combinedNews[category as NewsCategory],
              ...articles
            ];
          });
        }

        // Add GB news
        if (gbNews.status === 'fulfilled') {
          Object.entries(gbNews.value).forEach(([category, articles]) => {
            combinedNews[category as NewsCategory] = [
              ...combinedNews[category as NewsCategory],
              ...articles
            ];
          });
        }

        // Sort each category by date
        Object.keys(combinedNews).forEach(category => {
          combinedNews[category as NewsCategory].sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );

          // Limit to 5 articles per category
          combinedNews[category as NewsCategory] = combinedNews[category as NewsCategory].slice(0, 5);
        });

        setNewsByCategory(combinedNews);
      } catch (err) {
        console.error('Error fetching categorized news:', err);
        setError('حدث خطأ أثناء جلب الأخبار. الرجاء المحاولة مرة أخرى لاحقًا.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

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

  // Truncate text to a certain length
  const truncateText = (text: string | null, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category as NewsCategory);
  };

  // Refresh news for the current category
  const refreshCategory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from multiple countries for the active category
      const [usNews, gbNews] = await Promise.allSettled([
        fetchTopHeadlines('us', activeCategory, 3),
        fetchTopHeadlines('gb', activeCategory, 2)
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

      // If both failed, try one more source
      if (combinedNews.length === 0) {
        const fallbackNews = await fetchTopHeadlines('ae', activeCategory, 5);
        combinedNews = [...combinedNews, ...fallbackNews];
      }

      // Sort by date and limit to 5
      combinedNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      combinedNews = combinedNews.slice(0, 5);

      setNewsByCategory(prev => ({
        ...prev,
        [activeCategory]: combinedNews
      }));
    } catch (err) {
      console.error(`Error refreshing ${activeCategory} news:`, err);
      setError('تعذر تحديث الأخبار. الرجاء المحاولة مرة أخرى لاحقًا.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border border-border/50 rounded-xl overflow-hidden bg-card">
      <CardHeader className="bg-card-foreground/5 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <CardTitle className="text-lg sm:text-xl font-semibold">الأخبار حسب الفئة</CardTitle> {/* News by Category */}
        </div>
        <CardDescription className="text-sm sm:text-base">
          تصفح أحدث الأخبار مصنفة حسب الفئات المختلفة
        </CardDescription> {/* Browse the latest news categorized by different topics */}
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        <Tabs
          defaultValue="general"
          value={activeCategory}
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full">
              {Object.entries(NEWS_CATEGORIES).map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex items-center gap-1 min-w-[100px]"
                >
                  {categoryIcons[key as NewsCategory]}
                  <span>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.keys(NEWS_CATEGORIES).map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <ScrollArea className="h-[500px] rounded-md">
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
                ) : !newsByCategory[category as NewsCategory] || newsByCategory[category as NewsCategory].length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>لا توجد أخبار متاحة حاليًا في هذه الفئة</p> {/* No news available in this category at the moment */}
                    <p className="mt-2 text-sm">جاري تحميل البيانات المخزنة...</p>
                    {/* Loading cached data... */}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newsByCategory[category as NewsCategory].map((article, index) => (
                      <div key={index} className="pb-4">
                        <div className="flex flex-col gap-2">
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

                          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {article.source.name}
                            </Badge>
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>
                        {index < newsByCategory[category as NewsCategory].length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <CardFooter className="bg-card-foreground/5 p-3 sm:p-4 border-t text-xs text-muted-foreground">
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p>يتم تحديث الأخبار تلقائيًا من مصادر متعددة</p>
          {/* News is automatically updated from multiple sources */}

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {NEWS_CATEGORIES[activeCategory]}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={refreshCategory}
              title="تحديث"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
