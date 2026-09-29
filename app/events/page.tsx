import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop Gifts by Occasion & Moment | Mora Moments",
  description: "Find meaningful gifts for birthdays, anniversaries, weddings, festivals and cherished life milestones.",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

export default async function EventsIndexPage() {
  const events = await fetchEvents();

  return (
    <main className="flex-grow pt-12 pb-24 px-6 md:px-12 container mx-auto">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-wine mb-3 block">
          Every Moment Deserves A Celebration
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink mb-4">
          Shop by Occasion
        </h1>
        <p className="text-muted text-base leading-relaxed">
          From unforgettable birthdays and heartfelt anniversaries to grand wedding ceremonies, find gifts thoughtfully tailored for every feeling.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 bg-cream/30 border border-line rounded-sm">
          <Calendar size={40} className="text-wine/60 mx-auto mb-3" />
          <h3 className="font-serif text-2xl mb-2">Occasions Loading</h3>
          <p className="text-sm text-muted mb-6">Discover our curated gift edits in our main shop.</p>
          <Link href="/shop" className="bg-wine text-white px-6 py-3 text-xs font-bold uppercase tracking-wider">
            Explore Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((evt: any) => (
            <Link
              key={evt.id}
              href={`/events/${evt.slug}`}
              className="group relative flex flex-col h-[380px] overflow-hidden rounded-sm bg-wine shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <Image
                src={evt.bannerImage || evt.image || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"}
                alt={evt.name}
                fill
                className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="relative z-10 p-8 mt-auto flex flex-col text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f2ccb6] mb-2 block">
                  {evt._count?.products ?? 0} Curated Items
                </span>
                <h2 className="font-serif text-3xl font-medium mb-3 group-hover:translate-x-1 transition-transform duration-300">
                  {evt.name}
                </h2>
                {evt.description && (
                  <p className="text-sm text-white/80 line-clamp-2 mb-6 font-light leading-relaxed">
                    {evt.description}
                  </p>
                )}
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-white group-hover:text-[#f2ccb6] transition-colors">
                  <span>Explore Collection</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
