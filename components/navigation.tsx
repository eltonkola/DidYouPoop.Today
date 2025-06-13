'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home, 
  Calendar, 
  Trophy, 
  Settings, 
  Menu,
  Plus,
  BarChart3
} from 'lucide-react';
import { usePoopStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Log Poop', href: '/log', icon: Plus },
  { name: 'History', href: '/history', icon: Calendar },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const { streak, achievements } = usePoopStore();
  const [open, setOpen] = useState(false);

  const NavLink = ({ item, mobile = false }: { item: typeof navigation[0], mobile?: boolean }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    
    return (
      <Link
        href={item.href}
        onClick={() => mobile && setOpen(false)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          mobile && 'justify-start w-full'
        )}
      >
        <Icon className="w-4 h-4" />
        {item.name}
        {item.name === 'Achievements' && achievements.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {achievements.length}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">💩</span>
            <span className="hidden sm:inline">DidYouPoop.Today</span>
            <span className="sm:hidden">DYP</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          {/* Streak Badge */}
          <div className="hidden sm:flex items-center gap-2">
            {streak > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {streak} day streak
              </Badge>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">💩</span>
                    <span className="font-bold text-lg">DidYouPoop.Today</span>
                  </div>
                  
                  {streak > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <BarChart3 className="w-3 h-3" />
                      {streak} day streak
                    </Badge>
                  )}
                  
                  <nav className="flex flex-col gap-2">
                    {navigation.map((item) => (
                      <NavLink key={item.name} item={item} mobile />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}