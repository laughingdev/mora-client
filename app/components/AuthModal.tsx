"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { useStore } from '../../store/useStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  // Email Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      console.log('Failed to sync cart after login:', e);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setLoading(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_return_url', window.location.pathname + window.location.search);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      window.location.href = `${apiUrl}/auth/google`;
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'signin') {
        const response = await api.post('/auth/email/login', { email, password });
        const { tokens, user } = response.data.data;

        if (typeof window !== 'undefined' && tokens?.accessToken) {
          localStorage.setItem('token', tokens.accessToken);
        }
        setUser(user);
        await syncLocalCartToBackend();
        toast.success(`Welcome back${user.firstName ? `, ${user.firstName}` : ''}!`);
        onClose();
      } else {
        const response = await api.post('/auth/email/register', {
          email,
          password,
          firstName,
          lastName
        });
        const { tokens, user } = response.data.data;

        if (typeof window !== 'undefined' && tokens?.accessToken) {
          localStorage.setItem('token', tokens.accessToken);
        }
        setUser(user);
        await syncLocalCartToBackend();
        toast.success(`Account created! Welcome to Mora Moments.`);
        onClose();
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[110] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="pointer-events-auto bg-[#fffaf4] border border-line shadow-2xl w-full max-w-md p-8 sm:p-9 relative overflow-hidden rounded-xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted hover:text-wine transition-colors p-1.5 rounded-full hover:bg-cream/40"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-block mb-2">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-muted font-medium">Mora Moments</span>
                </div>
                <h2 className="text-3xl font-serif text-wine mb-2">
                  {showEmailForm
                    ? authMode === 'signin' ? 'Sign In' : 'Create Account'
                    : 'Welcome'
                  }
                </h2>
                <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-xs mx-auto">
                  {showEmailForm
                    ? authMode === 'signin'
                      ? 'Enter your email and password to access your account'
                      : 'Create your account to track orders and save bespoke gift boxes'
                    : 'Sign in to access your curated hampers, order tracking, and member privileges'
                  }
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center rounded-lg">
                  {error}
                </div>
              )}

              {/* Primary Action: Google Login */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3.5 bg-white hover:bg-[#fbfbfb] text-ink border border-[#dadce0] hover:border-[#b4b7ba] px-5 py-3.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {/* Official Google Icon */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="tracking-wide">Continue with Google</span>
                  {loading && <Loader2 className="animate-spin text-muted" size={16} />}
                </button>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-line" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-muted">
                    <span className="bg-[#fffaf4] px-3 font-medium">Or continue with Email</span>
                  </div>
                </div>

                {/* Toggle Email Form Button */}
                {!showEmailForm ? (
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    className="w-full bg-cream/50 hover:bg-cream/90 text-wine border border-line py-3 text-xs uppercase tracking-widest transition-colors font-medium rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail size={15} />
                    <span>Sign in with Email & Password</span>
                  </button>
                ) : (
                  /* Email Form */
                  <form onSubmit={handleEmailAuth} className="space-y-3.5">
                    {authMode === 'signup' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted mb-1 font-medium">
                            First Name
                          </label>
                          <div className="relative flex items-center bg-white border border-line focus-within:border-wine rounded-md transition-colors">
                            <UserIcon size={14} className="ml-3 text-muted" />
                            <input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="First name"
                              className="w-full p-2.5 outline-none text-ink bg-transparent text-xs"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted mb-1 font-medium">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last name"
                            className="w-full p-2.5 bg-white border border-line focus:border-wine outline-none text-ink text-xs rounded-md transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted mb-1 font-medium">
                        Email Address
                      </label>
                      <div className="relative flex items-center bg-white border border-line focus-within:border-wine rounded-md transition-colors">
                        <Mail size={14} className="ml-3 text-muted" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full p-2.5 outline-none text-ink bg-transparent text-xs"
                          required
                          autoFocus={showEmailForm}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted mb-1 font-medium">
                        Password
                      </label>
                      <div className="relative flex items-center bg-white border border-line focus-within:border-wine rounded-md transition-colors">
                        <Lock size={14} className="ml-3 text-muted" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-2.5 outline-none text-ink bg-transparent text-xs"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email || !password}
                      className="w-full bg-wine text-white py-3 mt-1 text-xs uppercase tracking-widest hover:bg-wine-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium rounded-md shadow cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={15} />
                      ) : (
                        <>
                          <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>

                    {/* Mode Toggle (Sign In <-> Sign Up) */}
                    <div className="flex items-center justify-between pt-2 text-[11px] text-muted">
                      <span>
                        {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                        className="text-wine font-medium underline hover:text-wine-dark transition-colors cursor-pointer"
                      >
                        {authMode === 'signin' ? 'Create an account' : 'Sign in'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Bottom Security Note */}
              <div className="text-center mt-6 pt-4 border-t border-line/60">
                <p className="text-[10px] text-muted leading-relaxed">
                  By continuing, you agree to Mora Moments{' '}
                  <a href="/policies" className="underline hover:text-wine">Terms of Service</a> &{' '}
                  <a href="/policies" className="underline hover:text-wine">Privacy Policy</a>.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
