import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Gift, DollarSign, Award, ExternalLink, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Affiliate & Creator Program | Mora Moments",
  description: "Join the Mora Moments Affiliate & Creator Program. Share luxury handcrafted gift hampers with your audience and earn handsome commissions.",
};

// Default Google Form link for Mora Moments Affiliate application
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfuNkL7n0w8j21S3_mBd1RHTJBvzIJWWSLkaJ2j2RkpY0FLZQ/viewform";
const DIRECT_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfuNkL7n0w8j21S3_mBd1RHTJBvzIJWWSLkaJ2j2RkpY0FLZQ/viewform";

export default function AffiliateProgramPage() {
  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream/90 via-cream/50 to-ivory border-b border-line pt-12 pb-16 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted mb-6">
            <Link href="/" className="hover:text-wine transition-colors">Home</Link>
            <ChevronRight size={12} className="text-  muted/60" />
            <span className="text-wine font-semibold">Affiliate Program</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-line text-wine text-xs font-semibold tracking-wider uppercase mb-4 shadow-xs">
              <Sparkles size={14} className="text-gold" />
              <span>Partner With Mora Moments</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-wine font-normal tracking-tight mb-4">
              Join Our Affiliate & Creator Network
            </h1>
            <p className="text-ink/80 text-sm md:text-base leading-relaxed font-light">
              Share the art of thoughtful gifting with your audience. Earn attractive commissions, get early access to artisanal collections, and collaborate with India’s leading luxury gift studio.
            </p>
          </div>
        </div>
      </section>

      {/* Program Benefits Grid */}
      <section className="container mx-auto max-w-5xl px-6 md:px-12 py-12">
        {/* Embedded Google Form Section */}
        <div className="bg-white border border-line rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="bg-wine text-white p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-white mb-1">Affiliate Application Form</h2>
              <p className="text-xs text-white/80">Fill out the short form below to apply. Our partnerships team will review within 24 hours.</p>
            </div>
            <a
              href={DIRECT_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white text-wine font-semibold px-4 py-2.5 rounded-md text-xs tracking-wider uppercase hover:bg-cream transition-colors shrink-0 shadow-xs"
            >
              <span>Open in New Tab</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Form Frame */}
          <div className="p-2 md:p-6 bg-[#faf6f2]">
            <div className="w-full bg-white rounded-xl border border-line shadow-xs">
              <iframe
                src={GOOGLE_FORM_URL}
                width="100%"
                height="1650"
                scrolling="no"
                style={{ width: "100%", height: "1650px", border: 0 }}
                className="w-full border-none"
                title="Mora Moments Affiliate Application Form"
              >
                Loading affiliate application form...
              </iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
