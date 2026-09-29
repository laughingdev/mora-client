"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useStore } from "../../store/useStore";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const router = useRouter();

  const subtotal = cart.reduce((total, item) => total + ((item.price || 0) * item.quantity), 0);

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
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
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-ivory z-[110] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-line flex items-center justify-between bg-white">
              <h2 className="font-serif text-2xl text-wine">Your Bag ({cart.length})</h2>
              <button 
                onClick={onClose}
                className="text-muted hover:text-wine transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-serif text-muted mb-4">Your bag is empty.</p>
                  <p className="text-sm text-ink/70 mb-8">Let's find something special for you.</p>
                  <button 
                    onClick={() => {
                      onClose();
                      router.push('/shop');
                    }}
                    className="border border-wine text-wine px-8 py-3 text-xs uppercase tracking-widest hover:bg-wine hover:text-white transition-colors"
                  >
                    Explore Gifts
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-6 border-b border-line/50">
                      <div className="w-20 h-20 bg-cream shrink-0">
                        <img 
                          src={item.image || '/placeholder.jpg'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="text-sm font-medium text-ink line-clamp-1">{item.name}</h4>
                            {item.variantName && (
                              <span className="text-[11px] text-muted font-medium block mt-0.5">Option: {item.variantName}</span>
                            )}
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted hover:text-wine transition-colors ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <p className="text-xs text-wine font-bold mb-3">₹{(item.price || 0).toLocaleString('en-IN')}</p>
                        
                        <div className="mt-auto flex items-center border border-line h-8 w-24 bg-white">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-full flex items-center justify-center text-muted hover:text-wine"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="flex-1 text-center text-xs font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-muted hover:text-wine"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="border-t border-line p-6 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm uppercase tracking-widest font-bold text-muted">Subtotal</span>
                  <span className="font-serif text-2xl text-wine">₹{(subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-muted text-center mb-4">Shipping & taxes calculated at checkout.</p>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-wine text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-wine-dark transition-colors flex items-center justify-center gap-2 group"
                >
                  Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
