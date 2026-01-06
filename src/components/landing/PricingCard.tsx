import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { PricingCardProps } from '@/types';

export const PricingCard: React.FC<PricingCardProps> = ({ plan, price, description, features, popular = false, cta }) => (
  <Card className={`flex flex-col relative transition-all duration-300 hover:translate-y-[-4px] ${
    popular 
      ? 'bg-primary/5 border-primary/40 shadow-2xl shadow-primary/10 ring-1 ring-primary/20' 
      : 'bg-white/[0.03] border-white/[0.08] backdrop-blur-sm'
  }`}>
    {popular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-widest shadow-lg">
        Most Popular
      </div>
    )}
    <CardHeader className="pb-4 pt-8">
      <CardTitle className="text-2xl font-bold font-headline">{plan}</CardTitle>
      <CardDescription className="text-muted-foreground/70">{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-5xl font-extrabold tracking-tight">{price}</span>
        {price !== 'Custom' && <span className="text-muted-foreground">/mo</span>}
      </div>
      <ul className="space-y-4">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground/90 leading-tight">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <div className="p-6 pt-0 mt-4">
      <Link href="/auth" className="w-full">
        <Button className="w-full h-12 text-base font-bold" variant={popular ? 'default' : 'outline'}>{cta}</Button>
      </Link>
    </div>
  </Card>
);