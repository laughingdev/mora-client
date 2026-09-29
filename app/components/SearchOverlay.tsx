"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductPrice from "./ProductPrice";
import { getProductUrl } from "@/lib/urls";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/products?search=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data.data) ? data.data : []);
        }
      } catch (e) {
        console.error("Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[120] bg-ivory flex flex-col"
        >
          <div className="border-b border-line">
            <div className="container mx-auto px-6 md:px-12 py-6 flex items-center gap-4">
              <Search className="text-wine" size={24} />
              <form onSubmit={handleSubmit} className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search gifts, categories, or feelings..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-xl md:text-3xl font-serif outline-none text-ink placeholder:text-muted/50"
                />
              </form>
              <button 
                onClick={onClose}
                className="text-muted hover:text-wine transition-colors p-2"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto container mx-auto px-6 md:px-12 py-12">
            {loading && (
              <div className="flex items-center justify-center py-20 text-wine">
                <Loader2 className="animate-spin" size={32} />
              </div>
            )}
            
            {!loading && query && results.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted font-serif">No gifts found for "{query}"</p>
                <p className="text-sm mt-4 text-ink/70">Try searching for broader terms or explore our shop.</p>
                <button 
                  onClick={() => { onClose(); router.push('/shop'); }}
                  className="mt-8 border border-wine text-wine px-6 py-3 text-xs uppercase tracking-widest hover:bg-wine hover:text-white transition-colors"
                >
                  Explore Shop
                </button>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted mb-8 font-bold">Suggestions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {results.map((product) => (
                    <Link 
                      key={product.id} 
                      href={getProductUrl(product)}
                      onClick={onClose}
                      className="group flex flex-col"
                    >
                      <div className="relative aspect-square bg-cream overflow-hidden mb-3">
                        <img 
                          src={product.images?.[0]?.imageUrl || (typeof product.images?.[0] === 'string' ? product.images[0] : null) || '/placeholder.jpg'} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h4 className="font-serif text-ink group-hover:text-wine transition-colors line-clamp-1">{product.name}</h4>
                      <ProductPrice product={product} size="sm" />
                    </Link>
                  ))}
                </div>
                
                <div className="mt-12 text-center">
                  <button 
                    onClick={handleSubmit}
                    className="text-wine text-sm font-medium underline underline-offset-4 hover:opacity-70 transition-opacity"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              </div>
            )}
            
            {!query && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted mb-6 font-bold">Popular Searches</h3>
                  <div className="flex flex-wrap gap-3">
                    {["Birthday", "Anniversary", "For Him", "Roses", "Chocolate", "Personalized"].map(term => (
                      <button 
                        key={term}
                        onClick={() => { setQuery(term); }}
                        className="bg-cream/50 hover:bg-wine text-ink hover:text-white px-4 py-2 rounded-full text-sm transition-colors border border-line hover:border-wine"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
