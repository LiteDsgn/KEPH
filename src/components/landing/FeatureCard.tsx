import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FeatureCardProps } from '@/types';

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, image }) => (
  <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-sm h-full flex flex-col group hover:bg-white/[0.05] transition-all duration-500 overflow-hidden">
    <div className="p-8 flex-grow flex flex-col relative z-10">
      {Icon && (
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 mb-6 group-hover:scale-110 transition-transform duration-500 ring-1 ring-primary/20 shadow-lg shadow-primary/5">
          <Icon className="h-7 w-7 text-primary" />
        </div>
      )}
      <h3 className="text-2xl font-bold mb-4 font-headline tracking-tight group-hover:text-primary transition-colors duration-300">{title}</h3>
      <p className="text-muted-foreground/80 text-lg leading-relaxed">{description}</p>
    </div>
    {image && (
      <div className="relative mt-auto pt-4 px-6 pb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60 z-10" />
        <img 
          src={image} 
          alt={title} 
          className="w-full h-48 object-cover rounded-xl border border-white/5 shadow-2xl group-hover:scale-[1.02] transition-transform duration-700" 
        />
      </div>
    )}
  </Card>
);