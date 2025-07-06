import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section id="cta" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-primary text-primary-foreground p-12 sm:p-16 rounded-2xl text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline mb-6">Ready to transform your productivity?</h2>
          <p className="text-xl sm:text-2xl text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">Join thousands of professionals who've revolutionized their workflow with AI-powered task management.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard"><Button size="lg" variant="secondary">Start your free trial</Button></Link>
            <Button size="lg" variant="outline">Talk to sales</Button>
          </div>
        </div>
      </div>
    </section>
  );
}