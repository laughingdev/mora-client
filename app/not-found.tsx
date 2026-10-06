"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Search, Home, ShoppingBag, Gift, Truck, HelpCircle, Sparkles, BookOpen } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-[88vh] bg-gradient-to-b from-[#fdfbf7] via-[#faf4ee] to-[#f7eee6] flex items-center justify-center py-20 px-6 md:px-12 relative overflow-hidden">
      {/* GIGANTIC 404 WATERMARK TEXT BEHIND LOTTIE ANIMATION */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[16rem] sm:text-[24rem] md:text-[32rem] font-black text-wine/10 leading-none select-none pointer-events-none tracking-tighter z-0"
        aria-hidden="true"
      >
        404
      </div>

      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-wine/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#dfb18e]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Foreground Container */}
      <div className="container mx-auto max-w-3xl text-center relative z-10">
        
        {/* Transparent Lottie Animation Container Overlaying the 404 watermark */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto mb-4 flex items-center justify-center bg-transparent">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-wine text-white text-[11px] font-bold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 z-20 pointer-events-auto">
            <Sparkles size={12} className="text-[#dfb18e]" />
            <span>Page Not Found</span>
          </div>

          <DotLottieReact
            src="/Lurking_Cat.lottie"
            loop
            autoplay
            className="w-full h-full object-contain pointer-events-auto"
          />
        </div>

        {/* Headline & Description */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink font-normal mb-3 leading-tight">
          Lost in the <em className="text-wine font-medium not-italic">Gift Studio</em>
        </h1>
        <p className="text-muted text-sm sm:text-base font-light max-w-lg mx-auto mb-8 leading-relaxed">
          Looks like our curious cat wandered off. The page you are looking for doesn't exist, was moved, or is taking a quick nap.
        </p>

        {/* Clean Interactive Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto mb-10">
          <div className="flex items-center border border-line bg-white/90 rounded-full p-1.5 shadow-sm focus-within:border-wine focus-within:ring-2 focus-within:ring-wine/20 transition-all">
            <Search size={18} className="text-muted ml-3.5 shrink-0" />
            <input
              type="text"
              placeholder="Search gifts, hampers, or occasions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm outline-none text-ink placeholder:text-muted/60"
            />
            <button
              type="submit"
              className="bg-wine text-white text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-wine-dark transition-colors shrink-0 shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-wine text-white text-xs sm:text-sm font-semibold uppercase tracking-wider px-7 py-3.5 rounded-full hover:bg-wine-dark transition-all shadow-md transform hover:-translate-y-0.5"
          >
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-white text-ink border border-line text-xs sm:text-sm font-semibold uppercase tracking-wider px-7 py-3.5 rounded-full hover:text-wine hover:border-wine transition-all shadow-xs transform hover:-translate-y-0.5"
          >
            <ShoppingBag size={16} />
            <span>Explore Collection</span>
          </Link>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="pt-8 border-t border-line/70 max-w-2xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest font-bold text-muted mb-4">Or discover these popular destinations:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Link
              href="/builder"
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white/80 border border-line/80 hover:border-wine hover:text-wine transition-all text-ink/80 shadow-2xs hover:shadow-xs"
            >
              <Gift size={15} className="text-wine shrink-0" />
              <span>Custom Gift Box</span>
            </Link>
            <Link
              href="/track-order"
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white/80 border border-line/80 hover:border-wine hover:text-wine transition-all text-ink/80 shadow-2xs hover:shadow-xs"
            >
              <Truck size={15} className="text-wine shrink-0" />
              <span>Track Order</span>
            </Link>
            <Link
              href="/blog"
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white/80 border border-line/80 hover:border-wine hover:text-wine transition-all text-ink/80 shadow-2xs hover:shadow-xs"
            >
              <BookOpen size={15} className="text-wine shrink-0" />
              <span>Gift Stories</span>
            </Link>
            <Link
              href="/contact-us"
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white/80 border border-line/80 hover:border-wine hover:text-wine transition-all text-ink/80 shadow-2xs hover:shadow-xs"
            >
              <HelpCircle size={15} className="text-wine shrink-0" />
              <span>Help & Support</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
