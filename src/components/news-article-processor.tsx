'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AlertTriangle, CheckCircle, Loader2, ScrollText, Search, HelpCircle, XCircle } from 'lucide-react';
import ClientLink from '@/components/client-link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

// AI function imports
import { summarizeArticle, type SummarizeArticleOutput } from '@/ai/flows/summarize-article';
import { detectFakeNews, type DetectFakeNewsOutput } from '@/ai/flows/detect-fake-news';
import { verifyClaim, type VerifyClaimInput, type VerifyClaimOutput } from '@/ai/flows/verify-claim'; // Import verifyClaim

const formSchema = z.object({
  articleUrl: z.string().url({ message: 'الرجاء إدخال رابط صالح.' }), // Please enter a valid URL.
});

const claimSchema = z.object({
    claimText: z.string().min(10, { message: 'الرجاء إدخال نص للتحقق (10 أحرف على الأقل).' }), // Please enter text to verify (at least 10 characters).
});


type NewsAnalysisResult = {
  summaryResult: SummarizeArticleOutput | null;
  fakeNewsResult: DetectFakeNewsOutput | null;
};

export function NewsArticleProcessor() {
  const [isAnalysisLoading, setIsAnalysisLoading] = React.useState(false);
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = React.useState<NewsAnalysisResult | null>(null);
  const [currentUrl, setCurrentUrl] = React.useState<string | null>(null);

  // State for claim verification
  const [isVerificationLoading, setIsVerificationLoading] = React.useState(false);
  const [verificationError, setVerificationError] = React.useState<string | null>(null);
  const [verificationResult, setVerificationResult] = React.useState<VerifyClaimOutput | null>(null);
  const [claimToVerify, setClaimToVerify] = React.useState('');

  const analysisForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      articleUrl: '',
    },
  });

  const claimForm = useForm<z.infer<typeof claimSchema>>({
      resolver: zodResolver(claimSchema),
      defaultValues: {
          claimText: '',
      },
  });


  async function onAnalyzeSubmit(values: z.infer<typeof formSchema>) {
    setIsAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResults(null);
    setCurrentUrl(values.articleUrl);
    // Reset verification state when analyzing a new article
    setVerificationResult(null);
    setVerificationError(null);
    setClaimToVerify('');
    claimForm.reset();


    try {
      // Fetch article content (placeholder)
      const articleContent = `محتوى لـ ${values.articleUrl}`; // Placeholder

      // Run AI flows in parallel
      const [summaryResponse, fakeNewsResponse] = await Promise.allSettled([
        summarizeArticle({ articleUrl: values.articleUrl }),
        detectFakeNews({ articleUrl: values.articleUrl, articleContent }),
      ]);

      const summaryResult = summaryResponse.status === 'fulfilled' ? summaryResponse.value : null;
      const fakeNewsResult = fakeNewsResponse.status === 'fulfilled' ? fakeNewsResponse.value : null;

      setAnalysisResults({ summaryResult, fakeNewsResult });

       if (summaryResponse.status === 'rejected') {
         console.error("فشل التلخيص:", summaryResponse.reason);
         // Optionally set a specific error
       }
       if (fakeNewsResponse.status === 'rejected') {
         console.error("فشل كشف الأخبار الكاذبة:", fakeNewsResponse.reason);
         // Optionally set a specific error
       }
       if (summaryResponse.status === 'rejected' || fakeNewsResponse.status === 'rejected') {
         setAnalysisError('حدث خطأ أثناء معالجة المقال. الرجاء المحاولة مرة أخرى.');
       }

    } catch (err) {
      console.error('خطأ في معالجة المقال:', err);
      setAnalysisError('حدث خطأ غير متوقع. يرجى التحقق من الرابط أو المحاولة مرة أخرى لاحقًا.');
      setAnalysisResults(null);
    } finally {
      setIsAnalysisLoading(false);
    }
  }

  async function onVerifySubmit(values: z.infer<typeof claimSchema>) {
      setIsVerificationLoading(true);
      setVerificationError(null);
      setVerificationResult(null);
      setClaimToVerify(values.claimText);

      try {
          const result = await verifyClaim({ claimText: values.claimText });
          setVerificationResult(result);
      } catch (err) {
          console.error('خطأ في التحقق من الادعاء:', err); // Error verifying claim:
          setVerificationError('حدث خطأ أثناء التحقق من المعلومات. الرجاء المحاولة مرة أخرى.'); // An error occurred during verification. Please try again.
          setVerificationResult(null);
      } finally {
          setIsVerificationLoading(false);
      }
  }

  const getVerdictIcon = (verdict: string | undefined) => {
    switch (verdict) {
        case "مرجح أنه صحيح":
            return <CheckCircle className="h-5 w-5 text-green-600" />;
        case "مرجح أنه خطأ":
            return <XCircle className="h-5 w-5 text-destructive" />;
        case "غير مؤكد":
            return <HelpCircle className="h-5 w-5 text-yellow-600" />;
        default:
            return null;
    }
  };


  return (
    <Card className="w-full shadow-lg border border-border/50 rounded-xl overflow-hidden bg-card">
      {/* Article Analysis Section */}
      <CardHeader className="bg-card-foreground/5 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl font-semibold">تحليل المقال الإخباري</CardTitle> {/* Analyze News Article */}
        <CardDescription className="text-sm sm:text-base">أدخل رابط المقال الإخباري أدناه.</CardDescription> {/* Enter the URL of a news article below. */}
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <Form {...analysisForm}>
          <form onSubmit={analysisForm.handleSubmit(onAnalyzeSubmit)} className="space-y-4">
            <FormField
              control={analysisForm.control}
              name="articleUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="articleUrl" className="text-sm sm:text-base">رابط المقال</FormLabel> {/* Article URL */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <FormControl>
                      <Input
                        id="articleUrl"
                        placeholder="https://example.com/news-article"
                        {...field}
                        className="flex-grow text-sm sm:text-base"
                        aria-describedby="articleUrl-message"
                      />
                    </FormControl>
                    <Button type="submit" disabled={isAnalysisLoading} className="w-full sm:w-auto min-w-[100px] sm:min-w-[120px] text-sm sm:text-base">
                      {isAnalysisLoading ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري التحليل...
                        </>
                      ) : (
                        'تحليل'
                      )}
                    </Button>
                  </div>
                  <FormMessage id="articleUrl-message" className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {isAnalysisLoading && (
           <div className="space-y-6 pt-4">
             <Separator />
             <div className="space-y-4">
                <Skeleton className="h-5 w-1/4 sm:h-6" />
                <Skeleton className="h-3 w-full sm:h-4" />
                <Skeleton className="h-3 w-full sm:h-4" />
                <Skeleton className="h-3 w-3/4 sm:h-4" />
              </div>
              <Separator />
             <div className="space-y-4">
                <Skeleton className="h-5 w-1/3 sm:h-6" />
                 <Skeleton className="h-3 w-1/2 sm:h-4" />
             </div>
           </div>
        )}

        {!isAnalysisLoading && analysisError && (
          <div className="pt-4">
             <Separator />
            <p className="text-destructive mt-4 text-center text-sm sm:text-base">{analysisError}</p>
          </div>
        )}

        {!isAnalysisLoading && !analysisError && analysisResults && (
          <div className="pt-4 space-y-6">
            <Separator />
            {/* Summary Section */}
            {analysisResults.summaryResult ? (
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-primary">
                  <ScrollText className="h-4 w-4 sm:h-5 sm:w-5" /> ملخص المقال {/* Article Summary */}
                </h3>
                <p className="text-foreground/90 leading-relaxed bg-secondary/30 p-3 sm:p-4 rounded-md border text-sm sm:text-base">
                  {analysisResults.summaryResult.summary}
                </p>
              </div>
            ) : (
               <p className="text-muted-foreground text-sm sm:text-base">تعذر إنشاء الملخص.</p> // Could not generate summary.
            )}

            <Separator />

            {/* Fake News Detection Section */}
             {analysisResults.fakeNewsResult ? (
                <div className="space-y-3">
                   <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-primary">
                     <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" /> فحص المعلومات المضللة {/* Misinformation Check */}
                   </h3>
                   <div className={`flex items-start sm:items-center gap-3 p-3 sm:p-4 rounded-md border ${
                     analysisResults.fakeNewsResult.isFakeNews
                       ? 'bg-destructive/10 border-destructive/30'
                       : 'bg-green-500/10 border-green-500/30' // Using theme colors now
                   }`}>
                      {analysisResults.fakeNewsResult.isFakeNews ? (
                       <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive flex-shrink-0 mt-1 sm:mt-0" />
                     ) : (
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--success))] flex-shrink-0 mt-1 sm:mt-0" /> // Added success color variable
                     )}
                      <div className="flex-grow">
                       <p className={`font-medium text-sm sm:text-base ${analysisResults.fakeNewsResult.isFakeNews ? 'text-destructive' : 'text-[hsl(var(--success))]'}`}> {/* Use success color variable */}
                         {analysisResults.fakeNewsResult.isFakeNews
                           ? 'تم اكتشاف معلومات مضللة محتملة'
                           : 'لم يتم اكتشاف معلومات مضللة واضحة'}
                       </p>
                       <p className={`text-xs sm:text-sm ${analysisResults.fakeNewsResult.isFakeNews ? 'text-destructive/90' : 'text-[hsl(var(--success))] opacity-90'}`}> {/* Use success color variable */}
                         {analysisResults.fakeNewsResult.reason}
                       </p>
                     </div>
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                            <Badge variant={analysisResults.fakeNewsResult.isFakeNews ? 'destructive' : 'default'} className={`text-xs sm:text-sm ${!analysisResults.fakeNewsResult.isFakeNews ? 'bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))] text-white' : ''}`}> {/* Use success color variable */}
                             الثقة: {(analysisResults.fakeNewsResult.confidenceScore * 100).toFixed(0)}% {/* Confidence: */}
                           </Badge>
                         </TooltipTrigger>
                         <TooltipContent side="top">
                           <p className="text-xs sm:text-sm">درجة ثقة الذكاء الاصطناعي لهذا التقييم.</p> {/* AI confidence score for this assessment. */}
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                   </div>
                 </div>
               ) : (
                  <p className="text-muted-foreground text-sm sm:text-base">تعذر إجراء فحص المعلومات المضللة.</p> // Could not perform misinformation check.
               )}
          </div>
        )}
      </CardContent>
      {currentUrl && !isAnalysisLoading && (
        <CardFooter className="bg-card-foreground/5 p-3 sm:p-4 border-t">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              الرابط الذي تم تحليله: <ClientLink href={currentUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{currentUrl}</ClientLink> {/* Analyzed URL: */}
            </p>
        </CardFooter>
      )}

        {/* Claim Verification Section */}
        <Separator />
        <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-semibold">التحقق من صحة المعلومات</CardTitle> {/* Verify Information */}
            <CardDescription className="text-sm sm:text-base">أدخل نصًا أو ادعاءً للتحقق من صحته باستخدام البحث عبر الإنترنت.</CardDescription> {/* Enter text or a claim to verify its authenticity using web search. */}
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
            <Form {...claimForm}>
                <form onSubmit={claimForm.handleSubmit(onVerifySubmit)} className="space-y-4">
                    <FormField
                        control={claimForm.control}
                        name="claimText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="claimText" className="text-sm sm:text-base">النص المراد التحقق منه</FormLabel> {/* Text to Verify */}
                                <FormControl>
                                    <Textarea
                                        id="claimText"
                                        placeholder="اكتب الادعاء أو المعلومة هنا..." // Write the claim or information here...
                                        {...field}
                                        className="min-h-[80px] text-sm sm:text-base"
                                        aria-describedby="claimText-message"
                                    />
                                </FormControl>
                                <FormMessage id="claimText-message" className="text-xs sm:text-sm" />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isVerificationLoading} className="w-full sm:w-auto min-w-[100px] sm:min-w-[120px] text-sm sm:text-base">
                        {isVerificationLoading ? (
                            <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                جاري التحقق... {/* Verifying... */}
                            </>
                        ) : (
                            <>
                                <Search className="ml-2 h-4 w-4" /> {/* Swapped icon side */}
                                تحقق الآن {/* Verify Now */}
                            </>
                        )}
                    </Button>
                </form>
            </Form>

            {isVerificationLoading && (
                <div className="space-y-4 pt-4">
                    <Separator />
                    <Skeleton className="h-5 w-1/3 sm:h-6" />
                    <Skeleton className="h-3 w-full sm:h-4" />
                    <Skeleton className="h-3 w-full sm:h-4" />
                    <Skeleton className="h-3 w-1/2 sm:h-4" />
                     <Skeleton className="h-3 w-3/4 sm:h-4 mt-2" />
                </div>
            )}

            {!isVerificationLoading && verificationError && (
                <div className="pt-4">
                    <Separator />
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>خطأ في التحقق</AlertTitle> {/* Verification Error */}
                        <AlertDescription>{verificationError}</AlertDescription>
                    </Alert>
                </div>
            )}

            {!isVerificationLoading && !verificationError && verificationResult && (
                <div className="pt-4 space-y-4">
                    <Separator />
                    <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 text-primary">
                        {getVerdictIcon(verificationResult.verdict)}
                        نتيجة التحقق {/* Verification Result */}
                    </h3>
                    <Alert
                        variant={
                            verificationResult.verdict === "مرجح أنه خطأ" ? "destructive" :
                            verificationResult.verdict === "غير مؤكد" ? "default" : // Using default for uncertain, maybe add a warning variant later
                            "default" // Default for Likely True (implicitly success)
                        }
                        className={verificationResult.verdict === "مرجح أنه صحيح" ? `border-green-500/30 bg-green-500/10 text-green-700 [&>svg]:text-green-600` : verificationResult.verdict === "غير مؤكد" ? `border-yellow-500/30 bg-yellow-500/10 text-yellow-700 [&>svg]:text-yellow-600` : ""} // Custom styling for success/warning
                    >
                         {getVerdictIcon(verificationResult.verdict)}
                         <AlertTitle className={`font-bold ${verificationResult.verdict === "مرجح أنه صحيح" ? 'text-green-700' : verificationResult.verdict === "غير مؤكد" ? 'text-yellow-700' : ''}`}> {/* Bold and color based on verdict */}
                             {verificationResult.verdict}
                         </AlertTitle>
                        <AlertDescription className={`mt-1 ${verificationResult.verdict === "مرجح أنه صحيح" ? 'text-green-700/90' : verificationResult.verdict === "غير مؤكد" ? 'text-yellow-700/90' : ''}`}>
                            {verificationResult.explanation}
                        </AlertDescription>
                    </Alert>

                    {verificationResult.supportingEvidence && verificationResult.supportingEvidence.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm sm:text-base font-medium text-muted-foreground">الأدلة الداعمة:</h4> {/* Supporting Evidence: */}
                            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-foreground/80">
                                {verificationResult.supportingEvidence.map((evidence, index) => (
                                    <li key={index}>
                                        {evidence.startsWith('http') ? (
                                            <ClientLink href={evidence} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary break-all">{evidence}</ClientLink>
                                        ) : (
                                            <span className="break-words">{evidence}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
             {claimToVerify && !isVerificationLoading && (
                 <CardFooter className="bg-card-foreground/5 p-3 sm:p-4 border-t mt-4">
                     <p className="text-xs sm:text-sm text-muted-foreground">
                         النص الذي تم التحقق منه: <span className="italic">"{claimToVerify}"</span> {/* Verified Claim: */}
                     </p>
                 </CardFooter>
             )}
        </CardContent>


    </Card>
  );
}
