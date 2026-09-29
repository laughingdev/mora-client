"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Gift, 
  Mail, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  ShieldCheck, 
  Heart, 
  Info, 
  Loader2, 
  CheckCircle2, 
  Edit3, 
  Package, 
  MapPin, 
  Search
} from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";
import { useStore } from "../../store/useStore";
import AuthModal from "../components/AuthModal";

export default function BuilderClient() {
  const router = useRouter();
  const { user, addToCart } = useStore();

  // Builder steps: 1: Box, 2: Items, 3: Card, 4: Personalize, 5: Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Data sources
  const [boxes, setBoxes] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Selected State
  const [selectedBox, setSelectedBox] = useState<any | null>(null);
  // Map of productId -> { product, quantity }
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: { product: any; quantity: number } }>({});
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  
  // Personalization State
  const [personalization, setPersonalization] = useState({
    cardType: 'handwritten', // 'handwritten' | 'typed'
    recipientName: '',
    cardMessage: '',
    senderName: '',
    specialInstructions: ''
  });

  // Category filter & search for Step 2
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Checkout / Address state for Step 5
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Load Boxes, Cards, Products, Categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingInitial(true);
        const [boxRes, cardRes, prodRes, catRes] = await Promise.all([
          api.get('/boxes?active=true'),
          api.get('/cards?active=true'),
          api.get('/products?active=true&customizable=true&limit=100'),
          api.get('/categories')
        ]);

        const loadedBoxes = boxRes.data?.data || [];
        setBoxes(loadedBoxes);
        if (loadedBoxes.length > 0) {
          setSelectedBox(loadedBoxes[0]);
        }

        const loadedCards = cardRes.data?.data || [];
        setCards(loadedCards);
        if (loadedCards.length > 0) {
          setSelectedCard(loadedCards[0]);
          setPersonalization(p => ({
            ...p,
            cardType: loadedCards[0].type === 'typed' ? 'typed' : 'handwritten'
          }));
        }

        setProducts(prodRes.data?.data || []);
        setCategories(catRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load builder data', err);
        toast.error('Unable to load gift builder options. Please refresh.');
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchData();
  }, []);

  // Fetch addresses when entering Step 5 if user is logged in
  useEffect(() => {
    if (user && currentStep === 5) {
      api.get('/addresses')
        .then(res => {
          const list = res.data?.data || [];
          setAddresses(list);
          if (list.length > 0 && !selectedAddressId) {
            setSelectedAddressId(list[0].id);
          }
        })
        .catch(err => console.log('Failed to fetch addresses', err));
    }
  }, [user, currentStep, selectedAddressId]);

  // Total items currently selected in the box
  const totalItemCount = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  // Financial calculations
  const boxPrice = selectedBox?.price || 0;
  const cardPrice = selectedCard?.price || 0;
  const itemsSubtotal = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  }, [selectedItems]);

  const hamperSubtotal = boxPrice + cardPrice + itemsSubtotal;
  const shippingCharge = hamperSubtotal > 1000 ? 0 : 50;
  const tax = hamperSubtotal * 0.18;
  const grandTotal = hamperSubtotal + shippingCharge + tax;

  // Min and max items from chosen box
  const minItems = selectedBox?.minItems || 1;
  const maxItems = selectedBox?.maxItems || 6;
  const isCapacityValid = totalItemCount >= minItems && totalItemCount <= maxItems;

  // Add Item to Hamper
  const handleAddItem = (product: any) => {
    if (totalItemCount >= maxItems) {
      toast.error(`Your chosen box can hold up to ${maxItems} items. Remove an item or upgrade box.`);
      return;
    }

    setSelectedItems(prev => {
      const existing = prev[product.id];
      const newQty = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [product.id]: { product, quantity: newQty }
      };
    });
  };

  // Remove / Decrement Item
  const handleRemoveItem = (productId: string) => {
    setSelectedItems(prev => {
      const existing = prev[productId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return {
        ...prev,
        [productId]: { ...existing, quantity: existing.quantity - 1 }
      };
    });
  };

  // Filtered products in Step 2
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchQuery.trim() || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || 
        p.categoryId === selectedCategory || 
        (p.categories && p.categories.some((c: any) => c.id === selectedCategory));

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Save new address inline
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill in all required address fields.');
      return;
    }

    setSavingAddress(true);
    try {
      const res = await api.post('/addresses', newAddress);
      const created = res.data?.data;
      setAddresses(prev => [created, ...prev]);
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
      toast.success('Address saved successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Place Order Directly & Proceed to Payment
  const handleCreateOrder = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (!selectedAddressId) {
      toast.error('Please select or add a shipping address.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const customItemsList = Object.values(selectedItems).map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.salePrice || item.product.price,
        quantity: item.quantity,
        sku: item.product.sku,
        image: item.product.images?.[0]?.imageUrl || ''
      }));

      const customizationPayload = {
        box: {
          id: selectedBox.id,
          name: selectedBox.name,
          price: selectedBox.price,
          images: selectedBox.images,
          minItems: selectedBox.minItems,
          maxItems: selectedBox.maxItems
        },
        card: {
          id: selectedCard.id,
          name: selectedCard.name,
          price: selectedCard.price,
          type: selectedCard.type,
          images: selectedCard.images
        },
        cardType: personalization.cardType,
        recipientName: personalization.recipientName,
        cardMessage: personalization.cardMessage,
        senderName: personalization.senderName,
        specialInstructions: personalization.specialInstructions,
        customItems: customItemsList
      };

      // 1. Sync custom items into DB cart with full variant/product support
      await api.post('/cart/sync', {
        items: customItemsList.map(ci => ({
          productId: ci.id,
          quantity: ci.quantity
        }))
      });

      // 2. Create the order with customizationDetails and isCustomHamper
      const orderRes = await api.post('/orders', {
        addressId: selectedAddressId,
        isCustomHamper: true,
        customizationDetails: customizationPayload
      });

      const order = orderRes.data?.data;
      toast.success('Custom Hamper created! Redirecting to payment...');
      
      // Navigate straight to existing payment screen
      router.push(`/checkout/payment?orderId=${order.id}`);
    } catch (err: any) {
      console.error('Order creation error', err);
      toast.error(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Add custom hamper bundle to cart
  const handleAddHamperToCart = () => {
    if (!selectedBox || !selectedCard) return;

    const customItemsList = Object.values(selectedItems).map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.salePrice || item.product.price
    }));

    const hamperCartItem = {
      id: `custom-hamper-${Date.now()}`,
      productId: Object.keys(selectedItems)[0] || selectedBox.id,
      name: `Custom Hamper: ${selectedBox.name}`,
      price: hamperSubtotal,
      quantity: 1,
      image: selectedBox.images?.[0] || '/placeholder.jpg'
    };

    addToCart(hamperCartItem);
    toast.success('Custom hamper added to your bag!');
  };

  if (loadingInitial) {
    return (
      <div className="min-h-[70vh] bg-ivory flex flex-col items-center justify-center py-20 px-6">
        <Loader2 className="animate-spin text-wine mb-4" size={44} />
        <h2 className="font-serif text-2xl text-wine">Opening Custom Hamper Studio...</h2>
        <p className="text-muted text-sm mt-2">Gathering handcrafted boxes and artisan cards</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-24 pb-28 text-ink selection:bg-wine selection:text-white">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Hero Studio Banner */}
      <div className="container mx-auto px-6 md:px-12 max-w-6xl mb-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wine/10 text-wine text-xs uppercase tracking-widest font-bold mb-3">
            <Sparkles size={14} /> Bespoke Gifting Studio
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-wine mb-3">
            Build Your Custom Hamper
          </h1>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            Craft a one-of-a-kind gift experience in 5 simple steps: select your luxury box, curate thoughtful items, personalize an artisan greeting card, and let our craft team hand-package it with love.
          </p>
        </div>

        {/* Stepper Navigation */}
        <div className="mt-10 border-y border-line bg-white/70 backdrop-blur-sm shadow-sm py-4 px-4 md:px-8 rounded-xl flex items-center justify-between overflow-x-auto gap-4">
          {[
            { step: 1, label: "1. Choose Box", icon: Gift },
            { step: 2, label: `2. Select Items (${totalItemCount}/${maxItems})`, icon: Package },
            { step: 3, label: "3. Pick Card", icon: Mail },
            { step: 4, label: "4. Personalize", icon: Edit3 },
            { step: 5, label: "5. Review & Order", icon: CheckCircle2 }
          ].map(s => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <button
                key={s.step}
                onClick={() => {
                  if (s.step === 2 && !selectedBox) return toast.error("Please choose a box first");
                  if (s.step >= 3 && !isCapacityValid) return toast.error(`Please select between ${minItems} and ${maxItems} items`);
                  if (s.step >= 4 && !selectedCard) return toast.error("Please select a greeting card");
                  setCurrentStep(s.step as any);
                }}
                className={`flex items-center gap-2.5 text-xs md:text-sm font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer px-3 py-1.5 rounded-lg ${
                  isActive 
                    ? "bg-wine text-white font-bold shadow-sm" 
                    : isCompleted 
                    ? "text-wine hover:bg-wine/5 font-semibold" 
                    : "text-muted hover:text-ink opacity-70"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isActive ? "bg-white text-wine font-bold" : isCompleted ? "bg-wine/20 text-wine" : "bg-line text-muted"
                }`}>
                  {isCompleted ? <Check size={12} /> : s.step}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        {/* STEP 1: CHOOSE BOX */}
        {currentStep === 1 && (
          <div className="fade-in">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-wine">Step 1: Select Your Hamper Box</h2>
                <p className="text-muted text-sm mt-1">
                  Each box is crafted with premium finishes and includes tissue bedding, satin ribbons, and protective luxury packaging.
                </p>
              </div>
              {selectedBox && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-wine text-white px-6 py-3 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-all flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
                >
                  Continue to Items <ArrowRight size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {boxes.map((box) => {
                const isSelected = selectedBox?.id === box.id;
                return (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBox(box)}
                    className={`bg-white rounded-2xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col group ${
                      isSelected
                        ? "border-wine shadow-lg ring-2 ring-wine/20"
                        : "border-line hover:border-wine/40 hover:shadow-md"
                    }`}
                  >
                    <div className="relative h-64 bg-cream overflow-hidden">
                      {box.images && box.images.length > 0 ? (
                        <img
                          src={box.images[0]}
                          alt={box.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <Gift size={48} />
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-wine text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                          Fits {box.minItems} – {box.maxItems} items
                        </span>
                      </div>

                      <div className="absolute top-4 right-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${
                          box.price > 0 ? "bg-wine text-white" : "bg-emerald-600 text-white"
                        }`}>
                          {box.price > 0 ? `+₹${box.price}` : "FREE WITH HAMPER"}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-wine text-white flex items-center justify-center shadow-lg">
                          <Check size={20} />
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-xl text-ink font-bold group-hover:text-wine transition-colors">
                          {box.name}
                        </h3>
                        <p className="text-muted text-xs leading-relaxed mt-2">
                          {box.description || "Artisanal gift box designed to make an unforgettable first impression."}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                        <span className="text-xs text-muted font-medium">
                          Suitable for {box.minItems} to {box.maxItems} gifts
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? "text-wine" : "text-muted group-hover:text-wine"
                        }`}>
                          {isSelected ? "Selected ✓" : "Select This Box"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE CUSTOMIZABLE ITEMS */}
        {currentStep === 2 && (
          <div className="fade-in">
            {/* Box Capacity Tracker Banner */}
            <div className="bg-white border border-line rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-cream border border-line overflow-hidden shrink-0">
                  {selectedBox?.images?.[0] ? (
                    <img src={selectedBox.images[0]} alt={selectedBox.name} className="w-full h-full object-cover" />
                  ) : (
                    <Gift size={24} className="m-auto text-wine" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted uppercase tracking-widest font-semibold">Current Vessel</div>
                  <h3 className="font-serif text-lg text-wine font-bold">{selectedBox?.name}</h3>
                  <div className="text-xs text-muted mt-0.5">
                    Requires at least <strong>{minItems}</strong> items (maximum <strong>{maxItems}</strong>)
                  </div>
                </div>
              </div>

              {/* Progress meter */}
              <div className="flex-1 max-w-md">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-ink">
                    Capacity: {totalItemCount} of {maxItems} items selected
                  </span>
                  <span className={`font-bold ${
                    totalItemCount < minItems ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {totalItemCount < minItems 
                      ? `Add ${minItems - totalItemCount} more item(s)` 
                      : totalItemCount === maxItems 
                      ? "Box is Full ✓" 
                      : "Ready to proceed ✓"}
                  </span>
                </div>
                <div className="w-full h-3 bg-cream rounded-full overflow-hidden border border-line">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      totalItemCount < minItems ? "bg-amber-500" : "bg-emerald-600"
                    }`}
                    style={{ width: `${Math.min(100, (totalItemCount / maxItems) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-lg border border-line text-xs uppercase tracking-wider font-semibold hover:border-wine transition-colors cursor-pointer"
                >
                  Change Box
                </button>
                <button
                  onClick={() => {
                    if (!isCapacityValid) {
                      toast.error(`Please select at least ${minItems} items to fill this box.`);
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  disabled={!isCapacityValid}
                  className="bg-wine text-white px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  Next: Pick Card <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === 'all'
                      ? "bg-wine text-white"
                      : "bg-white border border-line text-muted hover:text-ink"
                  }`}
                >
                  All Items ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-wine text-white"
                        : "bg-white border border-line text-muted hover:text-ink"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-line rounded-full pl-10 pr-4 py-2 text-xs outline-none focus:border-wine transition-colors"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const selectedInfo = selectedItems[product.id];
                const qty = selectedInfo?.quantity || 0;
                const price = product.salePrice || product.price;

                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-xl border overflow-hidden flex flex-col transition-all ${
                      qty > 0 ? "border-wine ring-2 ring-wine/10 shadow-md" : "border-line hover:border-wine/40"
                    }`}
                  >
                    <div className="relative aspect-square bg-cream overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
                      )}

                      {qty > 0 && (
                        <div className="absolute top-3 right-3 bg-wine text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                          {qty}
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] text-muted uppercase tracking-wider">
                          {product.category?.name || "Artisan Gift"}
                        </div>
                        <h4 className="font-medium text-sm text-ink line-clamp-1 mt-0.5" title={product.name}>
                          {product.name}
                        </h4>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-bold text-wine text-sm">₹{price.toLocaleString('en-IN')}</span>
                          {product.salePrice && product.price > product.salePrice && (
                            <span className="text-muted line-through text-xs">₹{product.price.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-line">
                        {qty === 0 ? (
                          <button
                            onClick={() => handleAddItem(product)}
                            className="w-full bg-cream hover:bg-wine hover:text-white text-ink text-xs uppercase tracking-wider font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus size={14} /> Add to Box
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-cream rounded-lg p-1 border border-line">
                            <button
                              onClick={() => handleRemoveItem(product.id)}
                              className="w-7 h-7 rounded bg-white text-ink flex items-center justify-center hover:bg-wine hover:text-white transition-colors cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-bold text-ink px-2">{qty} in box</span>
                            <button
                              onClick={() => handleAddItem(product)}
                              className="w-7 h-7 rounded bg-white text-ink flex items-center justify-center hover:bg-wine hover:text-white transition-colors cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white border border-line rounded-2xl">
                  <Package size={40} className="mx-auto text-muted mb-2" />
                  <h4 className="font-serif text-lg text-ink">No customizable items found</h4>
                  <p className="text-muted text-xs mt-1">Try clearing your search query or choosing another category.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: PICK GREETING CARD */}
        {currentStep === 3 && (
          <div className="fade-in">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-wine">Step 3: Choose a Greeting Card</h2>
                <p className="text-muted text-sm mt-1">
                  Every card is printed on heavyweight textured archival cotton paper and slipped into a wax-sealed envelope.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-lg border border-line text-xs uppercase tracking-wider font-semibold hover:border-wine transition-colors cursor-pointer"
                >
                  Back to Items
                </button>
                {selectedCard && (
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="bg-wine text-white px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Personalize Card <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cards.map((card) => {
                const isSelected = selectedCard?.id === card.id;

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedCard(card);
                      if (card.type !== 'both') {
                        setPersonalization(p => ({ ...p, cardType: card.type }));
                      }
                    }}
                    className={`bg-white rounded-2xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col group ${
                      isSelected
                        ? "border-wine shadow-lg ring-2 ring-wine/20"
                        : "border-line hover:border-wine/40 hover:shadow-md"
                    }`}
                  >
                    <div className="relative h-64 bg-cream overflow-hidden">
                      {card.images && card.images.length > 0 ? (
                        <img
                          src={card.images[0]}
                          alt={card.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <Mail size={48} />
                        </div>
                      )}

                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-wine text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                          {card.type === 'handwritten' ? '✍️ Handwritten Script' : card.type === 'typed' ? '🖨️ Digital Printed' : '✍️ or 🖨️ Choice'}
                        </span>
                      </div>

                      <div className="absolute top-4 right-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${
                          card.price > 0 ? "bg-wine text-white" : "bg-emerald-600 text-white"
                        }`}>
                          {card.price > 0 ? `+₹${card.price}` : "INCLUDED FREE"}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-wine text-white flex items-center justify-center shadow-lg">
                          <Check size={20} />
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-xl text-ink font-bold group-hover:text-wine transition-colors">
                          {card.name}
                        </h3>
                        <p className="text-muted text-xs leading-relaxed mt-2">
                          {card.description || "Curated card with hot-stamped detailing, accompanied by a luxury envelope."}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                        <span className="text-xs text-muted font-medium">
                          {card.price > 0 ? `₹${card.price}` : "Included with Hamper"}
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? "text-wine" : "text-muted group-hover:text-wine"
                        }`}>
                          {isSelected ? "Selected ✓" : "Select This Card"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: PERSONALIZE GREETING CARD */}
        {currentStep === 4 && (
          <div className="fade-in">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-wine">Step 4: Personalize Your Message</h2>
                <p className="text-muted text-sm mt-1">
                  Type your heartfelt note below. You will see a live preview of how it looks on your selected card.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-lg border border-line text-xs uppercase tracking-wider font-semibold hover:border-wine transition-colors cursor-pointer"
                >
                  Back to Cards
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="bg-wine text-white px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-all flex items-center gap-2 cursor-pointer"
                >
                  Review Order <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Input Column */}
              <div className="lg:col-span-6 bg-white border border-line rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="space-y-6">
                  {/* Card Type Selector (if card allows both) */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted font-bold mb-2">
                      Card Inscription Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPersonalization({ ...personalization, cardType: 'handwritten' })}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          personalization.cardType === 'handwritten'
                            ? "border-wine bg-wine/5 ring-1 ring-wine"
                            : "border-line hover:border-wine/30"
                        }`}
                      >
                        <span className="text-xl">✍️</span>
                        <div>
                          <div className="text-xs font-bold text-ink">Handwritten Note</div>
                          <div className="text-[10px] text-muted">Pen & ink by artisan calligrapher</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPersonalization({ ...personalization, cardType: 'typed' })}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          personalization.cardType === 'typed'
                            ? "border-wine bg-wine/5 ring-1 ring-wine"
                            : "border-line hover:border-wine/30"
                        }`}
                      >
                        <span className="text-xl">🖨️</span>
                        <div>
                          <div className="text-xs font-bold text-ink">Digital Printed</div>
                          <div className="text-[10px] text-muted">Clean archival typography</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recipient Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted font-bold mb-2">
                      Recipient Name (To)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sophia"
                      value={personalization.recipientName}
                      onChange={e => setPersonalization({ ...personalization, recipientName: e.target.value })}
                      className="w-full border border-line rounded-lg p-3 text-sm outline-none focus:border-wine bg-ivory/50"
                    />
                  </div>

                  {/* Message Body */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs uppercase tracking-widest text-muted font-bold">
                        Personal Message
                      </label>
                      <span className="text-[10px] text-muted">
                        {personalization.cardMessage.length}/350 characters
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      maxLength={350}
                      placeholder="Write your heartfelt message here..."
                      value={personalization.cardMessage}
                      onChange={e => setPersonalization({ ...personalization, cardMessage: e.target.value })}
                      className="w-full border border-line rounded-lg p-3 text-sm outline-none focus:border-wine bg-ivory/50 leading-relaxed"
                    />

                    {/* Inspiration chips */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-muted self-center mr-1">Inspirations:</span>
                      {[
                        "Wishing you joy and unforgettable moments!",
                        "Happy Birthday to my favourite person!",
                        "Warmest congratulations on this grand milestone!",
                        "Forever grateful for having you in my life."
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPersonalization({ ...personalization, cardMessage: prompt })}
                          className="text-[10px] bg-cream hover:bg-wine/10 hover:text-wine text-ink px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-line/60"
                        >
                          {prompt.length > 28 ? prompt.substring(0, 26) + '...' : prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sender Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted font-bold mb-2">
                      Sender Name (From)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alexander & Maya"
                      value={personalization.senderName}
                      onChange={e => setPersonalization({ ...personalization, senderName: e.target.value })}
                      className="w-full border border-line rounded-lg p-3 text-sm outline-none focus:border-wine bg-ivory/50"
                    />
                  </div>

                  {/* Special Packaging Instructions */}
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted font-bold mb-2">
                      Special Packaging Instructions for Crafting Team (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Please tie with burgundy ribbon, deliver before 5 PM"
                      value={personalization.specialInstructions}
                      onChange={e => setPersonalization({ ...personalization, specialInstructions: e.target.value })}
                      className="w-full border border-line rounded-lg p-3 text-sm outline-none focus:border-wine bg-ivory/50"
                    />
                  </div>
                </div>
              </div>

              {/* Live Card Preview Column */}
              <div className="lg:col-span-6 sticky top-28">
                <div className="text-xs uppercase tracking-widest text-muted font-bold mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-wine" /> Real-Time Card Preview
                </div>

                <div className="bg-[#FAF7F2] border-2 border-[#D4C3A3] rounded-2xl p-8 md:p-12 shadow-lg relative min-h-[380px] flex flex-col justify-between overflow-hidden">
                  {/* Subtle inner gold border line */}
                  <div className="absolute inset-3 border border-[#E2D5BE] pointer-events-none rounded-xl" />

                  {/* Top card banner */}
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-widest text-[#8A7960] font-bold">
                      {selectedCard?.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-[#EFE8DC] text-[#716149] font-medium">
                      {personalization.cardType === 'handwritten' ? 'Handwritten Script' : 'Archival Print'}
                    </span>
                  </div>

                  {/* Card Message Canvas */}
                  <div className="relative z-10 my-8">
                    {personalization.recipientName && (
                      <div className="font-serif text-lg text-wine font-semibold mb-4">
                        Dearest {personalization.recipientName},
                      </div>
                    )}

                    <div className={`text-[#2D2A26] leading-relaxed whitespace-pre-wrap ${
                      personalization.cardType === 'handwritten'
                        ? 'font-serif text-lg italic tracking-wide text-wine-dark'
                        : 'font-sans text-sm tracking-normal'
                    }`}>
                      {personalization.cardMessage || (
                        <span className="text-muted/60 italic font-sans text-sm">
                          Your heartfelt message will appear here in elegant script...
                        </span>
                      )}
                    </div>

                    {personalization.senderName && (
                      <div className="font-serif text-base text-wine font-medium mt-6 text-right">
                        With love,<br />
                        <span className="font-bold">{personalization.senderName}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer emblem */}
                  <div className="relative z-10 text-center border-t border-[#EAE1D2] pt-4">
                    <span className="text-[9px] uppercase tracking-widest text-[#A8987E] font-medium">
                      Mora Moments • Handcrafted with love
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW, ADDRESS & PLACE ORDER */}
        {currentStep === 5 && (
          <div className="fade-in">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-wine">Step 5: Review & Confirm Your Hamper</h2>
              <p className="text-muted text-sm mt-1">
                Verify your curated selection and finalize your delivery address before proceeding to payment.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Hamper Spec Sheet & Shipping */}
              <div className="lg:col-span-7 space-y-6">
                {/* Hamper contents spec card */}
                <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-muted mb-4 border-b border-line pb-3 flex items-center justify-between">
                    <span>Curated Hamper Contents</span>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-wine hover:underline text-[11px] font-bold cursor-pointer"
                    >
                      Edit Selection
                    </button>
                  </h3>

                  {/* Selected Box */}
                  <div className="flex gap-4 items-center p-3 rounded-xl bg-ivory/50 border border-line mb-3">
                    <div className="w-14 h-14 rounded-lg bg-cream overflow-hidden border border-line shrink-0">
                      {selectedBox?.images?.[0] ? (
                        <img src={selectedBox.images[0]} alt={selectedBox.name} className="w-full h-full object-cover" />
                      ) : (
                        <Gift size={20} className="m-auto text-wine" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-muted uppercase tracking-wider font-bold">Gift Box</div>
                      <div className="text-sm font-bold text-ink truncate">{selectedBox?.name}</div>
                      <div className="text-xs text-muted">Fits {minItems} - {maxItems} items</div>
                    </div>
                    <div className="font-bold text-sm text-wine">
                      {boxPrice > 0 ? `₹${boxPrice.toLocaleString('en-IN')}` : 'FREE'}
                    </div>
                  </div>

                  {/* Selected Items */}
                  <div className="space-y-2 mb-3">
                    {Object.values(selectedItems).map(({ product, quantity }) => {
                      const price = product.salePrice || product.price;
                      return (
                        <div key={product.id} className="flex gap-3 items-center p-2.5 rounded-lg border border-line/60">
                          <div className="w-10 h-10 rounded bg-cream overflow-hidden shrink-0 border border-line/50">
                            {product.images?.[0]?.imageUrl && (
                              <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-ink truncate">{product.name}</div>
                            <div className="text-[10px] text-muted">Qty: {quantity}</div>
                          </div>
                          <div className="text-xs font-bold text-ink">
                            ₹{(price * quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Card */}
                  <div className="flex gap-4 items-center p-3 rounded-xl bg-ivory/50 border border-line">
                    <div className="w-14 h-14 rounded-lg bg-cream overflow-hidden border border-line shrink-0">
                      {selectedCard?.images?.[0] ? (
                        <img src={selectedCard.images[0]} alt={selectedCard.name} className="w-full h-full object-cover" />
                      ) : (
                        <Mail size={20} className="m-auto text-wine" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-muted uppercase tracking-wider font-bold">Greeting Card</div>
                      <div className="text-sm font-bold text-ink truncate">{selectedCard?.name}</div>
                      <div className="text-xs text-muted">
                        Style: {personalization.cardType === 'handwritten' ? '✍️ Handwritten' : '🖨️ Typed'}
                      </div>
                    </div>
                    <div className="font-bold text-sm text-wine">
                      {cardPrice > 0 ? `₹${cardPrice.toLocaleString('en-IN')}` : 'FREE'}
                    </div>
                  </div>

                  {/* Personalization message quote */}
                  {personalization.cardMessage && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs">
                      <div className="font-bold text-amber-900 mb-1 flex items-center justify-between">
                        <span>Card Message:</span>
                        <button onClick={() => setCurrentStep(4)} className="text-wine hover:underline text-[10px]">
                          Edit
                        </button>
                      </div>
                      <p className="text-ink/80 italic font-serif leading-relaxed">
                        "{personalization.cardMessage}"
                      </p>
                      <div className="mt-2 text-[10px] text-muted">
                        To: <strong>{personalization.recipientName || 'Recipient'}</strong> • From: <strong>{personalization.senderName || 'Sender'}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping Address Selection */}
                <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-muted flex items-center gap-1.5">
                      <MapPin size={16} className="text-wine" /> Delivery Destination
                    </h3>
                    {user && !showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="text-wine hover:underline text-xs font-bold cursor-pointer"
                      >
                        + Add New Address
                      </button>
                    )}
                  </div>

                  {!user ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted mb-4">
                        Please sign in or register to select delivery address and confirm your custom order.
                      </p>
                      <button
                        onClick={() => setIsAuthOpen(true)}
                        className="bg-wine text-white px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-colors cursor-pointer"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  ) : showAddressForm ? (
                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-muted mb-1">Full Name *</label>
                          <input
                            required
                            value={newAddress.fullName}
                            onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                            className="w-full border border-line p-2.5 rounded-lg text-xs outline-none focus:border-wine"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-muted mb-1">Phone Number *</label>
                          <input
                            required
                            value={newAddress.phone}
                            onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                            className="w-full border border-line p-2.5 rounded-lg text-xs outline-none focus:border-wine"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-muted mb-1">Address Line 1 *</label>
                        <input
                          required
                          value={newAddress.addressLine1}
                          onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                          className="w-full border border-line p-2.5 rounded-lg text-xs outline-none focus:border-wine"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-muted mb-1">City *</label>
                          <input
                            required
                            value={newAddress.city}
                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full border border-line p-2.5 rounded-lg text-xs outline-none focus:border-wine"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-muted mb-1">State *</label>
                          <input
                            required
                            value={newAddress.state}
                            onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="w-full border border-line p-2.5 rounded-lg text-xs outline-none focus:border-wine"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-muted mb-1">Pincode *</label>
                          <input
                            required
                            value={newAddress.pincode}
                            onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            className="w-full border border-line p-2.5 rounded-lg text-xs outline-none focus:border-wine"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 py-2 border border-line rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="bg-ink text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-wine transition-colors cursor-pointer"
                        >
                          {savingAddress ? "Saving..." : "Save Address"}
                        </button>
                      </div>
                    </form>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted mb-3">No saved delivery address found.</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="border border-wine text-wine px-5 py-2 rounded-lg text-xs uppercase tracking-wider font-bold hover:bg-wine hover:text-white transition-colors cursor-pointer"
                      >
                        + Add Delivery Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map(addr => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            selectedAddressId === addr.id
                              ? "border-wine bg-wine/5 ring-1 ring-wine"
                              : "border-line hover:border-wine/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressSelect"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-wine"
                          />
                          <div className="text-xs">
                            <div className="font-bold text-ink">{addr.fullName} <span className="text-muted font-normal">({addr.phone})</span></div>
                            <div className="text-muted mt-0.5">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Pricing Breakdown & Payment CTA */}
              <div className="lg:col-span-5 sticky top-28">
                <div className="bg-white border border-line rounded-2xl p-6 md:p-8 shadow-sm">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-muted mb-6 border-b border-line pb-4">
                    Price Summary
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted">
                      <span>Box ({selectedBox?.name})</span>
                      <span className="text-ink">{boxPrice > 0 ? `₹${boxPrice.toLocaleString('en-IN')}` : 'FREE'}</span>
                    </div>

                    <div className="flex justify-between text-muted">
                      <span>Greeting Card ({selectedCard?.name})</span>
                      <span className="text-ink">{cardPrice > 0 ? `₹${cardPrice.toLocaleString('en-IN')}` : 'FREE'}</span>
                    </div>

                    <div className="flex justify-between text-muted">
                      <span>Curated Gifts ({totalItemCount} items)</span>
                      <span className="text-ink">₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-muted pt-2 border-t border-line/60">
                      <span>Subtotal</span>
                      <span className="text-ink font-semibold">₹{hamperSubtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-muted">
                      <span>Shipping</span>
                      <span className="text-ink">{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
                    </div>

                    <div className="flex justify-between text-muted">
                      <span>Estimated Tax (18%)</span>
                      <span className="text-ink">₹{tax.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-4 border-t border-line text-lg font-bold">
                      <span className="font-serif text-ink">Grand Total</span>
                      <span className="font-serif text-2xl text-wine">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Primary Button: Proceed to Payment */}
                  <div className="mt-8 space-y-3">
                    <button
                      onClick={handleCreateOrder}
                      disabled={submittingOrder}
                      className="w-full bg-wine text-white h-14 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                    >
                      {submittingOrder ? (
                        <>
                          <Loader2 className="animate-spin" size={18} /> Initializing Secure Payment...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} /> Proceed to Payment
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleAddHamperToCart}
                      className="w-full bg-cream hover:bg-wine/10 text-wine border border-wine/20 h-11 rounded-xl text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                    >
                      Add Hamper to Bag & Continue Shopping
                    </button>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Razorpay SSL Encrypted • 100% Satisfaction Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Quick Bar on Mobile / Desktop */}
      {currentStep < 5 && selectedBox && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-line py-3.5 px-6 z-40 shadow-lg">
          <div className="container mx-auto max-w-6xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-xs">
                <span className="text-muted">Hamper Total: </span>
                <span className="font-serif text-base font-bold text-wine">₹{hamperSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted">Items: </span>
                <span className={`font-bold ${isCapacityValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {totalItemCount}/{maxItems}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep((currentStep - 1) as any)}
                  className="px-4 py-2 border border-line rounded-lg text-xs uppercase tracking-wider font-semibold hover:border-wine transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => {
                  if (currentStep === 1) setCurrentStep(2);
                  else if (currentStep === 2) {
                    if (!isCapacityValid) {
                      toast.error(`Please select between ${minItems} and ${maxItems} items.`);
                      return;
                    }
                    setCurrentStep(3);
                  } else if (currentStep === 3) {
                    if (!selectedCard) {
                      toast.error("Please pick a card.");
                      return;
                    }
                    setCurrentStep(4);
                  } else if (currentStep === 4) {
                    setCurrentStep(5);
                  }
                }}
                disabled={currentStep === 2 && !isCapacityValid}
                className="bg-wine text-white px-6 py-2 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-wine-dark transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {currentStep === 4 ? "Review Order" : "Continue"} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
