import ShopClient from "../shop/ShopClient";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Gifts for Men & Curated Hampers for Him | Mora Moments",
  description: "Explore our distinguished collection of curated gift hampers, bespoke accessories, artisanal treats, and memorable keepsakes handcrafted for him.",
  alternates: {
    canonical: "https://moramoments.in/men",
  },
  openGraph: {
    title: "Gifts for Men & Curated Hampers for Him | Mora Moments",
    description: "Explore our distinguished collection of curated gift hampers, bespoke accessories, artisanal treats, and memorable keepsakes handcrafted for him.",
    url: "https://moramoments.in/men",
  }
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchMenProducts(searchParams: any) {
  try {
    const params = new URLSearchParams();
    
    // Always enforce gender=male for /men
    params.set('gender', 'male');

    // Process other search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'gender' && value !== undefined && value !== null && value !== '') {
        const val = Array.isArray(value) ? value[0] : value;
        params.append(key, String(val));
      }
    });

    if (params.has('order') && !params.has('sort')) {
      params.append('sort', 'price');
    }

    if (!params.has('limit')) params.append('limit', '24');

    const res = await fetch(`${API_BASE}/products?${params.toString()}`, { 
      next: { revalidate: 15 } 
    });
    
    if (!res.ok) return { products: [], meta: null };
    const json = await res.json();
    return {
      products: Array.isArray(json.data) ? json.data : [],
      meta: json.pagination || null
    };
  } catch (e) {
    return { products: [], meta: null };
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`, { 
      next: { revalidate: 60 } 
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

async function fetchEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`, { 
      next: { revalidate: 60 } 
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

export default async function MenPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;

  const [productData, categories, events] = await Promise.all([
    fetchMenProducts(resolvedParams),
    fetchCategories(),
    fetchEvents()
  ]);

  return (
    <main className="flex-grow pb-28 bg-[#fffdfa]">
      {/* Editorial Luxury Header Banner for Men */}
      <section className="relative w-full bg-gradient-to-b from-[#f3eee8] via-[#f7f2ed] to-[#fffdfa] border-b border-line/60 pt-10 pb-14 px-6 md:px-12 overflow-hidden">
        {/* Decorative ambient watermarks */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#4a3028]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-wine/5 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

        {/* Breadcrumb */}
        <div className="container mx-auto max-w-7xl mb-6 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-muted">
            <Link href="/" className="hover:text-wine transition-colors">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link href="/shop" className="hover:text-wine transition-colors">Shop</Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink font-semibold">For Him</span>
          </nav>
        </div>

        <div className="container mx-auto text-center relative z-10 max-w-3xl">
          <p className="text-wine text-[11px] font-bold tracking-[0.25em] uppercase mb-4 flex items-center justify-center gap-3">
            <span className="w-6 h-[1px] bg-wine/50 block"></span>
            <Sparkles size={13} className="text-gold" />
            Thoughtfully Curated For Him
            <span className="w-6 h-[1px] bg-wine/50 block"></span>
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-tight mb-4">
            Distinguished Gifts <em className="text-wine font-medium not-italic">for Him</em>
          </h1>

          <p className="text-muted text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-light">
            Celebrate the men who inspire you with artisanal leather, curated hampers, grooming essentials, and personalized keepsakes designed to impress.
          </p>
        </div>
      </section>

      {/* Main Interactive Shop Experience */}
      <div className="container mx-auto px-6 md:px-12 pt-8">
        <ShopClient 
          initialProducts={productData.products} 
          categories={categories} 
          events={events}
          meta={productData.meta}
          searchParams={{ ...resolvedParams, gender: 'male' }}
          lockedGender="male"
          pageTitle="Gifts for Him"
        />
      </div>
    </main>
  );
}
