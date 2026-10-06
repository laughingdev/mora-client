"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Heart, 
  Minus, 
  Plus, 
  Star, 
  Share2, 
  Info, 
  ShoppingBag, 
  Zap, 
  Check, 
  Sparkles, 
  ShieldCheck,
  Truck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Camera,
  Video as VideoIcon,
  UploadCloud,
  X as CloseIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../../store/useStore";
import api from "../../../lib/api";
import ProductCard from "@/app/components/ProductCard";

interface ProductOption {
  id: string | null; // null represents the base/original product
  isBase: boolean;
  name: string;
  price: number;
  originalPrice: number;
  salePrice?: number | null;
  stock: number;
  image?: string | null;
}

export default function ProductClient({ 
  initialProduct, 
  initialReviews, 
  initialVariantParam,
  initialSimilarProducts = [],
  categories = []
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, addToWishlist, wishlist, user } = useStore();
  const [product] = useState(initialProduct);
  const [reviews, setReviews] = useState(initialReviews);
  const [similarProducts, setSimilarProducts] = useState<any[]>(initialSimilarProducts || []);

  useEffect(() => {
    if (!initialSimilarProducts || initialSimilarProducts.length === 0) {
      api.get(`/products/${product.id}/similar`)
        .then(res => {
          if (res.data?.data) {
            setSimilarProducts(res.data.data);
          }
        })
        .catch(() => {});
    } else {
      setSimilarProducts(initialSimilarProducts);
    }
  }, [product.id, initialSimilarProducts]);

  useEffect(() => {
    // Refresh reviews to include author's own review even if pending approval
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token || user) {
      api.get(`/products/${product.id}/reviews`)
        .then(res => {
          if (Array.isArray(res.data?.data)) {
            setReviews(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [product.id, user]);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description"); // description, reviews, shipping
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "", images: [] as string[], videos: [] as string[] });
  const [uploadingReviewMedia, setUploadingReviewMedia] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Base product images
  const baseImages: string[] = (
    product.images?.map((img: any) => img?.imageUrl || img) || []
  ).filter(Boolean);
  if (baseImages.length === 0) baseImages.push('/placeholder.jpg');

  // Base Option representing the main product
  const baseOriginalPrice = Number(product.price) || 0;
  const baseSalePrice =
    product.salePrice !== undefined && product.salePrice !== null && Number(product.salePrice) > 0
      ? Number(product.salePrice)
      : null;
  const baseSellPrice = baseSalePrice !== null ? baseSalePrice : baseOriginalPrice;
  const baseDiscountRatio =
    baseSalePrice !== null && baseOriginalPrice > baseSalePrice
      ? (baseOriginalPrice - baseSalePrice) / baseOriginalPrice
      : 0;

  const baseOption: ProductOption = {
    id: null,
    isBase: true,
    name: "Standard",
    price: baseSellPrice,
    originalPrice: baseOriginalPrice,
    salePrice: baseSalePrice,
    stock: product.stock,
    image: baseImages[0] || null,
  };

  // If variants exist, construct options including the base product
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const options: ProductOption[] = hasVariants
    ? [
        baseOption,
        ...product.variants.map((v: any) => {
          const vPrice = Number(v.price) || 0;
          let vOriginalPrice = vPrice;
          if (baseDiscountRatio > 0) {
            vOriginalPrice = Math.max(vPrice, Math.round(vPrice / (1 - baseDiscountRatio)));
            if (baseOriginalPrice > vPrice && vOriginalPrice < baseOriginalPrice) {
              vOriginalPrice = baseOriginalPrice;
            }
          } else if (baseOriginalPrice > vPrice) {
            vOriginalPrice = baseOriginalPrice;
          }

          return {
            id: v.id,
            isBase: false,
            name: v.name,
            price: vPrice,
            originalPrice: vOriginalPrice,
            salePrice: vPrice < vOriginalPrice ? vPrice : null,
            stock: v.stock,
            image: v.image?.imageUrl || v.image || null,
          };
        }),
      ]
    : [];

  // Helper to match a variant option by name, slugified name, or id
  const getMatchedOption = (vParam?: string | null) => {
    if (!vParam || options.length === 0) return null;
    const cleanParam = vParam.trim().toLowerCase();
    return (
      options.find(
        (opt) =>
          opt.id?.toLowerCase() === cleanParam ||
          opt.name.toLowerCase() === cleanParam ||
          opt.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanParam
      ) || null
    );
  };

  // Lowest price option as general default
  const lowestOption =
    options.length > 0
      ? [...options].sort((a, b) => a.price - b.price)[0]
      : baseOption;

  // Initial option matches URL query param (?variant=...) or defaults to lowest price
  const initialVariant = getMatchedOption(
    searchParams?.get("variant") || searchParams?.get("option") || initialVariantParam
  );

  const [selectedOption, setSelectedOption] = useState<ProductOption>(
    initialVariant || lowestOption
  );

  // Sync state if user navigates via browser back/forward buttons
  useEffect(() => {
    const vParam = searchParams?.get("variant") || searchParams?.get("option");
    if (vParam) {
      const match = getMatchedOption(vParam);
      if (match && match.id !== selectedOption.id) {
        setSelectedOption(match);
        setActiveImageIndex(0);
      }
    } else if (searchParams && !searchParams.has("variant") && !selectedOption.isBase && options.some(o => o.isBase)) {
      const base = options.find((o) => o.isBase) || lowestOption;
      if (base && base.id !== selectedOption.id) {
        setSelectedOption(base);
        setActiveImageIndex(0);
      }
    }
  }, [searchParams]);

  const handleSelectOption = (opt: ProductOption) => {
    setSelectedOption(opt);
    setActiveImageIndex(0);

    // Update browser URL query parameter with the variant context without page reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (opt.isBase || !opt.name || opt.name.toLowerCase() === "standard") {
        url.searchParams.delete("variant");
        url.searchParams.delete("option");
      } else {
        url.searchParams.set("variant", opt.name);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Gallery images scoped to the active option:
  // We do NOT dump all variant photos into the gallery together!
  const currentImages: string[] = (() => {
    if (selectedOption.isBase || !selectedOption.image) {
      return baseImages;
    }
    // If the active variant has its own image, show it as photo #0, followed by base product angle photos
    return [
      selectedOption.image,
      ...baseImages.filter((img) => img !== selectedOption.image)
    ];
  })();

  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  const handleNextImage = () => {
    if (currentImages.length <= 1) return;
    setSlideDirection(1);
    setActiveImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const handlePrevImage = () => {
    if (currentImages.length <= 1) return;
    setSlideDirection(-1);
    setActiveImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  // Wheel horizontal side scroll handler
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 25) {
      if (e.deltaX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
  };

  // Touch swipe handlers for mobile/tablet
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 35) {
      if (diff < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    setTouchStartX(null);
  };

  const currentPrice = selectedOption.price;
  const currentStock = selectedOption.stock;

  const createCartItem = () => ({
    id: selectedOption.isBase ? product.id : `${product.id}-${selectedOption.id}`,
    productId: product.id,
    variantId: selectedOption.isBase ? undefined : (selectedOption.id || undefined),
    variantName: selectedOption.isBase ? undefined : selectedOption.name,
    name: selectedOption.isBase ? product.name : `${product.name} (${selectedOption.name})`,
    price: currentPrice,
    image: currentImages[0] || '/placeholder.jpg',
    quantity,
  });

  const handleAddToCart = () => {
    if (currentStock === 0) return;
    const item = createCartItem();
    addToCart(item);
    toast.success(`Added ${quantity} × ${item.name} to your bag`);
  };

  const handleBuyNow = () => {
    if (currentStock === 0) return;
    const item = createCartItem();
    addToCart(item);
    toast.success("Proceeding to checkout...");
    router.push("/checkout");
  };

  const handleShare = () => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const isVariant =
      !selectedOption.isBase &&
      Boolean(selectedOption.name) &&
      selectedOption.name.toLowerCase() !== "standard";

    if (isVariant) {
      url.searchParams.set("variant", selectedOption.name);
    } else {
      url.searchParams.delete("variant");
      url.searchParams.delete("option");
    }

    const shareUrl = url.toString();
    const shareTitle = isVariant
      ? `${product.name} (${selectedOption.name}) | Mora Moments`
      : `${product.name} | Mora Moments`;
    const shareText = isVariant
      ? `Check out ${product.name} in ${selectedOption.name} at Mora Moments!`
      : `Check out ${product.name} at Mora Moments!`;

    if (navigator.share) {
      navigator
        .share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success(
        isVariant
          ? `Link with ${selectedOption.name} variant copied!`
          : "Product link copied to clipboard"
      );
    }
  };

  const handleReviewFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (reviewForm.images.length + reviewForm.videos.length + files.length > 6) {
      toast.error("You can attach a maximum of 6 photos/videos.");
      return;
    }

    setUploadingReviewMedia(true);
    const toastId = toast.loading("Uploading media...");

    try {
      const newImages = [...reviewForm.images];
      const newVideos = [...reviewForm.videos];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds 50MB limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/uploads/media", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data?.data?.url) {
          if (file.type.startsWith("video")) {
            newVideos.push(res.data.data.url);
          } else {
            newImages.push(res.data.data.url);
          }
        }
      }

      setReviewForm((prev) => ({ ...prev, images: newImages, videos: newVideos }));
      toast.success("Media attached successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload media", { id: toastId });
    } finally {
      setUploadingReviewMedia(false);
      e.target.value = "";
    }
  };

  const removeReviewMedia = (type: "image" | "video", index: number) => {
    setReviewForm((prev) => {
      if (type === "image") {
        return { ...prev, images: prev.images.filter((_, i) => i !== index) };
      }
      return { ...prev, videos: prev.videos.filter((_, i) => i !== index) };
    });
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }
    
    setSubmittingReview(true);
    try {
      const payload = {
        ...reviewForm,
        title: reviewForm.title.trim() || 'Verified Purchase',
      };
      const res = await api.post(`/products/${product.id}/reviews`, payload);
      setReviewSuccess("Thank you! Your review has been submitted.");
      if (res.data?.data) {
        setReviews((prev: any) => [res.data.data, ...prev]);
      }
      setReviewForm({ rating: 5, title: "", comment: "", images: [], videos: [] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl overflow-x-clip pb-20 sm:pb-0">
      {/* Breadcrumbs */}
      <div className="text-[10px] uppercase tracking-widest text-muted mb-8 font-medium">
        <span className="hover:text-wine cursor-pointer" onClick={() => router.push('/')}>Home</span>
        <span className="mx-2">/</span>
        <span className="hover:text-wine cursor-pointer" onClick={() => router.push('/shop')}>Shop</span>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-20 w-full max-w-full min-w-0">
        {/* Media Gallery with Side Scroll & Nav Arrows */}
        <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 min-w-0 max-w-full">
          {/* Thumbnails */}
          {currentImages.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[600px] no-scrollbar scrollbar-hide pb-2 md:pb-0 w-full md:w-24 shrink-0">
              {currentImages.map((img: string, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSlideDirection(i > activeImageIndex ? 1 : -1);
                    setActiveImageIndex(i);
                  }}
                  className={`relative w-18 h-18 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden bg-cream transition-all duration-300 ${
                    activeImageIndex === i 
                      ? "border-2 border-wine ring-2 ring-wine/20 scale-102" 
                      : "opacity-70 hover:opacity-100 border border-line"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Hero Photo Deck with Side Navigation & Side Scroll */}
          <div
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full aspect-square md:aspect-auto md:h-[600px] bg-cream rounded-2xl overflow-hidden group flex-1 border border-line shadow-sm min-w-0 max-w-full select-none"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={`${selectedOption.id}-${activeImageIndex}`}
                initial={{ opacity: 0, x: slideDirection * 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -slideDirection * 25 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                src={currentImages[activeImageIndex] || currentImages[0]}
                alt={product.name}
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />
            </AnimatePresence>

            {/* Left & Right Side Navigation Arrows (Hidden on Mobile) */}
            {currentImages.length > 1 && (
              <>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  aria-label="Previous image"
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-ink hover:text-wine items-center justify-center transition-all shadow-md z-20 border border-line hover:scale-110 opacity-90 group-hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  aria-label="Next image"
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-ink hover:text-wine items-center justify-center transition-all shadow-md z-20 border border-line hover:scale-110 opacity-90 group-hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Floating Bottom Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full pointer-events-auto">
                  {currentImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSlideDirection(idx > activeImageIndex ? 1 : -1);
                        setActiveImageIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activeImageIndex ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            <button 
              type="button"
              onClick={handleShare}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-wine hover:scale-110 transition-transform shadow-md z-20"
              title="Share Product"
            >
              <Share2 size={18} />
            </button>

            {/* Active Variant Pill Badge on Photo */}
            {hasVariants && (
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-ink shadow-sm flex items-center gap-1.5 border border-line z-20">
                <Sparkles size={13} className="text-wine" />
                <span>Showing: {selectedOption.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info & Action Center */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-6">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink mb-4 font-normal leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                ))}
                <span className="text-muted text-xs ml-2 tracking-wider">
                  ({reviews.length} {reviews.length === 1 ? 'REVIEW' : 'REVIEWS'})
                </span>
              </div>
            </div>

            {/* Price with Discount calculation */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-serif text-wine font-bold">
                ₹{currentPrice?.toLocaleString('en-IN')}
              </span>
              {selectedOption.originalPrice > selectedOption.price && (
                <>
                  <span className="line-through text-muted text-lg">
                    ₹{selectedOption.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                    Save ₹{(selectedOption.originalPrice - selectedOption.price).toLocaleString('en-IN')} ({Math.round(((selectedOption.originalPrice - selectedOption.price) / selectedOption.originalPrice) * 100)}% OFF)
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="prose prose-sm text-muted mb-8 line-clamp-3">
            <p>{product.description}</p>
          </div>

          {/* Variants Selection UI */}
          {options.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="text-xs uppercase tracking-widest font-bold text-ink flex items-center gap-1.5">
                  Select Option: 
                  <span className="text-wine font-semibold normal-case text-sm ml-1">
                    {selectedOption.name}
                  </span>
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-wine hover:text-wine-dark hover:underline transition-all cursor-pointer"
                    title="Share this variant link"
                  >
                    <Share2 size={13} />
                    <span>Share Variant</span>
                  </button>
                  {selectedOption.stock > 0 && selectedOption.stock <= 10 && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Only {selectedOption.stock} left
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {options.map((opt) => {
                  const isSelected = selectedOption.id === opt.id;
                  const isOutOfStock = opt.stock === 0;

                  return (
                    <button
                      key={opt.id || 'base-option'}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleSelectOption(opt)}
                      className={`group relative px-4 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? "border-wine bg-wine text-white shadow-md shadow-wine/20 ring-2 ring-wine/20 font-semibold"
                          : "border-line bg-white text-ink hover:border-wine/60 hover:bg-cream/40 font-medium"
                      } ${isOutOfStock ? "opacity-50 cursor-not-allowed line-through" : "cursor-pointer"}`}
                    >
                      {opt.image && (
                        <span className="w-5 h-5 rounded-md overflow-hidden bg-cream shrink-0 border border-black/10">
                          <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" />
                        </span>
                      )}
                      <span>{opt.name}</span>
                      <span className={`text-xs ml-0.5 ${isSelected ? "text-white/80" : "text-muted"}`}>
                        ₹{opt.price.toLocaleString('en-IN')}
                      </span>
                      {opt.originalPrice > opt.price && (
                        <span className={`text-[10px] line-through ${isSelected ? "text-white/60" : "text-muted/60"}`}>
                          ₹{opt.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="ml-1 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row: Quantity + Add to Bag + Buy Now + Wishlist */}
          <div className="space-y-3 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Mobile Utility Row: Quantity Selector + Wishlist */}
              <div className="flex items-center gap-3 sm:contents">
                {/* Quantity Selector */}
                <div className="flex-1 sm:flex-initial flex items-center border border-line rounded-xl h-13 sm:h-14 sm:w-32 bg-white px-2 shrink-0 shadow-xs">
                  <button 
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center text-muted hover:text-wine transition-colors disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="flex-1 text-center font-bold text-ink text-sm">{quantity}</span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                    className="w-10 h-full flex items-center justify-center text-muted hover:text-wine transition-colors disabled:opacity-30"
                    disabled={quantity >= currentStock}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Wishlist Button (Mobile Placement) */}
                <button
                  type="button"
                  onClick={() =>
                    addToWishlist({
                      id: product.id,
                      name: product.name,
                      price: currentPrice,
                      originalPrice: selectedOption.originalPrice,
                      image: currentImages[0] || '/placeholder.jpg',
                    })
                  }
                  className="sm:hidden w-13 h-13 border border-line rounded-xl flex items-center justify-center text-wine hover:bg-cream transition-colors bg-white shrink-0 shadow-xs active:scale-95"
                  title="Save to Wishlist"
                >
                  <Heart size={20} fill={wishlist.find(i => i.id === product.id) ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Add to Bag + Buy Now Dual CTA Grid */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="w-full border-2 border-wine bg-wine/5 hover:bg-wine text-wine hover:text-white rounded-xl h-13 sm:h-14 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <ShoppingBag size={16} className="shrink-0" />
                  <span className="truncate">{currentStock === 0 ? "Out of Stock" : "Add to Bag"}</span>
                </button>

                {/* Direct Buy Now Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={currentStock === 0}
                  className="w-full bg-gradient-to-r from-wine via-[#674a4f] to-[#4a2e33] text-white hover:opacity-95 rounded-xl h-13 sm:h-14 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase transition-all shadow-md shadow-wine/20 hover:shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <Zap size={16} className="shrink-0 fill-amber-300 text-amber-300" />
                  <span className="truncate">Buy Now</span>
                </button>
              </div>

              {/* Wishlist Button (Desktop Placement) */}
              <button
                type="button"
                onClick={() =>
                  addToWishlist({
                    id: product.id,
                    name: product.name,
                    price: currentPrice,
                    originalPrice: selectedOption.originalPrice,
                    image: currentImages[0] || '/placeholder.jpg',
                  })
                }
                className="hidden sm:flex w-14 h-14 border border-line rounded-xl items-center justify-center text-wine hover:bg-cream transition-colors bg-white shrink-0 shadow-xs active:scale-95"
                title="Save to Wishlist"
              >
                <Heart size={20} fill={wishlist.find(i => i.id === product.id) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Reassurance Banner (No SKU shown to customer!) */}
          <div className="flex items-center gap-3 text-xs text-muted mb-8 bg-cream/40 p-4 rounded-xl border border-line/60">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
            <p className="leading-relaxed">
              <span className="font-semibold text-ink">Insured Luxury Delivery</span> • Handcrafted with love & usually dispatched within 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-line pt-12 mb-24">
        <div className="flex gap-8 border-b border-line mb-8 overflow-x-auto scrollbar-hide">
          {["description", "reviews", "shipping"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs font-bold tracking-widest uppercase transition-colors relative whitespace-nowrap ${
                activeTab === tab ? "text-wine" : "text-muted hover:text-ink"
              }`}
            >
              {tab === "description" ? "Details" : tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-wine" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {activeTab === "description" && (
              <motion.div
                key="desc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="prose max-w-none text-ink/80 text-sm md:text-base leading-relaxed"
              >
                <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
              </motion.div>
            )}
            
            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex flex-col md:flex-row gap-12">
                  <div className="w-full md:w-1/2">
                    <h3 className="font-serif text-2xl text-wine mb-8">Customer Reviews</h3>
                    {reviews.length === 0 ? (
                      <p className="text-muted text-sm italic">No reviews yet. Be the first to share your thoughts!</p>
                    ) : (
                      <div className="space-y-8">
                        {reviews.map((review: any) => (
                          <div key={review.id} className="border-b border-line pb-6">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 text-gold">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 1} />
                                ))}
                                {review.title && <span className="font-semibold text-sm text-ink ml-1">{review.title}</span>}
                              </div>
                              {!review.isApproved && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  Pending Approval (Visible only to you)
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-xs text-muted mb-2">
                              {review.user?.firstName ? `${review.user.firstName} ${review.user.lastName || ''}` : review.firstName ? `${review.firstName} ${review.lastName || ''}` : (review.user?.name || 'Verified Buyer')}
                            </h4>
                            <p className="text-sm text-ink/85 leading-relaxed mb-3">{review.comment}</p>

                            {/* Images and Videos attached to review */}
                            {((review.images && review.images.length > 0) || (review.videos && review.videos.length > 0)) && (
                              <div className="flex gap-2.5 flex-wrap mt-2">
                                {review.images?.map((imgUrl: string, idx: number) => (
                                  <a key={`img-${idx}`} href={imgUrl} target="_blank" rel="noreferrer" className="w-16 h-16 rounded border border-line overflow-hidden hover:opacity-90 transition-opacity">
                                    <img src={imgUrl} alt={`Customer photo ${idx + 1}`} className="w-full h-full object-cover" />
                                  </a>
                                ))}
                                {review.videos?.map((vidUrl: string, idx: number) => (
                                  <div key={`vid-${idx}`} className="w-24 h-16 rounded border border-line overflow-hidden bg-black relative">
                                    <video src={vidUrl} controls className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full md:w-1/2 bg-ivory p-8 border border-line rounded-2xl">
                    <h3 className="font-serif text-xl text-wine mb-6">Write a Review</h3>
                    {reviewSuccess ? (
                      <div className="bg-cream/50 p-6 text-center border border-line rounded-xl">
                        <p className="text-wine font-medium">{reviewSuccess}</p>
                      </div>
                    ) : (
                      <form onSubmit={submitReview} className="space-y-5">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                className={`${star <= reviewForm.rating ? "text-amber-400" : "text-gray-300"} hover:scale-110 transition-transform`}
                              >
                                <Star size={24} fill="currentColor" strokeWidth={0} />
                              </button>
                            ))}
                          </div>
                        </div>


                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted mb-1.5 font-medium">Your Review</label>
                          <textarea 
                            required
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                            className="w-full bg-white border border-line p-3 rounded-lg outline-none focus:border-wine text-sm text-ink resize-none h-28"
                            placeholder="Share your gifting experience, unboxing thoughts, material quality..."
                          />
                        </div>

                        {/* Attach Photos and Videos */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[10px] uppercase tracking-widest text-muted font-medium">
                              Attach Photos & Videos
                            </label>
                            <span className="text-[10px] text-muted">Max 6 files</span>
                          </div>
                          
                          <label className={`border border-dashed border-line hover:border-wine bg-white/70 p-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors ${uploadingReviewMedia ? 'opacity-60 pointer-events-none' : ''}`}>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              onChange={handleReviewFileChange}
                              className="hidden"
                              disabled={uploadingReviewMedia}
                            />
                            {uploadingReviewMedia ? (
                              <div className="flex items-center gap-2 text-wine text-xs font-semibold py-1">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Uploading media...</span>
                              </div>
                            ) : (
                              <>
                                <Camera size={16} className="text-wine" />
                                <VideoIcon size={16} className="text-wine" />
                                <span className="text-xs text-ink/80 font-medium">Add photos or videos</span>
                              </>
                            )}
                          </label>

                          {/* Media preview chips */}
                          {(reviewForm.images.length > 0 || reviewForm.videos.length > 0) && (
                            <div className="flex gap-2 flex-wrap mt-2.5">
                              {reviewForm.images.map((url, i) => (
                                <div key={`img-${i}`} className="relative w-12 h-12 rounded border border-line overflow-hidden group">
                                  <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeReviewMedia("image", i)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                                  >
                                    <CloseIcon size={10} />
                                  </button>
                                </div>
                              ))}
                              {reviewForm.videos.map((url, i) => (
                                <div key={`vid-${i}`} className="relative w-16 h-12 rounded border border-line overflow-hidden bg-black flex items-center justify-center group">
                                  <video src={url} className="w-full h-full object-cover opacity-80" />
                                  <span className="absolute text-white pointer-events-none"><VideoIcon size={12} /></span>
                                  <button
                                    type="button"
                                    onClick={() => removeReviewMedia("video", i)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                                  >
                                    <CloseIcon size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button 
                          type="submit"
                          disabled={submittingReview || uploadingReviewMedia}
                          className="bg-wine text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-wine-dark rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
                        >
                          {submittingReview ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : "Submit Review"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === "shipping" && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-muted leading-relaxed space-y-6 max-w-2xl"
              >
                <div>
                  <h4 className="text-ink font-bold mb-2">Shipping Information</h4>
                  <p>All our gifts are carefully packaged to ensure they arrive in perfect condition. Standard shipping takes 3-5 business days across India. Express shipping (1-2 days) is available at checkout for urgent moments.</p>
                </div>
                <div>
                  <h4 className="text-ink font-bold mb-2">Returns & Exchanges</h4>
                  <p>Due to the personal nature of our gifts, we do not accept returns on personalized items or perishables (like chocolates). If your order arrives damaged, please contact us within 48 hours for a replacement.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="mt-20 pt-16 border-t border-line/70">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-wine text-[11px] font-bold tracking-[0.25em] uppercase mb-2 flex items-center gap-2">
                <Sparkles size={14} className="text-gold" />
                Curated Recommendations
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink">
                Similar Products You'll Adore
              </h2>
            </div>
            <Link
              href={product.gender === 'male' ? '/men' : product.gender === 'female' ? '/women' : '/shop'}
              className="text-xs font-bold tracking-wider uppercase text-wine hover:text-[#521b29] flex items-center gap-1.5 transition-colors self-start sm:self-auto group"
            >
              <span>Explore More Gifts</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {similarProducts.slice(0, 4).map((simProd: any) => (
              <ProductCard
                key={simProd.id}
                product={simProd}
                categories={categories}
                className="rounded-xl shadow-xs hover:shadow-md transition-shadow"
              />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Bottom Quick-Action Dock */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-line/80 px-3.5 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div className="flex flex-col pl-1 shrink-0 max-w-[120px]">
          <span className="text-[10px] uppercase font-bold text-muted truncate">{product.name}</span>
          <span className="text-sm font-extrabold text-wine">₹{currentPrice.toLocaleString('en-IN')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 flex-1">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            className="w-full border-2 border-wine bg-wine/5 text-wine hover:bg-wine hover:text-white rounded-lg h-11 text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            <ShoppingBag size={14} className="shrink-0" />
            <span className="truncate">{currentStock === 0 ? "Out" : "Add to Bag"}</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={currentStock === 0}
            className="w-full bg-gradient-to-r from-wine to-[#4a2e33] text-white rounded-lg h-11 text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm active:scale-[0.97] transition-all disabled:opacity-50"
          >
            <Zap size={14} className="shrink-0 fill-amber-300 text-amber-300" />
            <span className="truncate">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
