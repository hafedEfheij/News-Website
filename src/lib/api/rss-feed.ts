/**
 * Utilities for fetching and parsing RSS feeds
 */

export type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
};

// RSS feed URLs
const RSS_FEEDS = {
  bbcArabic: 'https://feeds.bbci.co.uk/arabic/rss.xml',
  googleNewsArabic: 'https://news.google.com/rss?hl=ar&gl=EG&ceid=EG:ar',
  snopes: 'https://www.snopes.com/feed/',
  factCheckOrg: 'https://www.factcheck.org/feed/'
};

// Mock RSS items for when feeds are unavailable
const MOCK_RSS_ITEMS: Record<string, RssItem[]> = {
  'BBC Arabic': [
    {
      title: 'الأمم المتحدة تحذر من تفاقم الأزمة الإنسانية في غزة',
      link: 'https://www.bbc.com/arabic',
      description: 'حذرت الأمم المتحدة من تدهور الوضع الإنساني في قطاع غزة مع استمرار النزاع واشتداد الحصار.',
      pubDate: new Date().toISOString(),
      source: 'BBC Arabic',
      imageUrl: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/13B2/production/_132899876_mediaitem132899875.jpg'
    },
    {
      title: 'ارتفاع أسعار النفط عالمياً مع تصاعد التوترات في الشرق الأوسط',
      link: 'https://www.bbc.com/arabic',
      description: 'شهدت أسعار النفط ارتفاعاً ملحوظاً في الأسواق العالمية مع تزايد المخاوف من تأثر الإمدادات بسبب التوترات المتصاعدة في منطقة الشرق الأوسط.',
      pubDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      source: 'BBC Arabic',
      imageUrl: 'https://ichef.bbci.co.uk/news/800/cpsprodpb/11D88/production/_132896543_gettyimages-1258163435.jpg'
    }
  ],
  'Google News': [
    {
      title: 'إطلاق مبادرة جديدة لدعم الشركات الناشئة في مجال التكنولوجيا',
      link: 'https://news.google.com',
      description: 'أعلنت وزارة الاتصالات وتكنولوجيا المعلومات عن إطلاق مبادرة جديدة لدعم الشركات الناشئة في مجال التكنولوجيا بتمويل يصل إلى 100 مليون دولار.',
      pubDate: new Date().toISOString(),
      source: 'Google News',
      imageUrl: 'https://picsum.photos/800/400?random=1'
    },
    {
      title: 'افتتاح معرض الكتاب الدولي بمشاركة أكثر من 500 دار نشر',
      link: 'https://news.google.com',
      description: 'افتتح معرض الكتاب الدولي أبوابه أمس بمشاركة أكثر من 500 دار نشر من مختلف أنحاء العالم، ويستمر المعرض لمدة أسبوعين.',
      pubDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      source: 'Google News',
      imageUrl: 'https://picsum.photos/800/400?random=2'
    }
  ],
  'Snopes': [
    {
      title: 'تحقق: هل صحيح أن تناول الثوم يقي من الإصابة بفيروس كورونا؟',
      link: 'https://www.snopes.com',
      description: 'انتشرت ادعاءات على وسائل التواصل الاجتماعي تفيد بأن تناول الثوم يمكن أن يقي من الإصابة بفيروس كورونا. تحققنا من صحة هذه المعلومات.',
      pubDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      source: 'Snopes',
      imageUrl: 'https://picsum.photos/800/400?random=3'
    }
  ],
  'FactCheck.org': [
    {
      title: 'تحليل: الادعاءات حول تأثير اللقاحات على الخصوبة غير مدعومة علمياً',
      link: 'https://www.factcheck.org',
      description: 'قمنا بتحليل الادعاءات المنتشرة حول تأثير لقاحات كوفيد-19 على الخصوبة ووجدنا أنها غير مدعومة بأدلة علمية موثوقة.',
      pubDate: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      source: 'FactCheck.org',
      imageUrl: 'https://picsum.photos/800/400?random=4'
    }
  ]
};

/**
 * Parse XML RSS feed to JSON
 */
