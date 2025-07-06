import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, PlayCircle } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 text-center">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-primary/10 text-primary text-sm font-bold px-4 py-2 rounded-full mb-6">Powered by Google Gemini AI</div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold font-headline tracking-tighter mb-8 leading-tight">Your productivity, amplified by AI</h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">Transform conversations, meetings, and thoughts into organized tasks instantly. KEPH understands context and creates actionable to-dos from any input.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard"><Button size="lg">Get started for free <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <Button variant="outline" size="lg">Watch demo</Button>
          </div>
          <div className="mt-10 flex justify-center items-center gap-x-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>Free forever</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>No credit card</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /><span>Cancel anytime</span></div>
          </div>
        </div>
        <div className="mt-16 max-w-5xl mx-auto">
            <div className="aspect-video bg-muted/50 rounded-2xl border border-border/20 shadow-lg flex items-center justify-center relative overflow-hidden">
                <img src="https://placehold.co/1280x720/000000/FFFFFF/png" alt="Product demo video" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <PlayCircle className="w-20 h-20 text-white/70 hover:text-white transition-colors cursor-pointer" />
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};