import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePoopStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

// Configure marked to handle our formatting
marked.setOptions({
  breaks: true,
  gfm: true,
  smartypants: true,
});

interface AIHealthSummaryProps {
  isPremium: boolean;
}

export function AIHealthSummary({ isPremium }: AIHealthSummaryProps) {
  const [healthSummary, setHealthSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { entries } = usePoopStore();

  const analyzePoopData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "system",
              content: "You are a health expert specializing in digestive health. Analyze the user's poop data and provide a detailed health summary. Focus on patterns, consistency, and potential health implications. Format the response with clear headings and bullet points for better readability."
            },
            {
              role: "user",
              content: `Analyze this poop data and provide a health summary:
              ${JSON.stringify(entries, null, 2)}`
            }
          ]
        })
      });

      const data = await response.json();
      // Format the response to make it more readable
      // Format the response to make it more readable
      const rawResponse = data.choices[0].message.content;
      // Convert to markdown with proper formatting
      const markdownResponse = rawResponse
        .replace(/\*\*([^*]+)\*\*/g, '# $1')  // Convert **bold** to # headings
        .replace(/\+ ([^\n]+)/g, '- $1')      // Convert + lists to - lists
        .replace(/\* ([^\n]+)/g, '- $1')      // Convert * lists to - lists
        .replace(/\n\n/, '\n\n\n');         // Add extra spacing between sections

      // Convert markdown to HTML
      const htmlResponse = marked(markdownResponse);
      // Sanitize the HTML
      const cleanHtml = DOMPurify.sanitize(htmlResponse);
      
      setHealthSummary(cleanHtml);
      setIsExpanded(true);
      setHealthSummary(formattedResponse);
      setIsExpanded(true);
    } catch (error) {
      console.error('Error analyzing poop data:', error);
      setHealthSummary('Failed to generate health summary. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPremium) {
    return null;
  }

  return (
    <Card className="p-6 space-y-4">
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">AI Health Summary</h3>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          </div>
          
          {!isExpanded && (
            <Button onClick={analyzePoopData} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Get My Health Summary'}
            </Button>
          )}

          {isExpanded && (
            <div className="prose prose-sm max-w-none">
              {healthSummary ? (
                <div 
                  className="space-y-6"
                  dangerouslySetInnerHTML={{ __html: healthSummary }}
                />
              ) : (
                <p className="text-muted-foreground">
                  Click the button above to get your personalized health summary
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
