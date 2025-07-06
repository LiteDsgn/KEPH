import React from 'react';

export function InputCaptureSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline mb-6">Three ways to capture everything</h2>
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">Typing, speaking, or uploading — AI adapts</p>
        </div>
        <div className="space-y-24">
          {/* Row 1: Image Left, Text Right */}
          <div className="grid md:grid-cols-2 gap-16 md:gap-32 items-center">
            <div className="order-1">
              <img src="https://placehold.co/600x400/000000/FFFFFF/png" alt="Typing interface" className="w-full h-[48vh] md:h-[60vh] object-cover rounded-lg" />
            </div>
            <div className="px-4 sm:px-6 order-2">
              <h3 className="text-3xl sm:text-4xl font-bold mb-6">Text to Tasks</h3>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">Paste meeting notes, email content, or brainstorm ideas. Our AI extracts actionable items and creates structured tasks with intelligent categorization.</p>
            </div>
          </div>
          
          {/* Row 2: Text Left, Image Right */}
          <div className="grid md:grid-cols-2 gap-16 md:gap-32 items-center">
            <div className="order-2 md:order-1 px-4 sm:px-6">
              <h3 className="text-3xl sm:text-4xl font-bold mb-6">Voice to Tasks</h3>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">Speak naturally and watch your thoughts transform into organized to-dos. Perfect for capturing ideas on the go or during brainstorming sessions.</p>
            </div>
            <div className="order-1 md:order-2">
              <img src="https://placehold.co/600x400/000000/FFFFFF/png" alt="Voice input UI" className="w-full h-[48vh] md:h-[60vh] object-cover rounded-lg" />
            </div>
          </div>
          
          {/* Row 3: Image Left, Text Right */}
          <div className="grid md:grid-cols-2 gap-16 md:gap-32 items-center">
            <div className="order-1">
              <img src="https://placehold.co/600x400/000000/FFFFFF/png" alt="Transcript upload interface" className="w-full h-[48vh] md:h-[60vh] object-cover rounded-lg" />
            </div>
            <div className="px-4 sm:px-6 order-2">
              <h3 className="text-3xl sm:text-4xl font-bold mb-6">Transcript to Tasks</h3>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">Upload meeting recordings or transcripts and extract every action item automatically. Never miss a follow-up task again.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}