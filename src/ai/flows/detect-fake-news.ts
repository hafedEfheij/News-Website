'use server';
/**
 * @fileOverview A fake news detection AI agent.
 *
 * - detectFakeNews - A function that handles the fake news detection process.
 * - DetectFakeNewsInput - The input type for the detectFakeNews function.
 * - DetectFakeNewsOutput - The return type for the detectFakeNews function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DetectFakeNewsInputSchema = z.object({
  articleUrl: z.string().describe('The URL of the news article to analyze.'),
  articleContent: z.string().describe('The content of the news article.'),
});
export type DetectFakeNewsInput = z.infer<typeof DetectFakeNewsInputSchema>;

const DetectFakeNewsOutputSchema = z.object({
  isFakeNews: z.boolean().describe('ما إذا كان من المحتمل أن يحتوي المقال على معلومات مضللة أو أخبار كاذبة.'), // Whether the article is likely to contain misinformation or fake news.
  confidenceScore: z.number().describe('درجة بين 0 و 1 تشير إلى مستوى الثقة في كشف الأخبار الكاذبة.'), // A score between 0 and 1 indicating the confidence level of the fake news detection.
  reason: z.string().describe('السبب وراء الإشارة إلى المقال على أنه قد يكون خبرًا كاذبًا، باللغة العربية.'), // The reason why the article is flagged as potentially fake news, in Arabic.
});
export type DetectFakeNewsOutput = z.infer<typeof DetectFakeNewsOutputSchema>;

export async function detectFakeNews(input: DetectFakeNewsInput): Promise<DetectFakeNewsOutput> {
  return detectFakeNewsFlow(input);
}

const detectFakeNewsPrompt = ai.definePrompt({
  name: 'detectFakeNewsPrompt',
  input: {
    schema: z.object({
      articleUrl: z.string().describe('The URL of the news article to analyze.'),
      articleContent: z.string().describe('The content of the news article.'),
    }),
  },
  output: {
    schema: z.object({
      isFakeNews: z.boolean().describe('ما إذا كان من المحتمل أن يحتوي المقال على معلومات مضللة أو أخبار كاذبة.'), // Whether the article is likely to contain misinformation or fake news.
      confidenceScore: z.number().describe('درجة بين 0 و 1 تشير إلى مستوى الثقة في كشف الأخبار الكاذبة.'), // A score between 0 and 1 indicating the confidence level of the fake news detection.
      reason: z.string().describe('السبب وراء الإشارة إلى المقال على أنه قد يكون خبرًا كاذبًا، باللغة العربية.'), // The reason why the article is flagged as potentially fake news, in Arabic.
    }),
  },
  prompt: `أنت خبير في كشف الأخبار الكاذبة والمعلومات المضللة. حلل المقال الإخباري التالي وحدد ما إذا كان من المحتمل أن يحتوي على معلومات مضللة أو أخبار كاذبة.\n\nرابط المقال: {{{articleUrl}}}\nمحتوى المقال: {{{articleContent}}}\n\nقدم درجة ثقة بين 0 و 1، واشرح أسبابك باللغة العربية. اضبط حقل isFakeNews بشكل مناسب.`, // You are an expert in detecting fake news and misinformation. Analyze the following news article and determine if it is likely to contain misinformation or fake news.\n\nArticle URL: {{{articleUrl}}}\nArticle Content: {{{articleContent}}}\n\nProvide a confidence score between 0 and 1, and explain your reasoning in Arabic. Set the isFakeNews field appropriately.
});

const detectFakeNewsFlow = ai.defineFlow<
  typeof DetectFakeNewsInputSchema,
  typeof DetectFakeNewsOutputSchema
>({
  name: 'detectFakeNewsFlow',
  inputSchema: DetectFakeNewsInputSchema,
  outputSchema: DetectFakeNewsOutputSchema,
}, async input => {
  const {output} = await detectFakeNewsPrompt(input);
  return output!;
});
