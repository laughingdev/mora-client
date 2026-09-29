import { redirect, notFound } from "next/navigation";
import { getProductUrl } from "@/lib/urls";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default async function ProductOldRouteRedirect({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const queryParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([k, v]) => {
    if (v) queryParams.set(k, String(v));
  });

  try {
    const res = await fetch(`${API_BASE}/products/slug/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        const symmetricUrl = getProductUrl(json.data);
        const qs = queryParams.toString();
        redirect(qs ? `${symmetricUrl}?${qs}` : symmetricUrl);
      }
    }
  } catch (e) {
    // If redirect was thrown by Next.js, rethrow it
    if ((e as any)?.digest?.startsWith?.('NEXT_REDIRECT')) {
      throw e;
    }
  }

  const qs = queryParams.toString();
  redirect(qs ? `/shop/${slug}?${qs}` : `/shop/${slug}`);
}
