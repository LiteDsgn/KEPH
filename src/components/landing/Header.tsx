import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 transition-all duration-300 pointer-events-none">
      <div 
        className={`
          container mx-auto px-4 sm:px-6 py-2 transition-all duration-300 pointer-events-auto mt-0 max-w-7xl
          ${isScrolled 
            ? 'bg-[#0D0D0D]/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]' 
            : 'bg-transparent border-b border-transparent'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className={`
              bg-primary/10 rounded-xl flex items-center justify-center ring-1 ring-primary/20 
              group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/5
              ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'}
            `}>
              <BrainCircuit className={`${isScrolled ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
            </div>
            <span className={`
              font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight transition-all duration-300
              ${isScrolled ? 'text-xl' : 'text-2xl'}
            `}>
              KEPH
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="#features" 
              className="text-xs font-bold tracking-wider uppercase text-muted-foreground/70 hover:text-primary transition-all duration-300"
            >
              Features
            </Link>
            <Link 
              href="#pricing" 
              className="text-xs font-bold tracking-wider uppercase text-muted-foreground/70 hover:text-primary transition-all duration-300"
            >
              Pricing
            </Link>
            <Link 
              href="#social-proof" 
              className="text-xs font-bold tracking-wider uppercase text-muted-foreground/70 hover:text-primary transition-all duration-300"
            >
              Love
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button 
                variant="ghost" 
                className={`text-xs font-bold hover:text-primary transition-all duration-300 ${isScrolled ? 'h-8 px-3' : 'h-10 px-4'}`}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button 
                className={`
                  text-xs font-bold shadow-lg shadow-primary/20 transition-all duration-300 bg-primary hover:bg-primary/90 rounded-full 
                  ${isScrolled ? 'h-8 px-4' : 'h-10 px-6'}
                `}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};