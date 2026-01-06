'use client';

import { useState, memo, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Chrome, CheckCircle, ArrowLeft, BrainCircuit } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm = memo(function AuthForm({ onSuccess }: AuthFormProps) {
  const { signIn, signUp, signInWithGoogle, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('signin');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  const validateForm = (isSignUp: boolean = false) => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.fullName.trim()) {
        errors.fullName = 'Full name is required';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear global error
    if (error) {
      clearError();
    }
  }, [formErrors, error, clearError]);

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(false)) return;

    const { error } = await signIn(formData.email, formData.password);
    
    if (!error && onSuccess) {
      onSuccess();
    }
  }, [formData.email, formData.password, validateForm, signIn, onSuccess]);

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;

    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    
    if (!error) {
      setSignupEmail(formData.email);
      setShowEmailConfirmation(true);
    }
  }, [formData.email, formData.password, formData.fullName, validateForm, signUp]);

  const handleGoogleSignIn = useCallback(async () => {
    const { error } = await signInWithGoogle();
    
    if (!error && onSuccess) {
      onSuccess();
    }
  }, [signInWithGoogle, onSuccess]);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: ''
    });
    setFormErrors({});
    clearError();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetForm();
  };

  const handleBackToSignIn = () => {
    setShowEmailConfirmation(false);
    setActiveTab('signin');
    resetForm();
  };

  // Show email confirmation screen after successful signup
  if (showEmailConfirmation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4 font-body">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <Card className="w-full max-w-md bg-[#0D0D0D]/80 backdrop-blur-xl border-white/[0.08] shadow-2xl relative z-10">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-lg shadow-primary/5">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Check Your Email</CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              We've sent a confirmation link to your email address
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="rounded-2xl bg-white/5 border border-white/[0.08] p-6 text-center shadow-inner">
              <Mail className="mx-auto mb-3 h-10 w-10 text-primary/50" />
              <p className="text-base font-medium text-white">{signupEmail}</p>
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="text-center leading-relaxed">
                Please check your email and click the confirmation link to activate your account.
              </p>
              
              <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/[0.05]">
                <p className="font-bold text-white uppercase tracking-wider text-[10px]">Next steps</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <span>Check your inbox for an email from KEPH</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <span>Click the confirmation link in the email</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <span>Return here to sign in to your account</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full rounded-full hover:bg-white/5 hover:text-primary transition-all duration-300 font-bold text-xs uppercase tracking-wider" 
              onClick={handleBackToSignIn}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 font-body relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      <Card className="w-full max-w-md bg-[#0D0D0D]/80 backdrop-blur-xl border-white/[0.08] shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <CardHeader className="space-y-2 pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20 shadow-lg shadow-primary/5">
              <BrainCircuit className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-headline tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Welcome to KEPH
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground text-base">
            Your intelligent task management companion
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/[0.08] p-1 rounded-xl mb-6">
              <TabsTrigger 
                value="signin" 
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 font-bold text-xs uppercase tracking-wider"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 font-bold text-xs uppercase tracking-wider"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive" className="mt-4 bg-destructive/10 border-destructive/20 text-destructive-foreground animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}
            
            <TabsContent value="signin" className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-11 h-12 bg-white/5 border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 rounded-xl ${formErrors.email ? 'border-red-500/50' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="signin-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Password</Label>
                    <button type="button" className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors">Forgot?</button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-11 h-12 bg-white/5 border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 rounded-xl ${formErrors.password ? 'border-red-500/50' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {formErrors.password && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{formErrors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 font-bold text-xs uppercase tracking-widest" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`pl-11 h-12 bg-white/5 border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 rounded-xl ${formErrors.fullName ? 'border-red-500/50' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{formErrors.fullName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-11 h-12 bg-white/5 border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 rounded-xl ${formErrors.email ? 'border-red-500/50' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-11 h-12 bg-white/5 border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 rounded-xl ${formErrors.password ? 'border-red-500/50' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {formErrors.password && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{formErrors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`pl-11 h-12 bg-white/5 border-white/[0.08] focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 rounded-xl ${formErrors.confirmPassword ? 'border-red-500/50' : ''}`}
                      disabled={loading}
                    />
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{formErrors.confirmPassword}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 font-bold text-xs uppercase tracking-widest mt-2" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
                <span className="bg-[#0D0D0D] px-4 text-muted-foreground/50">Or continue with</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full h-12 mt-6 rounded-xl bg-white/5 border-white/[0.08] hover:bg-white/10 hover:border-primary/30 transition-all duration-300 font-bold text-xs uppercase tracking-widest group"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Chrome className="mr-3 h-5 w-5 group-hover:text-primary transition-colors" />
              Google Account
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="text-center text-xs text-muted-foreground/50 border-t border-white/[0.03] pt-6 pb-8 flex justify-center">
          {activeTab === 'signin' ? (
            <p className="font-medium tracking-wide">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('signup')}
                className="text-primary hover:text-primary/80 transition-colors font-bold uppercase tracking-wider ml-1"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="font-medium tracking-wide">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('signin')}
                className="text-primary hover:text-primary/80 transition-colors font-bold uppercase tracking-wider ml-1"
              >
                Sign in
              </button>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
});