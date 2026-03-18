"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

const SupabaseContext = createContext();

export function SupabaseProvider({ children }) {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chats, setChats] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [partners, setPartners] = useState([]);
  const [myActiveOrderId, setMyActiveOrderId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const mapItem = (i) => ({ ...i, iconName: i.icon_name, stockLevel: i.stock_level });
  const mapOrder = (o) => ({ ...o, createdAt: o.created_at, queueNumber: o.queue_number });

  useEffect(() => {
    const loadData = async () => {
      const [{ data: menuData }, { data: ordersData }, { data: chatsData }, { data: contactData }, { data: partnersData }] = await Promise.all([
        supabase.from('menu_items').select('*').order('id'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('chats').select('*').order('created_at', { ascending: true }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('sort_order', { ascending: true })
      ]);

      if (menuData) setMenuItems(menuData.map(mapItem));
      if (ordersData) setOrders(ordersData.map(mapOrder));
      if (chatsData) setChats(chatsData);
      if (contactData) setContactMessages(contactData);
      if (partnersData) setPartners(partnersData);

      const savedActiveId = localStorage.getItem("hotwheels_coffee_active_order");
      if (savedActiveId) setMyActiveOrderId(savedActiveId);

      setIsLoaded(true);
    };

    loadData();

    const menuSub = supabase
      .channel('menu_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setMenuItems(prev => prev.map(item => item.id === payload.new.id ? mapItem(payload.new) : item));
        } else if (payload.eventType === 'INSERT') {
          setMenuItems(prev => [...prev, mapItem(payload.new)]);
        }
      })
      .subscribe();

    const ordersSub = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => {
            if (prev.find(o => o.id === payload.new.id)) return prev;
            return [mapOrder(payload.new), ...prev].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
          });
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? mapOrder(payload.new) : o));
        }
      })
      .subscribe();

    const chatsSub = supabase
      .channel('chats_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setChats(prev => {
            // Check if we already optimistically added it
            if (prev.find(c => c.id === payload.new.id || (c.temp && c.message === payload.new.message && c.order_id === payload.new.order_id))) return prev;
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'UPDATE') {
          setChats(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
        }
      })
      .subscribe();

    const contactSub = supabase
      .channel('contact_messages_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, (payload) => {
        setContactMessages(prev => [payload.new, ...prev]);
      })
      .subscribe();

    const partnersSub = supabase
      .channel('partners_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partners' }, (payload) => {
        if (payload.eventType === 'INSERT') setPartners(prev => [...prev, payload.new].sort((a,b)=>a.sort_order-b.sort_order));
        else if (payload.eventType === 'UPDATE') setPartners(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        else if (payload.eventType === 'DELETE') setPartners(prev => prev.filter(p => p.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(menuSub);
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(chatsSub);
      supabase.removeChannel(contactSub);
      supabase.removeChannel(partnersSub);
    };
  }, []);

  const updateItem = async (id, updates) => {
    // Map camelCase to snake_case for Supabase
    const dbUpdates = { ...updates };
    if (dbUpdates.stockLevel !== undefined) {
      dbUpdates.stock_level = dbUpdates.stockLevel;
      delete dbUpdates.stockLevel;
    }
    if (dbUpdates.iconName !== undefined) {
      dbUpdates.icon_name = dbUpdates.iconName;
      delete dbUpdates.iconName;
    }

    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    await supabase.from('menu_items').update(dbUpdates).eq('id', id);
  };

  const updateStock = async (id, newStock) => {
    let status = "In Stock";
    if (newStock === 0) status = "Sold Out";
    else if (newStock <= 20) status = "Low Stock";
    
    updateItem(id, { stockLevel: newStock, status });
  };

  const submitOrder = async (order) => {
    const today = new Date().toDateString();
    const todaysOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const queueNumber = todaysOrders.length + 1;
    const id = "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase();

    const newOrder = {
      id,
      status: "Preparing",
      queue_number: queueNumber,
      method: order.method,
      distance: order.distance,
      total: order.total,
      items: order.items,
    };

    setOrders(prev => [{...newOrder, createdAt: new Date().toISOString(), queueNumber}, ...prev]);
    setMyActiveOrderId(newOrder.id);
    localStorage.setItem("hotwheels_coffee_active_order", newOrder.id);

    // Validate stock for all items first
    for (const item of order.items) {
      const menuItem = menuItems.find(m => m.name === item.name);
      if (!menuItem || menuItem.stockLevel < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Only ${menuItem?.stockLevel || 0} left.`);
      }
    }

    await supabase.from('orders').insert([newOrder]);

    // Reduce stock for each item
    for (const item of order.items) {
      const menuItem = menuItems.find(m => m.name === item.name);
      if (menuItem) {
        const newStock = Math.max(0, menuItem.stockLevel - item.quantity);
        await updateStock(menuItem.id, newStock);
      }
    }
  };

  const updateOrderStatus = async (id, status) => {
    const order = orders.find(o => o.id === id);
    const oldStatus = order?.status;

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    await supabase.from('orders').update({ status }).eq('id', id);

    // If cancelled, restore stock
    if (status === "Cancelled" && oldStatus !== "Cancelled") {
      for (const item of order.items) {
        const menuItem = menuItems.find(m => m.name === item.name);
        if (menuItem) {
          await updateStock(menuItem.id, menuItem.stockLevel + item.quantity);
        }
      }
    }
  };

  const dismissActiveOrder = () => {
    setMyActiveOrderId(null);
    localStorage.removeItem("hotwheels_coffee_active_order");
  };

  const recoverOrder = (orderId) => {
    setMyActiveOrderId(orderId);
    localStorage.setItem("hotwheels_coffee_active_order", orderId);
  };

  const sendMessage = async (orderId, sender, message) => {
    const newMessage = { order_id: orderId, sender, message, is_read: false };
    const tempMessage = { ...newMessage, temp: true, id: Math.random().toString(), created_at: new Date().toISOString() };
    
    setChats(prev => [...prev, tempMessage]); // Optimistic load
    await supabase.from('chats').insert([newMessage]); // Actual load will arrive via socket, duplicate temp ignored via above check
  };

  const markChatRead = async (orderId, viewerRole) => {
    // Viewer Role: 'admin' watches for 'customer' messages, 'customer' watches for 'admin' messages
    const roleToMark = viewerRole === 'admin' ? 'customer' : 'admin';
    const hasUnread = chats.some(c => c.order_id === orderId && c.sender === roleToMark && !c.is_read);
    
    if (hasUnread) {
      setChats(prev => prev.map(c => c.order_id === orderId && c.sender === roleToMark ? { ...c, is_read: true } : c));
      await supabase.from('chats').update({ is_read: true }).eq('order_id', orderId).eq('sender', roleToMark);
    }
  };

  const markMessageRead = async (id) => {
    setContactMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
  };

  const addPartner = async (partner) => {
    await supabase.from('partners').insert([partner]);
  };

  const updatePartner = async (id, updates) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await supabase.from('partners').update(updates).eq('id', id);
  };

  const removePartner = async (id) => {
    setPartners(prev => prev.filter(p => p.id !== id));
    await supabase.from('partners').delete().eq('id', id);
  };

  return (
    <SupabaseContext.Provider value={{ menuItems, orders, chats, contactMessages, partners, myActiveOrderId, updateItem, updateStock, submitOrder, updateOrderStatus, dismissActiveOrder, recoverOrder, sendMessage, markChatRead, markMessageRead, addPartner, updatePartner, removePartner, isLoaded }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useDB() {
  return useContext(SupabaseContext);
}
