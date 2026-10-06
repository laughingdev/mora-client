import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2, ChevronRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import ProductClient from "@/app/product/[slug]/ProductClient";
import ShopClient from "../ShopClient";
import ProductPrice from "@/app/components/ProductPrice";
import { getProductUrl, getCategoryUrl } from "@/lib/urls";

interface ShopCatchAllProps {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/products/slug/${slug}`, { next: { revalidate: 15 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (e) {
    return null;
  }
}

async function fetchCategoryBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/categories/slug/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (e) {
    return null;
  }
}

async function fetchProductsForCategory(categorySlug: string, searchParams: any = {}) {
  try {
    const params = new URLSearchParams();
    params.set('categorySlug', categorySlug);
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'categorySlug' && value !== undefined && value !== null && value !== '') {
        const val = Array.isArray(value) ? value[0] : value;
        params.append(key, String(val));
      }
    });
    if (params.has('order') && !params.has('sort')) {
      params.append('sort', 'price');
    }
    if (!params.has('limit')) params.append('limit', '24');

    const res = await fetch(`${API_BASE}/products?${params.toString()}`, { next: { revalidate: 15 } });
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

async function fetchAllCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

async function fetchAllEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

async function fetchSimilarProducts(productId: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}/similar`, { next: { revalidate: 15 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

async function fetchReviews(productId: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, { next: { revalidate: 15 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) 
      ? json.data.filter((r: any) => r.isApproved === true || r.status === 'APPROVED') 
      : [];
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params, searchParams }: ShopCatchAllProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return { title: 'Shop | Mora Moments' };
  }

  const lastSegment = slug[slug.length - 1];

  // 1. Try matching product
  const product = await fetchProductBySlug(lastSegment);
  if (product) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const variantParam = (resolvedSearchParams.variant || resolvedSearchParams.option || '') as string;
    const matchedVariant = variantParam && Array.isArray(product.variants)
      ? product.variants.find((v: any) => v.id?.toLowerCase() === variantParam.toLowerCase() || v.name?.toLowerCase() === variantParam.toLowerCase())
      : null;

    const title = matchedVariant ? `${product.name} (${matchedVariant.name}) | Mora Moments` : `${product.name} | Mora Moments`;
    const imageUrl = matchedVariant?.image?.imageUrl || matchedVariant?.image ||
      product.images?.[0]?.imageUrl || (typeof product.images?.[0] === 'string' ? product.images[0] : null);

    return {
      title,
      description: product.description || `Buy ${product.name} at Mora Moments. Handcrafted thoughtful gifts.`,
      openGraph: {
        title,
        description: product.description,
        images: imageUrl ? [{ url: imageUrl }] : [],
      }
    };
  }

  // 2. Try matching category
  const category = await fetchCategoryBySlug(lastSegment);
  if (category) {
    const canonicalUrl = `https://moramoments.in/shop/${slug.join('/')}`;
    const title = category.metaTitle || `${category.name} Gifts & Hampers | Mora Moments`;
    const description = category.metaDescription || category.description || `Explore our thoughtfully curated collection of ${category.name} gifts, luxury hampers, and keepsakes.`;
    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        images: category.image ? [{ url: category.image }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: category.image ? [category.image] : [],
      }
    };
  }

  return { title: 'Shop | Mora Moments' };
}

