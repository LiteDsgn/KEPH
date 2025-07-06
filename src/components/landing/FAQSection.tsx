import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQSection() {
  return (
    <section id="faq" className="py-24 sm:py-32 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-24 lg:gap-32 max-w-7xl mx-auto">
          {/* Left Column - Title and Subtitle (Sticky) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline mb-6">Frequently asked questions</h2>
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">Everything you need to know about KEPH.</p>
            </div>
          </div>
          
          {/* Right Column - FAQ Accordion */}
          <div className="lg:col-span-3">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b border-border/30">
                <AccordionTrigger className="text-xl sm:text-2xl font-semibold text-left hover:no-underline py-6">
                  How does KEPH's AI understand my tasks?
                </AccordionTrigger>
                <AccordionContent className="text-base sm:text-lg text-muted-foreground leading-relaxed pb-6">
                  KEPH uses Google's advanced Gemini AI to analyze context, identify action items, and understand intent. It can process natural language, recognize patterns, and extract meaningful tasks from any type of input.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border-b border-border/30">
                <AccordionTrigger className="text-xl sm:text-2xl font-semibold text-left hover:no-underline py-6">
                  Is my data secure and private?
                </AccordionTrigger>
                <AccordionContent className="text-base sm:text-lg text-muted-foreground leading-relaxed pb-6">
                  Absolutely. We use enterprise-grade encryption, secure cloud storage with Supabase, and never share your data with third parties. Your privacy is our top priority.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border-b border-border/30">
                <AccordionTrigger className="text-xl sm:text-2xl font-semibold text-left hover:no-underline py-6">
                  Can I use KEPH offline?
                </AccordionTrigger>
                <AccordionContent className="text-base sm:text-lg text-muted-foreground leading-relaxed pb-6">
                  While AI features require an internet connection, you can view and edit existing tasks offline. Changes sync automatically when you're back online.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border-b border-border/30">
                <AccordionTrigger className="text-xl sm:text-2xl font-semibold text-left hover:no-underline py-6">
                  How does team collaboration work?
                </AccordionTrigger>
                <AccordionContent className="text-base sm:text-lg text-muted-foreground leading-relaxed pb-6">
                  Share tasks and projects with team members, assign responsibilities, and track progress in real-time. Everyone stays updated with automatic notifications and sync.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}