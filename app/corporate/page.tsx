import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function CorporatePage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-6 md:px-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-5xl text-wine mb-4">Corporate Gifting</h1>
          <p className="text-ink/70 mb-8">This page is under construction.</p>
          <Link href="/" className="bg-wine text-white px-6 py-3 text-sm tracking-wide hover:bg-wine/90 transition-colors">
            Return Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
