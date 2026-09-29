import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { formatBlogDate, calculateReadTime, stripHtml } from "../utils";
import BlogShareButtons from "../components/BlogShareButtons";
import { getBlogUrl } from "@/lib/urls";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface BlogData {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  isPublished: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  createdAt: string;
  updatedAt: string;
}

async function fetchBlogBySlug(slug: string): Promise<BlogData | null> {
  try {
    const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    return null;
  }
}

async function fetchRelatedBlogs(currentSlug: string): Promise<BlogData[]> {
  try {
    const res = await fetch(`${API_BASE}/blogs`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list: BlogData[] = Array.isArray(json.data) ? json.data : [];
    return list.filter((b) => b.slug !== currentSlug).slice(0, 3);
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog || !blog.isPublished) {
    return {
      title: "Article Not Found | Mora Moments",
      description: "The requested journal article could not be found.",
    };
  }

  const title = blog.metaTitle || `${blog.title} | Mora Moments Journal`;
  const description =
    blog.metaDescription ||
    stripHtml(blog.content).slice(0, 160) ||
    "Explore inspiring stories and gifting ideas from Mora Moments.";

  const canonicalUrl = `https://moramoments.in/blog/${blog.slug}`;

  return {
    title,
    description,
    keywords: blog.metaKeywords
      ? blog.metaKeywords.split(",").map((k) => k.trim())
      : ["gifts", "gifting guide", "Mora Moments", "journal"],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      siteName: "Mora Moments",
      images: blog.image ? [{ url: blog.image, alt: blog.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: blog.image ? [blog.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog || !blog.isPublished) {
    notFound();
  }

  const relatedBlogs = await fetchRelatedBlogs(slug);
  const articleUrl = `https://moramoments.in/blog/${blog.slug}`;
  const readTime = calculateReadTime(blog.content);

  // Schema.org Article JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.metaDescription || stripHtml(blog.content).slice(0, 160),
    image: blog.image ? [blog.image] : [],
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      "@type": "Organization",
      name: "Mora Moments",
      url: "https://moramoments.in",
    },
    publisher: {
      "@type": "Organization",
      name: "Mora Moments",
      logo: {
        "@type": "ImageObject",
        url: "https://moramoments.in/mora-logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  return (
    <div className="bg-[#fffdfa] min-h-screen pb-24">
      {/* Schema.org Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-line/60 bg-gradient-to-b from-[#fbf5ef] to-[#fffdfa] py-3.5 px-6 md:px-12"
      >
        <div className="container mx-auto flex items-center gap-2 text-xs text-muted flex-wrap">
          <Link href="/" className="hover:text-wine transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="text-muted/60" />
          <Link href="/blog" className="hover:text-wine transition-colors">
            Journal
          </Link>
          <ChevronRight size={12} className="text-muted/60" />
          <span className="text-ink font-medium truncate max-w-xs sm:max-w-md">
            {blog.title}
          </span>
        </div>
      </nav>

      {/* Main Article Container */}
      <article className="container mx-auto px-6 md:px-12 pt-10 sm:pt-14 max-w-4xl">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted hover:text-wine transition-colors group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to all stories</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-10 text-center sm:text-left">
          <p className="text-wine text-[11px] font-bold tracking-[0.25em] uppercase mb-4 flex items-center justify-center sm:justify-start gap-2.5">
            <span className="w-5 h-[1px] bg-wine/50 block"></span>
            Mora Moments Journal
          </p>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink leading-tight mb-6">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 py-4 border-y border-line/70">
            {/* Meta tags (Date, Read Time) */}
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={13} className="text-wine" />
                {formatBlogDate(blog.createdAt)}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted/40" />
              <span className="flex items-center gap-1.5 font-medium">
                <Clock size={13} className="text-wine" />
                {readTime} min read
              </span>
            </div>

            {/* Social Share Buttons */}
            <BlogShareButtons title={blog.title} url={articleUrl} />
          </div>
        </header>

        {/* Featured Image */}
        {blog.image && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-line/80 bg-cream/20">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-auto max-h-[520px] object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div
          className="blog-prose mx-auto"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Article Footer & Social Share */}
        <footer className="mt-14 pt-8 border-t border-line/70 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-wine/10 flex items-center justify-center text-wine font-serif font-bold text-sm">
              MM
            </div>
            <div>
              <p className="text-xs font-bold text-ink">Mora Moments Editorial</p>
              <p className="text-[11px] text-muted">Curated with love & care</p>
            </div>
          </div>

          <BlogShareButtons title={blog.title} url={articleUrl} />
        </footer>

        {/* Luxury Gifting Suggestion Box */}
        <section className="my-16 bg-gradient-to-br from-[#faf4ee] via-[#f7ede4] to-[#f4e4d8] border border-line rounded-2xl p-8 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 text-wine text-[11px] font-bold uppercase tracking-widest mb-3">
              <Sparkles size={13} /> The Mora Experience
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-ink mb-3 leading-snug">
              Turn This Inspiration Into a Cherished Gift
            </h3>
            <p className="text-muted text-xs sm:text-sm font-light mb-6 leading-relaxed">
              Explore our artisan-crafted gift hampers or customize a unique surprise with personalized photo cushions, aromatic candles, and heartfelt keepsakes.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="bg-wine hover:bg-[#521b29] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-colors shadow-2xs"
              >
                Shop Curated Hampers
              </Link>
              <Link
                href="/builder"
                className="border border-wine text-wine hover:bg-wine hover:text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-colors"
              >
                Build Bespoke Box
              </Link>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16 pt-12 border-t border-line/70">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-line/60">
              <h3 className="font-serif text-2xl md:text-3xl text-ink">
                More from the Journal
              </h3>
              <Link
                href="/blog"
                className="text-xs font-bold uppercase tracking-wider text-wine hover:underline"
              >
                View all stories &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((rel) => (
                <article
                  key={rel.id}
                  className="group flex flex-col bg-white border border-line/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300"
                >
                  <Link
                    href={getBlogUrl(rel)}
                    className="block relative h-40 overflow-hidden bg-cream/30"
                  >
                    {rel.image ? (
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-cream/50 text-muted">
                        <BookOpen size={28} className="text-wine/30" />
                      </div>
                    )}
                  </Link>

                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-[11px] text-muted mb-2 flex items-center gap-1.5">
                      <Calendar size={11} className="text-wine" />
                      {formatBlogDate(rel.createdAt)}
                    </span>

                    <h4 className="font-serif text-base text-ink group-hover:text-wine transition-colors line-clamp-2 mb-3 leading-snug">
                      <Link href={getBlogUrl(rel)}>{rel.title}</Link>
                    </h4>

                    <Link
                      href={getBlogUrl(rel)}
                      className="text-xs font-semibold text-wine group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-auto"
                    >
                      <span>Read Story</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
