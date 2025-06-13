'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Moon, Sun, Download, Trash2, User, Mail, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePoopStore } from '@/lib/store';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { entries, clearAllData } = usePoopStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `poop-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Data exported successfully! 📊');
  };

  const handleClearData = () => {
    if (showClearConfirm) {
      clearAllData();
      setShowClearConfirm(false);
      toast.success('All data cleared successfully');
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 5000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
          <Settings className="w-8 h-8" />
          Settings
        </h1>

        {/* Account Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Anonymous User</div>
                  <div className="text-sm text-muted-foreground">
                    Your data is stored locally on this device
                  </div>
                </div>
              </div>
              <Badge variant="secondary">Local Storage</Badge>
            </div>
            
            <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Privacy Notice</h4>
              <p>
                We respect your privacy! Your poop data is stored locally in your browser 
                and is never transmitted to external servers. You have full control over 
                your data and can export or delete it at any time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download your poop tracking data as JSON
                </p>
              </div>
              <Button
                variant="outline"
                onClick={exportData}
                disabled={entries.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-red-600 dark:text-red-400">Clear All Data</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your poop tracking data
                </p>
              </div>
              <Button
                variant={showClearConfirm ? "destructive" : "outline"}
                onClick={handleClearData}
                disabled={entries.length === 0}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {showClearConfirm ? 'Confirm Delete' : 'Clear Data'}
              </Button>
            </div>

            {showClearConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-sm text-red-700 dark:text-red-300">
                  ⚠️ This action cannot be undone. All your poop entries, achievements, 
                  and streak data will be permanently deleted.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold">{entries.length}</div>
                <div className="text-sm text-muted-foreground">Total Entries</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold">
                  {entries.filter(e => e.didPoop).length}
                </div>
                <div className="text-sm text-muted-foreground">Successful Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}