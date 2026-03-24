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
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const mapItem = (i) => ({ ...i, iconName: i.icon_name, stockLevel: i.stock_level });
  const mapOrder = (o) => ({ ...o, createdAt: o.created_at, queueNumber: o.queue_number });

  const handleLookupOrder = (raw) => {
    const found = orders.find(o => {
      const qn = String(o.queueNumber || o.queue_number || "").trim();
      const id = String(o.id || "").toUpperCase().trim();
      const searchRaw = String(raw).toUpperCase().trim();
      
      // Match queue number (exact), or ID (exact), or short ID (last part)
      return qn === searchRaw || 
             id === searchRaw || 
             id.endsWith(searchRaw) || 
             (searchRaw.length >= 4 && id.split('-').pop() === searchRaw);
    });
    return found;
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const loadData = async () => {
      const [{ data: menuData }, { data: ordersData }, { data: chatsData }, { data: contactData }, { data: partnersData }] = await Promise.all([
        supabase.from('menu_items').select('*').order('sort_order', { ascending: true }),
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
        } else if (payload.eventType === 'DELETE') {
          setMenuItems(prev => prev.filter(item => item.id !== payload.old.id));
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
      subscription.unsubscribe();
      supabase.removeChannel(menuSub);
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(chatsSub);
      supabase.removeChannel(contactSub);
      supabase.removeChannel(partnersSub);
    };
  }, []);

  const updateItem = async (id, updates) => {
    // Map camelCase to snake_case for Supabase
    const dbUpdate = {
      name: updates.name,
      price: updates.price,
      stock_level: updates.stockLevel,
      status: updates.status,
      icon_name: updates.iconName,
      description: updates.description,
      supports_temp: updates.supports_temp,
      category: updates.category
    };

    // Filter out undefined values and map camelCase to snake_case
    Object.keys(dbUpdate).forEach(key => {
      if (dbUpdate[key] === undefined) {
        delete dbUpdate[key];
      }
    });

    // Remove image update since column seems to be missing in DB
    delete dbUpdate.image;

    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    const { error } = await supabase.from('menu_items').update(dbUpdate).eq('id', id);
    if (error) throw error;
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
      status: "Pending Confirmation",
      queue_number: queueNumber,
      method: order.method,
      distance: order.distance,
      total: order.total,
      items: order.items,
      payment_method: order.paymentMethod || 'cash',
      payment_status: 'pending',
      payment_proof: order.paymentProof || null
    };

    // Validate stock for all items first
    for (const item of order.items) {
      const menuItem = menuItems.find(m => m.id === item.id || m.name === item.name);
      if (!menuItem || menuItem.stockLevel < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}. ${menuItem ? `Only ${menuItem.stockLevel} left.` : "Item no longer available."}`);
      }
    }

    await supabase.from('orders').insert([newOrder]);

    // Update state only after successful insertion
    setOrders(prev => [{...newOrder, createdAt: new Date().toISOString(), queueNumber}, ...prev]);
    setMyActiveOrderId(newOrder.id);
    localStorage.setItem("hotwheels_coffee_active_order", newOrder.id);

    // Reduce stock for each item
    for (const item of order.items) {
      const menuItem = menuItems.find(m => m.id === item.id || m.name === item.name);
      if (menuItem) {
        const newStock = Math.max(0, menuItem.stockLevel - item.quantity);
        await updateStock(menuItem.id, newStock);
      }
    }

    return newOrder;
  };

  const updateOrderStatus = async (id, status) => {
    const order = orders.find(o => o.id === id);
    const oldStatus = order?.status;

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, payment_status: status === "Cancelled" ? "cancelled" : o.payment_status } : o));
    await supabase.from('orders').update({ 
      status, 
      payment_status: status === "Cancelled" ? "cancelled" : order.payment_status 
    }).eq('id', id);

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

  const addMenuItem = async (item) => {
    const dbItem = { 
      name: item.name, 
      price: parseFloat(item.price), 
      stock_level: parseInt(item.stockLevel) || 0, 
      icon_name: item.iconName || "Coffee", 
      description: item.description || "",
      status: parseInt(item.stockLevel) > 0 ? "In Stock" : "Sold Out",
      sort_order: menuItems.length,
      supports_temp: item.supports_temp || false,
      category: item.category || "General"
    };
    const { error } = await supabase.from('menu_items').insert([dbItem]);
    if (error) throw error;
  };

  const removeMenuItem = async (id) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    await supabase.from('menu_items').delete().eq('id', id);
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const uploadPaymentProof = async (orderId, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}.${fileExt}`;
    const filePath = `proofs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Store the PATH instead of the public URL for security
    await supabase.from('orders').update({ payment_proof: filePath }).eq('id', orderId);
    return filePath;
  };

  const getSignedImageUrl = async (path) => {
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(path, 3600); // 1 hour link

    if (error) throw error;
    return data.signedUrl;
  };

  const reorderMenuItems = async (updatedItems) => {
    // Optimistically update local state
    setMenuItems(updatedItems);

    // Update each item's sort_order in Supabase
    // We can use upsert if we have IDs
    const updates = updatedItems.map((item, index) => ({
      id: item.id,
      sort_order: index,
      name: item.name, // Required for upsert if not using ON CONFLICT correctly, but better to use update loop for safety
    }));

    // Using a loop for individual updates to be safe with RLS and specific columns
    for (let i = 0; i < updatedItems.length; i++) {
      await supabase.from('menu_items').update({ sort_order: i }).eq('id', updatedItems[i].id);
    }
  };

  const confirmPayment = async (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: 'paid', status: 'Preparing' } : o));
    await supabase.from('orders').update({ payment_status: 'paid', status: 'Preparing' }).eq('id', orderId);
  };

  return (
    <SupabaseContext.Provider value={{ user, session, signIn, signOut, menuItems, orders, chats, contactMessages, partners, myActiveOrderId, updateItem, updateStock, addMenuItem, removeMenuItem, reorderMenuItems, submitOrder, updateOrderStatus, dismissActiveOrder, recoverOrder, handleLookupOrder, sendMessage, markChatRead, markMessageRead, addPartner, updatePartner, removePartner, uploadPaymentProof, getSignedImageUrl, confirmPayment, isLoaded }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useDB() {
  return useContext(SupabaseContext);
}
