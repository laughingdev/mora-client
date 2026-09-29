"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { useStore } from '../../store/useStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '' });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useStore((state) => state.setUser);
  const cart = useStore((state) => state.cart);
  const setCart = useStore((state) => state.setCart);

  const syncLocalCartToBackend = async () => {
    try {
      // 1. Fetch DB cart first
      const res = await api.get('/cart');
      const backendItems = res.data?.data?.items || [];
      
      // 2. Merge local cart into DB cart
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
      
      // 3. Sync merged cart back to backend (this overwrites DB with merged result)
      await api.post('/cart/sync', {
        items: mergedCart.map(item => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity
        }))
      });
      
      // 4. Update local store
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
      console.log('Failed to sync cart after login');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setStep('otp');
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });
      const { tokens, user, nextStep } = response.data.data;
      
      if (typeof window !== 'undefined' && tokens?.accessToken) {
        localStorage.setItem('token', tokens.accessToken);
      }
      setUser(user);
      
      if (nextStep === 'COMPLETE_PROFILE' || !user.isProfileComplete) {
        setStep('profile');
      } else {
        await syncLocalCartToBackend();
        onClose();
        setTimeout(() => {
          setStep('phone');
          setPhone('');
          setOtp('');
        }, 500);
      }
    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      setError(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/complete-profile', profileForm);
      setUser(response.data.data);
      await syncLocalCartToBackend();
      onClose();
      setTimeout(() => {
        setStep('phone');
        setPhone('');
        setOtp('');
        setProfileForm({ firstName: '', lastName: '', email: '' });
      }, 500);
    } catch (err: any) {
      console.error('Complete Profile Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[110] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="pointer-events-auto bg-ivory border border-line shadow-2xl w-full max-w-md p-8 relative overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted hover:text-wine transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif text-wine mb-2">
                  {step === 'phone' ? 'Welcome' : step === 'otp' ? 'Enter OTP' : 'Complete Profile'}
                </h2>
                <p className="text-sm text-muted">
                  {step === 'phone'
                    ? 'Enter your phone number to sign in or create an account'
                    : step === 'otp'
                    ? `We sent a code to +91 ${phone}`
                    : 'Please tell us a bit more about yourself'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-blush/30 border border-blush text-wine text-sm text-center">
                  {error}
                </div>
              )}

              {step === 'phone' && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">
                      Phone Number
                    </label>
                    <div className="flex bg-white border border-line focus-within:border-wine transition-colors">
                      <span className="flex items-center px-4 text-muted bg-cream/30 border-r border-line text-sm font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full p-3 outline-none text-ink bg-transparent text-sm"
                        placeholder="Enter 10 digit number"
                        autoFocus
                        required
                        pattern="[0-9]{10}"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={phone.length !== 10 || loading}
                    className="w-full bg-wine text-[#fff6ee] py-4 text-xs uppercase tracking-widest hover:bg-wine-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Continue'}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 text-center font-medium">
                      One Time Password
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full p-4 text-center text-2xl tracking-[0.5em] border border-line bg-white focus:border-wine outline-none transition-colors"
                      placeholder="••••••"
                      autoFocus
                      required
                      pattern="[0-9]{4,6}"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={otp.length < 4 || loading}
                    className="w-full bg-wine text-[#fff6ee] py-4 text-xs uppercase tracking-widest hover:bg-wine-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Verify'}
                  </button>
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-[11px] uppercase tracking-widest text-muted hover:text-wine transition-colors font-medium relative after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-wine after:left-0 after:-bottom-1 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </form>
              )}

              {step === 'profile' && (
                <form onSubmit={handleCompleteProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">First Name</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                        className="w-full p-3 bg-white border border-line focus:border-wine outline-none text-sm transition-colors"
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Last Name</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                        className="w-full p-3 bg-white border border-line focus:border-wine outline-none text-sm transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full p-3 bg-white border border-line focus:border-wine outline-none text-sm transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!profileForm.firstName || loading}
                    className="w-full bg-wine text-[#fff6ee] py-4 mt-2 text-xs uppercase tracking-widest hover:bg-wine-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save & Continue'}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
