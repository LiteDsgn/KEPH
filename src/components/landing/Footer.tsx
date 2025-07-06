import React from 'react';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="py-16 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <BrainCircuit className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold font-headline text-primary tracking-tight">KEPH</span>
            </div>
            <p className="text-base text-muted-foreground max-w-sm leading-relaxed">Transform your workflow with AI-powered task management. From thoughts to organized action in seconds.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Product</h4>
            <ul className="space-y-3 text-base">
              <li><Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Integrations</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">API</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3 text-base">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Press</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-3 text-base">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground">
          <p className="text-base">&copy; 2024 KEPH. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}