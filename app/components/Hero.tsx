"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] lg:min-h-[640px] flex items-center overflow-hidden bg-ivory py-12 md:py-16">
      {/* Background with subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/80 to-transparent z-10 w-full lg:w-3/5 pointer-events-none" />

      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-[85%_center] lg:bg-center"
        style={{ backgroundImage: 'url("/hero-gift.png")' }}
      />

      <div className="container mx-auto px-6 md:px-12 relative z-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-8">

        {/* Left Content */}
        <div className="w-full lg:w-1/2 pt-4 lg:pt-0 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-wine text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-wine block"></span>
              Thoughtfully made • Beautifully remembered
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[1.08] tracking-tight mb-5 text-ink">
              More than gifts,<br />
              <em className="text-wine font-medium not-italic">we create memories.</em>
            </h1>

            <p className="text-ink font-semibold text-base md:text-lg leading-relaxed max-w-md mb-8 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              Discover curated gift hampers and personalized surprises designed to make every special moment unforgettable.
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link
                href="/shop"
                className="group relative inline-flex items-center gap-3 bg-wine text-white px-7 py-3.5 font-bold text-sm tracking-wide overflow-hidden shadow-md hover:shadow-lg transition-all rounded-2xl"
              >
                <div className="absolute inset-0 w-full h-full bg-[#4f1d2a] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Shop gifts</span>
                <ArrowUpRight className="relative z-10 w-4 h-4 group-hover:rotate-45 transition-transform duration-300" strokeWidth={2.5} />
              </Link>

              <Link
                href="/builder"
                className="group inline-flex items-center gap-2.5 bg-white/90 backdrop-blur-sm border-2 border-wine text-wine hover:bg-wine hover:text-white px-7 py-3.5 font-bold text-sm tracking-wide transition-all duration-300 shadow-sm hover:shadow-md rounded-2xl"
              >
                <span>Build your own gift</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted font-medium mt-10">
              <span className="flex items-center gap-2">
                <span className="text-gold text-lg">✦</span> Loved by thoughtful people
              </span>
              <span className="flex items-center gap-2">
                <span className="text-gold text-lg">✦</span> Personalization available
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
