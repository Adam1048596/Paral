import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    image_main: string | null;
    price: number;
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
  const { user } = useAuth();

  useEffect(() => {
    console.log("CartProvider user:", user);
    if (!user) {
      setCartId(null);
      setItems([]);
      return;
    }

    const initCart = async () => {
      // Try to get existing cart
      const { data: cart, error } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();   // maybeSingle returns null instead of error if not found

      console.log("initCart: fetched cart:", cart, "error:", error);

      if (error) {
        console.error("Error fetching cart:", error);
        return;
      }

      let currentCart = cart;
      if (!currentCart) {
        console.log("No cart found, creating one...");
        const { data: newCart, error: insertError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();

        console.log("insert cart result:", newCart, "error:", insertError);

        if (insertError) {
          console.error("Error creating cart:", insertError);
          return;
        }
        currentCart = newCart;
      }

      if (currentCart?.id) {
        setCartId(currentCart.id);
        await refreshCartItems(currentCart.id);
      }
    };

    initCart();
  }, [user]);

  const refreshCartItems = async (cart_uuid: string) => {
    console.log("refreshCartItems for cart:", cart_uuid);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id, product_id, quantity,
        product:products(name, image_main, price)
      `)
      .eq('cart_id', cart_uuid);

    console.log("cart items:", data, "error:", error);
    if (error) {
      console.error("Error fetching cart items:", error);
      return;
    }
    setItems(data || []);
  };

  const refreshCart = async () => {
    if (cartId) await refreshCartItems(cartId);
  };

  const addItem = async (productId: string, quantity = 1) => {
    console.log("addItem called. cartId:", cartId, "productId:", productId);
    if (!cartId) {
      console.log("cartId is null → exiting");
      return;
    }
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      console.log("update existing item error:", error);
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ cart_id: cartId, product_id: productId, quantity });
      console.log("insert new item error:", error);
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