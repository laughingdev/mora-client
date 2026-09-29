"use client";

import Link from "next/link";
import { Search, Heart, User, ShoppingBag, Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "./AuthModal";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "./CartDrawer";
import { useStore } from "../../store/useStore";

interface HeaderProps {
  categories?: any[];
  pages?: any[];
}

export default function Header({ categories = [], pages = [] }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, setUser, cart, wishlist } = useStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="bg-wine text-[#fff6ee] text-center py-2.5 text-xs tracking-wider">
        Complimentary handwritten note with every order <span className="mx-3 text-[#e8bb8d]">•</span> Crafted with care in India
      </div>
      
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-ivory/90 backdrop-blur-md border-line/50 shadow-sm py-3" 
            : "bg-ivory/95 border-line py-5"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <button 
            className="md:hidden text-wine hover:opacity-70 transition-opacity"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden w-28 h-10 md:w-32 md:h-12 flex items-center justify-center">
              <img 
                src="/mora-logo.png" 
                alt="Mora Moments" 
                className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-wide">
            <Link href="/shop" className="hover:text-wine transition-colors relative after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-wine after:left-0 after:-bottom-1 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">Shop</Link>
            <Link href="/events" className="hover:text-wine transition-colors relative after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-wine after:left-0 after:-bottom-1 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">Occasions</Link>
            {categories.filter((c: any) => !c.parentId).map((category: any) => (
              <Link 
                key={category.id} 
                href={`/shop/${category.slug}`} 
                className="hover:text-wine transition-colors relative after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-wine after:left-0 after:-bottom-1 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
              >
                {category.name}
              </Link>
            ))}
            <Link href="/builder" className="hover:text-wine transition-colors relative after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-wine after:left-0 after:-bottom-1 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">Create Your Gift</Link>
            <Link href="/blog" className="hover:text-wine transition-colors relative after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-wine after:left-0 after:-bottom-1 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">Journal</Link>
          </nav>

          <div className="flex items-center gap-4 md:gap-5">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-ink hover:text-wine transition-colors"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link href={user ? "/account?tab=wishlist" : "#"} onClick={(e) => { if (!user) { e.preventDefault(); setIsAuthModalOpen(true); } }} className="text-ink hover:text-wine transition-colors relative">
              <Heart size={20} strokeWidth={1.5} />
              {isClient && wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-wine text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            {isClient && user ? (
              <div className="relative group hidden sm:block">
                <button className="text-ink hover:text-wine transition-colors flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cream border border-line flex items-center justify-center text-[10px] font-bold text-wine tracking-wider">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-ivory border border-line shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                  <div className="p-4 border-b border-line">
                    <p className="text-sm font-medium text-ink truncate">{user.name || 'User'}</p>
                    <p className="text-xs text-muted truncate">{user.email || 'No email'}</p>
                  </div>
                  <div className="py-2">
                    <Link href="/account" className="block px-4 py-2 text-sm text-ink hover:bg-cream/50 hover:text-wine transition-colors">My Account</Link>
                    <Link href="/account?tab=orders" className="block px-4 py-2 text-sm text-ink hover:bg-cream/50 hover:text-wine transition-colors">Orders</Link>
                  </div>
                  <div className="py-2 border-t border-line">
                    <button 
                      onClick={() => {
                        localStorage.removeItem('token');
                        setUser(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-wine hover:bg-blush/30 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="text-ink hover:text-wine transition-colors hidden sm:block"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
            )}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-ink hover:text-wine transition-colors relative"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {isClient && cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-wine text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/40 z-[60] md:hidden backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-ivory z-[70] shadow-2xl flex flex-col md:hidden"
            >
              <div className="p-6 border-b border-line flex items-center justify-between">
                <img src="/mora-logo.png" alt="Mora Moments" className="h-8" />
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl text-wine p-2 leading-none hover:opacity-70"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 border-b border-line flex items-center justify-between bg-cream/30">
                {isClient && user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cream border border-line flex items-center justify-center text-lg font-serif text-wine">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink truncate max-w-[150px]">{user.name || 'User'}</p>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('token');
                          setUser(null);
                        }}
                        className="text-xs text-wine hover:underline mt-0.5"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-3 text-wine"
                  >
                    <User size={20} />
                    <span className="text-sm font-medium uppercase tracking-widest">Sign In</span>
                  </button>
                )}
              </div>
              <nav className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 text-lg font-serif">
                <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="hover:text-wine transition-colors">Shop All</Link>
                <Link href="/events" onClick={() => setIsMenuOpen(false)} className="hover:text-wine transition-colors">Shop by Occasion</Link>
                {categories.filter((c: any) => !c.parentId).map((category: any) => (
                  <Link 
                    key={category.id} 
                    href={`/shop/${category.slug}`} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="hover:text-wine transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
                <Link href="/builder" onClick={() => setIsMenuOpen(false)} className="hover:text-wine transition-colors">Create Your Gift</Link>
                <Link href="/blog" onClick={() => setIsMenuOpen(false)} className="hover:text-wine transition-colors">Journal & Stories</Link>
              </nav>
              <div className="p-6 border-t border-line bg-cream/50 text-sm">
                <p className="text-ink/70 mb-2">Need help?</p>
                <a href="mailto:hello@moramoments.in" className="text-wine hover:underline">hello@moramoments.in</a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
