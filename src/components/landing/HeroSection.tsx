import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, PlayCircle } from 'lucide-react';

export const HeroSection: React.FC = () => {
  useEffect(() => {
    const initUnicorn = () => {
      if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
        window.UnicornStudio.init();
        window.UnicornStudio.isInitialized = true;
      }
    };

    // Load UNICORN Studio script if not already loaded
    if (!window.UnicornStudio) {
      window.UnicornStudio = { 
        isInitialized: false,
        init: () => {}, // Placeholder until script loads
        destroy: () => {} // Placeholder
      };
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.27/dist/unicornStudio.umd.js';
      script.onload = initUnicorn;
      (document.head || document.body).appendChild(script);
    } else {
      initUnicorn();
    }

    return () => {
      if (window.UnicornStudio && window.UnicornStudio.isInitialized) {
        window.UnicornStudio.destroy();
        window.UnicornStudio.isInitialized = false;
      }
    };
  }, []);

  return (
    <section className="pt-24 sm:pt-32 pb-24 text-center relative overflow-hidden bg-[#0D0D0D]">
      {/* UNICORN Studio Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div 
          className="unicorn-container w-full h-full" 
          data-us-project="hnA0lhIwdVN0b3aI1EQ6"
        />
        {/* Progressive overlay to blend with next section */}
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent via-[#0D0D0D]/20 to-[#0D0D0D]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-primary/10 text-primary text-sm font-bold px-4 py-2 rounded-full mb-6 ring-1 ring-primary/20">Powered by Google Gemini AI</div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold font-headline tracking-tighter mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">Your productivity, amplified by AI</h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">Transform conversations, meetings, and thoughts into organized tasks instantly. KEPH understands context and creates actionable to-dos from any input.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth"><Button size="lg" className="h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20">Get started for free <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-white/10 hover:bg-white/5 backdrop-blur-sm">Watch demo</Button>
          </div>
          <div className="mt-12 flex justify-center items-center gap-x-8 text-sm text-muted-foreground/60 font-medium">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary/50" /><span>Free forever</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary/50" /><span>No credit card</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary/50" /><span>Cancel anytime</span></div>
          </div>
        </div>
        <div className="mt-20 max-w-5xl mx-auto group">
            <div className="aspect-video bg-white/[0.02] rounded-3xl border border-white/[0.08] shadow-[0_0_50px_-12px_rgba(var(--primary),0.2)] flex items-center justify-center relative overflow-hidden transition-all duration-700 hover:border-white/[0.15] hover:shadow-[0_0_70px_-12px_rgba(var(--primary),0.3)]">
                <img src="https://placehold.co/1280x720/000000/FFFFFF/png" alt="Product demo video" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all duration-500">
                    <div className="w-24 h-24 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 ring-4 ring-white/10">
                      <PlayCircle className="w-12 h-12 text-white fill-white" />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};