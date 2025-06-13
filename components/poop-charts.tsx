'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { PoopEntry } from '@/lib/store';
import { format, subDays, parseISO, isAfter } from 'date-fns';

interface PoopChartsProps {
  entries: PoopEntry[];
  period: string;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];

export function PoopCharts({ entries, period }: PoopChartsProps) {
  const chartData = useMemo(() => {
    const days = parseInt(period);
    const startDate = subDays(new Date(), days);
    
    const filteredEntries = entries.filter(entry => 
      isAfter(parseISO(entry.date), startDate)
    ).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    // Daily scores chart data
    const dailyData = filteredEntries.map(entry => ({
      date: format(parseISO(entry.date), 'MMM d'),
      score: entry.score,
      didPoop: entry.didPoop ? 1 : 0,
      fiber: entry.fiber,
      duration: Math.round(entry.duration / 60), // Convert to minutes
    }));

    // Mood distribution
    const moodCounts = filteredEntries.reduce((acc, entry) => {
      if (entry.didPoop) {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const moodData = [
      { name: 'Happy', value: moodCounts.happy || 0, color: '#10B981' },
      { name: 'Neutral', value: moodCounts.neutral || 0, color: '#F59E0B' },
      { name: 'Sad', value: moodCounts.sad || 0, color: '#EF4444' },
    ].filter(item => item.value > 0);

    // Weekly averages (if period is long enough)
    const weeklyData = days >= 14 ? [] : [];
    
    return {
      dailyData,
      moodData,
      weeklyData,
    };
  }, [entries, period]);

  if (chartData.dailyData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium mb-2">No data to display</h3>
        <p className="text-muted-foreground">
          Start logging your poop to see charts and trends!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Scores Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Daily Poop Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'score' ? `${value}/100` : value,
                    name === 'score' ? 'Score' : name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fiber vs Duration Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Fiber Intake vs Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'fiber' ? `${value}g` : `${value} min`,
                    name === 'fiber' ? 'Fiber' : 'Duration'
                  ]}
                />
                <Bar dataKey="fiber" fill="#10B981" name="Fiber (g)" />
                <Bar dataKey="duration" fill="#F59E0B" name="Duration (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Mood Distribution Pie Chart */}
      {chartData.moodData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.moodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.moodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}