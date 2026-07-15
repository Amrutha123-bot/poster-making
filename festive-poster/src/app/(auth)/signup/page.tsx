'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !companyName) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Sign up the user
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) {
        setError(signupError.message);
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        // Create initial placeholder company record
        const { error: companyError } = await supabase.from('companies').insert({
          user_id: authData.user.id,
          name: companyName,
          brand_colors: ['#8B5CF6', '#FFD700'], // Default brand colors
          social_links: {},
        });

        if (companyError) {
          console.error('Error creating default company:', companyError);
          // Don't fail the registration; we'll let them complete the profile in dashboard
        }
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err: unknown) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen w-full flex items-center justify-center animated-gradient relative overflow-hidden px-4">
      {/* Decorative Floating background particles */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-accent-purple/30 particle" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-accent-gold/20 particle" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-accent-pink/30 particle" style={{ animationDelay: '4s' }}></div>

      <div className="w-full max-w-md fade-in relative z-10">
        <div className="flex flex-col items-center mb-8">
          <span className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-accent-gold via-accent-amber to-accent-pink bg-clip-text text-transparent font-display">
            FestivePoster
          </span>
          <p className="text-text-secondary text-sm mt-2">
            Branded occasion greeting posters for your business
          </p>
        </div>

        <Card glow={true}>
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-950/40 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
                Verify your email
              </h1>
              <p className="text-text-secondary text-xs md:text-sm mb-6">
                We&apos;ve sent a verification link to <strong className="text-text-primary">{email}</strong>. Please check your inbox and confirm your email.
              </p>
              <Link href="/login" className="w-full">
                <Button className="w-full">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
                Create your account
              </h1>
              <p className="text-text-secondary text-xs md:text-sm mb-6">
                Fill details to sign up and configure your brand.
              </p>

              {error && (
                <div className="mb-4 p-3.5 bg-red-900/30 border border-red-500/40 text-red-200 text-xs md:text-sm rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <Input
                  label="Company Name"
                  type="text"
                  placeholder="e.g. Acme Studio"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  disabled={isLoading}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />

                <Button type="submit" variant="primary" isLoading={isLoading} className="w-full mt-2">
                  Create Account
                </Button>
              </form>

              <div className="mt-6 text-center text-xs md:text-sm text-text-secondary">
                Already have an account?{' '}
                <Link href="/login" className="text-accent-gold font-medium hover:underline">
                  Log In
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
