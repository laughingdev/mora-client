import ShopClient from "./ShopClient";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Shop All Gifts & Curated Hampers | Mora Moments",
  description: "Browse our complete collection of handcrafted gift hampers, romantic keepsakes, and personalized surprises for every special occasion.",
  alternates: {
    canonical: "https://moramoments.in/shop",
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchProducts(searchParams: any) {
  try {
    const params = new URLSearchParams();
    
    // Process search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const val = Array.isArray(value) ? value[0] : value;
        params.append(key, String(val));
      }
    });

    // If order is provided without sort (e.g. from /shop?order=asc), default sort to price
    if (params.has('order') && !params.has('sort')) {
      params.append('sort', 'price');
    }

    // Default limit if not provided
    if (!params.has('limit')) params.append('limit', '24');

    const res = await fetch(`${API_BASE}/products?${params.toString()}`, { 
      cache: 'no-store' 
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

export default async function ShopPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;

  // SEO Redirection: Permanently 308-redirect parameterized categorySlug to clean canonical path /shop/[categorySlug]
  if (resolvedParams?.categorySlug) {
    const catSlug = Array.isArray(resolvedParams.categorySlug)
      ? resolvedParams.categorySlug[0]
      : resolvedParams.categorySlug;

    const remainingParams = new URLSearchParams();
    Object.entries(resolvedParams).forEach(([k, v]) => {
      if (k !== 'categorySlug' && v) {
        remainingParams.append(k, String(v));
      }
    });
    const qs = remainingParams.toString() ? `?${remainingParams.toString()}` : '';
    permanentRedirect(`/shop/${catSlug}${qs}`);
  }

  // SEO Redirection: Permanently 308-redirect eventSlug query param to canonical /events/[eventSlug]
  if (resolvedParams?.eventSlug) {
    const evtSlug = Array.isArray(resolvedParams.eventSlug)
      ? resolvedParams.eventSlug[0]
      : resolvedParams.eventSlug;

    permanentRedirect(`/events/${evtSlug}`);
  }

  const [productData, categories, events] = await Promise.all([
    fetchProducts(resolvedParams),
    fetchCategories(),
    fetchEvents()
  ]);

  return (
    <main className="flex-grow pb-28 bg-[#fffdfa]">
      {/* Editorial Luxury Header Banner */}
      <section className="relative w-full bg-gradient-to-b from-[#fbf4ee] via-[#faf0ea] to-[#fffdfa] border-b border-line/60 pt-12 pb-14 px-6 md:px-12 overflow-hidden">
        {/* Subtle decorative watermark/glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-wine/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-[#bb9657]/5 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

        <div className="container mx-auto text-center relative z-10 max-w-3xl">
          <p className="text-wine text-[11px] font-bold tracking-[0.25em] uppercase mb-4 flex items-center justify-center gap-3">
            <span className="w-6 h-[1px] bg-wine/50 block"></span>
            The Curated Collection
            <span className="w-6 h-[1px] bg-wine/50 block"></span>
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-tight mb-4">
            Gifts of <em className="text-wine font-medium not-italic">Meaning & Delight</em>
          </h1>

          <p className="text-muted text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-light">
            Explore handcrafted hampers, artisanal treasures, and customizable gift experiences made with deep care and devotion.
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
          searchParams={resolvedParams}
        />
      </div>
    </main>
  );
}
