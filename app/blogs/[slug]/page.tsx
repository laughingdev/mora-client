import { permanentRedirect } from "next/navigation";

export default async function BlogSlugRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/blog/${slug}`);
}
