import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { PricingCardProps } from '@/types';

export const PricingCard: React.FC<PricingCardProps> = ({ plan, price, description, features, popular = false, cta }) => (
  <Card className={`flex flex-col ${popular ? 'border-primary shadow-2xl shadow-primary/10' : 'border-border/30'}`}>
    <CardHeader className="pb-4">
      {popular && <div className="text-xs uppercase font-bold text-primary tracking-widest">Most Popular</div>}
      <CardTitle className="text-2xl font-bold">{plan}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="text-4xl font-extrabold mb-6">{price}</div>
      <ul className="space-y-3">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <div className="p-6 pt-0">
      <Link href="/dashboard" className="w-full">
        <Button className="w-full" variant={popular ? 'default' : 'outline'}>{cta}</Button>
      </Link>
    </div>
  </Card>
);