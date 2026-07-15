'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  className?: string;
}

export function Topbar({ className = '' }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  const pageTitle = () => {
    if (pathname.startsWith('/profile')) return 'Company Profile';
    if (pathname.startsWith('/occasions')) return 'Select Occasion';
    if (pathname.startsWith('/templates')) return 'Select Template';
    if (pathname.startsWith('/editor')) return 'Poster Editor';
    if (pathname.startsWith('/history')) return 'Poster History';
    return 'Dashboard';
  };

  if (!mounted) return null;

  return (
    <header
      className={`h-[var(--topbar-height)] border-b border-border-subtle bg-[#0F0A1E]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-base md:text-lg font-bold text-text-primary">{pageTitle()}</h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-border-subtle transition-all duration-150"
        >
          <div className="w-7 h-7 rounded-full bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-xs font-semibold text-accent-gold">
            {email ? email[0].toUpperCase() : 'U'}
          </div>
          <span className="text-sm font-medium text-text-secondary hidden sm:inline">{email}</span>
          <svg className="w-4 h-4 text-text-muted hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#140E24] border border-border-subtle py-1 shadow-xl z-20 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-border-subtle/50">
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Signed in as</p>
                <p className="text-xs text-text-primary font-medium truncate">{email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5"
              >
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="flex w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-[#0C071A] border-r border-border-subtle p-5 z-50 flex flex-col justify-between md:hidden animate-in slide-in-from-left duration-200">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-accent-gold to-accent-amber bg-clip-text text-transparent font-display">
                  FestivePoster
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-text-secondary hover:bg-white/5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {[
                  { name: 'Dashboard', href: '/dashboard' },
                  { name: 'Create Poster', href: '/occasions' },
                  { name: 'History', href: '/history' },
                  { name: 'Company Profile', href: '/profile' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      pathname.startsWith(item.href)
                        ? 'bg-accent-purple/10 text-accent-gold border border-accent-purple/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-border-subtle pt-4">
              <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300">
                Sign Out
              </Button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
