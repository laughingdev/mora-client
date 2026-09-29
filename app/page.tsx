import Link from "next/link";
import Hero from "./components/Hero";
import HeroCrawler from "./components/HeroCrawler";
import AudienceSection from "./components/AudienceSection";
import CategorySection from "./components/CategorySection";
import ProductGrid from "./components/ProductGrid";

async function fetchProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/products?featured=true&limit=24`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

async function fetchCrawlerItems() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/crawler-items`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const [products, categories, crawlerItems] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchCrawlerItems()
  ]);

  return (
    <div className="min-h-screen bg-ivory">
      <div className="pb-24">
        <Hero />
        <HeroCrawler initialItems={crawlerItems} />
        <AudienceSection />
        <CategorySection categories={categories} />
        <ProductGrid initialProducts={products} categories={categories} />
        
        {/* Builder Banner Section */}
        <section className="mx-6 md:mx-12 my-24 bg-wine text-white p-12 md:p-24 rounded-sm flex flex-col md:flex-row justify-between items-center relative overflow-hidden" id="builder">
          <div className="z-10 max-w-lg">
            <p className="text-[#e9ba95] text-[10px] font-bold tracking-[0.2em] uppercase mb-6">The most personal gift</p>
            <h2 className="font-serif text-5xl md:text-6xl leading-tight mb-6">
              Your gift.<br />
              <em className="font-medium not-italic text-white/90">Your way.</em>
            </h2>
            <p className="text-[#eadbd3] text-sm md:text-base leading-relaxed mb-10">
              Choose a feeling, pick their favourites, add your words — and we'll make it beautiful.
            </p>
            <Link href="/builder" className="inline-block bg-white text-wine px-8 py-4 font-bold text-sm tracking-wide hover:bg-cream hover:-translate-y-1 transition-transform duration-300">
              Build your gift <span>→</span>
            </Link>
          </div>
          
          <div className="relative w-full md:w-1/2 h-[300px] mt-12 md:mt-0 hidden md:block">
             <div className="absolute top-4 right-1/4 w-[250px] h-[225px] bg-[#dec6a7] rotate-6 shadow-[inset_0_0_0_20px_#c4a986] p-8 font-serif text-wine flex flex-col items-center justify-center z-10 transition-transform duration-500 hover:rotate-0">
               <span className="text-xl">for you</span>
               <strong className="text-[80px] leading-none mt-2">♡</strong>
             </div>
             <div className="absolute top-0 left-10 bg-white text-ink text-[10px] uppercase font-bold tracking-wider px-6 py-4 shadow-xl z-20">
               choose a theme
             </div>
             <div className="absolute bottom-10 right-0 bg-white text-ink text-[10px] uppercase font-bold tracking-wider px-6 py-4 shadow-xl z-20">
               add a little love
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
