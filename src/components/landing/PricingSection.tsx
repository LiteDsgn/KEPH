import React from 'react';
import { PricingCard } from '@/components/landing/PricingCard';

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline mb-6">Simple, transparent pricing</h2>
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">Start free and scale as you grow. No hidden fees, no surprises.</p>
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