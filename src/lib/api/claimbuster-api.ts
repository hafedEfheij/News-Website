/**
 * ClaimBuster API integration for claim detection
 */

const CLAIMBUSTER_API_KEY = process.env.CLAIMBUSTER_API_KEY || '';
const CLAIMBUSTER_API_URL = 'https://idir.uta.edu/claimbuster/api/v2/score/text/';

export type ClaimBusterResult = {
  text: string;
  score: number;
  isFactCheckWorthy: boolean;
};

/**
 * Score text for claim-worthiness using ClaimBuster API
 */
export async function scoreClaimWorthiness(text: string): Promise<ClaimBusterResult | null> {
  try {
    if (!text || text.trim() === '') {
      return null;
    }

    console.log('Scoring claim-worthiness with ClaimBuster API...');

    // Create a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(
      CLAIMBUSTER_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAIMBUSTER_API_KEY
        },
        body: JSON.stringify({
          text: text
        }),
        signal: controller.signal
      }
    );

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ClaimBuster API request failed: ${response.status}`);
    }

    const data = await response.json();

    // Check if we have valid results
    if (data && data.results && Object.keys(data.results).length > 0) {
      // Calculate average score
      let totalScore = 0;
      let count = 0;

      for (const [key, value] of Object.entries(data.results)) {
        if (typeof (value as any).score === 'number') {
          totalScore += (value as any).score;
          count++;
        }
      }

      const averageScore = count > 0 ? totalScore / count : 0;

      return {
        text: text,
        score: averageScore,
        isFactCheckWorthy: averageScore > 0.5 // Threshold for claim-worthiness
      };
    }

    console.warn('Unexpected response format from ClaimBuster API:', data);
    return null;
  } catch (error) {
    console.error('Error scoring claim-worthiness:', error);
    return null;
  }
}
