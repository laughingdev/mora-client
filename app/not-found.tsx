"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Search, Home, ShoppingBag, Gift, Truck, HelpCircle, ArrowLeft } from "lucide-react";

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
    <div className="min-h-[85vh] bg-[#fffdfa] flex items-center justify-center py-16 px-6 md:px-12 relative overflow-hidden">
      {/* Decorative background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-wine/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#dfb18e]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="container mx-auto max-w-3xl text-center relative z-10">
        {/* Lottie Animation Container */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-6 flex items-center justify-center bg-cream/30 border border-line/60 rounded-3xl p-4 shadow-sm backdrop-blur-xs">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-wine text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full shadow-xs">
            404 Error
          </div>
          <DotLottieReact
            src="/Lurking_Cat.lottie"
            loop
            autoplay
            className="w-full h-full object-contain"
          />
        </div>

        {/* Headlines */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink font-normal mb-3 leading-tight">
          Curious Cat Got <em className="text-wine font-medium not-italic">Lost</em>
        </h1>
        <p className="text-muted text-sm sm:text-base font-light max-w-lg mx-auto mb-8 leading-relaxed">
          The page you are looking for might have been moved, renamed, or is taking a quick catnap in our gifting studio.
        </p>

        {/* Quick Search Box */}
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto mb-10 relative">
          <div className="flex items-center border border-line bg-white rounded-full p-1.5 shadow-xs focus-within:border-wine transition-all">
            <Search size={18} className="text-muted ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search gifts, hampers, or occasions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-sm outline-none text-ink placeholder:text-muted/60"
            />
            <button
              type="submit"
              className="bg-wine text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-wine/90 transition-colors shrink-0 shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-wine text-white text-xs sm:text-sm font-semibold uppercase tracking-wider px-6 py-3.5 rounded-full hover:bg-wine-dark transition-all shadow-sm transform hover:-translate-y-0.5"
          >
            <Home size={16} />
            <span>Return Home</span>
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-white text-ink border border-line text-xs sm:text-sm font-semibold uppercase tracking-wider px-6 py-3.5 rounded-full hover:text-wine hover:border-wine transition-all shadow-2xs transform hover:-translate-y-0.5"
          >
            <ShoppingBag size={16} />
            <span>Explore Shop</span>
          </Link>
        </div>

        {/* Quick Link Shortcuts */}
        <div className="pt-8 border-t border-line/60 max-w-xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest font-bold text-muted mb-4">Or try one of these popular destinations:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <Link
              href="/builder"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-line/80 hover:border-wine hover:text-wine transition-colors text-ink/80 shadow-2xs"
            >
              <Gift size={14} className="text-wine" />
              <span>Custom Gift Box</span>
            </Link>
            <Link
              href="/track-order"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-line/80 hover:border-wine hover:text-wine transition-colors text-ink/80 shadow-2xs"
            >
              <Truck size={14} className="text-wine" />
              <span>Track Order</span>
            </Link>
            <Link
              href="/contact-us"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-line/80 hover:border-wine hover:text-wine transition-colors text-ink/80 shadow-2xs col-span-2 sm:col-span-1"
            >
              <HelpCircle size={14} className="text-wine" />
              <span>Help & Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