function parseRssFeed(xmlText: string, sourceName: string): RssItem[] {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const items = xmlDoc.querySelectorAll('item');

    if (items.length === 0) {
      console.warn(`No items found in RSS feed from ${sourceName}`);
      return MOCK_RSS_ITEMS[sourceName] || [];
    }

    return Array.from(items).map(item => {
      // Extract image URL if available
      let imageUrl: string | undefined;

      // Try media:content
      const mediaContent = item.querySelector('media\\:content, content');
      if (mediaContent) {
        imageUrl = mediaContent.getAttribute('url') || undefined;
      }

      // If no media:content, try enclosure
      if (!imageUrl) {
        const enclosure = item.querySelector('enclosure');
        if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
          imageUrl = enclosure.getAttribute('url') || undefined;
        }
      }

      // If still no image, try to find an image in the description
      if (!imageUrl) {
        const description = item.querySelector('description')?.textContent || '';
        const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }

      return {
        title: item.querySelector('title')?.textContent || 'No title',
        link: item.querySelector('link')?.textContent || '#',
        description: item.querySelector('description')?.textContent || 'No description',
        pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
        source: sourceName,
        imageUrl
      };
    });
  } catch (error) {
    console.error(`Error parsing RSS feed from ${sourceName}:`, error);
    return MOCK_RSS_ITEMS[sourceName] || [];
  }
}

/**
 * Fetch and parse an RSS feed with fallback to mock data
 */
async function fetchRssFeed(url: string, sourceName: string): Promise<RssItem[]> {
  try {
    // Use a CORS proxy for RSS feeds
    const corsProxy = 'https://api.allorigins.win/raw?url=';

    // Create a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${corsProxy}${encodeURIComponent(url)}`, {
      signal: controller.signal
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    const xmlText = await response.text();
    const parsedItems = parseRssFeed(xmlText, sourceName);

    // If parsing returned no items, use mock data
    if (parsedItems.length === 0) {
      console.log(`No items parsed from ${sourceName}, using mock data`);
      return MOCK_RSS_ITEMS[sourceName] || [];
    }

    return parsedItems;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error);
    console.log(`Using mock data for ${sourceName}`);
    return MOCK_RSS_ITEMS[sourceName] || [];
  }
}

/**
 * Fetch BBC Arabic news
 */
export async function fetchBBCArabicNews(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.bbcArabic, 'BBC Arabic');
}

/**
 * Fetch Google News Arabic
 */
export async function fetchGoogleNewsArabic(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.googleNewsArabic, 'Google News');
}

/**
 * Fetch Snopes fact checks
 */
export async function fetchSnopesFactChecks(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.snopes, 'Snopes');
}

/**
 * Fetch FactCheck.org fact checks
 */
export async function fetchFactCheckOrgChecks(): Promise<RssItem[]> {
  return fetchRssFeed(RSS_FEEDS.factCheckOrg, 'FactCheck.org');
}

/**
 * Fetch all news sources and combine them
 */
export async function fetchAllNews(): Promise<RssItem[]> {
  try {
    const [bbcNews, googleNews] = await Promise.all([
      fetchBBCArabicNews(),
      fetchGoogleNewsArabic()
    ]);

    // Combine and sort by date (newest first)
    return [...bbcNews, ...googleNews]
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 10); // Limit to 10 items
  } catch (error) {
    console.error('Error fetching combined news:', error);

    // Return mock data as fallback
    const mockNews = [
      ...MOCK_RSS_ITEMS['BBC Arabic'] || [],
      ...MOCK_RSS_ITEMS['Google News'] || []
    ];
    return mockNews;
  }
}

/**
 * Fetch all fact checks and combine them
 */
export async function fetchAllFactChecks(): Promise<RssItem[]> {
  try {
    const [snopesChecks, factCheckOrgChecks] = await Promise.all([
      fetchSnopesFactChecks(),
      fetchFactCheckOrgChecks()
    ]);

    // Combine and sort by date (newest first)
    return [...snopesChecks, ...factCheckOrgChecks]
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 10); // Limit to 10 items
  } catch (error) {
    console.error('Error fetching combined fact checks:', error);

    // Return mock data as fallback
    const mockFactChecks = [
      ...MOCK_RSS_ITEMS['Snopes'] || [],
      ...MOCK_RSS_ITEMS['FactCheck.org'] || []
    ];
    return mockFactChecks;
  }
}
