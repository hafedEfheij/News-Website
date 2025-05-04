/**
 * Hugging Face API integration for summarization and fake news detection
 */

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const SUMMARIZATION_MODEL = 'facebook/bart-large-cnn';
const FAKE_NEWS_MODEL = 'mrm8488/bert-tiny-finetuned-fake-news-detection';

/**
 * Summarize text using Hugging Face's BART model
 */
export async function summarizeText(
  text: string,
  maxLength: number = 150,
  minLength: number = 30
): Promise<string> {
  try {
    if (!text || text.trim() === '') {
      return '';
    }

    console.log('Summarizing text with Hugging Face API...');

    // Create a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout (model loading can take time)

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${SUMMARIZATION_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            max_length: maxLength,
            min_length: minLength,
            do_sample: false
          }
        }),
        signal: controller.signal
      }
    );

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Hugging Face API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0 && data[0].summary_text) {
      return data[0].summary_text;
    } else if (data.summary_text) {
      return data.summary_text;
    } else {
      console.warn('Unexpected response format from summarization API:', data);
      return '';
    }
  } catch (error) {
    console.error('Error summarizing text:', error);
    return '';
  }
}

export type FakeNewsResult = {
  label: string;
  score: number;
  isFake: boolean;
};

/**
 * Detect if text is likely to be fake news
 */
export async function detectFakeNews(text: string): Promise<FakeNewsResult | null> {
  try {
    if (!text || text.trim() === '') {
      return null;
    }

    console.log('Detecting fake news with Hugging Face API...');

    // Create a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout (model loading can take time)

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${FAKE_NEWS_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: text
        }),
        signal: controller.signal
      }
    );

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Hugging Face API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      // Find the fake label
      const fakeResult = data[0].find((item: any) =>
        item.label.toLowerCase().includes('fake') ||
        item.label.toLowerCase().includes('false')
      );

      const realResult = data[0].find((item: any) =>
        item.label.toLowerCase().includes('real') ||
        item.label.toLowerCase().includes('true')
      );

      if (fakeResult && realResult) {
        // Determine if it's fake based on which score is higher
        const isFake = fakeResult.score > realResult.score;
        return {
          label: isFake ? fakeResult.label : realResult.label,
          score: isFake ? fakeResult.score : realResult.score,
          isFake
        };
      } else if (fakeResult) {
        return {
          label: fakeResult.label,
          score: fakeResult.score,
          isFake: fakeResult.score > 0.5
        };
      } else if (realResult) {
        return {
          label: realResult.label,
          score: realResult.score,
          isFake: realResult.score < 0.5
        };
      }
    }

    console.warn('Unexpected response format from fake news detection API:', data);
    return null;
  } catch (error) {
    console.error('Error detecting fake news:', error);
    return null;
  }
}
