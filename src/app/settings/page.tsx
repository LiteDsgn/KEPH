'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTimezone } from '@/hooks/use-timezone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Save, 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  Shield, 
  Trash2,
  Download,
  Upload,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from 'next-themes';

interface UserSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  task_reminders: boolean;
  weekly_summary: boolean;
  theme_preference: 'light' | 'dark' | 'system';
  timezone: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  time_format: '12h' | '24h';
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const timezoneHook = useTimezone();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    email_notifications: true,
    task_reminders: true,
    weekly_summary: false,
    theme_preference: 'system',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings.',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setSettings({
          notifications_enabled: data.notifications_enabled ?? true,
          email_notifications: data.email_notifications ?? true,
          task_reminders: data.task_reminders ?? true,
          weekly_summary: data.weekly_summary ?? false,
          theme_preference: data.theme_preference ?? 'system',
          timezone: data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
          date_format: data.date_format ?? 'MM/DD/YYYY',
          time_format: data.time_format ?? '12h',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) {
      console.warn('No user found when attempting to save settings');
      return;
    }

    setIsSaving(true);
    try {
      // Validate settings before saving
      const settingsToSave = {
        user_id: user.id,
        notifications_enabled: Boolean(settings.notifications_enabled),
        email_notifications: Boolean(settings.email_notifications),
        task_reminders: Boolean(settings.task_reminders),
        weekly_summary: Boolean(settings.weekly_summary),
        theme_preference: settings.theme_preference,
        timezone: settings.timezone || 'UTC',
        date_format: settings.date_format,
        time_format: settings.time_format,
      };

      console.log('Saving settings:', settingsToSave);

      const { data, error } = await supabase
        .from('user_settings')
        .upsert(settingsToSave, {
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error('Supabase error saving settings:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        toast({
          title: 'Error',
          description: `Failed to save settings: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('Settings saved successfully:', data);

      // Apply theme change immediately
      setTheme(settings.theme_preference);
      
      // Refresh timezone settings
      try {
        await timezoneHook.refreshSettings();
      } catch (timezoneError) {
        console.warn('Failed to refresh timezone settings:', timezoneError);
      }

      toast({
        title: 'Success',
        description: 'Settings saved successfully.',
      });
    } catch (error) {
      console.error('Unexpected error saving settings:', {
        error,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      toast({
        title: 'Error',
        description: `Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      // Fetch user's tasks and data
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasksError) {
        throw tasksError;
      }

      const exportData = {
        user_id: user.id,
        export_date: new Date().toISOString(),
        tasks: tasks || [],
        settings: settings,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keph-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Data exported successfully.',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    );

    if (!confirmed) return;

    try {
      // Delete user data
      const { error } = await supabase.rpc('delete_user_account', {
        user_uuid: user.id
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });

      // Sign out and redirect
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please contact support.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 font-body">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-8">
          {/* Settings Header */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <SettingsIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold font-headline tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Settings
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Customize your KEPH experience
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <Monitor className="h-6 w-6 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Theme</Label>
                  <Select 
                    value={settings.theme_preference} 
                    onValueChange={(value: 'light' | 'dark' | 'system') => 
                      setSettings(prev => ({ ...prev, theme_preference: value }))
                    }
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Date Format</Label>
                  <Select 
                    value={settings.date_format} 
                    onValueChange={(value: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => 
                      setSettings(prev => ({ ...prev, date_format: value }))
                    }
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Time Format</Label>
                  <Select 
                    value={settings.time_format} 
                    onValueChange={(value: '12h' | '24h') => 
                      setSettings(prev => ({ ...prev, time_format: value }))
                    }
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Timezone</Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value: string) => 
                      setSettings(prev => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="America/New_York">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Eastern Time (ET)
                        </div>
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Central Time (CT)
                        </div>
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Mountain Time (MT)
                        </div>
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Pacific Time (PT)
                        </div>
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Greenwich Mean Time (GMT)
                        </div>
                      </SelectItem>
                      <SelectItem value="Europe/Paris">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Central European Time (CET)
                        </div>
                      </SelectItem>
                      <SelectItem value="Europe/Berlin">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Central European Time (CET)
                        </div>
                      </SelectItem>
                      <SelectItem value="Asia/Tokyo">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Japan Standard Time (JST)
                        </div>
                      </SelectItem>
                      <SelectItem value="Asia/Shanghai">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          China Standard Time (CST)
                        </div>
                      </SelectItem>
                      <SelectItem value="Asia/Kolkata">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          India Standard Time (IST)
                        </div>
                      </SelectItem>
                      <SelectItem value="Australia/Sydney">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Australian Eastern Time (AET)
                        </div>
                      </SelectItem>
                      <SelectItem value="UTC">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Coordinated Universal Time (UTC)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Your midnight is used for daily task transitions. Current timezone: {timezoneHook.getTimezoneDisplay()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <Bell className="h-6 w-6 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for important updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications_enabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, notifications_enabled: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, email_notifications: checked }))
                    }
                    disabled={!settings.notifications_enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming tasks
                    </p>
                  </div>
                  <Switch
                    checked={settings.task_reminders}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, task_reminders: checked }))
                    }
                    disabled={!settings.notifications_enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Weekly Summary</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of your productivity
                    </p>
                  </div>
                  <Switch
                    checked={settings.weekly_summary}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, weekly_summary: checked }))
                    }
                    disabled={!settings.notifications_enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <Shield className="h-6 w-6 text-primary" />
                Data & Privacy
              </CardTitle>
              <CardDescription>
                Manage your data and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Export Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of all your data
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportData}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="space-y-0.5">
                    <Label className="font-medium text-destructive">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSaving}
              className="flex items-center gap-2"
              size="lg"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}