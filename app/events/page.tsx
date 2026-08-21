"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// Placeholder data for carousel
const heroItems = [
  {
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop',
    caption: 'Tech Summit 2024'
  },
  {
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop',
    caption: 'Innovation Workshop'
  },
  {
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1600&auto=format&fit=crop',
    caption: 'Startup Pitch Day'
  },
  {
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1600&auto=format&fit=crop',
    caption: 'Hackathon 2024'
  },
  {
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
    caption: 'Design Thinking'
  }
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Hero Carousel Component - 3 Card Layout
function HeroCarousel({ items }: { items: typeof heroItems }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalCards = items.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Calculate indices for left, center, right
  const leftIndex = (currentIndex - 1 + totalCards) % totalCards;
  const centerIndex = currentIndex;
  const rightIndex = (currentIndex + 1) % totalCards;

  return (
    <div className="relative h-[500px] overflow-hidden">
      {/* Container with 3 visible cards */}
      <div className="relative h-full flex items-center justify-center gap-6 px-6">
        {/* Left Card - Half visible */}
        <div className="w-[20%] h-[350px] flex-shrink-0 opacity-60 scale-90 transition-all duration-700">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/10 overflow-hidden">
            {items[leftIndex]?.image && (
              <img 
                src={items[leftIndex].image} 
                alt={items[leftIndex].caption || ''}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Center Card - Large/Full size */}
        <div className="w-[55%] h-[480px] flex-shrink-0 transition-all duration-700">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50 relative">
            {items[centerIndex]?.image && (
              <img 
                src={items[centerIndex].image} 
                alt={items[centerIndex].caption || ''}
                className="w-full h-full object-cover"
              />
            )}
            {/* Caption overlay */}
            {items[centerIndex]?.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-2xl font-bold text-white">{items[centerIndex].caption}</h3>
              </div>
            )}
          </div>
        </div>

        {/* Right Card - Half visible */}
        <div className="w-[20%] h-[350px] flex-shrink-0 opacity-60 scale-90 transition-all duration-700">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/10 overflow-hidden">
            {items[rightIndex]?.image && (
              <img 
                src={items[rightIndex].image} 
                alt={items[rightIndex].caption || ''}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
        aria-label="Previous"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
        aria-label="Next"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Top Bar Component
function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#121212] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        {/* Logo */}
        <div className="w-12 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded" />

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search for events..."
              className="w-full h-11 pl-12 pr-4 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          {/* Notification Icon */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
              <svg
                className="w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a8 8 0 10-16 0v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"
                />
              </svg>
            </div>
            {/* Orange badge dot */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full border-2 border-[#121212]" />
          </div>

          {/* Profile Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700" />
        </div>
      </div>
    </div>
  );
}

// Event Card Component
function EventCard() {
  return (
    <div className="group relative aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/50">
      {/* Placeholder content */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-600">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
}

// Club Avatar Row Component
function ClubAvatarRow() {
  return (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-white/10 cursor-pointer hover:scale-110 transition-transform duration-200"
          />
        ))}
      </div>
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#121212] to-transparent pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#121212] to-transparent pointer-events-none" />
    </div>
  );
}

// ============================================================================
// MAIN EVENTS PAGE COMPONENT
// ============================================================================

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white font-poppins">
      {/* Top Bar */}
      <TopBar />

      {/* Spacer for fixed top bar */}
      <div className="h-20" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Carousel - 3 Card Layout */}
        <section className="py-12">
          <HeroCarousel items={heroItems} />
        </section>

        {/* Live Now Section */}
        <section className="py-12">
          <h2 className="text-3xl font-bold mb-8">Live Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCard key={i} />
            ))}
          </div>
        </section>

        {/* Browse by Club Section */}
        <section className="py-12 pb-20">
          <h2 className="text-3xl font-bold mb-8">Browse by club</h2>
          <ClubAvatarRow />
        </section>
      </div>
    </div>
  );
}
