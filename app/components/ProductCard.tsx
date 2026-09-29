"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Check } from "lucide-react";
import { useStore } from "@/store/useStore";
import { getProductPriceInfo } from "@/lib/pricing";
import { getProductUrl } from "@/lib/urls";
import ProductPrice from "./ProductPrice";

export interface ProductCardProps {
  product: any;
  categories?: any[];
  className?: string;
  animate?: boolean;
}

export default function ProductCard({
  product,
  categories = [],
  className = "",
  animate = true,
}: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const priceInfo = getProductPriceInfo(product);
  const prodUrl = getProductUrl(product);
  const isWishlisted = wishlist.some((w: any) => w.id === product.id);

  // Extract images
  const mainImage =
    product.images?.[0]?.imageUrl ||
    (typeof product.images?.[0] === "string" ? product.images[0] : null) ||
    product.image ||
    "/placeholder.jpg";

  const secondImage =
    product.images?.[1]?.imageUrl ||
    (typeof product.images?.[1] === "string" ? product.images[1] : null);

  // Extract assigned categories (multi-category support)
  let productCategories: any[] = [];
  if (Array.isArray(product.categories) && product.categories.length > 0) {
    productCategories = product.categories;
  } else if (product.category) {
    productCategories = typeof product.category === "object" ? [product.category] : [{ name: product.category }];
  } else if (product.categoryId && categories.length > 0) {
    const matched = categories.find((c) => c.id === product.categoryId);
    if (matched) productCategories = [matched];
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: priceInfo.sellPrice,
        originalPrice: priceInfo.originalPrice,
        image: mainImage,
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: priceInfo.sellPrice,
      originalPrice: priceInfo.originalPrice,
      image: mainImage,
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const CardWrapper = animate ? motion.div : "div";
  const wrapperProps = animate
    ? {
        layout: true,
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.35 },
      }
    : {};

  return (
    <CardWrapper
      {...wrapperProps}
      className={`group cursor-pointer flex flex-col h-full ${className}`}
    >
      {/* 1. Image Container */}
      <div className="relative aspect-[4/5] sm:aspect-square w-full bg-[#fbf6f2] overflow-hidden mb-4 rounded-2xl border border-line/50">
        {/* Badges: Featured & Discount */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          {product.featured && (
            <span className="bg-wine text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm">
              Featured
            </span>
          )}
          {priceInfo.discountPercent > 0 && (
            <span className="bg-[#bb9657] text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm">
              {priceInfo.discountPercent}% OFF
            </span>
          )}
          {product.stock <= 0 && (
            <span className="bg-ink/80 text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-ink hover:text-wine hover:scale-110 active:scale-95 transition-all shadow-sm"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={15}
            fill={isWishlisted ? "currentColor" : "none"}
            className={isWishlisted ? "text-wine" : "text-ink/70"}
          />
        </button>

        {/* Clickable Image with Dual-Image Hover Transition */}
        <Link href={prodUrl} className="block w-full h-full relative cursor-pointer">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
              secondImage ? "group-hover:opacity-0" : ""
            }`}
          />

          {secondImage && (
            <Image
              src={secondImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out group-hover:scale-105"
            />
          )}

          {/* Quick View Hover Bar */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <span className="translate-y-3 group-hover:translate-y-0 transition-all duration-300 bg-white text-wine px-5 py-2.5 text-xs font-bold tracking-wider uppercase rounded-full shadow-lg hover:bg-cream">
              Quick View
            </span>
          </div>
        </Link>
      </div>

      {/* 2. Product Details */}
      <div className="flex flex-col flex-grow">
        {/* Category Tag(s) */}
        {productCategories.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {productCategories.slice(0, 2).map((cat: any, i: number) => (
              <span
                key={cat.id || cat.slug || i}
                className="text-[10px] uppercase tracking-[0.16em] font-bold text-wine transition-colors"
              >
                {cat.name}
                {i < Math.min(productCategories.length, 2) - 1 ? " •" : ""}
              </span>
            ))}
            {productCategories.length > 2 && (
              <span className="text-[9px] text-muted font-medium">+{productCategories.length - 2}</span>
            )}
          </div>
        )}

        {/* Title */}
        <Link href={prodUrl} className="group-hover:text-wine transition-colors mb-1">
          <h3 className="font-serif text-xl text-ink font-normal line-clamp-1 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-muted font-light line-clamp-1 mb-4 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* 3. Footer Action: Price & Add to Bag */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <ProductPrice priceInfo={priceInfo} />

          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              aria-label={`Add ${product.name} to bag`}
              className={`text-[11px] font-bold tracking-wider uppercase border-b pb-0.5 transition-all whitespace-nowrap flex items-center gap-1 ${
                isAdded
                  ? "text-emerald-700 border-emerald-700 font-bold"
                  : "text-wine border-wine hover:opacity-70"
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={12} strokeWidth={2.5} />
                  <span>Added</span>
                </>
              ) : (
                <span>Add to bag +</span>
              )}
            </button>
          ) : (
            <span className="text-muted text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
