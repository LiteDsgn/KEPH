import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FeatureCardProps } from '@/types';

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, image }) => (
  <Card className="bg-card/50 border-border/30 h-full flex flex-col">
    <div className="p-6 flex-grow flex flex-col">
      {Icon && (
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      )}
      <h3 className="text-xl sm:text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{description}</p>
    </div>
    {image && (
      <img src={image} alt={title} className="w-full h-[30vh] object-cover rounded-b-lg mt-auto" />
    )}
  </Card>
);