"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CategorySection({ categories = [] }: { categories?: any[] }) {
  // Only show featured categories
  const featuredCategories = categories.filter((category) => Boolean(category.featured));

  // If no featured categories, return null
  if (!featuredCategories || featuredCategories.length === 0) return null;

  return (
    <section className="py-24 px-6 md:px-12 bg-white" id="categories">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-wine text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Find the feeling</p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">
              Gifts for every <em className="text-wine font-medium not-italic">moment</em>
            </h2>
          </div>
          <Link href="/shop" className="hidden md:flex items-center gap-2 text-xs font-bold underline underline-offset-4 hover:text-wine transition-colors">
            View all categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredCategories.slice(0, 8).map((category, index) => (
            <Link key={category.id} href={`/shop/${category.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative overflow-hidden group cursor-pointer bg-cream ${
                  index === 0 || index === 3 ? "md:row-span-2 md:col-span-2 lg:col-span-1 lg:row-span-2 h-[300px] md:h-[616px] lg:h-[496px]" : "h-[300px] md:h-[300px] lg:h-[240px]"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                <img
                  src={category.image || '/placeholder-category.jpg'}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <h3 className="font-serif text-white text-2xl mb-1 group-hover:text-gold transition-colors">{category.name}</h3>
                  <span className="text-white/80 text-[10px] uppercase tracking-wider flex items-center gap-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    Explore <ArrowRight size={12} />
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
