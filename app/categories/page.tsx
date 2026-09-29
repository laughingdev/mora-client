import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "../data/dummy-data";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-wine text-xs font-bold tracking-[0.2em] uppercase mb-4">Find the feeling</p>
            <h1 className="font-serif text-4xl md:text-5xl text-ink mb-6">
              Gifts for every <em className="font-medium text-wine">moment</em>
            </h1>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`} className="group relative block overflow-hidden rounded-sm aspect-[4/5] bg-cream">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image 
                  src={category.image} 
                  alt={category.name} 
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 text-white">
                  <h3 className="font-serif text-2xl font-normal mb-2">{category.name}</h3>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors flex items-center gap-2">
                    {category.subtitle} <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
