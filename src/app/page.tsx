import type {Metadata} from 'next';
import { NewsArticleProcessor } from '@/components/news-article-processor';
import { CategorizedNews } from '@/components/categorized-news';
import { TrendingNews } from '@/components/trending-news';
import { LatestNews } from '@/components/latest-news';
import { Github, Newspaper } from 'lucide-react';
import ClientLink from '@/components/client-link';

export const metadata: Metadata = {
  title: 'محقق الأخبار', // News Detective
  description: 'تصفح الأخبار العاجلة حسب الفئة، تلخيص المقالات وكشف الأخبار الكاذبة من روابط المقالات.', // Browse breaking news by category, summarize articles and detect fake news from article URLs.
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-gradient-to-b from-background to-secondary/30">
      <header className="w-full max-w-4xl mb-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
         <Newspaper size={48} className="text-primary" />
         <h1 className="text-4xl font-bold text-primary tracking-tight">
            محقق الأخبار
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          تصفح الأخبار العاجلة حسب الفئة، أو أدخل رابط مقال إخباري للحصول على ملخص موجز والتحقق من المعلومات المضللة المحتملة.
        </p>
      </header>

      <div className="w-full max-w-4xl space-y-8">
        {/* News Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trending News Section */}
          <TrendingNews />

          {/* Latest News Section */}
          <LatestNews />
        </div>

        {/* Categorized News Section */}
        <CategorizedNews />

        {/* News Article Processor */}
        <NewsArticleProcessor />
      </div>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>مدعوم بالذكاء الاصطناعي التوليدي</p>
        <ClientLink
          href="https://github.com/google/genkit"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors mt-2"
        >
          <Github size={16} />
          تم البناء باستخدام Genkit
        </ClientLink>
      </footer>
    </main>
  );
}
