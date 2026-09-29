"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, Heart, MapPin, LogOut, Settings, Plus, Trash2, Edit2, Loader2, CreditCard, Star } from "lucide-react";
import { useStore } from "../../store/useStore";
import api from "../../lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser, wishlist, removeFromWishlist, _hasHydrated } = useStore();
  const validTabs = ["profile", "orders", "addresses", "wishlist"];
  const currentTabParam = searchParams.get("tab");
  const initialTab = currentTabParam && validTabs.includes(currentTabParam) ? currentTabParam : "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab state whenever URL query params change (e.g. browser back/forward or header links)
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    const validTargetTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "profile";
    if (validTargetTab !== activeTab) {
      setActiveTab(validTargetTab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/account?tab=${tabId}`, { scroll: false });
  };
  
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rzpKey, setRzpKey] = useState("");
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  // Review State
  const [userReviews, setUserReviews] = useState<Record<string, any>>({});

  // Profile Form State
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "", country: "India" });
  const [savingAddress, setSavingAddress] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const isStoreHydrated = _hasHydrated || (typeof window !== "undefined" && useStore.persist?.hasHydrated());
    if (!isStoreHydrated) {
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      if (user) setUser(null);
      router.push("/");
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
          router.push("/");
        });
      return;
    }

    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || ""
      });

      if (hasFetchedRef.current) {
        return;
      }
      hasFetchedRef.current = true;

      const fetchData = async () => {
        try {
          const [ordersRes, addressRes, rzpRes, reviewsRes] = await Promise.all([
            api.get('/users/me/orders'),
            api.get('/addresses'),
            api.get('/payments/config'),
            api.get('/users/me/reviews').catch(() => ({ data: { data: [] } }))
          ]);
          setOrders(ordersRes.data.data || []);
          setAddresses(addressRes.data.data || []);
          setRzpKey(rzpRes.data.data.key_id);

          const reviewMap: Record<string, any> = {};
          if (reviewsRes.data?.data && Array.isArray(reviewsRes.data.data)) {
            reviewsRes.data.data.forEach((r: any) => {
              if (r.productId) reviewMap[r.productId] = r;
            });
          }
          setUserReviews(reviewMap);
        } catch (e: any) {
          console.error("Failed to fetch account data", e);
          if (e.response?.status === 401) {
            localStorage.removeItem("token");
            setUser(null);
            router.push("/");
            toast.error("Your session has expired. Please sign in again.");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user, _hasHydrated, router, setUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      const res = await api.patch('/users/me', profileForm);
      // We should ideally update the zustand store user here, but we'll assume it works
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      toast.success("Profile updated successfully");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await api.post('/addresses', addressForm);
      setAddresses([...addresses, res.data.data]);
      setShowAddressForm(false);
      setAddressForm({ fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "", country: "India" });
      toast.success("Address saved successfully");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(addresses.filter(a => a.id !== id));
      toast.success("Address deleted successfully");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete address");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const handleRetryPayment = (order: any) => {
    router.push(`/checkout/payment?orderId=${order.id}&redirectUrl=/account?tab=orders`);
  };

  if (!user || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-ivory">
        <Loader2 className="animate-spin text-wine" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "orders", label: "Order History", icon: Package },
    { id: "addresses", label: "Saved Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-ivory py-12 md:py-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white p-6 border border-line shadow-sm mb-6">
              <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-wine mx-auto mb-4">
                <User size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-center font-serif text-xl text-ink mb-1">{user.firstName} {user.lastName}</h2>
              <p className="text-center text-xs text-muted mb-6">{user.email}</p>
              
              <nav className="flex flex-col gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      activeTab === tab.id 
                        ? "bg-wine text-white font-medium" 
                        : "text-ink hover:bg-cream"
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 mt-4 border-t border-line transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 border border-line shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-8 border-b border-line pb-4">
                    <Settings className="text-wine" size={24} />
                    <h2 className="font-serif text-2xl text-ink">Account Settings</h2>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="max-w-md space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">First Name</label>
                        <input 
                          type="text" 
                          value={profileForm.firstName}
                          onChange={e => setProfileForm({...profileForm, firstName: e.target.value})}
                          className="w-full border border-line p-3 text-sm outline-none focus:border-wine"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Last Name</label>
                        <input 
                          type="text" 
                          value={profileForm.lastName}
                          onChange={e => setProfileForm({...profileForm, lastName: e.target.value})}
                          className="w-full border border-line p-3 text-sm outline-none focus:border-wine"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Email Address (Read-only)</label>
                      <input 
                        type="email" 
                        value={user.email}
                        readOnly
                        className="w-full border border-line p-3 text-sm bg-cream/50 text-muted cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-muted mb-2 font-medium">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profileForm.phone}
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full border border-line p-3 text-sm outline-none focus:border-wine"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={updatingProfile}
                        className="bg-wine text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-colors disabled:opacity-70"
                      >
                        {updatingProfile ? "Saving..." : "Save Changes"}
                      </button>
                      {profileSuccess && <span className="ml-4 text-green-600 text-sm">Profile updated successfully!</span>}
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 border border-line shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-8 border-b border-line pb-4">
                    <Package className="text-wine" size={24} />
                    <h2 className="font-serif text-2xl text-ink">Order History</h2>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={48} className="text-muted/30 mx-auto mb-4" />
                      <p className="text-muted mb-6">You haven't placed any orders yet.</p>
                      <Link href="/shop" className="text-wine underline underline-offset-4">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <div key={order.id} className="border border-line p-6 hover:border-wine/30 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-line pb-4">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-muted font-bold">
                                Order #{order.id.startsWith('MM-') ? order.id : order.id.substring(0,8)}
                              </p>
                              <p className="text-sm text-ink mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-widest text-muted font-bold">Total</p>
                                <p className="text-sm text-wine font-bold">₹{order.grandTotal.toLocaleString('en-IN')}</p>
                              </div>
                              <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted">Items: {order.items?.length || 0}</p>
                            <div className="flex gap-4 items-center">
                              {order.status === 'PENDING' && (
                                <button 
                                  onClick={() => handleRetryPayment(order)}
                                  disabled={paymentLoading === order.id}
                                  className="text-xs font-bold uppercase tracking-widest text-white bg-wine px-4 py-2 hover:bg-wine-dark transition-colors disabled:opacity-50"
                                >
                                  {paymentLoading === order.id ? "Processing..." : "Pay Now"}
                                </button>
                              )}
                              <Link 
                                href={`/track-order?id=${encodeURIComponent(order.id)}`} 
                                className="text-xs font-bold uppercase tracking-widest text-muted hover:text-wine transition-colors"
                              >
                                Track
                              </Link>
                              <Link href={`/account/orders/${order.id}`} className="text-xs font-bold uppercase tracking-widest text-wine border-b border-wine pb-0.5">
                                View Details
                              </Link>
                            </div>
                          </div>

                          {/* Delivered Items Review Quick Section */}
                          {order.status === 'DELIVERED' && order.items && order.items.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-line/60 space-y-3">
                              <p className="text-[11px] uppercase tracking-wider font-bold text-wine flex items-center gap-1.5">
                                <Star size={13} className="fill-amber-400 text-amber-400" />
                                Rate & Review Delivered Items (Photos & Videos enabled):
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {order.items.map((item: any) => {
                                  const prodId = item.productId || item.product?.id;
                                  const itemReview = prodId ? userReviews[prodId] : null;
                                  const prodName = item.product?.name || item.productName || 'Gift Item';
                                  const prodImg = item.product?.images?.[0]?.imageUrl || item.imageUrl || '/placeholder.jpg';

                                  return (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-cream/40 border border-line/70 rounded">
                                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                        <div className="w-10 h-10 bg-cream border border-line shrink-0 overflow-hidden rounded">
                                          <img src={prodImg} alt={prodName} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold text-ink truncate">{prodName}</p>
                                          <p className="text-[10px] text-muted">₹{item.price.toLocaleString('en-IN')}</p>
                                        </div>
                                      </div>
                                      
                                      {prodId && (
                                        itemReview ? (
                                          <Link
                                            href={`/account/orders/${order.id}/review?productId=${encodeURIComponent(prodId)}`}
                                            className="text-[11px] font-semibold text-wine bg-wine/10 hover:bg-wine hover:text-white px-2.5 py-1.5 rounded transition-colors whitespace-nowrap flex items-center gap-1"
                                          >
                                            <Star size={12} className="fill-amber-400 text-amber-400" />
                                            <span>{itemReview.rating}★ Edit</span>
                                          </Link>
                                        ) : (
                                          <Link
                                            href={`/account/orders/${order.id}/review?productId=${encodeURIComponent(prodId)}`}
                                            className="text-[11px] font-bold text-white bg-wine hover:bg-wine-dark px-3 py-1.5 rounded transition-colors whitespace-nowrap shadow-sm flex items-center gap-1"
                                          >
                                            <Star size={12} className="fill-white" />
                                            <span>Review</span>
                                          </Link>
                                        )
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 border border-line shadow-sm"
                >
                  <div className="flex items-center justify-between mb-8 border-b border-line pb-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-wine" size={24} />
                      <h2 className="font-serif text-2xl text-ink">Saved Addresses</h2>
                    </div>
                    <button 
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="flex items-center gap-2 text-wine text-xs uppercase tracking-widest font-bold"
                    >
                      {showAddressForm ? "Cancel" : <><Plus size={16} /> Add New</>}
                    </button>
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleSaveAddress} className="bg-cream/30 p-6 border border-line mb-8 space-y-4">
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
                      <button type="submit" disabled={savingAddress} className="bg-ink text-white px-6 py-3 text-xs uppercase tracking-widest font-bold mt-4 hover:bg-wine transition-colors">
                        {savingAddress ? "Saving..." : "Save Address"}
                      </button>
                    </form>
                  )}

                  {addresses.length === 0 && !showAddressForm ? (
                    <div className="text-center py-12">
                      <MapPin size={48} className="text-muted/30 mx-auto mb-4" />
                      <p className="text-muted">You have no saved addresses.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map(address => (
                        <div key={address.id} className="border border-line p-6 relative group">
                          <button onClick={() => handleDeleteAddress(address.id)} className="absolute top-4 right-4 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                          </button>
                          <h4 className="font-bold text-sm text-ink mb-2">{address.fullName}</h4>
                          <p className="text-sm text-muted leading-relaxed">
                            {address.addressLine1}<br/>
                            {address.city}, {address.state} {address.pincode}<br/>
                            {address.country}<br/>
                            Phone: {address.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === "wishlist" && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 border border-line shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-8 border-b border-line pb-4">
                    <Heart className="text-wine" size={24} />
                    <h2 className="font-serif text-2xl text-ink">My Wishlist</h2>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart size={48} className="text-muted/30 mx-auto mb-4" />
                      <p className="text-muted mb-6">Your wishlist is empty.</p>
                      <Link href="/shop" className="text-wine underline underline-offset-4">Find something you love</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map(item => (
                        <div key={item.id} className="border border-line relative group">
                          <button 
                            onClick={() => removeFromWishlist(item.id)}
                            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 z-10 shadow-sm hover:scale-110 transition-transform"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="aspect-square bg-cream relative">
                            <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover opacity-90" />
                          </div>
                          <div className="p-4 bg-white">
                            <h4 className="font-serif text-lg line-clamp-1 mb-1">{item.name}</h4>
                            <div className="flex items-baseline gap-2 mb-4 flex-wrap">
                              <span className="text-wine font-bold text-sm">₹{item.price.toLocaleString('en-IN')}</span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <>
                                  <span className="line-through text-muted/70 text-xs">
                                    ₹{item.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                                    Save ₹{(item.originalPrice - item.price).toLocaleString('en-IN')}
                                  </span>
                                </>
                              )}
                            </div>
                            <Link 
                              href={`/shop`} 
                              className="block text-center w-full bg-ink text-white py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-wine transition-colors"
                            >
                              View Product
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>


    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center bg-ivory">
        <Loader2 className="animate-spin text-wine" size={32} />
      </div>
    }>
      <AccountContent />
    </Suspense>
  );
}
