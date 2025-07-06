'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { InputCaptureSection } from '@/components/landing/InputCaptureSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { TestimonialsCarousel } from '@/components/landing/TestimonialsCarousel';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';



export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <HeroSection />

        <InputCaptureSection />

        <FeaturesSection />

        <UseCasesSection />

        <TestimonialsCarousel />

        <PricingSection />

        <FAQSection />

        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
