"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../store/useStore";
import api from "../../lib/api";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import Script from "next/script";
import Link from "next/link";
import { toast } from "sonner";
import AuthModal from "../components/AuthModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, user, setUser, clearCart, _hasHydrated } = useStore();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "", country: "India" });
  const [savingAddress, setSavingAddress] = useState(false);
  const hasInitializedRef = useRef(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  
  const [rzpKey, setRzpKey] = useState("");
  
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 50;
  const taxableAmount = subtotal - discount + shipping;
  const tax = taxableAmount * 0.18;
  const grandTotal = taxableAmount + tax;

  useEffect(() => {
    const isStoreHydrated = _hasHydrated || (typeof window !== "undefined" && useStore.persist?.hasHydrated());
    if (!isStoreHydrated) {
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!user && token) {
      api.get("/users/me")
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setSyncing(false);
        });
      return;
    }

    if (!user) {
      setSyncing(false);
      return;
    }

    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;
    
    const initializeCheckout = async () => {
      try {
        // Fetch User Addresses
        const addressRes = await api.get('/addresses');
        setAddresses(addressRes.data.data || []);
        if (addressRes.data.data?.length > 0) {
          setSelectedAddress(addressRes.data.data[0].id);
        }

        // Fetch Razorpay Key
        const rzpRes = await api.get('/payments/config');
        setRzpKey(rzpRes.data.data.key_id);
        // Sync local cart to DB with variant support
        if (cart.length > 0) {
          await api.post('/cart/sync', {
            items: cart.map(item => ({
              productId: item.productId || item.id,
              variantId: item.variantId || undefined,
              quantity: item.quantity
            }))
          }).catch(e => console.log('Cart sync error'));
        }
        
      } catch (e) {
        console.error("Failed to initialize checkout", e);
      } finally {
        setSyncing(false);
      }
    };

    initializeCheckout();
  }, [user, cart, _hasHydrated, router, setUser]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await api.post('/addresses', addressForm);
      const newAddress = res.data.data;
      setAddresses([...addresses, newAddress]);
      setSelectedAddress(newAddress.id);
      setShowAddressForm(false);
      setAddressForm({ fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "", country: "India" });
      toast.success("Address saved successfully!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save address. Please check all fields.");
    } finally {
      setSavingAddress(false);
    }
  };

  const applyCoupon = async () => {
    try {
      setCouponError("");
      const res = await api.post('/coupons/validate', { code: couponCode, orderValue: subtotal });
      setDiscount(res.data.data.discountAmount || 0);
    } catch (e: any) {
      setDiscount(0);
      setCouponError(e.response?.data?.message || "Invalid coupon");
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Create Order in backend
      const orderRes = await api.post('/orders', {
        addressId: selectedAddress,
        couponCode: discount > 0 ? couponCode : undefined
      });
      const order = orderRes.data.data;

      // 2. Redirect to Payment Page
      clearCart();
      router.push(`/checkout/payment?orderId=${order.id}`);

    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  if (syncing) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-wine mx-auto mb-4" size={48} />
          <p className="font-serif text-xl text-ink">Preparing your secure checkout...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ivory pt-24 pb-24 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white p-8 border border-line shadow-sm text-center">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-wine mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-serif text-2xl text-wine mb-2">Account Required</h1>
          <p className="text-muted text-sm mb-6">
            Please sign in or register to complete your order and save your delivery details securely.
          </p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full bg-wine text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-colors cursor-pointer"
          >
            Sign In / Register
          </button>
          <Link
            href="/shop"
            className="inline-block mt-4 text-xs text-muted hover:text-wine uppercase tracking-wider"
          >
            Continue Shopping
          </Link>
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-ivory pt-24 pb-24 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white p-8 border border-line shadow-sm text-center">
          <h1 className="font-serif text-2xl text-wine mb-2">Your Cart is Empty</h1>
          <p className="text-muted text-sm mb-6">
            Add some thoughtful gifts to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-block w-full bg-wine text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-colors"
          >
            Explore Gifts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-24 pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl text-wine mb-2">Secure Checkout</h1>
          <p className="text-sm text-muted flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> SSL Encrypted Payment
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Details */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white p-8 border border-line mb-8 shadow-sm">
              <h2 className="text-sm uppercase tracking-widest font-bold text-ink mb-6 border-b border-line pb-4">Shipping Address</h2>
              
              {addresses.length === 0 && !showAddressForm ? (
                <div className="text-center py-8">
                  <p className="text-muted mb-4">You don't have any addresses saved.</p>
                  <button onClick={() => setShowAddressForm(true)} className="inline-block border border-wine text-wine px-6 py-2 text-xs uppercase tracking-widest hover:bg-wine hover:text-white transition-colors">
                    Add New Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div 
                      key={address.id}
                      onClick={() => setSelectedAddress(address.id)}
                      className={`p-4 border cursor-pointer transition-colors ${
                        selectedAddress === address.id ? "border-wine bg-wine/5" : "border-line hover:border-wine/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedAddress === address.id ? "border-wine" : "border-muted"}`}>
                          {selectedAddress === address.id && <div className="w-2 h-2 rounded-full bg-wine" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-ink mb-1">{address.fullName}</p>
                          <p className="text-xs text-ink mb-1">{address.addressLine1}</p>
                          <p className="text-xs text-muted leading-relaxed">
                            {address.city}, {address.state} {address.pincode}
                          </p>
                          <p className="text-xs text-muted">Phone: {address.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {!showAddressForm && addresses.length > 0 && (
                    <button onClick={() => setShowAddressForm(true)} className="w-full py-4 border border-dashed border-wine text-wine text-xs uppercase tracking-widest font-bold hover:bg-wine/5 transition-colors mt-4">
                      + Add Another Address
                    </button>
                  )}

                  {showAddressForm && (
                    <form onSubmit={handleSaveAddress} className="bg-cream/30 p-6 border border-line mt-6 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-ink">New Address</h3>
                        {addresses.length > 0 && (
                          <button type="button" onClick={() => setShowAddressForm(false)} className="text-muted text-xs hover:text-wine uppercase tracking-widest">Cancel</button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Full Name</label>
                          <input required value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} className="w-full border border-line p-3 text-sm outline-none focus:border-wine" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Phone (10 digits)</label>
                          <input required value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full border border-line p-3 text-sm outline-none focus:border-wine" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Street Address</label>
                        <input required value={addressForm.addressLine1} onChange={e => setAddressForm({...addressForm, addressLine1: e.target.value})} className="w-full border border-line p-3 text-sm outline-none focus:border-wine" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">City</label>
                          <input required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full border border-line p-3 text-sm outline-none focus:border-wine" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">State</label>
                          <input required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full border border-line p-3 text-sm outline-none focus:border-wine" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Postal Code</label>
                          <input required value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-full border border-line p-3 text-sm outline-none focus:border-wine" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Country</label>
                          <input required value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} className="w-full border border-line p-3 text-sm outline-none focus:border-wine" />
                        </div>
                      </div>
                      <button type="submit" disabled={savingAddress} className="w-full bg-ink text-white px-6 py-3 text-xs uppercase tracking-widest font-bold mt-4 hover:bg-wine transition-colors">
                        {savingAddress ? "Saving..." : "Save & Use Address"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white p-8 border border-line shadow-[0_10px_40px_rgba(0,0,0,0.03)] sticky top-24">
              <h2 className="text-sm uppercase tracking-widest font-bold text-ink mb-6 border-b border-line pb-4">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-8 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-cream shrink-0 border border-line">
                      <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xs font-bold text-ink line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-muted mb-1">Qty: {item.quantity}</p>
                      <p className="text-xs text-wine font-bold">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6 flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Gift Card or Discount Code" 
                  className="flex-1 border border-line p-3 text-xs outline-none focus:border-wine"
                />
                <button 
                  onClick={applyCoupon}
                  className="bg-ink text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-wine transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs mb-6 -mt-4">{couponError}</p>}
              {discount > 0 && <p className="text-green-600 text-xs mb-6 -mt-4 flex items-center gap-1"><CheckCircle2 size={12}/> Coupon applied! You saved ₹{discount.toLocaleString('en-IN')}</p>}

              {/* Totals */}
              <div className="space-y-3 text-sm border-t border-line pt-6 mb-6">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-ink">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span className="text-ink">{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Estimated Tax (18%)</span>
                  <span className="text-ink">₹{tax.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-line pt-6 mb-8">
                <span className="font-serif text-xl text-ink">Total</span>
                <span className="font-serif text-2xl text-wine">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading || !selectedAddress}
                className="w-full bg-wine text-white h-14 text-sm font-bold tracking-widest uppercase hover:bg-wine-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
