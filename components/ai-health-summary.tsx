import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { usePoopStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';

interface AIHealthSummaryProps {
  isPremium: boolean;
}

export function AIHealthSummary({ isPremium }: AIHealthSummaryProps) {
  const [healthSummary, setHealthSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { entries } = usePoopStore();

  useEffect(() => {
    if (!isPremium) return;

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
                content: "You are a health expert specializing in digestive health. Analyze the user's poop data and provide a detailed health summary. Focus on patterns, consistency, and potential health implications."
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
        setHealthSummary(data.choices[0].message.content);
      } catch (error) {
        console.error('Error analyzing poop data:', error);
        setHealthSummary('Failed to generate health summary. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    analyzePoopData();
  }, [isPremium, entries]);

  if (!isPremium) {
    return null;
  }

  return (
    <Card className="p-6">
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">AI Health Summary</h3>
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        </div>
        <div className="prose max-w-none">
          {healthSummary ? (
            <div dangerouslySetInnerHTML={{ __html: healthSummary }} />
          ) : (
            <p>Loading your personalized health summary...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
