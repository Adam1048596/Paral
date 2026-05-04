import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext'; // we’ll create a simple auth context soon

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    image_main: string | null;
    price: number; // you may need to add price to products later
  };
};

type CartContextType = {
  items: CartItem[];
  cartId: string | null;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const { user } = useAuth(); // assume AuthContext provides user

  // Fetch or create cart
  useEffect(() => {
    if (!user) {
      setCartId(null);
      setItems([]);
      return;
    }
    const initCart = async () => {
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cart) {
        const { data: newCart } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        cart = newCart;
      }

      setCartId(cart?.id || null);
      if (cart?.id) await refreshCartItems(cart.id);
    };
    initCart();
  }, [user]);

  const refreshCartItems = async (cart_uuid: string) => {
    const { data } = await supabase
      .from('cart_items')
      .select(`
        id, product_id, quantity,
        product:products(name, image_main, price)
      `)
      .eq('cart_id', cart_uuid);
    setItems(data || []);
  };

  const refreshCart = async () => {
    if (cartId) await refreshCartItems(cartId);
  };

  const addItem = async (productId: string, quantity = 1) => {
    if (!cartId) return;
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ cart_id: cartId, product_id: productId, quantity });
    }
    await refreshCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(itemId);
      return;
    }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    await refreshCart();
  };

  const removeItem = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    await refreshCart();
  };

  const clearCart = async () => {
    if (!cartId) return;
    await supabase.from('cart_items').delete().eq('cart_id', cartId);
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{ items, cartId, addItem, updateQuantity, removeItem, refreshCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}