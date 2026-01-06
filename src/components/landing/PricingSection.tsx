import React from 'react';
import { PricingCard } from '@/components/landing/PricingCard';

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden bg-[#0D0D0D]">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-full max-w-4xl max-h-[800px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wider uppercase">Pricing Plans</div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-headline mb-6 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">Start free and scale as you grow. No hidden fees, no surprises.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard plan="Free" price="$0" description="Perfect for getting started" features={['Up to 100 tasks per month', 'Basic AI features', 'Mobile app access', 'Email support']} cta="Get started" />
          <PricingCard plan="Pro" price="$12" description="For power users and small teams" features={['Unlimited tasks', 'Advanced AI features', 'Team collaboration (up to 10 users)', 'Priority support', 'Advanced analytics']} popular={true} cta="Start free trial" />
          <PricingCard plan="Enterprise" price="Custom" description="For large organizations" features={['Everything in Pro', 'Unlimited users', 'SSO & advanced security', 'Custom integrations', 'Dedicated support']} cta="Contact sales" />
        </div>
      </div>
    </section>
  );
}