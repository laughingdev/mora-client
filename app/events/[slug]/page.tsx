import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import ProductPrice from "@/app/components/ProductPrice";
import ProductCard from "@/app/components/ProductCard";
import { getProductUrl } from "@/lib/urls";
import { ChevronRight, Calendar, Heart, Gift } from "lucide-react";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchEvent(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/events/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEvent(slug);

  if (!event) {
    return { title: 'Occasion Not Found | Mora Moments' };
  }

  const title = event.metaTitle || `${event.name} Gifts & Hampers | Mora Moments`;
  const description = event.metaDescription || event.description || `Celebrate ${event.name} with bespoke gift hampers, personalized surprises, and keepsakes.`;
  const imageUrl = event.bannerImage || event.image;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    }
  };
}

export default async function EventOccasionPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await fetchEvent(slug);

  if (!event) {
    return notFound();
  }

  const products = Array.isArray(event.products) ? event.products : [];
  const heroImage = event.bannerImage || event.image || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1600&q=80";

  return (
    <main className="flex-grow pb-24">
      {/* Event Hero Banner */}
      <section className="relative w-full min-h-[340px] md:min-h-[420px] bg-wine flex items-center justify-center overflow-hidden">
        <Image
          src={heroImage}
          alt={event.name}
          fill
          priority
          className="object-cover opacity-40 brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

        <div className="relative z-10 text-center text-white px-6 max-w-3xl py-16">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase text-[#fbe3d5] mb-5 border border-white/20">
            <Gift size={13} />
            <span>Curated For {event.name}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-5 leading-tight tracking-tight drop-shadow-sm">
            {event.name}
          </h1>

          {event.description && (
            <p className="text-base md:text-lg tracking-wide text-white/95 leading-relaxed font-light max-w-2xl mx-auto drop-shadow-sm">
              {event.description}
            </p>
          )}
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-6 md:px-12 mt-8">
        <nav className="flex items-center gap-2 text-xs text-muted mb-8 flex-wrap">
          <Link href="/" className="hover:text-wine transition-colors">Home</Link>
          <ChevronRight size={12} className="opacity-50" />
          <Link href="/events" className="hover:text-wine transition-colors">Occasions</Link>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-ink font-semibold">{event.name}</span>
        </nav>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-10 border-b border-line gap-4">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-ink">Gifts for {event.name}</h2>
            <p className="text-xs text-muted mt-1 uppercase tracking-wider">
              {products.length} {products.length === 1 ? 'Curated Gift' : 'Curated Gifts'} Available
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-cream border border-line text-wine hover:border-wine transition-colors"
            >
              <span>Build Custom Gift</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-24 bg-cream/30 border border-line/60 rounded-sm">
            <Gift size={40} className="text-wine/60 mx-auto mb-4" />
            <h3 className="font-serif text-2xl md:text-3xl text-ink mb-2">Gifts are being curated</h3>
            <p className="text-sm text-muted max-w-md mx-auto mb-8">
              We are handpicking bespoke gifts and hampers for {event.name}. In the meantime, browse our full collection or build a custom hamper.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="bg-wine text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 hover:bg-[#521b29] transition-colors shadow-sm"
              >
                Browse Shop
              </Link>
              <Link
                href="/builder"
                className="border-2 border-wine text-wine text-xs font-bold uppercase tracking-wider px-6 py-3.5 hover:bg-wine hover:text-white transition-colors"
              >
                Build A Gift
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                animate={false}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
