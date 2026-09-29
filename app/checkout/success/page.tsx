"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import api from "../../../lib/api";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        // Fetch order details to confirm
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data.data);
      } catch (e) {
        console.error("Failed to fetch order", e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-cream rounded-full mb-4" />
          <div className="h-6 w-48 bg-cream rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-3xl text-wine mb-4">Order Not Found</h1>
        <p className="text-muted mb-8">We couldn't retrieve the details for this order.</p>
        <Link href="/" className="bg-wine text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-wine-dark transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="bg-white p-8 md:p-12 border border-line shadow-sm text-center">
          <div className="w-20 h-20 bg-wine/10 rounded-full flex items-center justify-center mx-auto mb-6 text-wine">
            <CheckCircle size={40} strokeWidth={1.5} />
          </div>
          
          <h1 className="font-serif text-4xl text-ink mb-4">Payment Successful!</h1>
          <p className="text-muted mb-3">Thank you for your purchase. Your order has been placed.</p>
          <div className="inline-flex items-center gap-2 bg-cream/60 border border-line px-4 py-2 rounded-full mb-12">
            <span className="text-xs uppercase tracking-wider text-muted font-bold">Order ID:</span>
            <span className="font-mono text-sm font-bold text-wine">{order.id}</span>
          </div>

          <div className="bg-cream/30 border border-line p-6 text-left mb-12 flex items-start gap-4">
            <Package className="text-wine mt-1 shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-ink mb-2">What happens next?</h3>
              <p className="text-sm text-muted leading-relaxed">
                We're getting your order ready to be shipped. We will notify you when it has been sent. You can track your order status live anytime using your Order ID.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={`/track-order?id=${encodeURIComponent(order.id)}`}
              className="w-full sm:w-auto bg-wine text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-wine-dark transition-colors flex items-center justify-center gap-2"
            >
              Track Order <ArrowRight size={16} />
            </Link>
            <Link 
              href="/account"
              className="w-full sm:w-auto border border-wine text-wine px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-wine hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              My Account
            </Link>
            <Link 
              href="/"
              className="w-full sm:w-auto bg-ink text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-ink/80 transition-colors flex items-center justify-center gap-2"
            >
              Continue Shopping <Home size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-cream rounded-full mb-4" />
          <div className="h-6 w-48 bg-cream rounded" />
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
