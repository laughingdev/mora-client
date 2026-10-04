"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../lib/api';
import { useStore } from '../../../store/useStore';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const setUser = useStore((state) => state.setUser);
  const cart = useStore((state) => state.cart);
  const setCart = useStore((state) => state.setCart);

  const syncLocalCartToBackend = async () => {
    try {
      const res = await api.get('/cart');
      const backendItems = res.data?.data?.items || [];

      const mergedMap = new Map();
      backendItems.forEach((bi: any) => {
        const key = bi.variant?.id ? `${bi.product.id}-${bi.variant.id}` : bi.product.id;
        mergedMap.set(key, {
          productId: bi.product.id,
          variantId: bi.variant?.id || undefined,
          variantName: bi.variant?.name || undefined,
          name: bi.variant?.name ? `${bi.product.name} (${bi.variant.name})` : bi.product.name,
          price: bi.price,
          quantity: bi.quantity
        });
      });

      cart.forEach((li: any) => {
        const prodId = li.productId || li.id;
        const key = li.variantId ? `${prodId}-${li.variantId}` : prodId;
        if (mergedMap.has(key)) {
          mergedMap.get(key).quantity += li.quantity;
        } else {
          mergedMap.set(key, {
            productId: prodId,
            variantId: li.variantId || undefined,
            variantName: li.variantName || undefined,
            name: li.name,
            price: li.price,
            image: li.image,
            quantity: li.quantity
          });
        }
      });

      const mergedCart = Array.from(mergedMap.values());

      await api.post('/cart/sync', {
        items: mergedCart.map(item => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity
        }))
      });

      setCart(mergedCart.map(item => ({
        id: item.variantId ? `${item.productId}-${item.variantId}` : item.productId,
        productId: item.productId,
        variantId: item.variantId,
        variantName: item.variantName,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      })));
    } catch (e) {
      console.error('Failed to sync cart after Google login:', e);
    }
  };

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(decodeURIComponent(error));
        toast.error('Google Sign-In failed');
        return;
      }

      if (!token) {
        setStatus('error');
        setErrorMessage('Authentication token was not received from Google.');
        return;
      }

      try {
        localStorage.setItem('token', token);

        // Fetch fresh user profile
        const userRes = await api.get('/auth/me');
        const user = userRes.data?.data;

        if (user) {
          setUser(user);
        }

        // Sync shopping cart
        await syncLocalCartToBackend();

        setStatus('success');
        toast.success(`Welcome${user?.firstName ? `, ${user.firstName}` : ''}!`);

        // Redirect to intended page or home
        const returnUrl = sessionStorage.getItem('auth_return_url') || '/';
        sessionStorage.removeItem('auth_return_url');

        setTimeout(() => {
          router.replace(returnUrl);
        }, 600);
      } catch (err: any) {
        console.error('Auth verification error:', err);
        setStatus('error');
        setErrorMessage(err.response?.data?.message || err.message || 'Failed to complete Google Sign-In.');
      }
    };

    handleAuth();
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-ivory">
      <div className="max-w-md w-full p-8 bg-white border border-line shadow-xl text-center">
        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <Loader2 className="animate-spin text-wine mx-auto" size={40} />
            <h2 className="text-2xl font-serif text-wine">Signing you in...</h2>
            <p className="text-sm text-muted">Connecting with your Google account</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 space-y-4">
            <CheckCircle className="text-emerald-600 mx-auto" size={44} />
            <h2 className="text-2xl font-serif text-wine">Authenticated!</h2>
            <p className="text-sm text-muted">Redirecting you to Mora Moments...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 space-y-5">
            <AlertCircle className="text-rose-600 mx-auto" size={44} />
            <h2 className="text-2xl font-serif text-wine">Sign-In Failed</h2>
            <p className="text-sm text-muted">{errorMessage}</p>
            <button
              onClick={() => router.replace('/')}
              className="px-6 py-3 bg-wine text-white text-xs uppercase tracking-widest hover:bg-wine-dark transition-colors font-medium"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-ivory">
          <Loader2 className="animate-spin text-wine" size={32} />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
