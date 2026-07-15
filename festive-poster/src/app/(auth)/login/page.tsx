'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      router.refresh();
      router.push('/dashboard');
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
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-text-secondary text-xs md:text-sm mb-6">
            Log in to manage your company profile and generate posters.
          </p>

          {error && (
            <div className="mb-4 p-3.5 bg-red-900/30 border border-red-500/40 text-red-200 text-xs md:text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <div className="flex flex-col gap-1.5">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-accent-purple hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs md:text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent-gold font-medium hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
