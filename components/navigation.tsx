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
  BarChart3,
  LogIn,
  Crown,
  Cloud,
  CloudOff
} from 'lucide-react';
import { usePoopStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { UserMenu } from '@/components/auth/user-menu';
import { AuthModal } from '@/components/auth/auth-modal';
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
  const { streak, achievements, isLoading, lastSyncTime } = usePoopStore();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Sync Status */}
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                {isLoading ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Cloud className="w-3 h-3 animate-pulse" />
                    Syncing...
                  </Badge>
                ) : lastSyncTime ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-green-600" />
                    Synced
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CloudOff className="w-3 h-3 text-gray-500" />
                    Local Only
                  </Badge>
                )}
              </div>
            )}

            {/* Streak Badge */}
            {streak > 0 && (
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {streak} day streak
              </Badge>
            )}

            {/* User Menu or Sign In */}
            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Crown className="w-4 h-4" />
                  Premium
                </Button>
              </div>
            )}

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
                      <span className="font-bold text-lg">DidYouPoop.online</span>
                    </div>
                    
                    {/* Sync Status for mobile */}
                    {user && (
                      <div className="flex items-center gap-2 mb-2">
                        {isLoading ? (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Cloud className="w-3 h-3 animate-pulse" />
                            Syncing...
                          </Badge>
                        ) : lastSyncTime ? (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Cloud className="w-3 h-3 text-green-600" />
                            Cloud Synced
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <CloudOff className="w-3 h-3 text-gray-500" />
                            Local Only
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Always show navigation */}
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

                    {/* Sign in button for mobile */}
                    {!user && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <Button 
                          onClick={() => {
                            setShowAuthModal(true);
                            setOpen(false);
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                        <Button 
                          onClick={() => {
                            setShowAuthModal(true);
                            setOpen(false);
                          }}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Get Premium
                        </Button>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Get cloud sync and premium features!
                        </p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}