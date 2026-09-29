"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Loader2, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import api from "../../../lib/api";
import { useStore } from "../../../store/useStore";
import { toast } from "sonner";
import Link from "next/link";

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const redirectUrl = searchParams.get("redirectUrl") || `/checkout/success?orderId=${orderId}`;
  
  const { user, setUser, _hasHydrated } = useStore();
  const [order, setOrder] = useState<any>(null);
  const [rzpKey, setRzpKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const hasAutoTriggeredRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const startPayment = async (orderData = order, keyData = rzpKey) => {
    const currentOrder = orderData || order;
    const currentKey = keyData || rzpKey;

    if (!currentOrder || !currentKey) {
      toast.error("Payment details not ready");
      return;
    }

    try {
      setPaymentLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !(window as any).Razorpay) {
        toast.error("Failed to load Razorpay payment gateway. Please check your internet connection.");
        setPaymentLoading(false);
        return;
      }

      const rzpRes = await api.post('/payments/create-order', { orderId: currentOrder.id });
      const razorpayOrder = rzpRes.data.data;

      const options = {
        key: currentKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "MoraMoments",
        description: `Order #${currentOrder.id.substring(0, 8)}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: currentOrder.id
            });
            toast.success("Payment successful!");
            router.push(redirectUrl);
          } catch (err) {
            console.error("Payment verification failed", err);
            toast.error("Payment verification failed. Please contact support.");
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: "#722F37" // wine color
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            toast.info("Payment window closed. Click below to complete your payment.");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setPaymentLoading(false);
        toast.error(response.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (e: any) {
      console.error("Payment initiation error", e);
      toast.error(e.response?.data?.message || "Failed to initiate payment");
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    const isStoreHydrated = _hasHydrated || (typeof window !== "undefined" && useStore.persist?.hasHydrated());
    if (!isStoreHydrated) {
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!user && !token) {
      router.push('/');
      return;
    }

    if (!user && token) {
      api.get("/users/me")
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          router.push('/');
        });
      return;
    }

    if (!orderId) {
      router.push('/account?tab=orders');
      return;
    }

    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        setFetchError(null);
        const [orderRes, rzpRes] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get('/payments/config')
        ]);
        
        const fetchedOrder = orderRes.data.data;
        if (fetchedOrder.status !== 'PENDING') {
          toast.info("This order has already been processed.");
          router.push(`/account/orders/${orderId}`);
          return;
        }

        const key = rzpRes.data.data.key_id;
        setOrder(fetchedOrder);
        setRzpKey(key);
        setLoading(false);

        // Auto-trigger Razorpay modal once order and key are loaded
        if (!hasAutoTriggeredRef.current) {
          hasAutoTriggeredRef.current = true;
          startPayment(fetchedOrder, key);
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || "Failed to load payment details";
        toast.error(errorMsg);
        setFetchError(errorMsg);
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, user, _hasHydrated, router, setUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory pt-24 pb-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-wine mx-auto mb-4" size={36} />
          <p className="font-serif text-lg text-ink">Preparing your payment gateway...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-ivory pt-32 pb-24 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white p-8 border border-line shadow-sm text-center">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-wine mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="font-serif text-2xl text-ink mb-2">Unable to Load Payment</h2>
          <p className="text-muted text-sm mb-6">{fetchError}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                hasFetchedRef.current = false;
                setLoading(true);
                setFetchError(null);
                api.get(`/orders/${orderId}`)
                  .then((orderRes) => {
                    return api.get('/payments/config').then((rzpRes) => {
                      setOrder(orderRes.data.data);
                      setRzpKey(rzpRes.data.data.key_id);
                      setLoading(false);
                      startPayment(orderRes.data.data, rzpRes.data.data.key_id);
                    });
                  })
                  .catch((e: any) => {
                    setFetchError(e.response?.data?.message || "Failed to reload payment details");
                    setLoading(false);
                  });
              }}
              className="flex-1 bg-wine text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-colors cursor-pointer"
            >
              Retry Payment
            </button>
            <Link
              href="/account?tab=orders"
              className="flex-1 border border-line text-ink py-3 text-xs uppercase tracking-widest font-bold hover:border-wine hover:text-wine transition-colors text-center inline-flex items-center justify-center"
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-ivory pt-32 pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="container mx-auto px-6 max-w-3xl">
        <Link href="/account?tab=orders" className="inline-flex items-center gap-2 text-wine mb-8 hover:underline text-sm font-medium">
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
        
        <div className="bg-white p-8 md:p-12 border border-line shadow-[0_10px_40px_rgba(0,0,0,0.03)] text-center">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-wine mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-serif text-3xl text-ink mb-2">Complete Your Payment</h1>
          <p className="text-muted mb-8">Order #{order.id.substring(0, 8)}</p>
          
          <div className="bg-ivory border border-line p-6 mb-8 text-left rounded-md max-h-[250px] overflow-y-auto">
            <h3 className="text-xs uppercase tracking-widest font-bold text-ink mb-4 border-b border-line pb-2">Order Summary</h3>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <img src={item.product?.images?.[0]?.imageUrl || '/placeholder.jpg'} alt="product" className="w-10 h-10 object-cover border border-line" />
                    <div>
                      <p className="font-medium text-ink line-clamp-1">{item.product?.name || 'Product'}</p>
                      <p className="text-muted text-xs">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-wine whitespace-nowrap">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center border-t border-line pt-6 mb-8 text-left">
            <span className="font-serif text-xl text-ink">Total Amount</span>
            <span className="font-serif text-3xl text-wine">₹{order.grandTotal.toLocaleString('en-IN')}</span>
          </div>
          
          <button 
            onClick={() => startPayment()}
            disabled={paymentLoading}
            className="w-full bg-wine text-white h-14 text-sm font-bold tracking-widest uppercase hover:bg-wine-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {paymentLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Opening Payment Gateway...</span>
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                <span>Pay ₹{order.grandTotal.toLocaleString('en-IN')} Now</span>
              </>
            )}
          </button>
          <p className="text-xs text-muted mt-4 flex items-center justify-center gap-1">
            <ShieldCheck size={12} /> Secure encrypted payment via Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory pt-24 pb-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-wine" size={32} />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
