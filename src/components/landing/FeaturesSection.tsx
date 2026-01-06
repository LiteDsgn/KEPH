import React from 'react';
import { Zap, Shield, BarChart, Users2, BookOpen, CheckCircle } from 'lucide-react';
import { FeatureCard } from '@/components/landing/FeatureCard';

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 relative overflow-hidden bg-[#0D0D0D]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-full h-full max-w-4xl max-h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wider uppercase">Capabilities</div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-headline mb-6 tracking-tight">Everything you need to stay organized</h2>
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">KEPH combines powerful AI with intuitive design to create the ultimate productivity companion.</p>
        </div>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <FeatureCard icon={Zap} title="AI-Powered Intelligence" description="Understands context, extracts intent, and creates meaningful task structures." image="https://placehold.co/600x400/000000/FFFFFF/png" />
            </div>
            <div className="md:col-span-2">
              <FeatureCard icon={CheckCircle} title="Smart Organization" description="Features auto-categorization, priority detection, and intelligent due date suggestions." image="https://placehold.co/600x400/000000/FFFFFF/png" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <FeatureCard icon={BarChart} title="Progress Analytics" description="Get daily summaries, track completion rates, and gain insights on your work patterns." image="https://placehold.co/600x400/000000/FFFFFF/png" />
            </div>
            <div className="md:col-span-3">
              <FeatureCard icon={Users2} title="Team Collaboration" description="Share tasks, collaborate on projects, and keep everyone aligned with real-time updates." image="https://placehold.co/600x400/000000/FFFFFF/png" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <FeatureCard icon={Shield} title="Secure & Private" description="With end-to-end encryption and enterprise-grade security, your data is always private." image="https://placehold.co/600x400/000000/FFFFFF/png" />
            </div>
            <div className="md:col-span-2">
              <FeatureCard icon={BookOpen} title="Timeline View" description="View tasks chronologically with smart date grouping and visual progress tracking." image="https://placehold.co/600x400/000000/FFFFFF/png" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}