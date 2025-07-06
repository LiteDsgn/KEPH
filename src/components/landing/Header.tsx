import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/30">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-primary tracking-tight">KEPH</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-base font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">Use Cases</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/dashboard"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/dashboard"><Button size="sm">Get KEPH free</Button></Link>
          </div>
        </div>
      </div>
    </header>
  );
};