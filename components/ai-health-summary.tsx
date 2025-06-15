import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePoopStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'isomorphic-dompurify';
import { isRevenueCatConfigured } from '@/lib/revenuecat';
import { getUserSubscription } from '@/lib/subscription';
import { UserSubscription } from '@/lib/subscription';

// Configure marked to handle our formatting
// We're using ReactMarkdown now, no need for marked configuration

interface AIHealthSummaryProps {
  isPremium: boolean;
}

export function AIHealthSummary({ isPremium }: AIHealthSummaryProps) {
  const { entries } = usePoopStore();
  const { user } = useAuthStore();
  const [healthSummary, setHealthSummary] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremiumChecked, setIsPremiumChecked] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!isRevenueCatConfigured()) {
        setIsPremiumChecked(true);
        setIsPremiumUser(false);
        return;
      }

      try {
        const subscription = await getUserSubscription();
        setIsPremiumUser(!!subscription?.isPremium);
      } catch (error) {
        console.error('Error checking premium status:', error);
        setIsPremiumUser(false);
      } finally {
        setIsPremiumChecked(true);
      }
    };

    if (isPremium) {
      checkPremiumStatus();
    }
  }, [isPremium]);

  const analyzePoopData = async () => {
    setIsLoading(true);
    try {
      // Format the entries data in a more readable way
      const formattedEntries = entries.map(entry => ({
        date: entry.date,
        score: entry.score,
        duration: entry.duration,
        fiber: entry.fiber,
        mood: entry.mood,
        notes: entry.notes,
        didPoop: entry.didPoop,
        createdAt: entry.createdAt
      }));

      // Log the data being sent to Groq
      console.log('Sending to Groq:', {
        entries: formattedEntries,
        prompt: `Analyze this poop data and provide a health summary:
        ${JSON.stringify(formattedEntries, null, 2)}
        
        Please analyze the following aspects:
        1. Poop frequency and consistency
        2. Fiber intake patterns
        3. Mood correlation with bowel movements
        4. Duration of bowel movements
        5. Overall gut health trends
        
        Provide actionable recommendations based on the data.`
      });

      // Log the data being sent to Groq
      console.log('Sending to Groq:', {
        entries: formattedEntries,
        prompt: `Analyze this poop data and provide a health summary:
        ${JSON.stringify(formattedEntries, null, 2)}`
      });

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
              content: "You are a health expert specializing in digestive health. Analyze the user's poop data and provide a detailed health summary. Format the response with clear headings and bullet points for better readability. Use markdown format with # for main headings, ## for subheadings, and - for bullet points."
            },
            {
              role: "user",
              content: `Analyze this poop data and provide a health summary:
              ${JSON.stringify(formattedEntries, null, 2)}`
            }
          ]
        })
      });

      const data = await response.json();
      
      // Log both raw and formatted response
      console.log('Raw AI Response:', data.choices[0].message.content);

      // Format the response with proper spacing and bullet points
      const formattedResponse = data.choices[0].message.content
        .replace(/\n\n/, '\n\n\n')  // Add extra spacing between sections
        .replace(/\+ ([^\n]+)/g, '- $1')  // Convert + lists to - lists
        .replace(/\* ([^\n]+)/g, '- $1')  // Convert * lists to - lists;

      // Sanitize the response
      const cleanHtml = DOMPurify.sanitize(formattedResponse);
      
      setHealthSummary(cleanHtml);
      setIsExpanded(true);
    } catch (error) {
      console.error('Error analyzing poop data:', error);
      setHealthSummary('Failed to generate health summary. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <CardContent>
        <div className="flex flex-col gap-4">
          {isPremiumUser ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Health Summary</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </Button>
              </div>

              {isExpanded && (
                <div className="prose prose-sm max-w-none">
                  {healthSummary ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold mb-4">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold mb-3">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-semibold mb-2">{children}</h3>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="list-item">{children}</li>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2">{children}</p>
                        )
                      }}
                    >
                      {healthSummary}
                    </ReactMarkdown>
                  ) : (
                    <Button onClick={analyzePoopData} disabled={isLoading}>
                      {isLoading ? 'Analyzing...' : 'Get My Health Summary'}
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">
              This feature is available to premium users only. Upgrade to premium to access advanced health analysis.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
