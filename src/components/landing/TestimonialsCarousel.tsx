'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';
import { Quote } from 'lucide-react';
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
    <section id="social-proof" className="py-24 sm:py-32 relative overflow-hidden bg-[#0D0D0D]">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl max-h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wider uppercase">Wall of Love</div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-headline mb-6 tracking-tight">Trusted by the world's most productive people</h2>
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">Join thousands of professionals who have reclaimed their time with KEPH.</p>
        </div>
        
        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                  <div className="h-full">
                    <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-sm h-full hover:bg-white/[0.05] transition-all duration-300 group">
                      <CardContent className="p-8 flex flex-col h-full relative">
                        <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-8 group-hover:text-primary/40 transition-colors duration-300" />
                        
                        <div className="mb-8 flex-grow">
                          <p className="text-xl font-medium leading-relaxed font-headline text-foreground/90 italic">
                            "{testimonial.text}"
                          </p>
                        </div>
                        
                        <div className="mt-auto flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl shadow-inner">
                            {testimonial.author.charAt(0)}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-foreground">{testimonial.author}</div>
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{testimonial.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Arrows - Hidden on mobile, styled for desktop */}
            <div className="hidden lg:block">
              <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white w-12 h-12" />
              <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white w-12 h-12" />
            </div>
          </Carousel>
          
          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-3 mt-12">
            {Array.from({ length: count }, (_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index + 1 === current
                    ? "bg-primary w-10 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                    : "bg-white/10 hover:bg-white/20 w-4"
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