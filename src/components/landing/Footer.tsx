import React from 'react';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="py-24 relative overflow-hidden bg-[#0D0D0D]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center ring-1 ring-primary/20">
                <BrainCircuit className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">KEPH</span>
            </div>
            <p className="text-lg text-muted-foreground max-w-sm leading-relaxed mb-8">Transform your workflow with AI-powered task management. From thoughts to organized action in seconds.</p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors"><span className="sr-only">Twitter</span><svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg></Link>
              <Link href="#" className="hover:text-primary transition-colors"><span className="sr-only">GitHub</span><svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-4 text-base">
              <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">API Docs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-4 text-base">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Press Kit</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4 text-base">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground/60">&copy; 2024 KEPH AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs text-muted-foreground/60"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> System Status: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}