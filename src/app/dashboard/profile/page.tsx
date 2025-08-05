'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, User, Mail, Calendar, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data.',
          variant: 'destructive',
        });
        return;
      }

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to update profile.',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name || null,
        updated_at: new Date().toISOString(),
      } : null);

      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Profile not found.</p>
          <Button 
            onClick={() => router.push('/dashboard')} 
            className="mt-4"
          >
            Back to Dashboard
          </Button>
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
          {/* Profile Header */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/30 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-md">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url ?? profile.avatar_url ?? undefined} 
                    alt={profile.full_name || profile.email} 
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                    {getUserInitials(profile.full_name || undefined, profile.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-bold font-headline tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {profile.full_name || 'User'}
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    {profile.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Information */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <User className="h-6 w-6 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="full_name" className="font-medium">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-medium">Email Address</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-muted/50 border-border/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed from this page.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <Shield className="h-6 w-6 text-primary" />
                Account Details
              </CardTitle>
              <CardDescription>
                Information about your account and security.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">{profile.email}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Member Since</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(profile.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Updated</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(profile.updated_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}