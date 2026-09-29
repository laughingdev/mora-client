/**
 * Helper to build symmetric SEO-friendly URLs with slugs only (NO IDs anywhere).
 * Product URL format: /shop/cat/subcat/.../[product-slug]
 * Category URL format: /shop/cat/subcat/...
 * Event URL format: /events/[event-slug]
 */

export function getProductUrl(product: any): string {
  if (!product) return '/shop';
  const slug = product.slug || product.productSlug;
  if (!slug) return '/shop';

  // Build category ancestry path if category hierarchy is present
  const catSlugs: string[] = [];
  let curr = product.category;
  while (curr) {
    if (curr.slug) {
      catSlugs.unshift(curr.slug);
    }
    curr = curr.parent;
  }

  if (catSlugs.length > 0) {
    return `/shop/${catSlugs.join('/')}/${slug}`;
  }

  // Fallback to direct category slug if single category string or object exists
  if (product.categorySlug) {
    return `/shop/${product.categorySlug}/${slug}`;
  }

  if (typeof product.category === 'string') {
    const cleanCat = product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (cleanCat) return `/shop/${cleanCat}/${slug}`;
  }

  return `/shop/${slug}`;
}

export function getCategoryUrl(category: any, allCategories?: any[]): string {
  if (!category) return '/shop';
  const slug = typeof category === 'string' ? category : category.slug;
  if (!slug) return '/shop';

  if (typeof category === 'object') {
    const catSlugs: string[] = [];
    let curr: any = category;
    
    // If allCategories lookup table is available and category has parentId but no populated parent
    const catMap = allCategories ? new Map(allCategories.map((c: any) => [c.id, c])) : null;

    while (curr) {
      if (curr.slug) {
        catSlugs.unshift(curr.slug);
      }
      if (curr.parent) {
        curr = curr.parent;
      } else if (curr.parentId && catMap) {
        curr = catMap.get(curr.parentId);
      } else {
        curr = null;
      }
    }

    if (catSlugs.length > 0) {
      return `/shop/${catSlugs.join('/')}`;
    }
  }

  return `/shop/${slug}`;
}

export function getEventUrl(event: any): string {
  if (!event) return '/events';
  const slug = typeof event === 'string' ? event : event.slug;
  return slug ? `/events/${slug}` : '/events';
}

export function getBlogUrl(blog: any): string {
  if (!blog) return '/blog';
  const slug = typeof blog === 'string' ? blog : blog.slug;
  return slug ? `/blog/${slug}` : '/blog';
}
