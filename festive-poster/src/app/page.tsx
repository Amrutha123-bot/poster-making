import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export const revalidate = 0;

export default async function LandingPage() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (e) {
    console.error('Landing page auth check failed:', e);
  }

  return (
    <main className="min-h-screen w-full flex flex-col justify-between animated-gradient relative overflow-hidden text-text-primary">
      {/* Decorative Floating background particles */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-accent-purple/30 particle" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-accent-gold/20 particle" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-accent-pink/30 particle" style={{ animationDelay: '4s' }}></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-10">
        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-accent-gold to-accent-amber bg-clip-text text-transparent font-display">
          FestivePoster
        </span>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button variant="secondary" className="px-5 py-2">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 transition-colors">
                Sign In
              </Link>
              <Link href="/signup">
                <Button variant="primary" className="px-5 py-2 text-xs">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Body */}
      <section className="flex-1 max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center gap-6 z-10 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-border-subtle rounded-full text-xs font-medium text-accent-gold mb-2 backdrop-blur-md">
          <span className="flex h-1.5 w-1.5 rounded-full bg-accent-gold animate-pulse"></span>
          Fully Automate Festive Marketing
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold font-display leading-[1.1] max-w-3xl tracking-tight">
          Create Stunning Branded{' '}
          <span className="bg-gradient-to-r from-accent-gold via-accent-amber to-accent-pink bg-clip-text text-transparent">
            Festival Posters
          </span>{' '}
          In Seconds
        </h1>

        <p className="text-text-secondary text-base sm:text-xl max-w-2xl leading-relaxed">
          Upload your company branding once. Generate beautifully typeset greetings for Diwali, Christmas, Holi, Eid, and New Year with your logo, tagline, and contact info. No AI text hallucinations, completely free-stack.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          {user ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto px-8 py-3 text-base">
                Open Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto px-8 py-3 text-base">
                  Get Started for Free
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto px-8 py-3 text-base">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full max-w-4xl text-left">
          {[
            {
              title: 'Zero Hallucinations',
              desc: 'Our deterministic layout engine keeps your branding block clean, pixel-perfect, and exactly where it should be.',
              color: 'border-accent-purple/20 bg-accent-purple/5'
            },
            {
              title: 'Custom Brand Profiles',
              desc: 'Configure logo, taglines, website, and custom brand colors once. Reuse across all layouts seamlessly.',
              color: 'border-accent-gold/20 bg-accent-gold/5'
            },
            {
              title: 'Multi-Size Export',
              desc: 'Export posters optimized for Instagram Feed (Square), Stories (Portrait), or LinkedIn (Landscape) with one click.',
              color: 'border-accent-pink/20 bg-accent-pink/5'
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${feature.color}`}
            >
              <h3 className="text-base font-bold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-border-subtle/50 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted z-10 gap-2">
        <p>&copy; {new Date().getFullYear()} FestivePoster. All rights reserved.</p>
        <p>Built with Next.js, Supabase & Konva.js</p>
      </footer>
    </main>
  );
}
