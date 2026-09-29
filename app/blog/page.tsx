import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Calendar, Sparkles, BookOpen } from "lucide-react";
import { formatBlogDate, calculateReadTime, stripHtml } from "./utils";
import { getBlogUrl } from "@/lib/urls";

export const metadata: Metadata = {
  title: "The Journal | Thoughtful Gifting Stories & Inspiration | Mora Moments",
  description:
    "Explore inspiring gift guides, celebration ideas, and heartfelt stories curated by Mora Moments to make every occasion unforgettable.",
  alternates: {
    canonical: "https://moramoments.in/blog",
  },
  openGraph: {
    title: "The Journal | Mora Moments",
    description:
      "Explore inspiring gift guides, celebration ideas, and heartfelt stories curated by Mora Moments.",
    url: "https://moramoments.in/blog",
    siteName: "Mora Moments",
    type: "website",
  },
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchBlogs(): Promise<BlogItem[]> {
  try {
    const res = await fetch(`${API_BASE}/blogs`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    return [];
  }
}

export default async function BlogListingPage() {
  const blogs = await fetchBlogs();
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const secondaryBlogs = blogs.length > 1 ? blogs.slice(1) : [];

  return (
    <div className="bg-[#fffdfa] min-h-screen pb-24">
      {/* Editorial Luxury Header Banner */}
      <section className="relative w-full bg-gradient-to-b from-[#fbf4ee] via-[#faf0ea] to-[#fffdfa] border-b border-line/60 pt-14 pb-16 px-6 md:px-12 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-wine/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-[#bb9657]/5 rounded-full blur-2xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

        <div className="container mx-auto text-center relative z-10 max-w-3xl">
          <p className="text-wine text-[11px] font-bold tracking-[0.25em] uppercase mb-4 flex items-center justify-center gap-3">
            <span className="w-6 h-[1px] bg-wine/50 block"></span>
            The Mora Moments Journal
            <span className="w-6 h-[1px] bg-wine/50 block"></span>
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-tight mb-4">
            Stories of <em className="text-wine font-medium not-italic">Love & Devotion</em>
          </h1>

          <p className="text-muted text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-light">
            Inspirational gift guides, celebration rituals, and thoughtful perspectives designed to turn fleeting moments into lifelong memories.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-6 md:px-12 pt-12">
        {blogs.length === 0 ? (
          /* Empty State */
          <div className="text-center py-24 px-6 bg-white border border-line/80 rounded-2xl shadow-xs max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-[#fbf5f2] flex items-center justify-center mx-auto mb-4 border border-wine/10 text-wine">
              <BookOpen size={28} />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-ink mb-3">
              Journal Stories Coming Soon
            </h2>
            <p className="text-sm text-muted max-w-md mx-auto mb-8 font-light leading-relaxed">
              We are currently handcrafting thoughtful editorial pieces, gifting guides, and romantic celebration stories. Check back soon!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/shop"
                className="bg-wine text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 hover:bg-[#521b29] rounded-xl transition-colors shadow-sm"
              >
                Explore Curated Gifts
              </Link>
              <Link
                href="/builder"
                className="border border-wine text-wine text-xs font-bold uppercase tracking-wider px-6 py-3.5 hover:bg-wine hover:text-white rounded-xl transition-colors"
              >
                Build Custom Hamper
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {/* Featured Hero Story */}
            {featuredBlog && (
              <section className="group">
                <Link
                  href={getBlogUrl(featuredBlog)}
                  className="block bg-white border border-line/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-center">
                    {/* Featured Image */}
                    <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[450px] overflow-hidden bg-cream/30">
                      {featuredBlog.image ? (
                        <img
                          src={featuredBlog.image}
                          alt={featuredBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f8f3ee] to-[#ece0d6] text-muted">
                          <BookOpen size={48} className="text-wine/30" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-wine text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                        Featured Story
                      </div>
                    </div>

                    {/* Featured Content */}
                    <div className="lg:col-span-5 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-4 text-xs text-muted mb-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-wine" />
                          {formatBlogDate(featuredBlog.createdAt)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted/40" />
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-wine" />
                          {calculateReadTime(featuredBlog.content)} min read
                        </span>
                      </div>

                      <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink group-hover:text-wine transition-colors duration-300 leading-tight mb-4">
                        {featuredBlog.title}
                      </h2>

                      <p className="text-muted text-sm sm:text-base leading-relaxed line-clamp-3 mb-8 font-light">
                        {stripHtml(featuredBlog.content)}
                      </p>

                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-wine group-hover:translate-x-1 transition-transform duration-300">
                        <span>Read Full Story</span>
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Secondary Stories Grid */}
            {secondaryBlogs.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-line/60">
                  <h3 className="font-serif text-2xl md:text-3xl text-ink">
                    More from the Journal
                  </h3>
                  <span className="text-xs text-muted uppercase tracking-wider font-semibold">
                    {secondaryBlogs.length} {secondaryBlogs.length === 1 ? "article" : "articles"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {secondaryBlogs.map((blog) => (
                    <article
                      key={blog.id}
                      className="group flex flex-col bg-white border border-line/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300"
                    >
                      <Link href={getBlogUrl(blog)} className="block relative h-56 overflow-hidden bg-cream/30">
                        {blog.image ? (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f8f3ee] to-[#ece0d6] text-muted">
                            <BookOpen size={36} className="text-wine/30" />
                          </div>
                        )}
                      </Link>

                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 text-xs text-muted mb-3">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-wine" />
                            {formatBlogDate(blog.createdAt)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted/40" />
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} className="text-wine" />
                            {calculateReadTime(blog.content)} min read
                          </span>
                        </div>

                        <h4 className="font-serif text-xl text-ink group-hover:text-wine transition-colors duration-200 line-clamp-2 mb-3 leading-snug">
                          <Link href={getBlogUrl(blog)}>{blog.title}</Link>
                        </h4>

                        <p className="text-xs sm:text-sm text-muted line-clamp-3 mb-6 leading-relaxed flex-grow font-light">
                          {stripHtml(blog.content)}
                        </p>

                        <Link
                          href={getBlogUrl(blog)}
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-wine group-hover:translate-x-1 transition-transform"
                        >
                          <span>Read Story</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Luxury Gifting CTA Banner */}
            <section className="bg-gradient-to-r from-[#282323] via-[#3a2028] to-[#282323] text-white rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-xl mt-4">
              <div className="absolute right-0 top-0 w-80 h-80 bg-wine/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest mb-4">
                  <Sparkles size={14} /> Inspired by Our Stories?
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-white mb-4 leading-tight">
                  Transform Sentiment Into an <em className="text-gold not-italic">Artisanal Keepsake</em>
                </h3>
                <p className="text-white/80 text-sm sm:text-base font-light mb-8 leading-relaxed">
                  Every story we write is rooted in real connections. Discover our complete collection of curated gift hampers or build your bespoke surprise box today.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/shop"
                    className="bg-wine hover:bg-[#521b29] text-white px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Browse Gifts
                  </Link>
                  <Link
                    href="/builder"
                    className="border border-white/30 hover:border-white text-white px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Custom Box Builder
                  </Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
