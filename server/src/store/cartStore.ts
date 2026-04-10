import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(
            item => item.id === newItem.id && item.size === newItem.size
          );
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === newItem.id && item.size === newItem.size
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              )
            };
          }
          
          return { items: [...state.items, newItem] };
        });
      },
      
      removeItem: (id, size) => {
        set((state) => ({
          items: state.items.filter(
            item => !(item.id === id && item.size === size)
          )
        }));
      },
      
      updateQuantity: (id, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id, size);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.id === id && item.size === size
              ? { ...item, quantity }
              : item
          )
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.price * item.quantity),
          0
        );
      }
    }),
    {
      name: 'cart-storage'
    }
  )
);