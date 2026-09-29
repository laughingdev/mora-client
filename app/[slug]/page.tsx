import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CmsPageView from "../components/CmsPageView";
import { DEFAULT_PAGES_MAP, PageRecord } from "../data/defaultPages";

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getPageData(slug: string): Promise<PageRecord | null> {
  try {
    const res = await fetch(`${API_BASE}/pages/slug/${slug}`, { 
      next: { revalidate: 60 } 
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data && json.data.isPublished !== false) {
        return json.data;
      }
    }
  } catch (error) {
    // Fall back to default page if backend is unreachable
  }

  // Check default pages map fallback
  if (DEFAULT_PAGES_MAP[slug]) {
    return DEFAULT_PAGES_MAP[slug];
  }

  return null;
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageData(slug);

  if (!page) {
    return {
      title: "Page Not Found | Mora Moments",
    };
  }

  const title = page.metaTitle || `${page.title} | Mora Moments`;
  const description = page.metaDescription || `Read ${page.title} at Mora Moments. Handcrafted thoughtful gifts.`;

  return {
    title,
    description,
    keywords: page.metaKeywords ? page.metaKeywords.split(',').map(s => s.trim()) : undefined,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function DynamicCmsPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  const page = await getPageData(slug);

  if (!page) {
    notFound();
  }

  return <CmsPageView page={page} slug={slug} />;
}
