import ShopClient from "../shop/ShopClient";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Gifts for Women & Luxury Hampers for Her | Mora Moments",
  description: "Discover enchanting curated gift hampers, artisanal jewelry, fragrant botanical sets, and personalized keepsakes handcrafted for her.",
  alternates: {
    canonical: "https://moramoments.in/women",
  },
  openGraph: {
    title: "Gifts for Women & Luxury Hampers for Her | Mora Moments",
    description: "Discover enchanting curated gift hampers, artisanal jewelry, fragrant botanical sets, and personalized keepsakes handcrafted for her.",
    url: "https://moramoments.in/women",
  }
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchWomenProducts(searchParams: any) {
  try {
    const params = new URLSearchParams();
    
    // Always enforce gender=female for /women
    params.set('gender', 'female');

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

export default async function WomenPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;

  const [productData, categories, events] = await Promise.all([
    fetchWomenProducts(resolvedParams),
    fetchCategories(),
    fetchEvents()
  ]);

  return (
    <main className="flex-grow pb-28 bg-[#fffdfa]">
      {/* Editorial Luxury Header Banner for Women */}
      <section className="relative w-full bg-gradient-to-b from-[#faf0ea] via-[#fbf3ee] to-[#fffdfa] border-b border-line/60 pt-10 pb-14 px-6 md:px-12 overflow-hidden">
        {/* Decorative ambient watermarks */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-wine/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-[#e5a987]/10 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

        {/* Breadcrumb */}
        <div className="container mx-auto max-w-7xl mb-6 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-muted">
            <Link href="/" className="hover:text-wine transition-colors">Home</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link href="/shop" className="hover:text-wine transition-colors">Shop</Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink font-semibold">For Her</span>
          </nav>
        </div>

        <div className="container mx-auto text-center relative z-10 max-w-3xl">
          <p className="text-wine text-[11px] font-bold tracking-[0.25em] uppercase mb-4 flex items-center justify-center gap-3">
            <span className="w-6 h-[1px] bg-wine/50 block"></span>
            <Sparkles size={13} className="text-gold" />
            Exquisitely Curated For Her
            <span className="w-6 h-[1px] bg-wine/50 block"></span>
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-tight mb-4">
            Treasures of Grace <em className="text-wine font-medium not-italic">for Her</em>
          </h1>

          <p className="text-muted text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-light">
            Indulge her senses with handcrafted hampers, bespoke jewelry, aromatic candles, and personalized floral keepsakes created to make every moment unforgettable.
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
          searchParams={{ ...resolvedParams, gender: 'female' }}
          lockedGender="female"
          pageTitle="Gifts for Her"
        />
      </div>
    </main>
  );
}
