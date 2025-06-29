import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types/product';
import { toast } from 'sonner';
import { ShoppingCart, CheckCircle, XCircle } from 'lucide-react';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getTotalItems: () => number;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      addToCart: (product, quantity = 1) => {
        const currentItems = get().cartItems;
        const existingItem = currentItems.find(item => item.id === product.id);

        if (product.stock !== undefined && product.stock < quantity && !existingItem) {
            toast.error(`Not enough stock for ${product.name}. Only ${product.stock} available.`, { icon: <XCircle className="text-red-500" /> });
            return;
        }

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          if (product.stock !== undefined && product.stock < newQuantity) {
            toast.error(`Cannot add more ${product.name}. Only ${product.stock} available in total.`, { icon: <XCircle className="text-red-500" /> });
            set({
              cartItems: currentItems.map(item =>
                item.id === product.id ? { ...item, quantity: product.stock! } : item
              ),
            });
          } else {
            set({
              cartItems: currentItems.map(item =>
                item.id === product.id ? { ...item, quantity: newQuantity } : item
              ),
            });
            toast.success(`${quantity} more ${product.name} added to cart.`, { icon: <CheckCircle className="text-green-500" /> });
          }
        } else {
          set({ cartItems: [...currentItems, { ...product, quantity }] });
          toast.success(`${product.name} added to cart.`, { icon: <CheckCircle className="text-green-500" /> });
        }
      },
      removeFromCart: (productId) => {
        const productToRemove = get().cartItems.find(item => item.id === productId);
        set({ cartItems: get().cartItems.filter(item => item.id !== productId) });
        if (productToRemove) {
            toast.error(`${productToRemove.name} removed from cart.`, { icon: <XCircle className="text-red-500" /> });
        }
      },
      updateQuantity: (productId, quantity) => {
        const productToUpdate = get().cartItems.find(item => item.id === productId);
        if (!productToUpdate) return;

        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        if (productToUpdate.stock !== undefined && productToUpdate.stock < quantity) {
            toast.error(`Not enough stock for ${productToUpdate.name}. Only ${productToUpdate.stock} available.`, { icon: <XCircle className="text-red-500" /> });
            set({
              cartItems: get().cartItems.map(item =>
                item.id === productId ? { ...item, quantity: productToUpdate.stock! } : item
              ),
            });
            return;
        }

        set({
          cartItems: get().cartItems.map(item =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
        toast.info(`Quantity for ${productToUpdate.name} updated to ${quantity}.`, { icon: <ShoppingCart /> });
      },
      clearCart: () => {
        set({ cartItems: [] });
        toast.info("Cart cleared.", { icon: <ShoppingCart />});
      },
      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getTotalItems: () => {
        return get().cartItems.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      // partialize: (state) => ({ cartItems: state.cartItems }), // Example: only persist cartItems
    }
  )
);

export default useCartStore;
