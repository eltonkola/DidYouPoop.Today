'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut, Crown, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { getUserSubscription, getSubscriptionPlan, UserSubscription } from '@/lib/subscription';
import { toast } from 'sonner';

export function UserMenu() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [revenueCatAvailable, setRevenueCatAvailable] = useState(false);

  useEffect(() => {
    if (user) {
      checkRevenueCatAndLoadSubscription();
    }
  }, [user]);

  const checkRevenueCatAndLoadSubscription = async () => {
    try {
      const { isRevenueCatConfigured } = await import('@/lib/revenuecat');
      
      if (isRevenueCatConfigured()) {
        setRevenueCatAvailable(true);
        loadSubscription();
      }
    } catch (error) {
      console.log('RevenueCat not available:', error);
      setRevenueCatAvailable(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const data = await getUserSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  if (!user) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const plan = getSubscriptionPlan(subscription);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
            <AvatarFallback>{getInitials(user.email || 'U')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant={plan.isPremium ? "default" : "secondary"}
                className={plan.isPremium ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                {plan.isPremium ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </>
                ) : (
                  'Free'
                )}
              </Badge>
              {!revenueCatAvailable && (
                <Badge variant="outline" className="text-xs">
                  All Features Free
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {!plan.isPremium && revenueCatAvailable && (
          <>
            <DropdownMenuItem onClick={() => router.push('/premium')}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Upgrade to Premium</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}