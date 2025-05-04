/**
 * Utilities for fetching news from NewsAPI
 */

const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export type NewsArticle = {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  category?: string; // Added category field
};

export type NewsApiResponse = {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
};

// Available news categories
export const NEWS_CATEGORIES = {
  general: 'عام', // General
  business: 'أعمال', // Business
  technology: 'تكنولوجيا', // Technology
  entertainment: 'ترفيه', // Entertainment
  sports: 'رياضة', // Sports
  science: 'علوم', // Science
  health: 'صحة', // Health
} as const;

export type NewsCategory = keyof typeof NEWS_CATEGORIES;

// Mock news data by category for fallback
export const MOCK_NEWS_BY_CATEGORY: Record<NewsCategory, NewsArticle[]> = {
  general: [
    {
      source: { id: 'bbc-news', name: 'BBC News' },
      author: 'BBC News',
      title: 'الأمم المتحدة تدعو إلى وقف إطلاق النار في الشرق الأوسط',
      description: 'دعت الأمم المتحدة إلى وقف فوري لإطلاق النار في منطقة الشرق الأوسط وسط تصاعد التوترات.',
      url: 'https://www.bbc.com/arabic',
      urlToImage: 'https://ichef.bbci.co.uk/news/1024/branded_arabic/13B2/production/_132899876_mediaitem132899875.jpg',
      publishedAt: new Date().toISOString(),
      content: 'دعت الأمم المتحدة إلى وقف فوري لإطلاق النار في منطقة الشرق الأوسط وسط تصاعد التوترات بين الأطراف المتنازعة.',
      category: 'general'
    },
    {
      source: { id: 'al-jazeera', name: 'Al Jazeera' },
      author: 'الجزيرة',
      title: 'انعقاد قمة مجموعة العشرين لمناقشة التحديات الاقتصادية العالمية',
      description: 'بدأت قمة مجموعة العشرين أعمالها لمناقشة التحديات الاقتصادية العالمية وسبل التعاون المشترك.',
      url: 'https://www.aljazeera.net',
      urlToImage: 'https://picsum.photos/800/400?random=10',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      content: 'بدأت قمة مجموعة العشرين أعمالها اليوم لمناقشة التحديات الاقتصادية العالمية وسبل التعاون المشترك بين الدول الأعضاء.',
      category: 'general'
    }
  ],
  business: [
    {
      source: { id: 'bloomberg', name: 'Bloomberg' },
      author: 'بلومبرج',
      title: 'ارتفاع أسعار النفط مع زيادة التوترات في الشرق الأوسط',
      description: 'ارتفعت أسعار النفط العالمية بنسبة 3% مع تصاعد المخاوف من تأثر الإمدادات بسبب التوترات في الشرق الأوسط.',
      url: 'https://www.bloomberg.com/markets/commodities',
      urlToImage: 'https://picsum.photos/800/400?random=20',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      content: 'ارتفعت أسعار النفط العالمية بنسبة 3% مع تصاعد المخاوف من تأثر الإمدادات بسبب التوترات المتصاعدة في منطقة الشرق الأوسط.',
      category: 'business'
    },
    {
      source: { id: 'cnbc', name: 'CNBC' },
      author: 'CNBC عربية',
      title: 'البنك المركزي يخفض أسعار الفائدة بمقدار 25 نقطة أساس',
      description: 'قرر البنك المركزي خفض أسعار الفائدة بمقدار 25 نقطة أساس في محاولة لتحفيز النمو الاقتصادي.',
      url: 'https://www.cnbc.com/world/?region=world',
      urlToImage: 'https://picsum.photos/800/400?random=21',
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      content: 'قرر البنك المركزي خفض أسعار الفائدة بمقدار 25 نقطة أساس في محاولة لتحفيز النمو الاقتصادي وسط مخاوف من تباطؤ الاقتصاد العالمي.',
      category: 'business'
    }
  ],
  technology: [
    {
      source: { id: 'wired', name: 'Wired' },
      author: 'وايرد',
      title: 'إطلاق الجيل الجديد من الهواتف الذكية بتقنيات الذكاء الاصطناعي',
      description: 'أعلنت شركات التكنولوجيا الكبرى عن إطلاق الجيل الجديد من الهواتف الذكية المزودة بتقنيات الذكاء الاصطناعي المتطورة.',
      url: 'https://www.wired.com/category/gear/phones/',
      urlToImage: 'https://picsum.photos/800/400?random=30',
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      content: 'أعلنت شركات التكنولوجيا الكبرى عن إطلاق الجيل الجديد من الهواتف الذكية المزودة بتقنيات الذكاء الاصطناعي المتطورة التي تتيح للمستخدمين تجربة فريدة.',
      category: 'technology'
    },
    {
      source: { id: 'techcrunch', name: 'TechCrunch' },
      author: 'تك كرانش',
      title: 'تطوير تقنية جديدة لشحن السيارات الكهربائية في دقائق معدودة',
      description: 'نجح باحثون في تطوير تقنية جديدة تتيح شحن بطاريات السيارات الكهربائية في غضون دقائق معدودة بدلاً من ساعات.',
      url: 'https://techcrunch.com/category/transportation/',
      urlToImage: 'https://picsum.photos/800/400?random=31',
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      content: 'نجح باحثون في تطوير تقنية جديدة تتيح شحن بطاريات السيارات الكهربائية في غضون دقائق معدودة بدلاً من ساعات، مما قد يحدث ثورة في صناعة السيارات الكهربائية.',
      category: 'technology'
    }
  ],
  entertainment: [
    {
      source: { id: 'variety', name: 'Variety' },
      author: 'فارايتي',
      title: 'إعلان موعد إطلاق الموسم الجديد من مسلسل "بيت التنين"',
      description: 'أعلنت شبكة HBO عن موعد إطلاق الموسم الثاني من مسلسل "بيت التنين" المنتظر بشدة من قبل المعجبين.',
      url: 'https://variety.com/tv/',
      urlToImage: 'https://picsum.photos/800/400?random=40',
      publishedAt: new Date(Date.now() - 518400000).toISOString(),
      content: 'أعلنت شبكة HBO عن موعد إطلاق الموسم الثاني من مسلسل "بيت التنين" المنتظر بشدة من قبل المعجبين، والذي سيعرض في الربع الأول من العام المقبل.',
      category: 'entertainment'
    },
    {
      source: { id: 'hollywood-reporter', name: 'Hollywood Reporter' },
      author: 'هوليوود ريبورتر',
      title: 'فيلم عربي يفوز بجائزة مهرجان كان السينمائي',
      description: 'فاز فيلم عربي بالجائزة الكبرى في مهرجان كان السينمائي، محققاً إنجازاً تاريخياً للسينما العربية.',
      url: 'https://www.hollywoodreporter.com/movies/',
      urlToImage: 'https://picsum.photos/800/400?random=41',
      publishedAt: new Date(Date.now() - 604800000).toISOString(),
      content: 'فاز فيلم عربي بالجائزة الكبرى في مهرجان كان السينمائي، محققاً إنجازاً تاريخياً للسينما العربية وسط إشادة واسعة من النقاد والجمهور.',
      category: 'entertainment'
    }
  ],
  sports: [
    {
      source: { id: 'espn', name: 'ESPN' },
      author: 'ESPN',
      title: 'المنتخب المصري يتأهل إلى نهائيات كأس العالم',
      description: 'نجح المنتخب المصري في التأهل إلى نهائيات كأس العالم بعد فوزه في المباراة الفاصلة.',
      url: 'https://www.espn.com/soccer/',
      urlToImage: 'https://picsum.photos/800/400?random=50',
      publishedAt: new Date(Date.now() - 691200000).toISOString(),
      content: 'نجح المنتخب المصري في التأهل إلى نهائيات كأس العالم بعد فوزه في المباراة الفاصلة على منافسه بنتيجة 2-1 في مباراة مثيرة.',
      category: 'sports'
    },
    {
      source: { id: 'bein-sports', name: 'beIN SPORTS' },
      author: 'بي إن سبورتس',
      title: 'ريال مدريد يفوز بدوري أبطال أوروبا للمرة الـ15 في تاريخه',
      description: 'توج ريال مدريد بلقب دوري أبطال أوروبا للمرة الـ15 في تاريخه بعد فوزه في المباراة النهائية.',
      url: 'https://www.beinsports.com/ar/',
      urlToImage: 'https://picsum.photos/800/400?random=51',
      publishedAt: new Date(Date.now() - 777600000).toISOString(),
      content: 'توج ريال مدريد بلقب دوري أبطال أوروبا للمرة الـ15 في تاريخه بعد فوزه في المباراة النهائية على منافسه بنتيجة 2-0 في مباراة قوية.',
      category: 'sports'
    }
  ],
  science: [
    {
      source: { id: 'national-geographic', name: 'National Geographic' },
      author: 'ناشيونال جيوغرافيك',
      title: 'اكتشاف أثري جديد في مصر يعود إلى عصر الفراعنة',
      description: 'أعلن علماء الآثار عن اكتشاف مقبرة فرعونية جديدة تحتوي على كنوز أثرية نادرة تعود إلى 3000 عام.',
      url: 'https://www.nationalgeographic.com/history/',
      urlToImage: 'https://picsum.photos/800/400?random=60',
      publishedAt: new Date(Date.now() - 864000000).toISOString(),
      content: 'أعلن علماء الآثار عن اكتشاف مقبرة فرعونية جديدة تحتوي على كنوز أثرية نادرة تعود إلى 3000 عام، مما يلقي الضوء على جوانب جديدة من الحضارة المصرية القديمة.',
      category: 'science'
    },
    {
      source: { id: 'science-daily', name: 'Science Daily' },
      author: 'ساينس ديلي',
      title: 'علماء يكتشفون كوكباً جديداً صالحاً للحياة خارج المجموعة الشمسية',
      description: 'اكتشف علماء الفلك كوكباً جديداً خارج المجموعة الشمسية يقع في المنطقة الصالحة للحياة حول نجمه.',
      url: 'https://www.sciencedaily.com/',
      urlToImage: 'https://picsum.photos/800/400?random=61',
      publishedAt: new Date(Date.now() - 950400000).toISOString(),
      content: 'اكتشف علماء الفلك كوكباً جديداً خارج المجموعة الشمسية يقع في المنطقة الصالحة للحياة حول نجمه، مما يجعله مرشحاً محتملاً لاستضافة حياة خارج كوكب الأرض.',
      category: 'science'
    }
  ],
  health: [
    {
      source: { id: 'who', name: 'WHO' },
      author: 'منظمة الصحة العالمية',
      title: 'منظمة الصحة العالمية تحذر من انتشار سلالة جديدة من الإنفلونزا',
      description: 'أصدرت منظمة الصحة العالمية تحذيراً من انتشار سلالة جديدة من الإنفلونزا قد تسبب موجة إصابات خلال فصل الشتاء.',
      url: 'https://www.who.int/',
      urlToImage: 'https://picsum.photos/800/400?random=70',
      publishedAt: new Date(Date.now() - 1036800000).toISOString(),
      content: 'أصدرت منظمة الصحة العالمية تحذيراً من انتشار سلالة جديدة من الإنفلونزا قد تسبب موجة إصابات خلال فصل الشتاء، ودعت إلى اتخاذ الإجراءات الوقائية اللازمة.',
      category: 'health'
    },
    {
      source: { id: 'medical-news', name: 'Medical News Today' },
      author: 'ميديكال نيوز توداي',
      title: 'دراسة جديدة تكشف فوائد النوم الجيد لصحة القلب',
      description: 'كشفت دراسة طبية حديثة عن العلاقة الوثيقة بين جودة النوم وصحة القلب والأوعية الدموية.',
      url: 'https://www.medicalnewstoday.com/',
      urlToImage: 'https://picsum.photos/800/400?random=71',
      publishedAt: new Date(Date.now() - 1123200000).toISOString(),
      content: 'كشفت دراسة طبية حديثة عن العلاقة الوثيقة بين جودة النوم وصحة القلب والأوعية الدموية، حيث أظهرت أن النوم الجيد لمدة 7-8 ساعات يومياً يقلل من مخاطر الإصابة بأمراض القلب.',
      category: 'health'
    }
  ]
};

