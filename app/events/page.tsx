"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import LogoLoop from "@/components/LogoLoop";

// Event images data
const heroItems = [
  {
    image: '/events/equniox.png',
    caption: 'Equinox'
  },
  {
    image: '/events/hustle mania.png',
    caption: 'Hustle Mania'
  },
  {
    image: '/events/wc 2.0.png',
    caption: 'Welcome 2.0'
  },
  {
    image: '/events/metaloop.png',
    caption: 'Metaloop'
  },
  {
    image: '/events/B2B.png',
    caption: 'B2B'
  }
];

const liveEvents = [
  { image: '/events/equniox.png', title: 'Equinox' },
  { image: '/events/hustle mania.png', title: 'Hustle Mania' },
  { image: '/events/wc 2.0.png', title: 'Welcome 2.0' },
  { image: '/events/metaloop.png', title: 'Metaloop' },
  { image: '/events/B2B.png', title: 'B2B' },
  { image: '/events/gi.png', title: 'GI' },
  { image: '/events/wc.png', title: 'Welcome' },
  { image: '/events/welcome-gate.jpg', title: 'Welcome Gate' },
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
        <div className="w-[55%] h-[480px] flex-shrink-0 transition-all duration-700 group">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50 relative transition-transform duration-300 group-hover:scale-110 group-hover:z-50">
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
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#121212] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        {/* Logo */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          title="Go back"
          className="w-12 h-10 rounded flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
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
function EventCard({ image, title }: { image?: string; title?: string }) {
  return (
    <div className="group relative aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-black/50 hover:z-50">
      {image ? (
        <>
          <img 
            src={image} 
            alt={title || 'Event'} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300">
              <h4 className="text-lg font-semibold text-white">{title}</h4>
            </div>
          )}
        </>
      ) : (
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
      )}
    </div>
  );
}

// Club logos data for LogoLoop
const clubLogos = [
  { src: '/clubs/apex', alt: 'APEX', title: 'APEX' },
  { src: '/clubs/areo', alt: 'AREO', title: 'AREO' },
  { src: '/clubs/came', alt: 'CAME', title: 'CAME' },
  { src: '/clubs/cie', alt: 'CIE', title: 'CIE' },
  { src: '/clubs/code', alt: 'CODE', title: 'CODE' },
  { src: '/clubs/EWB', alt: 'EWB', title: 'EWB' },
  { src: '/clubs/lit', alt: 'LIT', title: 'LIT' },
  { src: '/clubs/mun', alt: 'MUN', title: 'MUN' },
  { src: '/clubs/nss', alt: 'NSS', title: 'NSS' },
  { src: '/clubs/scope', alt: 'SCOPE', title: 'SCOPE' },
];

// Club Avatar Row Component with LogoLoop
function ClubAvatarRow() {
  return (
    <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
      <LogoLoop
        logos={clubLogos}
        speed={120}
        direction="left"
        logoHeight={80}
        gap={60}
        pauseOnHover
        scaleOnHover
        fadeOut
        fadeOutColor="#121212"
        ariaLabel="College clubs"
      />
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
            {liveEvents.map((event, i) => (
              <EventCard key={i} image={event.image} title={event.title} />
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
