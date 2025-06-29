import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface CompareState {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  maxCompareItems: number;
}

const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compareItems: [],
      maxCompareItems: 4, // Max 4 items to compare at a time, can be configured
      addToCompare: (product) => {
        const currentItems = get().compareItems;
        if (currentItems.length >= get().maxCompareItems) {
          toast.warning(`You can compare a maximum of ${get().maxCompareItems} products. Please remove an item to add another.`);
          return;
        }
        if (!currentItems.find(item => item.id === product.id)) {
          set({ compareItems: [...currentItems, product] });
          toast.success(`${product.name} added to comparison list.`);
        } else {
          toast.info(`${product.name} is already in the comparison list.`);
        }
      },
      removeFromCompare: (productId) => {
        const productToRemove = get().compareItems.find(item => item.id === productId);
        set({ compareItems: get().compareItems.filter(item => item.id !== productId) });
        if (productToRemove) {
            toast.error(`${productToRemove.name} removed from comparison list.`);
        }
      },
      clearCompare: () => {
        set({ compareItems: [] });
        toast.info("Comparison list cleared.");
      },
    }),
    {
      name: 'compare-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useCompareStore;