export default async function ShopCatchAllPage({ params, searchParams }: ShopCatchAllProps) {
  const { slug } = await params;
  if (!slug || slug.length === 0) return notFound();

  const lastSegment = slug[slug.length - 1];

  // Check 1: Is this last segment a Product?
  const product = await fetchProductBySlug(lastSegment);

  if (product) {
    const [reviews, similarProducts, allCategories] = await Promise.all([
      fetchReviews(product.id),
      fetchSimilarProducts(product.id),
      fetchAllCategories()
    ]);
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const variantParam = (resolvedSearchParams.variant || resolvedSearchParams.option || '') as string;

    // Build breadcrumbs hierarchy
    const breadcrumbs: { label: string; href: string }[] = [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
    ];

    let currCat = product.category;
    const catTrail: { label: string; href: string }[] = [];
    while (currCat) {
      if (currCat.name && currCat.slug) {
        catTrail.unshift({ label: currCat.name, href: `/shop/${currCat.slug}` });
      }
      currCat = currCat.parent;
    }
    breadcrumbs.push(...catTrail);
    breadcrumbs.push({ label: product.name, href: getProductUrl(product) });

    const canonicalUrl = `https://moramoments.in${getProductUrl(product)}`;

    const productSchema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images?.map((img: any) => img?.imageUrl || img) || [],
      "description": product.description,
      "sku": product.sku,
      "offers": {
        "@type": "Offer",
        "url": canonicalUrl,
        "priceCurrency": "INR",
        "price": product.price,
        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    };

    return (
      <main className="flex-grow pt-4 md:pt-8 pb-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />

        {/* Symmetric Breadcrumb */}
        <div className="container mx-auto px-6 md:px-12 mb-6">
          <nav className="flex items-center gap-2 text-xs text-muted flex-wrap">
            {breadcrumbs.map((b, i) => (
              <span key={b.href + i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={12} className="opacity-50" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-ink font-semibold truncate max-w-[200px] md:max-w-none">{b.label}</span>
                ) : (
                  <Link href={b.href} className="hover:text-wine transition-colors">
                    {b.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>

        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-wine" size={32} />
          </div>
        }>
          <ProductClient
            initialProduct={product}
            initialReviews={reviews}
            initialVariantParam={variantParam}
            initialSimilarProducts={similarProducts}
            categories={allCategories}
          />
        </Suspense>
      </main>
    );
  }

  // Check 2: Is this a Category or Subcategory?
  const category = await fetchCategoryBySlug(lastSegment);

  if (category) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const [productData, allCategories, allEvents] = await Promise.all([
      fetchProductsForCategory(category.slug, resolvedSearchParams),
      fetchAllCategories(),
      fetchAllEvents()
    ]);

    // Build category breadcrumbs
    const breadcrumbs: { label: string; href: string }[] = [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
    ];

    let currParent = category.parent;
    const parentTrail: { label: string; href: string }[] = [];
    while (currParent) {
      if (currParent.name && currParent.slug) {
        parentTrail.unshift({ label: currParent.name, href: `/shop/${currParent.slug}` });
      }
      currParent = currParent.parent;
    }
    breadcrumbs.push(...parentTrail);
    breadcrumbs.push({ label: category.name, href: `/shop/${slug.join('/')}` });

    const canonicalUrl = `https://moramoments.in/shop/${slug.join('/')}`;
    const categorySchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${category.name} Gifts & Hampers`,
      "description": category.description || `Thoughtful gifts and curated hampers in ${category.name}`,
      "url": canonicalUrl,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": productData.products.slice(0, 12).map((prod: any, idx: number) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": prod.name,
          "url": `https://moramoments.in${getProductUrl(prod)}`
        }))
      }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": b.label,
        "item": `https://moramoments.in${b.href}`
      }))
    };

    return (
      <main className="flex-grow pb-28 bg-[#fffdfa]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* Luxury Category Hero Banner */}
        <section className="relative w-full min-h-[200px] md:min-h-[260px] bg-wine flex items-center justify-center overflow-hidden mb-8">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover opacity-45"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-wine via-[#521b29] to-[#3a101c]" />
          )}
          <div className="relative z-10 text-center text-white px-6 max-w-2xl py-10">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#f3cfba] mb-2 block">
              Curated Gift Collection
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-3 leading-tight text-white">{category.name}</h1>
            {category.description && (
              <p className="text-xs sm:text-sm tracking-wide text-white/90 leading-relaxed font-light max-w-lg mx-auto">
                {category.description}
              </p>
            )}
          </div>
        </section>

        {/* Breadcrumb Trail & Subcategories */}
        <div className="container mx-auto px-6 md:px-12 mb-8">
          <nav className="flex items-center gap-2 text-xs text-muted mb-6 flex-wrap">
            {breadcrumbs.map((b, i) => (
              <span key={b.href + i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={12} className="opacity-50" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-ink font-semibold">{b.label}</span>
                ) : (
                  <Link href={b.href} className="hover:text-wine transition-colors">
                    {b.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          {/* Child Subcategories quick shortcuts */}
          {category.children && category.children.length > 0 && (
            <div className="mb-8 pb-6 border-b border-line/60">
              <p className="text-[11px] uppercase tracking-widest font-bold text-muted mb-3">Explore {category.name} Subcategories</p>
              <div className="flex flex-wrap gap-2.5">
                {category.children.map((sub: any) => (
                  <Link
                    key={sub.id}
                    href={`/shop/${slug.join('/')}/${sub.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-line bg-white hover:border-wine hover:text-wine text-xs font-medium transition-all shadow-sm"
                  >
                    <span>{sub.name}</span>
                    <ChevronRight size={11} className="opacity-70" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Rich interactive ShopClient with category preset */}
          <ShopClient
            initialProducts={productData.products}
            categories={allCategories}
            events={allEvents}
            meta={productData.meta}
            searchParams={resolvedSearchParams}
            currentCategory={category}
          />
        </div>
      </main>
    );
  }

  return notFound();
}
