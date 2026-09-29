"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface CrawlerItem {
  id: string;
  title?: string | null;
  image: string;
  link: string;
  sortOrder?: number;
  active?: boolean;
}

interface HeroCrawlerProps {
  initialItems?: CrawlerItem[];
}

export default function HeroCrawler({ initialItems = [] }: HeroCrawlerProps) {
  const [items, setItems] = useState<CrawlerItem[]>(initialItems);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLAnchorElement>(null);

  const [stepWidth, setStepWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Fetch items if not supplied in initialItems
  useEffect(() => {
    if (initialItems.length === 0) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      fetch(`${apiBase}/crawler-items`)
        .then((res) => (res.ok ? res.json() : { data: [] }))
        .then((json) => {
          if (Array.isArray(json.data) && json.data.length > 0) {
            setItems(json.data);
          }
        })
        .catch(() => { });
    }
  }, [initialItems]);

  // Ensure we have a comfortable base of items to loop
  const baseItems = items.length > 0 ? items : [];
  let repeatedBase = [...baseItems];
  while (repeatedBase.length > 0 && repeatedBase.length < 4) {
    repeatedBase = [...repeatedBase, ...baseItems];
  }

  const N = repeatedBase.length;
  // Duplicate 4 times to give infinite buffer in both directions
  const displayItems = [...repeatedBase, ...repeatedBase, ...repeatedBase, ...repeatedBase];

  // Start in the second set (index N)
  const [currentIndex, setCurrentIndex] = useState(N > 0 ? N : 0);

  // Synchronize start index if N changes
  useEffect(() => {
    if (N > 0) {
      setCurrentIndex(N);
    }
  }, [N]);

  // Measure exact step width (card width + gap)
  const measureStep = useCallback(() => {
    if (firstCardRef.current && trackRef.current) {
      const cardRect = firstCardRef.current.getBoundingClientRect();
      const style = window.getComputedStyle(trackRef.current);
      const gap = parseFloat(style.gap) || (window.innerWidth >= 768 ? 20 : 16);
      if (cardRect.width > 0) {
        setStepWidth(cardRect.width + gap);
      }
    }
  }, []);

  useEffect(() => {
    measureStep();
    const handleResize = () => measureStep();
    window.addEventListener("resize", handleResize);

    // ResizeObserver for dynamic layout changes
    let observer: ResizeObserver | null = null;
    if (containerRef.current) {
      observer = new ResizeObserver(() => measureStep());
      observer.observe(containerRef.current);
    }

    // Safety timeout after initial paint
    const t = setTimeout(measureStep, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
      clearTimeout(t);
    };
  }, [measureStep, items]);

  const nextStep = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  const goToIndex = (targetIdx: number) => {
    if (N === 0) return;
    setIsTransitioning(true);
    const currentBase = Math.floor(currentIndex / N) * N;
    setCurrentIndex(currentBase + (targetIdx % N));
  };

  // Seamless infinite wrap-around on transition end
  const handleTransitionEnd = () => {
    if (N === 0) return;
    if (currentIndex >= N * 2) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev - N);
    } else if (currentIndex < N) {
      setIsTransitioning(false);
      setCurrentIndex((prev) => prev + N);
    }
  };

  // Autoplay step timer (advances 1 step every 4s, pauses on hover)
  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const timer = setInterval(() => {
      nextStep();
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, items.length, nextStep]);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextStep();
    } else if (diff < -45) {
      prevStep();
    }
    touchStartX.current = null;
  };

  if (!items || items.length === 0) {
    return null;
  }

  const activeDotIndex = items.length > 0 ? (currentIndex % items.length) : 0;

  return (
    <section className="relative w-full bg-[#fbf8f5] border-y border-line/60 py-7 overflow-hidden select-none">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-wine animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
              Curated Gift Highlights
            </span>
          </div>

          {/* Step Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              aria-label="Previous card"
              className="w-8 h-8 rounded-full border border-line bg-white/95 hover:bg-wine hover:text-white hover:border-wine flex items-center justify-center text-ink transition-colors shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextStep}
              aria-label="Next card"
              className="w-8 h-8 rounded-full border border-line bg-white/95 hover:bg-wine hover:text-white hover:border-wine flex items-center justify-center text-ink transition-colors shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Viewport Window:
            - Desktop: 2 cards + 1 half card (2.5 cards visible)
            - Mobile: exactly 1 card visible
        */}
        <div
          ref={containerRef}
          className="relative overflow-hidden w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            className="flex gap-4 md:gap-5"
            style={{
              transform: `translateX(-${currentIndex * stepWidth}px)`,
              transition: isTransitioning
                ? "transform 550ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            }}
          >
            {displayItems.map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href={item.link || "/shop"}
                draggable={false}
                ref={idx === 0 ? firstCardRef : null}
                className="group relative flex-none w-full md:w-[calc((100%-40px)/2.5)] h-[220px] sm:h-[245px] md:h-[270px] rounded-2xl overflow-hidden bg-cream border border-line/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Card Background Image */}
                <Image
                  src={item.image}
                  alt={item.title || "Curated Moment"}
                  fill
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient Scrim for Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-10">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] uppercase tracking-widest text-[#f8d7c4] font-semibold block mb-1">
                        Featured
                      </span>
                      <span className="font-serif text-lg sm:text-xl font-medium leading-snug tracking-wide text-white group-hover:text-[#f8d7c4] transition-colors truncate block drop-shadow-sm">
                        {item.title || "Explore Collection"}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-wine group-hover:rotate-45 transition-all duration-300 shrink-0 border border-white/20">
                      <ArrowUpRight size={15} className="text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Step Indicator Dots */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {items.map((_, dotIdx) => {
              const isActive = activeDotIndex === dotIdx;
              return (
                <button
                  key={dotIdx}
                  onClick={() => goToIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${isActive ? "w-6 bg-wine" : "w-1.5 bg-line hover:bg-muted"
                    }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
