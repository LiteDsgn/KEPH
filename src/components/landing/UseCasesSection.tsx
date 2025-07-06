import React from 'react';
import { Users, Mic, FileText, Bot, MessageSquare, HelpCircle, Mail, Slack } from 'lucide-react';
import { FeatureCard } from '@/components/landing/FeatureCard';

export function UseCasesSection() {
  return (
    <section id="use-cases" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Two-Column Intro Block */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center mb-16 lg:mb-32">
          {/* Left Column: Icon Grid */}
          <div className="text-muted-foreground overflow-hidden">
            {/* Mobile: Marquee */}
            <div className="pb-6 md:hidden">
              <div className="py-8 flex animate-marquee space-x-8">
                <Slack className="h-8 w-8 flex-shrink-0" />
                <MessageSquare className="h-8 w-8 flex-shrink-0" />
                <Users className="h-8 w-8 flex-shrink-0" />
                <HelpCircle className="h-8 w-8 flex-shrink-0" />
                <Mail className="h-8 w-8 flex-shrink-0" />
                <Mic className="h-8 w-8 flex-shrink-0" />
                <FileText className="h-8 w-8 flex-shrink-0" />
                <Bot className="h-8 w-8 flex-shrink-0" />
                {/* Duplicate for seamless loop */}
                <Slack className="h-8 w-8 flex-shrink-0" />
                <MessageSquare className="h-8 w-8 flex-shrink-0" />
                <Users className="h-8 w-8 flex-shrink-0" />
                <HelpCircle className="h-8 w-8 flex-shrink-0" />
                <Mail className="h-8 w-8 flex-shrink-0" />
                <Mic className="h-8 w-8 flex-shrink-0" />
                <FileText className="h-8 w-8 flex-shrink-0" />
                <Bot className="h-8 w-8 flex-shrink-0" />
              </div>
            </div>
            {/* Desktop: Grid */}
            <div className="hidden md:grid grid-cols-4 gap-4">
              <div className="py-6">
                <Slack className="h-8 w-8 mx-auto" />
              </div>
              <div className="py-6">
                <MessageSquare className="h-8 w-8 mx-auto" />
              </div>
              <div className="py-6">
                <Users className="h-8 w-8 mx-auto" />
              </div>
              <div className="py-6">
                <HelpCircle className="h-8 w-8 mx-auto" />
              </div>
              <div className="py-6">
                <Mail className="h-8 w-8 mx-auto" />
              </div>
              <div className="py-6">
                <Mic className="h-8 w-8 mx-auto" />
              </div>
              <div className="py-6">
                <FileText className="h-8 w-8 mx-auto" />
              </div>
              <div className="py-6">
                <Bot className="h-8 w-8 mx-auto" />
              </div>
            </div>
          </div>
          {/* Right Column: Headline and Description */}
          <div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline mb-6">Built for how you work</h2>
            <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">Whether you're a busy professional, creative, or team leader, KEPH adapts to your workflow.</p>
          </div>
        </div>
        {/* Three-Column Use Cases Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard image="https://placehold.co/600x400/000000/FFFFFF/png" title="Creative Professionals" description="Capture inspiration and turn briefs into project plans." />
          <FeatureCard image="https://placehold.co/600x400/000000/FFFFFF/png" title="Business Leaders" description="Transform meeting discussions into action items and track strategic initiatives." />
          <FeatureCard image="https://placehold.co/600x400/000000/FFFFFF/png" title="Remote Teams" description="Stay synchronized across time zones, with task lists and automated tracking." />
        </div>
      </div>
    </section>
  );
}