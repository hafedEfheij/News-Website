/**
 * Google Fact Check API integration
 */

const FACT_CHECK_API_KEY = process.env.GOOGLE_FACT_CHECK_API_KEY || '';
const FACT_CHECK_API_URL = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';

export type FactCheckPublisher = {
  name: string;
  site: string;
};

export type FactCheckReview = {
  publisher: FactCheckPublisher;
  url: string;
  title: string;
  reviewDate?: string;
  textualRating?: string;
  languageCode?: string;
};

export type FactCheckClaim = {
  text: string;
  claimant?: string;
  claimDate?: string;
  claimReview: FactCheckReview[];
};

export type FactCheckResponse = {
  claims?: FactCheckClaim[];
  nextPageToken?: string;
};

/**
 * Search for fact checks related to a query
 */
export async function searchFactChecks(
  query: string,
  language: string = 'en',
  maxResults: number = 10
): Promise<FactCheckClaim[]> {
  try {
    if (!query || query.trim() === '') {
      return [];
    }

    console.log(`Searching fact checks for: "${query}"`);

    // Create a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const params = new URLSearchParams({
      key: FACT_CHECK_API_KEY,
      query: query,
      languageCode: language,
      pageSize: maxResults.toString()
    });

    const response = await fetch(`${FACT_CHECK_API_URL}?${params.toString()}`, {
      signal: controller.signal
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Fact Check API request failed: ${response.status}`);
      return [];
    }

    const data: FactCheckResponse = await response.json();

    if (!data.claims || data.claims.length === 0) {
      console.log(`No fact checks found for: "${query}"`);
      return [];
    }

    console.log(`Found ${data.claims.length} fact checks for: "${query}"`);
    return data.claims;
  } catch (error) {
    console.error('Error searching fact checks:', error);
    return [];
  }
}

/**
 * Get fact checks for a specific claim
 */
export async function getFactChecksForClaim(
  claim: string,
  language: string = 'en'
): Promise<FactCheckClaim[]> {
  return searchFactChecks(claim, language, 5);
}
