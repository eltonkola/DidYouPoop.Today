import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/components/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DidYouPoop.today - Track Your Daily Movements',
  description: 'The fun and functional way to track your gut health with poop scoring, streaks, and achievements!',
  keywords: 'poop tracker, gut health, bowel movement, digestive health, fiber intake',
  authors: [{ name: 'DidYouPoop Team' }],
  creator: 'DidYouPoop.today',
  publisher: 'DidYouPoop.today',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://didyoupoop.today',
    title: 'DidYouPoop.today - Track Your Daily Movements',
    description: 'The fun and functional way to track your gut health!',
    siteName: 'DidYouPoop.today',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg'
  },
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: '#ff9800'
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#f4511e'
    }
  ],
  twitter: {
    card: 'summary_large_image',
    title: 'DidYouPoop.today - Track Your Daily Movements',
    description: 'The fun and functional way to track your gut health!',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <AuthGuard>
                {children}
              </AuthGuard>
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}