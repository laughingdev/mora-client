"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Star, 
  UploadCloud, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  X, 
  Loader2, 
  CheckCircle2, 
  Package, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import api from "@/lib/api";

const RATING_LABELS: Record<number, string> = {
  1: "Poor - Dissatisfied",
  2: "Fair - Could be better",
  3: "Good - Satisfied",
  4: "Very Good - Loved it",
  5: "Excellent - Highly recommended!",
};

function OrderReviewContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get("productId");

  const { user, setUser, _hasHydrated } = useStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [userReviews, setUserReviews] = useState<Record<string, any>>({});

  // Review Form State (No headline / title field as requested)
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [mediaList, setMediaList] = useState<{ url: string; type: "image" | "video" }[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isStoreHydrated = _hasHydrated || (typeof window !== "undefined" && useStore.persist?.hasHydrated());
    if (!isStoreHydrated) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      if (user) setUser(null);
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [orderRes, reviewsRes] = await Promise.all([
          api.get(`/orders/${params.id}`),
          api.get("/users/me/reviews").catch(() => ({ data: { data: [] } })),
        ]);

        const orderData = orderRes.data.data;
        setOrder(orderData);

        const reviewMap: Record<string, any> = {};
        if (reviewsRes.data?.data && Array.isArray(reviewsRes.data.data)) {
          reviewsRes.data.data.forEach((r: any) => {
            if (r.productId) reviewMap[r.productId] = r;
          });
        }
        setUserReviews(reviewMap);

        // Determine default selected product
        const items = orderData.items || [];
        const matchingItem = queryProductId
          ? items.find((i: any) => (i.productId || i.product?.id) === queryProductId)
          : null;

        const defaultId = matchingItem 
          ? (matchingItem.productId || matchingItem.product?.id)
          : items[0]?.productId || items[0]?.product?.id || "";

        setSelectedProductId(defaultId);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
          router.push("/");
          return;
        }
        toast.error("Failed to load order details for review");
        router.push("/account?tab=orders");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, user, _hasHydrated, router, setUser, queryProductId]);

  // Sync form when selected product changes
  useEffect(() => {
    if (!selectedProductId) return;

    const existing = userReviews[selectedProductId];
    if (existing) {
      setRating(existing.rating || 5);
      setComment(existing.comment || "");
      const media: { url: string; type: "image" | "video" }[] = [];
      if (Array.isArray(existing.images)) {
        existing.images.forEach((url: string) => media.push({ url, type: "image" }));
      }
      if (Array.isArray(existing.videos)) {
        existing.videos.forEach((url: string) => media.push({ url, type: "video" }));
      }
      setMediaList(media);
    } else {
      setRating(5);
      setComment("");
      setMediaList([]);
    }
  }, [selectedProductId, userReviews]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mediaList.length + files.length > 8) {
      toast.error("You can attach up to 8 photos/videos.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading media...");

    try {
      const uploaded: { url: string; type: "image" | "video" }[] = [];

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
          uploaded.push({
            url: res.data.data.url,
            type: file.type.startsWith("video") ? "video" : "image",
          });
        }
      }

      if (uploaded.length > 0) {
        setMediaList((prev) => [...prev, ...uploaded]);
        toast.success(`Attached ${uploaded.length} file(s)`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload media", { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("Please choose a product to review");
      return;
    }

    setSubmitting(true);
    try {
      const images = mediaList.filter((m) => m.type === "image").map((m) => m.url);
      const videos = mediaList.filter((m) => m.type === "video").map((m) => m.url);

      const payload = {
        productId: selectedProductId,
        rating,
        title: "Verified Purchase",
        comment: comment.trim(),
        images,
        videos,
      };

      const res = await api.post(`/products/${selectedProductId}/reviews`, payload);
      const savedReview = res.data?.data || payload;

      setUserReviews((prev) => ({ ...prev, [selectedProductId]: savedReview }));
      toast.success(userReviews[selectedProductId] ? "Review updated successfully!" : "Review submitted successfully!");

      // Return to order details page after a brief moment
      setTimeout(() => {
        router.push(`/account/orders/${order.id}`);
      }, 700);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory pt-32 pb-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine"></div>
      </div>
    );
  }

  if (!order) return null;

  const currentItem = (order.items || []).find(
    (i: any) => (i.productId || i.product?.id) === selectedProductId
  ) || order.items?.[0];

  const currentProdName = currentItem?.product?.name || currentItem?.productName || "Product";
  const currentProdImg = currentItem?.product?.images?.[0]?.imageUrl || currentItem?.imageUrl || "/placeholder.jpg";
  const existingReview = userReviews[selectedProductId];
  const activeStarCount = hoverRating || rating;

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        {/* Back navigation */}
        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex items-center gap-2 text-wine mb-8 hover:underline text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Order #{order.id.startsWith("MM-") ? order.id : order.id.substring(0, 8)}
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-ink">Rate & Review Product</h1>
            <span className="bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Delivered & Verified
            </span>
          </div>
          <p className="text-muted text-sm mt-1.5">
            Share your feedback, attach photos or unboxing videos to help others choose the perfect gift.
          </p>
        </div>

        {/* Multi-item Product Switcher if order contains multiple items */}
        {order.items && order.items.length > 1 && (
          <div className="bg-white p-4 border border-line rounded-lg mb-8 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-muted font-bold mb-3">
              Items in this order ({order.items.length}):
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {order.items.map((item: any) => {
                const prodId = item.productId || item.product?.id;
                const isSelected = prodId === selectedProductId;
                const hasReviewed = !!userReviews[prodId];
                const name = item.product?.name || item.productName || "Product";
                const img = item.product?.images?.[0]?.imageUrl || item.imageUrl || "/placeholder.jpg";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedProductId(prodId)}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-left shrink-0 transition-all ${
                      isSelected
                        ? "border-wine bg-wine/5 shadow-sm ring-2 ring-wine/20"
                        : "border-line hover:border-wine/40 bg-white"
                    }`}
                  >
                    <div className="w-12 h-12 rounded bg-cream border border-line overflow-hidden shrink-0">
                      <img src={img} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-ink truncate max-w-[140px]">{name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {hasReviewed ? (
                          <span className="text-[10px] text-green-700 font-bold flex items-center gap-0.5">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            {userReviews[prodId]?.rating}★ Reviewed
                          </span>
                        ) : (
                          <span className="text-[10px] text-wine font-medium">Pending review</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Review Form Card */}
        <div className="bg-white p-8 md:p-10 border border-line shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-lg">
          {/* Active Product Summary Banner */}
          <div className="flex items-center gap-5 p-4 bg-cream/30 border border-line rounded-lg mb-8">
            <div className="w-20 h-20 bg-cream border border-line rounded overflow-hidden shrink-0">
              <img
                src={currentProdImg}
                alt={currentProdName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted font-bold">Reviewing Item</p>
              <h2 className="font-serif text-xl text-ink font-semibold mt-0.5">{currentProdName}</h2>
              {currentItem?.variantName && (
                <p className="text-xs text-muted mt-0.5">Variant: {currentItem.variantName}</p>
              )}
              {existingReview && (
                <p className="text-xs text-green-700 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 size={13} /> You reviewed this item on {new Date(existingReview.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Star Rating */}
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-ink mb-3">
                Overall Rating <span className="text-wine">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div
                  className="flex items-center gap-2"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${
                          star <= activeStarCount
                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]"
                            : "fill-transparent text-gray-300 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-semibold text-wine bg-wine/5 px-3 py-1.5 rounded-full w-fit">
                  {RATING_LABELS[activeStarCount] || ""}
                </span>
              </div>
            </div>

            {/* 2. Detailed Comment / Experience (No Headline Field) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs uppercase tracking-widest font-bold text-ink">
                  Your Detailed Review
                </label>
                <span className="text-xs text-muted">{comment.length}/1000 characters</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the product quality, packaging, fragrance, and gifting presentation? What did you love most?"
                rows={5}
                maxLength={1000}
                required
                className="w-full border border-line p-4 text-sm text-ink outline-none focus:border-wine transition-colors rounded-lg resize-none leading-relaxed"
              />
            </div>

            {/* 3. Attach Photos and Videos */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-ink">
                    Attach Photos & Videos
                  </label>
                  <p className="text-xs text-muted mt-0.5">
                    Real photos and unboxing videos give great insights to fellow shoppers!
                  </p>
                </div>
                <span className="text-xs text-muted">Max 8 files</span>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-line hover:border-wine/70 bg-cream/20 hover:bg-cream/40 p-6 rounded-lg text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 ${
                  uploading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />

                {uploading ? (
                  <div className="flex items-center gap-2.5 text-wine text-sm font-semibold py-4">
                    <Loader2 size={22} className="animate-spin" />
                    <span>Uploading your photos/videos to gallery...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-wine/10 text-wine flex items-center justify-center">
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Click to browse or drag and drop photos and videos
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Supported: JPG, PNG, WEBP, MP4, MOV, WEBM (up to 50MB per file)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Media Preview Grid */}
              {mediaList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                  {mediaList.map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-lg border border-line overflow-hidden bg-black/5 shadow-sm"
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={`Uploaded attachment ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover opacity-85"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="p-1.5 rounded-full bg-white/90 text-wine shadow">
                              <VideoIcon size={16} />
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMedia(idx);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow"
                        title="Remove file"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href={`/account/orders/${order.id}`}
                className="text-xs uppercase tracking-widest font-semibold text-muted hover:text-ink transition-colors"
              >
                Cancel and Return to Order
              </Link>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full sm:w-auto bg-wine text-white text-xs uppercase tracking-widest font-bold px-8 py-3.5 hover:bg-wine-dark transition-all rounded shadow hover:shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Review...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{existingReview ? "Update Review" : "Submit Review"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OrderReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory pt-32 pb-24 flex items-center justify-center">
          <Loader2 className="animate-spin text-wine" size={36} />
        </div>
      }
    >
      <OrderReviewContent />
    </Suspense>
  );
}
