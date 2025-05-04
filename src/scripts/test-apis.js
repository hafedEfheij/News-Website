// Script to test various news APIs

// Use environment variables or placeholder values for testing
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'your_news_api_key';
const FACT_CHECK_API_KEY = process.env.GOOGLE_FACT_CHECK_API_KEY || 'your_fact_check_api_key';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || 'your_huggingface_api_key';
const CLAIMBUSTER_API_KEY = process.env.CLAIMBUSTER_API_KEY || 'your_claimbuster_api_key';
const GEMINI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || 'your_gemini_api_key';

// Test NewsAPI
async function testNewsAPI() {
  console.log('Testing NewsAPI...');
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`NewsAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('NewsAPI Response:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    return true;
  } catch (error) {
    console.error('Error testing NewsAPI:', error);
    return false;
  }
}

// Test Google Fact Check API
async function testGoogleFactCheckAPI() {
  console.log('Testing Google Fact Check API...');
  try {
    const params = new URLSearchParams({
      key: FACT_CHECK_API_KEY,
      query: 'climate change'
    });

    const response = await fetch(
      `https://factchecktools.googleapis.com/v1alpha1/claims:search?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google Fact Check API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Google Fact Check API Response:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    return true;
  } catch (error) {
    console.error('Error testing Google Fact Check API:', error);
    return false;
  }
}

// Test Hugging Face Summarization API
async function testHuggingFaceSummarizationAPI() {
  console.log('Testing Hugging Face Summarization API...');
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930.',
          parameters: {
            max_length: 100,
            min_length: 30
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Hugging Face Summarization API Response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing Hugging Face Summarization API:', error);
    return false;
  }
}

// Test Hugging Face Fake News Detection API
async function testHuggingFaceFakeNewsAPI() {
  console.log('Testing Hugging Face Fake News Detection API...');
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mrm8488/bert-tiny-finetuned-fake-news-detection',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'Scientists discover that drinking coffee extends life by 100 years.'
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Hugging Face Fake News Detection API Response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing Hugging Face Fake News Detection API:', error);
    return false;
  }
}

// Test ClaimBuster API
async function testClaimBusterAPI() {
  console.log('Testing ClaimBuster API...');
  try {
    const response = await fetch(
      'https://idir.uta.edu/claimbuster/api/v2/score/text/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAIMBUSTER_API_KEY
        },
        body: JSON.stringify({
          text: 'The earth is flat. The sky is blue. Vaccines cause autism.'
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ClaimBuster API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('ClaimBuster API Response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing ClaimBuster API:', error);
    return false;
  }
}

// Test BBC News RSS Feed
async function testBBCNewsRSS() {
  console.log('Testing BBC News RSS Feed...');
  try {
    const response = await fetch('https://feeds.bbci.co.uk/arabic/rss.xml');

    if (!response.ok) {
      throw new Error(`BBC News RSS request failed: ${response.status}`);
    }

    const data = await response.text();
    console.log('BBC News RSS Response (first 500 chars):', data.substring(0, 500) + '...');
    return true;
  } catch (error) {
    console.error('Error testing BBC News RSS:', error);
    return false;
  }
}

// Test Google News RSS Feed
async function testGoogleNewsRSS() {
  console.log('Testing Google News RSS Feed...');
  try {
    const response = await fetch('https://news.google.com/rss?hl=ar&gl=EG&ceid=EG:ar');

    if (!response.ok) {
      throw new Error(`Google News RSS request failed: ${response.status}`);
    }

    const data = await response.text();
    console.log('Google News RSS Response (first 500 chars):', data.substring(0, 500) + '...');
    return true;
  } catch (error) {
    console.error('Error testing Google News RSS:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    newsAPI: await testNewsAPI(),
    googleFactCheckAPI: await testGoogleFactCheckAPI(),
    huggingFaceSummarization: await testHuggingFaceSummarizationAPI(),
    huggingFaceFakeNews: await testHuggingFaceFakeNewsAPI(),
    claimBusterAPI: await testClaimBusterAPI(),
    bbcNewsRSS: await testBBCNewsRSS(),
    googleNewsRSS: await testGoogleNewsRSS()
  };

  console.log('\n--- API Test Results ---');
  for (const [api, success] of Object.entries(results)) {
    console.log(`${api}: ${success ? '✅ Working' : '❌ Failed'}`);
  }
}

// Run the tests
runAllTests();
