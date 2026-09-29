"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { useStore } from "../../store/useStore";
import { getProductPriceInfo } from "../../lib/pricing";
import { getProductUrl } from "@/lib/urls";
import ProductPrice from "./ProductPrice";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  initialProducts?: any[];
  categories?: any[];
}

export default function ProductGrid({ initialProducts = [], categories = [] }: ProductGridProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const { addToCart, addToWishlist, wishlist } = useStore();

  // Only display featured categories in tabs
  const featuredCategories = categories.filter((c) => Boolean(c.featured));
  const filters = ["All", ...featuredCategories.map((c) => c.name)];

  // Automatically reset to "All" if current filter category is no longer featured
  useEffect(() => {
    if (activeFilter !== "All" && !featuredCategories.some((c) => c.name === activeFilter)) {
      setActiveFilter("All");
    }
  }, [featuredCategories, activeFilter]);

  // Only show featured products in "Made to make them feel special" section
  const featuredProducts = initialProducts.filter((p) => Boolean(p.featured));

  const selectedCategory = featuredCategories.find((c) => c.name === activeFilter);
  const matchingCategoryIds = selectedCategory
    ? [selectedCategory.id, ...categories.filter((c) => c.parentId === selectedCategory.id).map((c) => c.id)]
    : [];

  const filteredProducts = activeFilter === "All"
    ? featuredProducts.slice(0, 8)
    : featuredProducts.filter((p) => matchingCategoryIds.includes(p.categoryId)).slice(0, 8);

  const displayedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "low") {
      return getProductPriceInfo(a).sellPrice - getProductPriceInfo(b).sellPrice;
    }
    if (sortBy === "high") {
      return getProductPriceInfo(b).sellPrice - getProductPriceInfo(a).sellPrice;
    }
    return 0;
  });

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 container mx-auto" id="shop">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <p className="text-wine text-[10px] font-bold tracking-[0.2em] uppercase mb-4">The gift edit</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Made to make them <em className="text-wine font-medium not-italic">feel special</em>
          </h2>
        </div>
        <p className="text-muted text-sm pb-1">Small gestures. Big feelings.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-line mb-10 gap-6">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs transition-all duration-300 border ${
                activeFilter === filter
                  ? "bg-wine text-white border-wine"
                  : "bg-transparent text-ink border-line hover:border-wine"
              }`}
            >
              {filter === "All" ? "All gifts" : filter}
            </button>
          ))}
        </div>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          className="bg-transparent text-muted text-xs border-none outline-none self-start md:self-auto cursor-pointer"
        >
          <option value="featured">Sort: Featured</option>
          <option value="low">Price: Low to high</option>
          <option value="high">Price: High to low</option>
        </select>
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7"
      >
        <AnimatePresence mode="popLayout">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categories={categories}
              animate={true}
            />
          ))}
        </AnimatePresence>
      </motion.div>
      
      {displayedProducts.length === 0 && (
        <div className="py-20 text-center text-muted">
          No featured gifts found in this category.
        </div>
      )}

      <div className="mt-16 text-center">
        <Link href="/shop" className="inline-flex items-center gap-3 border border-ink text-ink px-8 py-4 text-xs font-bold tracking-wide hover:bg-ink hover:text-white transition-colors duration-300">
          View all gifts <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