/**
 * Fetch top headlines from NewsAPI
 */
export async function fetchTopHeadlines(
  country: string = 'us',
  category: NewsCategory = 'general',
  pageSize: number = 10
): Promise<NewsArticle[]> {
  try {
    // Create a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`,
      {
        cache: 'no-store', // Disable caching to get fresh news
        signal: controller.signal
      }
    );

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`NewsAPI request failed: ${response.status}. Using mock data.`);
      return MOCK_NEWS_BY_CATEGORY[category] || [];
    }

    const data: NewsApiResponse = await response.json();

    // Check if we got valid articles
    if (!data.articles || data.articles.length === 0) {
      console.warn(`NewsAPI returned no articles for ${category}. Using mock data.`);
      return MOCK_NEWS_BY_CATEGORY[category] || [];
    }

    // Add category to each article
    const articlesWithCategory = data.articles.map(article => ({
      ...article,
      category
    }));

    console.log(`Successfully fetched ${articlesWithCategory.length} articles for ${category} category`);
    return articlesWithCategory;
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return MOCK_NEWS_BY_CATEGORY[category] || [];
  }
}

/**
 * Fetch news for all categories
 */
export async function fetchNewsByCategories(
  country: string = 'us',
  pageSize: number = 5
): Promise<Record<NewsCategory, NewsArticle[]>> {
  try {
    const categories = Object.keys(NEWS_CATEGORIES) as NewsCategory[];
    console.log(`Fetching news for ${categories.length} categories from NewsAPI...`);

    // Use Promise.allSettled to handle partial failures
    const results = await Promise.allSettled(
      categories.map(category =>
        fetchTopHeadlines(country, category, pageSize)
      )
    );

    // Process results
    const newsByCategory: Partial<Record<NewsCategory, NewsArticle[]>> = {};
    let successCount = 0;

    results.forEach((result, index) => {
      const category = categories[index];
      if (result.status === 'fulfilled') {
        newsByCategory[category] = result.value;
        successCount++;
      } else {
        console.error(`Error fetching ${category} news:`, result.reason);
        newsByCategory[category] = MOCK_NEWS_BY_CATEGORY[category] || [];
      }
    });

    console.log(`Successfully fetched news for ${successCount}/${categories.length} categories`);

    // If all categories failed, log a warning
    if (successCount === 0) {
      console.warn('All category fetches failed. Using mock data for all categories.');
    }

    return newsByCategory as Record<NewsCategory, NewsArticle[]>;
  } catch (error) {
    console.error('Error fetching news by categories:', error);
    return MOCK_NEWS_BY_CATEGORY;
  }
}

