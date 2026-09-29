import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Mora Moments | Thoughtful Gifts & Experiences",
    template: "%s | Mora Moments",
  },
  description: "Mora Moments creates thoughtful gift hampers and personalized surprises for every special moment in your life.",
  keywords: ["gifts", "hampers", "personalized gifts", "anniversary", "birthday", "Mora Moments"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://moramoments.in",
    siteName: "Mora Moments",
    title: "Mora Moments | Thoughtful Gifts & Experiences",
    description: "Mora Moments creates thoughtful gift hampers and personalized surprises for every special moment in your life.",
    images: [
      {
        url: "/og-image.jpg", // Make sure this exists in public folder
        width: 1200,
        height: 630,
        alt: "Mora Moments - Thoughtful Gifts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mora Moments | Thoughtful Gifts",
    description: "Mora Moments creates thoughtful gift hampers and personalized surprises.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

async function fetchPages() {
  try {
    const res = await fetch(`${API_BASE}/pages`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await fetchCategories();
  const pages = await fetchPages();

  return (
    <html lang="en">
      <body
        className="antialiased selection:bg-wine selection:text-white flex flex-col min-h-screen font-sans"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Mora Moments",
              "url": "https://moramoments.in",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://moramoments.in/shop?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
        <Header categories={categories} pages={pages} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer categories={categories} pages={pages} />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
