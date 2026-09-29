"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Settings, RotateCcw, X, AlertTriangle, Star, Camera } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import api from "@/lib/api";

const STAGES = [
  { status: 'CONFIRMED', label: 'Order Placed', icon: CheckCircle },
  { status: 'PROCESSING', label: 'Processing', icon: Settings },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: Package }
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, setUser, _hasHydrated } = useStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rzpKey, setRzpKey] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [cancelCustom, setCancelCustom] = useState("");
  const [returnCustom, setReturnCustom] = useState("");

  // Review states
  const [userReviews, setUserReviews] = useState<Record<string, any>>({});

  useEffect(() => {
    const isStoreHydrated = _hasHydrated || (typeof window !== "undefined" && useStore.persist?.hasHydrated());
    if (!isStoreHydrated) {
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      if (user) setUser(null);
      router.push('/');
      return;
    }

    if (!user) {
      api.get("/users/me")
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
          router.push('/');
        });
      return;
    }

    const fetchData = async () => {
      try {
        const [orderRes, rzpRes, reviewsRes] = await Promise.all([
          api.get(`/orders/${params.id}`),
          api.get('/payments/config'),
          api.get('/users/me/reviews').catch(() => ({ data: { data: [] } }))
        ]);
        setOrder(orderRes.data.data);
        setRzpKey(rzpRes.data.data.key_id);

        const reviewMap: Record<string, any> = {};
        if (reviewsRes.data?.data && Array.isArray(reviewsRes.data.data)) {
          reviewsRes.data.data.forEach((r: any) => {
            if (r.productId) reviewMap[r.productId] = r;
          });
        }
        setUserReviews(reviewMap);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
          router.push('/');
          toast.error("Session expired. Please sign in again.");
          return;
        }
        toast.error("Failed to load order details");
        router.push('/account?tab=orders');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, user, _hasHydrated, router, setUser]);

  const handleRetryPayment = () => {
    router.push(`/checkout/payment?orderId=${order.id}&redirectUrl=/account/orders/${order.id}`);
  };

  const handleCancelOrder = async () => {
    const reason = cancelReason === 'Other' ? cancelCustom : cancelReason;
    if (!reason.trim()) { toast.error('Please provide a reason'); return; }

    const previousOrder = { ...order };
    // 1. Instantly close modal and update UI with zero waiting time
    setShowCancelModal(false);
    setOrder((prev: any) => ({
      ...prev,
      status: 'CANCELLED',
      cancelReason: reason,
      ...(prev.paymentStatus === 'PAID' ? { paymentStatus: 'REFUNDED' } : {})
    }));
    toast.success('Order cancelled successfully');

    // 2. Dispatch background server request
    try {
      await api.post(`/orders/${order.id}/cancel`, { reason });
    } catch (e: any) {
      setOrder(previousOrder);
      toast.error(e.response?.data?.message || 'Failed to cancel order. Changes reverted.');
    }
  };

  const handleReturnOrder = async () => {
    const reason = returnReason === 'Other' ? returnCustom : returnReason;
    if (!reason.trim()) { toast.error('Please provide a reason'); return; }

    const previousOrder = { ...order };
    // 1. Instantly close modal and update UI with zero waiting time
    setShowReturnModal(false);
    setOrder((prev: any) => ({
      ...prev,
      status: 'RETURN_REQUESTED',
      returnReason: reason
    }));
    toast.success('Return request submitted');

    // 2. Dispatch background server request
    try {
      await api.post(`/orders/${order.id}/return`, { reason });
    } catch (e: any) {
      setOrder(previousOrder);
      toast.error(e.response?.data?.message || 'Failed to submit return. Changes reverted.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory pt-24 pb-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine"></div>
      </div>
    );
  }

  if (!order) return null;

  const currentStageIndex = STAGES.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isInReturnFlow = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_PICKUP', 'RETURNED'].includes(order.status);

  const RETURN_STAGES = [
    { status: 'RETURN_REQUESTED', label: 'Return Requested', icon: RotateCcw, desc: 'We\'ve received your return request and are reviewing it.' },
    { status: 'RETURN_APPROVED', label: 'Return Approved', icon: CheckCircle, desc: 'Your return has been approved. We will arrange a pickup.' },
    { status: 'RETURN_PICKUP', label: 'Pickup Scheduled', icon: Truck, desc: 'Our courier will collect the item from you soon.' },
    { status: 'RETURNED', label: 'Refund Processed', icon: Package, desc: 'Item received. Your refund has been credited to your original payment method.' },
  ];
  const returnStageIndex = RETURN_STAGES.findIndex(s => s.status === order.status);

  return (
    <div className="min-h-screen bg-ivory pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <Link href="/account?tab=orders" className="inline-flex items-center gap-2 text-wine mb-8 hover:underline text-sm font-medium">
          <ArrowLeft size={16} /> Back to My Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-serif text-3xl text-ink">Order #{order.id.startsWith('MM-') ? order.id : order.id.substring(0, 8)}</h1>
              <Link
                href={`/track-order?id=${encodeURIComponent(order.id)}`}
                className="text-xs font-semibold text-wine bg-wine/10 hover:bg-wine/20 px-3 py-1 rounded-full transition-colors flex items-center gap-1.5"
              >
                <Truck size={14} /> Live Tracking
              </Link>
            </div>
            <p className="text-muted mt-2">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="bg-white px-4 py-2 border border-line shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Total Amount</p>
            <p className="text-xl font-serif text-wine">₹{order.grandTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white p-8 border border-line shadow-[0_10px_40px_rgba(0,0,0,0.03)] mb-8">
          <h2 className="text-sm uppercase tracking-widest font-bold text-ink mb-8 border-b border-line pb-4">Order Status</h2>

          {isCancelled ? (
            <div className="flex items-center gap-4 text-red-600 bg-red-50 p-6 rounded-md border border-red-100">
              <CheckCircle size={24} />
              <div>
                <h3 className="font-bold">Order Cancelled</h3>
                <p className="text-sm opacity-80">This order has been cancelled.</p>
              </div>
            </div>
          ) : isInReturnFlow ? (
            // ── Return Pipeline Timeline ──
            <div>
              <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-0 relative">
                <div className="absolute top-6 left-0 w-full h-0.5 bg-line hidden md:block z-0" />
                <div className="absolute top-6 left-0 h-0.5 bg-purple-500 hidden md:block z-0 transition-all duration-500"
                  style={{ width: `${Math.max(0, returnStageIndex) / (RETURN_STAGES.length - 1) * 100}%` }} />
                {RETURN_STAGES.map((stage, idx) => {
                  const done = returnStageIndex >= idx;
                  const current = returnStageIndex === idx;
                  const Icon = stage.icon;
                  return (
                    <div key={stage.status} className="flex md:flex-col items-start md:items-center gap-3 md:gap-2 md:text-center relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${done ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-line text-muted'
                        } ${current ? 'ring-4 ring-purple-200' : ''}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-widest font-bold ${done ? 'text-ink' : 'text-muted'}`}>{stage.label}</p>
                        {current && <p className="text-xs text-muted mt-1 max-w-35">{stage.desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : order.status === 'PENDING' ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-orange-50 text-orange-800 p-6 rounded-md border border-orange-200">
              <div className="flex items-center gap-4">
                <Clock size={24} className="text-orange-600" />
                <div>
                  <h3 className="font-bold">Payment Pending</h3>
                  <p className="text-sm opacity-80">Your order has been saved, but the payment is pending.</p>
                </div>
              </div>
              <button
                onClick={handleRetryPayment}
                disabled={paymentLoading}
                className="bg-wine text-white px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-colors whitespace-nowrap"
              >
                {paymentLoading ? "Processing..." : "Pay Now"}
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-line -translate-y-1/2 hidden md:block z-0" />
              <div className="absolute top-1/2 left-0 h-1 bg-wine -translate-y-1/2 hidden md:block z-0 transition-all duration-500"
                style={{ width: `${Math.max(0, currentStageIndex) / (STAGES.length - 1) * 100}%` }} />

              <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                {STAGES.map((stage, idx) => {
                  const isCompleted = currentStageIndex >= idx;
                  const isCurrent = currentStageIndex === idx;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.status} className="flex md:flex-col items-center gap-4 md:gap-2 text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-wine border-wine text-white' : 'bg-white border-line text-muted'
                        } ${isCurrent ? 'ring-4 ring-wine/20' : ''}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-widest font-bold ${isCompleted ? 'text-ink' : 'text-muted'}`}>{stage.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 border border-line shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
                <h2 className="text-sm uppercase tracking-widest font-bold text-ink">Items in your order</h2>
                {order.status === 'DELIVERED' && (
                  <span className="text-xs text-wine font-medium flex items-center gap-1.5 bg-wine/5 px-2.5 py-1 rounded">
                    <Star size={13} className="fill-amber-400 text-amber-400" /> Reviews eligible
                  </span>
                )}
              </div>

              {order.status === 'DELIVERED' && (
                <div className="mb-6 p-4 bg-amber-50/60 border border-amber-200/70 rounded-md flex items-start gap-3">
                  <Star size={20} className="text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-amber-900">Your order has been delivered!</h4>
                    <p className="text-xs text-amber-800/90 mt-0.5">
                      How was your gifting experience? Write a review below and attach your photos or unboxing videos!
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {order.items.map((item: any) => {
                  const prodId = item.productId || item.product?.id;
                  const itemReview = prodId ? userReviews[prodId] : null;
                  const prodName = item.product?.name || item.productName || 'Product';
                  const prodImg = item.product?.images?.[0]?.imageUrl || item.imageUrl || '/placeholder.jpg';

                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-line last:border-0 last:pb-0 sm:items-center justify-between">
                      <div className="flex gap-4 items-center flex-1 min-w-0">
                        <div className="w-20 h-20 bg-cream border border-line shrink-0 overflow-hidden rounded">
                          <img src={prodImg} alt={prodName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-bold text-ink text-sm sm:text-base mb-0.5 truncate">{prodName}</h3>
                          {item.variantName && <p className="text-xs text-muted mb-0.5">Variant: {item.variantName}</p>}
                          <p className="text-xs text-muted">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                          <p className="text-sm font-bold text-wine mt-0.5">₹{item.subtotal.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {order.status === 'DELIVERED' && prodId && (
                        <div className="shrink-0 flex items-center pt-2 sm:pt-0">
                          {itemReview ? (
                            <Link
                              href={`/account/orders/${order.id}/review?productId=${encodeURIComponent(prodId)}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-wine bg-wine/10 hover:bg-wine hover:text-white px-3.5 py-2 rounded transition-colors"
                            >
                              <Star size={13} className="fill-amber-400 text-amber-400" />
                              <span>Reviewed ({itemReview.rating}★) • Edit</span>
                            </Link>
                          ) : (
                            <Link
                              href={`/account/orders/${order.id}/review?productId=${encodeURIComponent(prodId)}`}
                              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-wine hover:bg-wine-dark px-4 py-2 rounded transition-all shadow hover:shadow-md"
                            >
                              <Star size={13} className="fill-white" />
                              <span>Write Review</span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 border border-line shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
              <h2 className="text-sm uppercase tracking-widest font-bold text-ink mb-6 border-b border-line pb-4">Payment Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-ink">₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span className="text-ink">{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Tax (18%)</span>
                  <span className="text-ink">₹{order.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-line flex justify-between font-bold">
                  <span className="text-ink">Total</span>
                  <span className="text-wine text-lg">₹{order.grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-4 mt-2 flex justify-between items-center">
                  <span className="text-muted">Payment Status</span>
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                      order.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-700' :
                        order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                    }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 border border-line shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
              <h2 className="text-sm uppercase tracking-widest font-bold text-ink mb-6 border-b border-line pb-4 flex items-center gap-2">
                <MapPin size={16} className="text-wine" /> Shipping Address
              </h2>
              {order.address ? (
                <div className="text-sm text-muted space-y-1">
                  <p className="font-bold text-ink">{order.address.fullName}</p>
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                  <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
                  <p>{order.address.country}</p>
                  <p className="pt-2">Phone: {order.address.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-muted">No address provided.</p>
              )}
            </div>

            {/* Subtle cancel/return — very low visibility, just a text link */}
            {(['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) || order.status === 'DELIVERED') && (
              <div className="pt-4 text-center border-t border-line mt-2">
                <p className="text-[10px] uppercase tracking-widest text-muted/50 mb-2">Need help with this order?</p>
                {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) && (
                  <button onClick={() => setShowCancelModal(true)} className="text-xs text-muted/40 hover:text-red-400 underline underline-offset-2 transition-colors">
                    Cancel this order
                  </button>
                )}
                {order.status === 'DELIVERED' && (
                  <button onClick={() => setShowReturnModal(true)} className="text-xs text-muted/40 hover:text-purple-400 underline underline-offset-2 transition-colors">
                    Request a return
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cancel Order Modal ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white max-w-md w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle size={22} />
                <h3 className="font-serif text-xl text-ink">Cancel Order</h3>
              </div>
              <button onClick={() => setShowCancelModal(false)}><X size={20} className="text-muted hover:text-ink" /></button>
            </div>
            <p className="text-sm text-muted mb-6">Please tell us why you want to cancel. This helps us improve.</p>
            <div className="space-y-2 mb-4">
              {['Changed my mind', 'Ordered by mistake', 'Found a better price', 'Delivery time too long', 'Other'].map(r => (
                <label key={r} className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${cancelReason === r ? 'border-wine bg-wine/5' : 'border-line hover:border-wine/40'}`}>
                  <input type="radio" name="cancelReason" value={r} checked={cancelReason === r} onChange={() => setCancelReason(r)} className="accent-wine" />
                  <span className="text-sm text-ink">{r}</span>
                </label>
              ))}
            </div>
            {cancelReason === 'Other' && (
              <textarea value={cancelCustom} onChange={e => setCancelCustom(e.target.value)} placeholder="Please describe your reason..." className="w-full border border-line p-3 text-sm resize-none h-20 mb-4 focus:outline-none focus:border-wine" />
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 border border-line text-ink text-sm py-2.5 hover:bg-cream transition-colors">Keep Order</button>
              <button onClick={handleCancelOrder} disabled={actionLoading} className="flex-1 bg-red-600 text-white text-sm py-2.5 hover:bg-red-700 transition-colors disabled:opacity-50">
                {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Return Order Modal ── */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowReturnModal(false)}>
          <div className="bg-white max-w-md w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3 text-purple-600">
                <RotateCcw size={22} />
                <h3 className="font-serif text-xl text-ink">Return Order</h3>
              </div>
              <button onClick={() => setShowReturnModal(false)}><X size={20} className="text-muted hover:text-ink" /></button>
            </div>
            <p className="text-sm text-muted mb-6">Please select a reason for your return. The payment will be marked as refunded.</p>
            <div className="space-y-2 mb-4">
              {['Item damaged or defective', 'Wrong item delivered', 'Product not as described', 'Quality not satisfactory', 'No longer needed', 'Other'].map(r => (
                <label key={r} className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${returnReason === r ? 'border-purple-500 bg-purple-50' : 'border-line hover:border-purple-300'}`}>
                  <input type="radio" name="returnReason" value={r} checked={returnReason === r} onChange={() => setReturnReason(r)} className="accent-purple-600" />
                  <span className="text-sm text-ink">{r}</span>
                </label>
              ))}
            </div>
            {returnReason === 'Other' && (
              <textarea value={returnCustom} onChange={e => setReturnCustom(e.target.value)} placeholder="Please describe the issue..." className="w-full border border-line p-3 text-sm resize-none h-20 mb-4 focus:outline-none focus:border-purple-500" />
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowReturnModal(false)} className="flex-1 border border-line text-ink text-sm py-2.5 hover:bg-cream transition-colors">Keep Order</button>
              <button onClick={handleReturnOrder} disabled={actionLoading} className="flex-1 bg-purple-600 text-white text-sm py-2.5 hover:bg-purple-700 transition-colors disabled:opacity-50">
                {actionLoading ? 'Submitting...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
