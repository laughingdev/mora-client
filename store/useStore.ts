import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  productId?: string;
  variantId?: string | null;
  variantName?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface StoreState {
  cart: CartItem[];
  wishlist: Product[];
  user: User | null;
  _hasHydrated: boolean;
  
  // Cart Actions
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Wishlist Actions
  addToWishlist: (item: Product) => void;
  removeFromWishlist: (id: string) => void;
  
  // User Actions
  setUser: (user: User | null) => void;
  setCart: (cart: CartItem[]) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      user: null,
      _hasHydrated: false,
      
      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),
        
      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.id !== id),
        })),
        
      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),
        
      clearCart: () => set({ cart: [] }),
      
      addToWishlist: (item) =>
        set((state) => {
          if (state.wishlist.find((i) => i.id === item.id)) {
            return state;
          }
          return { wishlist: [...state.wishlist, item] };
        }),
        
      removeFromWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.filter((i) => i.id !== id),
        })),
        
      setUser: (user) => set({ user }),
      setCart: (cart) => set({ cart }),
      setHasHydrated: (hasHydrated: boolean) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: 'mora-moments-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        user: state.user,
      }),
    }
  )
);
