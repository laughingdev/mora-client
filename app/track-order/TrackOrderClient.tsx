"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  RotateCcw, 
  AlertCircle, 
  Copy, 
  Check, 
  ArrowRight, 
  PhoneCall, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  ChevronDown,
  Gift
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useStore } from "@/store/useStore";
import AuthModal from "../components/AuthModal";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantName?: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  imageUrl?: string | null;
}

interface OrderData {
  id: string;
  userId?: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  grandTotal: number;
  cancelReason?: string | null;
  returnReason?: string | null;
  address?: {
    fullName: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  } | null;
  items: OrderItem[];
}

const ORDER_STEPS = [
  { status: "CONFIRMED", label: "Order Confirmed", desc: "Order and payment confirmed", icon: CheckCircle2 },
  { status: "PROCESSING", label: "Crafting & Packing", desc: "Personalizing & securely boxing", icon: Gift },
  { status: "SHIPPED", label: "Out for Delivery", desc: "Handed over to delivery courier", icon: Truck },
  { status: "DELIVERED", label: "Delivered", desc: "Delivered safely with love", icon: Package },
];

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useStore();

  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const isOrderOwner = Boolean(user && order?.userId && user.id === order.userId);

  // If URL has ?id= or ?orderId=, auto-fetch
  useEffect(() => {
    const urlId = searchParams.get("id") || searchParams.get("orderId");
    if (urlId) {
      setSearchId(urlId);
      performTrack(urlId);
    }
  }, [searchParams]);

  // If user is logged in, optionally fetch recent orders for quick pills
  useEffect(() => {
    if (user) {
      api.get("/orders")
        .then(res => {
          if (Array.isArray(res.data?.data)) {
            setUserOrders(res.data.data.slice(0, 5));
          }
        })
        .catch(() => {
          // ignore background error
        });
    }
  }, [user]);

  const performTrack = async (targetId: string) => {
    const cleanId = (targetId || "").trim();
    if (!cleanId) {
      setError("Please enter an Order ID");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders/track/${encodeURIComponent(cleanId)}`);
      setOrder(res.data.data);
    } catch (err: any) {
      setOrder(null);
      const msg = err.response?.data?.message || `No order found with ID "${cleanId}". Please check and try again.`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    router.replace(`/track-order?id=${encodeURIComponent(searchId.trim())}`);
    performTrack(searchId);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("Order ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepProgressIndex = (status: string) => {
    switch (status) {
      case "PENDING":
        return -1; // Payment pending, nothing confirmed yet
      case "CONFIRMED":
        return 0;
      case "PROCESSING":
        return 1;
      case "SHIPPED":
        return 2;
      case "DELIVERED":
        return 3;
      default:
        return -1;
    }
  };

  const isCancelled = order?.status === "CANCELLED";
  const isReturn = ["RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_PICKUP", "RETURNED"].includes(order?.status || "");

  const faqs = [
    {
      q: "Where can I find my Order ID?",
      a: "Your clean Order ID (e.g. MM-749201) was shown on your payment confirmation screen and sent via SMS and Email receipt when you placed your order."
    },
    {
      q: "How long does standard delivery take?",
      a: "Standard delivery usually takes 3 to 5 business days across India. Custom engraved and handcrafted gift boxes are dispatched within 24 to 48 hours."
    },
    {
      q: "Can I update my delivery address?",
      a: "If your order has not been dispatched yet (in 'Confirmed' or 'Crafting' stage), contact our Gifting Concierge immediately on WhatsApp with your Order ID."
    },
    {
      q: "What if my tracking status hasn't updated?",
      a: "Tracking updates periodically as courier transit hubs scan the parcel. If status hasn't updated in 48 hours, reach out to our concierge for instant support."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#2c1810] pt-28 md:pt-36 pb-24">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      {/* Luxury Background Accents */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6b1d2f]/10 text-[#6b1d2f] text-xs font-semibold tracking-widest uppercase mb-4">
            <Sparkles size={14} /> Mora Moments Concierge
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#2c1810] mb-4">
            Track Your Order
          </h1>
          <p className="text-sm sm:text-base text-[#67544e] font-light leading-relaxed">
            Enter your clean Order ID to check live crafting progress, courier dispatch updates, and estimated delivery.
          </p>
        </div>

        {/* Search Box Form */}
        <div className="max-w-2xl mx-auto mb-10">
          <form 
            onSubmit={handleSearch}
            className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-[0_12px_36px_rgba(107,29,47,0.06)] border border-[#ede5dd] flex flex-col sm:flex-row gap-2 transition-all focus-within:border-[#6b1d2f]/40 focus-within:shadow-[0_12px_40px_rgba(107,29,47,0.12)]"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 text-[#8f756c]" size={20} />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Order ID (e.g. MM-749201)"
                className="w-full pl-12 pr-4 py-3 bg-transparent text-base text-[#2c1810] placeholder:text-[#a8958e] focus:outline-none uppercase font-medium tracking-wide"
              />
              {searchId && (
                <button
                  type="button"
                  onClick={() => setSearchId("")}
                  className="mr-3 text-xs text-[#a8958e] hover:text-[#2c1810]"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !searchId.trim()}
              className="bg-[#6b1d2f] hover:bg-[#521422] text-[#f7e9dc] px-8 py-3.5 rounded-xl font-medium text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <span>Track Order</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Recent Orders (if user has orders) */}
          {userOrders.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 justify-center text-xs">
              <span className="text-[#8f756c] font-medium">Your recent orders:</span>
              {userOrders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setSearchId(o.id);
                    performTrack(o.id);
                  }}
                  className="px-3 py-1 bg-white border border-[#ede5dd] rounded-full text-[#6b1d2f] font-mono text-[11px] font-semibold hover:border-[#6b1d2f] hover:bg-[#6b1d2f]/5 transition-colors"
                >
                  {o.id}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-10 p-5 rounded-2xl bg-[#fff5f5] border border-[#fed7d7] text-[#9b2c2c] flex items-start gap-4 shadow-sm"
          >
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold mb-1">Could not find order</p>
              <p className="opacity-90">{error}</p>
              <p className="mt-2 text-xs text-[#742a2a] opacity-80">
                Tip: Enter the clean Order ID from your confirmation message (e.g. <span className="font-mono font-bold">MM-749201</span>) or simply the 6 digits.
              </p>
            </div>
          </motion.div>
        )}

        {/* Active Order Tracking Result */}
        <AnimatePresence mode="wait">
          {order && (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Order Status Hero Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ede5dd] shadow-[0_10px_35px_rgba(107,29,47,0.04)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#ede5dd]">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-[#2c1810]">
                        {order.id}
                      </span>
                      <button
                        onClick={() => handleCopyId(order.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#6b1d2f] bg-[#6b1d2f]/10 hover:bg-[#6b1d2f]/20 transition-colors"
                        title="Copy Order ID"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${
                        order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800" :
                        order.status === "CANCELLED" ? "bg-rose-100 text-rose-800" :
                        order.status === "SHIPPED" ? "bg-sky-100 text-sky-800" :
                        order.status === "PENDING" ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold" :
                        isReturn ? "bg-purple-100 text-purple-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {order.status === "PENDING" ? "Payment Pending" : order.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#8f756c]">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-widest text-[#8f756c] font-bold">
                        {order.paymentStatus === 'PAID' ? 'Total Paid' : 'Amount Due'}
                      </p>
                      <p className="font-serif text-2xl font-bold text-[#6b1d2f]">
                        ₹{order.grandTotal.toLocaleString("en-IN")}
                      </p>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider flex items-center justify-end gap-1 ${
                        order.paymentStatus === 'PAID' ? 'text-emerald-700' :
                        order.paymentStatus === 'PENDING' ? 'text-amber-800 font-bold' :
                        order.paymentStatus === 'FAILED' ? 'text-rose-700' :
                        'text-[#8f756c]'
                      }`}>
                        {order.paymentStatus === 'PAID' ? '• Payment Confirmed' : `• Payment ${order.paymentStatus}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="pt-8">
                  {/* Dedicated Action Alert for PENDING Orders */}
                  {order.status === "PENDING" && (
                    <div className="mb-8 p-6 sm:p-7 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                          <Clock size={24} className="animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg font-bold text-amber-950">Payment Pending</h3>
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                              Awaiting Confirmation
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-amber-900/80 mt-1 max-w-xl leading-relaxed">
                            {isOrderOwner
                              ? "Your order items are reserved. Please complete your payment to confirm your order and begin handcrafting and dispatch."
                              : !user
                              ? "This order has been placed, but payment is not completed yet. If you are the customer who placed this order, please sign in to complete your payment."
                              : "Payment on this order is currently pending by the purchaser."}
                          </p>
                        </div>
                      </div>
                      {isOrderOwner ? (
                        <Link
                          href={`/checkout/payment?orderId=${order.id}&redirectUrl=/track-order?id=${encodeURIComponent(order.id)}`}
                          className="shrink-0 w-full sm:w-auto text-center px-6 py-3.5 rounded-xl bg-[#6b1d2f] hover:bg-[#521422] text-[#f7e9dc] font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Complete Payment (₹{order.grandTotal.toLocaleString("en-IN")})</span>
                          <ArrowRight size={15} />
                        </Link>
                      ) : !user ? (
                        <button
                          type="button"
                          onClick={() => setIsAuthOpen(true)}
                          className="shrink-0 w-full sm:w-auto text-center px-5 py-3 rounded-xl border border-amber-300 bg-white hover:bg-amber-100/60 text-amber-900 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <span>Sign In to Pay</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : null}
                    </div>
                  )}

                  {isCancelled ? (
                    <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 text-rose-900">
                      <AlertCircle className="text-rose-600 mt-1 shrink-0" size={24} />
                      <div>
                        <h3 className="font-serif text-lg font-semibold">Order Cancelled</h3>
                        <p className="text-sm text-rose-800/80 mt-1">
                          This order was cancelled. {order.cancelReason ? `Reason: "${order.cancelReason}"` : "If you have questions about refund or restocking, our team is happy to assist."}
                        </p>
                        {order.paymentStatus === "REFUNDED" && (
                          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 size={14} /> Full refund issued to original payment method
                          </div>
                        )}
                      </div>
                    </div>
                  ) : isReturn ? (
                    <div className="p-6 bg-purple-50 border border-purple-100 rounded-2xl flex items-start gap-4 text-purple-900">
                      <RotateCcw className="text-purple-600 mt-1 shrink-0" size={24} />
                      <div>
                        <h3 className="font-serif text-lg font-semibold">Return in Progress</h3>
                        <p className="text-sm text-purple-800/80 mt-1">
                          Current Return Status: <span className="font-bold">{order.status.replace("_", " ")}</span>
                        </p>
                        {order.returnReason && (
                          <p className="text-xs text-purple-700 mt-1">Customer note: {order.returnReason}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Desktop Timeline */}
                      <div className="relative hidden md:block">
                        {/* Connecting Line */}
                        <div className="absolute top-6 left-12 right-12 h-1 bg-[#ede5dd] rounded-full z-0" />
                        <div 
                          className="absolute top-6 left-12 h-1 bg-[#6b1d2f] rounded-full z-0 transition-all duration-700"
                          style={{
                            width: `${getStepProgressIndex(order.status) < 0 ? 0 : (getStepProgressIndex(order.status) / (ORDER_STEPS.length - 1)) * 88}%`
                          }}
                        />

                        {/* Steps Grid */}
                        <div className="grid grid-cols-4 relative z-10 text-center">
                          {ORDER_STEPS.map((step, idx) => {
                            const currentIndex = getStepProgressIndex(order.status);
                            const isDone = currentIndex >= idx;
                            const isCurrent = currentIndex === idx;
                            const isPendingStep = order.status === "PENDING" && idx === 0;
                            const Icon = isPendingStep ? Clock : step.icon;
                            const stepLabel = isPendingStep ? "Awaiting Payment" : step.label;
                            const stepDesc = isPendingStep ? "Awaiting payment confirmation" : step.desc;

                            return (
                              <div key={step.status} className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  isDone
                                    ? "bg-[#6b1d2f] border-[#6b1d2f] text-white shadow-md shadow-[#6b1d2f]/20"
                                    : isPendingStep
                                    ? "bg-amber-50 border-amber-400 text-amber-700 ring-4 ring-amber-200/60"
                                    : "bg-white border-[#ede5dd] text-[#a8958e]"
                                } ${isCurrent && !isPendingStep ? "ring-4 ring-[#6b1d2f]/15 scale-110" : ""}`}>
                                  <Icon size={20} className={isPendingStep ? "animate-pulse" : ""} />
                                </div>
                                <h4 className={`text-xs uppercase tracking-wider font-bold mt-4 ${
                                  isDone ? "text-[#2c1810]" : isPendingStep ? "text-amber-900" : "text-[#a8958e]"
                                }`}>
                                  {stepLabel}
                                </h4>
                                <p className={`text-[11px] mt-1 max-w-[150px] leading-tight ${
                                  isPendingStep ? "text-amber-800/80 font-medium" : "text-[#8f756c]"
                                }`}>
                                  {stepDesc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mobile Timeline */}
                      <div className="md:hidden space-y-6">
                        {ORDER_STEPS.map((step, idx) => {
                          const currentIndex = getStepProgressIndex(order.status);
                          const isDone = currentIndex >= idx;
                          const isCurrent = currentIndex === idx;
                          const isPendingStep = order.status === "PENDING" && idx === 0;
                          const Icon = isPendingStep ? Clock : step.icon;
                          const stepLabel = isPendingStep ? "Awaiting Payment" : step.label;
                          const stepDesc = isPendingStep ? "Awaiting payment confirmation" : step.desc;

                          return (
                            <div key={step.status} className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                isDone
                                  ? "bg-[#6b1d2f] border-[#6b1d2f] text-white"
                                  : isPendingStep
                                  ? "bg-amber-50 border-amber-400 text-amber-700 ring-4 ring-amber-200/60"
                                  : "bg-white border-[#ede5dd] text-[#a8958e]"
                              } ${isCurrent && !isPendingStep ? "ring-4 ring-[#6b1d2f]/15" : ""}`}>
                                <Icon size={18} className={isPendingStep ? "animate-pulse" : ""} />
                              </div>
                              <div className="pt-1">
                                <h4 className={`text-sm font-bold ${
                                  isDone ? "text-[#2c1810]" : isPendingStep ? "text-amber-900" : "text-[#a8958e]"
                                }`}>
                                  {stepLabel}
                                </h4>
                                <p className={`text-xs mt-0.5 ${
                                  isPendingStep ? "text-amber-800/80 font-medium" : "text-[#8f756c]"
                                }`}>
                                  {stepDesc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Content Grid: Items + Destination & Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Cols: Items */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede5dd] shadow-sm">
                    <h3 className="font-serif text-xl font-medium text-[#2c1810] mb-6 flex items-center gap-2">
                      <Gift size={20} className="text-[#6b1d2f]" />
                      Items in this Package ({order.items.length})
                    </h3>

                    <div className="divide-y divide-[#ede5dd]">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#fbf9f6] rounded-xl overflow-hidden border border-[#ede5dd] shrink-0 flex items-center justify-center">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="text-[#a8958e]" size={28} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#2c1810] truncate">
                              {item.productSlug ? (
                                <Link 
                                  href={`/shop/${item.productSlug}`}
                                  className="hover:text-[#6b1d2f] hover:underline"
                                >
                                  {item.productName}
                                </Link>
                              ) : (
                                item.productName
                              )}
                            </h4>
                            {item.variantName && (
                              <p className="text-xs text-[#8f756c] mt-0.5">Variant: {item.variantName}</p>
                            )}
                            <p className="text-xs text-[#8f756c] mt-1">
                              Qty: <span className="font-semibold text-[#2c1810]">{item.quantity}</span> × ₹{item.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-serif font-bold text-[#6b1d2f]">
                              ₹{item.subtotal.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Col: Address & Summary & Concierge */}
                <div className="space-y-6">
                  {/* Delivery Location Card */}
                  {order.address && (
                    <div className="bg-white rounded-3xl p-6 border border-[#ede5dd] shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6b1d2f] mb-3">
                        <MapPin size={16} /> Delivery Address
                      </div>
                      <p className="text-sm font-semibold text-[#2c1810]">{order.address.fullName}</p>
                      <p className="text-xs text-[#8f756c] mt-1 leading-relaxed">
                        {order.address.city}, {order.address.state} - {order.address.pincode}
                      </p>
                      <p className="text-xs text-[#8f756c]">{order.address.country}</p>
                      <div className="mt-4 pt-4 border-t border-[#ede5dd] flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
                        <ShieldCheck size={14} /> Insured Mora Express Handled Delivery
                      </div>
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="bg-white rounded-3xl p-6 border border-[#ede5dd] shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#8f756c] mb-4">
                      Price Details
                    </h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between text-[#67544e]">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Coupon Discount</span>
                          <span>-₹{order.discount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#67544e]">
                        <span>Shipping</span>
                        <span>{order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`}</span>
                      </div>
                      <div className="flex justify-between text-[#67544e]">
                        <span>Taxes & GST (18%)</span>
                        <span>₹{order.tax.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="pt-3 border-t border-[#ede5dd] flex justify-between items-center text-sm font-bold text-[#2c1810]">
                        <span>{order.paymentStatus === 'PAID' ? 'Total Paid' : 'Total Due'}</span>
                        <span className="font-serif text-base text-[#6b1d2f]">
                          ₹{order.grandTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                      {isOrderOwner && order.paymentStatus === 'PENDING' && (
                        <Link
                          href={`/checkout/payment?orderId=${order.id}&redirectUrl=/track-order?id=${encodeURIComponent(order.id)}`}
                          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#6b1d2f] hover:bg-[#521422] text-[#f7e9dc] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm text-center"
                        >
                          <span>Complete Payment</span>
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Concierge Assistance */}
                  <div className="bg-[#321e22] text-[#f7e9dc] rounded-3xl p-6 shadow-md">
                    <h4 className="font-serif text-lg text-[#dfb18e] mb-2 flex items-center gap-2">
                      <PhoneCall size={18} /> Need Help?
                    </h4>
                    <p className="text-xs text-[#e7cfc4] leading-relaxed mb-4">
                      Our gifting concierge is ready to answer questions about dispatch, custom messages, or address updates.
                    </p>
                    <div className="flex flex-col gap-2">
                      <a
                        href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi Mora Moments, I need help with my Order ${order.id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs tracking-wider uppercase transition-colors"
                      >
                        Chat on WhatsApp
                      </a>
                      {isOrderOwner && (
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="w-full text-center py-2.5 px-4 rounded-xl border border-[#aa7d7d] hover:bg-[#aa7d7d]/20 text-[#f7e9dc] font-medium text-xs tracking-wider uppercase transition-colors"
                        >
                          Manage in Account
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informational Guidance (Visible before search or below order) */}
        {!order && !loading && (
          <div className="mt-12 space-y-12 max-w-4xl mx-auto">
            {/* 3 Step Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#ede5dd] text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#6b1d2f]/10 text-[#6b1d2f] flex items-center justify-center mx-auto mb-4">
                  <Gift size={22} />
                </div>
                <h4 className="font-serif text-base font-semibold text-[#2c1810] mb-2">1. Thoughtfully Crafted</h4>
                <p className="text-xs text-[#8f756c] leading-relaxed">
                  Each gift box and keepsake is personalized and packed with utmost care in our signature wine gift box.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#ede5dd] text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#6b1d2f]/10 text-[#6b1d2f] flex items-center justify-center mx-auto mb-4">
                  <Truck size={22} />
                </div>
                <h4 className="font-serif text-base font-semibold text-[#2c1810] mb-2">2. Express Courier</h4>
                <p className="text-xs text-[#8f756c] leading-relaxed">
                  Dispatched with India's premier air courier partners to ensure delicate hampers arrive safely and on time.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#ede5dd] text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#6b1d2f]/10 text-[#6b1d2f] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={22} />
                </div>
                <h4 className="font-serif text-base font-semibold text-[#2c1810] mb-2">3. Delivered with Joy</h4>
                <p className="text-xs text-[#8f756c] leading-relaxed">
                  Delivered right to your doorstep or directly to your loved one with our complimentary gift note.
                </p>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ede5dd] shadow-sm">
              <h3 className="font-serif text-2xl font-medium text-[#2c1810] mb-6 text-center">
                Frequently Asked Questions
              </h3>
              <div className="divide-y divide-[#ede5dd]">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full text-left flex justify-between items-center text-sm font-semibold text-[#2c1810] gap-4"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown 
                          size={18} 
                          className={`text-[#8f756c] transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} 
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-[#8f756c] mt-2 leading-relaxed"
                          >
                            {faq.a}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
