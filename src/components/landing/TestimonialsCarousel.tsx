'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';
import { testimonials } from '@/data/testimonials';

export const TestimonialsCarousel: React.FC = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <section id="social-proof" className="py-24 sm:py-32 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline mb-6">Trusted by productivity enthusiasts</h2>
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">See what our users are saying about KEPH.</p>
        </div>
        
        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="bg-card/50 border-border/30 h-full">
                      <CardContent className="pt-6 flex flex-col h-full">
                        <p className="mb-6 text-lg leading-relaxed flex-grow">"{testimonial.text}"</p>
                        <div className="mt-auto flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                            {testimonial.author.charAt(0)}
                          </div>
                          <div>
                            <div className="text-base font-semibold">{testimonial.author}</div>
                            <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Arrows */}
            <CarouselPrevious className="-left-12 lg:-left-16" />
            <CarouselNext className="-right-12 lg:-right-16" />
          </Carousel>
          
          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: count }, (_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index + 1 === current
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};