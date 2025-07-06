import React from 'react';
import { FAQItemProps } from '@/types';

export const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => (
  <div className="border-b border-border/30 py-6">
    <h3 className="font-semibold text-xl sm:text-2xl mb-4">{question}</h3>
    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{answer}</p>
  </div>
);