/**
 * Search for news articles on NewsAPI
 */
export async function searchNews(
  query: string,
  language: string = 'en',
  pageSize: number = 10
): Promise<NewsArticle[]> {
  try {
    // If no query is provided, return empty array
    if (!query || query.trim() === '') {
      return [];
    }

    console.log(`Searching NewsAPI for: "${query}"`);

    // Create a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&language=${language}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`,
      {
        cache: 'no-store',
        signal: controller.signal
      }
    );

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`NewsAPI search request failed: ${response.status}. Using mock data.`);
      const allMockArticles = Object.values(MOCK_NEWS_BY_CATEGORY).flat();
      return allMockArticles.slice(0, pageSize);
    }

    const data: NewsApiResponse = await response.json();

    // Check if we got valid articles
    if (!data.articles || data.articles.length === 0) {
      console.warn(`NewsAPI search returned no articles for "${query}". Using mock data.`);
      const allMockArticles = Object.values(MOCK_NEWS_BY_CATEGORY).flat();
      return allMockArticles.slice(0, pageSize);
    }

    console.log(`Successfully found ${data.articles.length} articles for search: "${query}"`);
    return data.articles;
  } catch (error) {
    console.error('Error searching NewsAPI:', error);
    const allMockArticles = Object.values(MOCK_NEWS_BY_CATEGORY).flat();
    return allMockArticles.slice(0, pageSize);
  }
}
