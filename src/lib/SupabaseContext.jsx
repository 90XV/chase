"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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

  // Active channels ref to prevent memory leaks / stale channels
  const channelsRef = useRef([]);

  const mapItem = (i) => ({ ...i, iconName: i.icon_name, stockLevel: i.stock_level });
  const mapOrder = (o) => ({ ...o, createdAt: o.created_at, queueNumber: o.queue_number });

  // Safe lookup: checks memory first, then queries Supabase securely
  const lookupOrder = async (raw) => {
    if (!raw) return null;
    const searchRaw = String(raw).toUpperCase().trim();

    // 1. Check in local memory
    const existing = orders.find(o => {
      const qn = String(o.queueNumber || o.queue_number || "").trim();
      const id = String(o.id || "").toUpperCase().trim();
      return qn === searchRaw || 
             id === searchRaw || 
             id.endsWith(searchRaw) || 
             (searchRaw.length >= 4 && id.split('-').pop() === searchRaw);
    });

    if (existing) return existing;

    // 2. Query Supabase securely via RPC or targeted select
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('lookup_order', { search_query: searchRaw });
      if (!rpcErr && rpcData && rpcData.length > 0) {
        const found = mapOrder(rpcData[0]);
        setOrders(prev => [found, ...prev.filter(o => o.id !== found.id)]);
        return found;
      }
    } catch {
      // RPC fallback to direct select if RPC not installed
    }

    try {
      // Direct exact match query
      let query = supabase.from('orders').select('*');
      if (/^\d+$/.test(searchRaw)) {
        query = query.eq('queue_number', parseInt(searchRaw, 10));
      } else {
        query = query.or(`id.eq.${searchRaw},id.ilike.%${searchRaw}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1);
      if (!error && data && data.length > 0) {
        const found = mapOrder(data[0]);
        setOrders(prev => [found, ...prev.filter(o => o.id !== found.id)]);
        return found;
      }
    } catch (err) {
      console.error("Order lookup error:", err);
    }

    return null;
  };

  // Synchronous lookup for immediate backwards compatibility
  const handleLookupOrder = (raw) => {
    return orders.find(o => {
      const qn = String(o.queueNumber || o.queue_number || "").trim();
      const id = String(o.id || "").toUpperCase().trim();
      const searchRaw = String(raw).toUpperCase().trim();
      return qn === searchRaw || 
             id === searchRaw || 
             id.endsWith(searchRaw) || 
             (searchRaw.length >= 4 && id.split('-').pop() === searchRaw);
    });
  };

  // Clean all subscriptions
  const cleanupChannels = useCallback(() => {
    channelsRef.current.forEach(ch => {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        console.warn("Channel cleanup error:", e);
      }
    });
    channelsRef.current = [];
  }, []);

  // Main data loader and subscription manager
  useEffect(() => {
    let isSubscribed = true;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isSubscribed) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isSubscribed) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  // Whenever user state or activeOrderId changes, refresh data and realtime subscriptions
  useEffect(() => {
    let isCancelled = false;
    const savedActiveId = typeof window !== 'undefined' ? localStorage.getItem("hotwheels_coffee_active_order") : null;
    if (savedActiveId && !myActiveOrderId) {
      setMyActiveOrderId(savedActiveId);
    }

    const loadData = async () => {
      cleanupChannels();

      try {
        // 1. Load public data: Menu Items & Partners
        const [{ data: menuData }, { data: partnersData }] = await Promise.all([
          supabase.from('menu_items').select('*').order('sort_order', { ascending: true }),
          supabase.from('partners').select('*').order('sort_order', { ascending: true })
        ]);

        if (isCancelled) return;
        if (menuData) setMenuItems(menuData.map(mapItem));
        if (partnersData) setPartners(partnersData);

        // 2. Sensitive data isolation based on role
        if (user) {
          // ADMIN: Load all orders, chats, and contact messages
          const [{ data: ordersData }, { data: chatsData }, { data: contactData }] = await Promise.all([
            supabase.from('orders').select('*').order('created_at', { ascending: false }),
            supabase.from('chats').select('*').order('created_at', { ascending: true }),
            supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
          ]);

          if (isCancelled) return;
          if (ordersData) setOrders(ordersData.map(mapOrder));
          if (chatsData) setChats(chatsData);
          if (contactData) setContactMessages(contactData);

          // Admin Realtime Subscriptions (Full Tables)
          const adminOrdersSub = supabase
            .channel('admin_orders_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
              if (payload.eventType === 'INSERT') {
                setOrders(prev => [mapOrder(payload.new), ...prev.filter(o => o.id !== payload.new.id)]);
              } else if (payload.eventType === 'UPDATE') {
                setOrders(prev => prev.map(o => o.id === payload.new.id ? mapOrder(payload.new) : o));
              }
            })
            .subscribe();

          const adminChatsSub = supabase
            .channel('admin_chats_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload) => {
              if (payload.eventType === 'INSERT') {
                setChats(prev => prev.find(c => c.id === payload.new.id) ? prev : [...prev, payload.new]);
              } else if (payload.eventType === 'UPDATE') {
                setChats(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
              }
            })
            .subscribe();

          const adminContactSub = supabase
            .channel('admin_contact_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, (payload) => {
              setContactMessages(prev => [payload.new, ...prev]);
            })
            .subscribe();

          channelsRef.current.push(adminOrdersSub, adminChatsSub, adminContactSub);

        } else {
          // CUSTOMER / PUBLIC: Only load their own active order and chats if one exists
          const currentActiveId = myActiveOrderId || savedActiveId;
          if (currentActiveId) {
            const [{ data: activeOrderData }, { data: activeChatsData }] = await Promise.all([
              supabase.from('orders').select('*').eq('id', currentActiveId).maybeSingle(),
              supabase.from('chats').select('*').eq('order_id', currentActiveId).order('created_at', { ascending: true })
            ]);

            if (isCancelled) return;
            if (activeOrderData) {
              setOrders([mapOrder(activeOrderData)]);
            } else {
              setOrders([]);
            }
            if (activeChatsData) setChats(activeChatsData);

            // Customer Realtime Subscription (Scoped strictly to their active order)
            const customerOrderSub = supabase
              .channel(`customer_order_${currentActiveId}`)
              .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'orders',
                filter: `id=eq.${currentActiveId}`
              }, (payload) => {
                setOrders(prev => prev.map(o => o.id === payload.new.id ? mapOrder(payload.new) : o));
              })
              .subscribe();

            const customerChatsSub = supabase
              .channel(`customer_chats_${currentActiveId}`)
              .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'chats',
                filter: `order_id=eq.${currentActiveId}`
              }, (payload) => {
                if (payload.eventType === 'INSERT') {
                  setChats(prev => prev.find(c => c.id === payload.new.id || (c.temp && c.message === payload.new.message)) ? prev : [...prev, payload.new]);
                } else if (payload.eventType === 'UPDATE') {
                  setChats(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
                }
              })
              .subscribe();

            channelsRef.current.push(customerOrderSub, customerChatsSub);
          } else {
            setOrders([]);
            setChats([]);
          }
          setContactMessages([]);
        }

        // 3. Shared Public Subscriptions: Menu & Partners
        const menuSub = supabase
          .channel('public_menu_items')
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

        const partnersSub = supabase
          .channel('public_partners')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'partners' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              setPartners(prev => [...prev, payload.new].sort((a,b) => a.sort_order - b.sort_order));
            } else if (payload.eventType === 'UPDATE') {
              setPartners(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
            } else if (payload.eventType === 'DELETE') {
              setPartners(prev => prev.filter(p => p.id !== payload.old.id));
            }
          })
          .subscribe();

        channelsRef.current.push(menuSub, partnersSub);

      } catch (err) {
        console.error("Data load error:", err);
      } finally {
        if (!isCancelled) setIsLoaded(true);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
      cleanupChannels();
    };
  }, [user, myActiveOrderId, cleanupChannels]);

  // Admin Auth Verification Helper
  const requireAdmin = () => {
    if (!user) {
      throw new Error("Unauthorized: Administrator access required.");
    }
  };

  // ==========================================
  // MENU OPERATIONS
  // ==========================================
  const updateItem = async (id, updates) => {
    requireAdmin();
    const dbUpdate = {
      name: updates.name,
      price: updates.price !== undefined ? parseFloat(updates.price) : undefined,
      stock_level: updates.stockLevel !== undefined ? parseInt(updates.stockLevel, 10) : undefined,
      status: updates.status,
      icon_name: updates.iconName,
      description: updates.description,
      supports_temp: updates.supports_temp,
      category: updates.category
    };

    Object.keys(dbUpdate).forEach(key => {
      if (dbUpdate[key] === undefined) delete dbUpdate[key];
    });

    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    const { error } = await supabase.from('menu_items').update(dbUpdate).eq('id', id);
    if (error) throw error;
  };

  const updateStock = async (id, newStock) => {
    requireAdmin();
    const safeStock = Math.max(0, parseInt(newStock, 10) || 0);
    let status = "In Stock";
    if (safeStock === 0) status = "Sold Out";
    else if (safeStock <= 20) status = "Low Stock";
    
    await updateItem(id, { stockLevel: safeStock, status });
  };

  const addMenuItem = async (item) => {
    requireAdmin();
    const dbItem = { 
      name: String(item.name || "").trim(), 
      price: Math.max(0, parseFloat(item.price) || 0), 
      stock_level: Math.max(0, parseInt(item.stockLevel, 10) || 0), 
      icon_name: item.iconName || "Coffee", 
      description: String(item.description || "").trim(),
      status: (parseInt(item.stockLevel, 10) || 0) > 0 ? "In Stock" : "Sold Out",
      sort_order: menuItems.length,
      supports_temp: Boolean(item.supports_temp),
      category: item.category || "General"
    };

    if (!dbItem.name) throw new Error("Item name is required.");
    const { error } = await supabase.from('menu_items').insert([dbItem]);
    if (error) throw error;
  };

  const removeMenuItem = async (id) => {
    requireAdmin();
    setMenuItems(prev => prev.filter(item => item.id !== id));
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  };

  const reorderMenuItems = async (updatedItems) => {
    requireAdmin();
    setMenuItems(updatedItems);
    for (let i = 0; i < updatedItems.length; i++) {
      await supabase.from('menu_items').update({ sort_order: i }).eq('id', updatedItems[i].id);
    }
  };

  // ==========================================
  // CUSTOMER ORDER SUBMISSION (Hardened)
  // ==========================================
  const submitOrder = async (order) => {
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      throw new Error("Order must contain at least one item.");
    }

    // 1. Recalculate and validate total against current prices to prevent tampering
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of order.items) {
      const dbItem = menuItems.find(m => m.id === item.id);
      if (!dbItem) {
        throw new Error(`Item "${item.name}" is no longer available.`);
      }
      if (dbItem.stockLevel < item.quantity) {
        throw new Error(`Insufficient stock for ${dbItem.name}. Only ${dbItem.stockLevel} left.`);
      }

      calculatedSubtotal += dbItem.price * item.quantity;
      validatedItems.push({
        id: dbItem.id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
        selection: item.selection === "hot" ? "hot" : "ice"
      });
    }

    const safeDistance = Math.max(0, Math.min(100, parseFloat(order.distance) || 0));
    const deliveryFee = order.method === "delivery" ? safeDistance * 1.5 : 0;
    const finalCalculatedTotal = Math.round((calculatedSubtotal + deliveryFee) * 100) / 100;

    // 2. Generate cryptographically safe order ID
    let randomSuffix = "";
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const arr = new Uint8Array(3);
      crypto.getRandomValues(arr);
      randomSuffix = Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    } else {
      randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    const id = `ORD-${randomSuffix}`;

    // 3. Queue number calculation: query count of today's orders
    let queueNumber = 1;
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());
      queueNumber = (count || 0) + 1;
    } catch {
      queueNumber = orders.length + 1;
    }

    const newOrder = {
      id,
      status: "Pending Confirmation",
      queue_number: queueNumber,
      method: order.method === "delivery" ? "delivery" : "pickup",
      distance: safeDistance,
      total: finalCalculatedTotal,
      items: validatedItems,
      payment_method: order.paymentMethod === "transfer" ? "transfer" : "cash",
      payment_status: "pending",
      payment_proof: null
    };

    const { error: insertError } = await supabase.from('orders').insert([newOrder]);
    if (insertError) throw insertError;

    // Update state and active order in localStorage
    const savedOrder = { ...newOrder, createdAt: new Date().toISOString(), queueNumber };
    setOrders(prev => [savedOrder, ...prev]);
    setMyActiveOrderId(newOrder.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem("hotwheels_coffee_active_order", newOrder.id);
    }

    // Attempt stock decrement (will succeed if RLS permits or admin handles)
    for (const item of validatedItems) {
      const dbItem = menuItems.find(m => m.id === item.id);
      if (dbItem) {
        const newStock = Math.max(0, dbItem.stockLevel - item.quantity);
        try {
          await supabase.from('menu_items').update({ stock_level: newStock }).eq('id', dbItem.id);
        } catch {
          // Non-blocking if admin policy requires privileged update
        }
      }
    }

    return savedOrder;
  };

  const updateOrderStatus = async (id, status) => {
    requireAdmin();
    const order = orders.find(o => o.id === id);
    const oldStatus = order?.status;

    setOrders(prev => prev.map(o => o.id === id ? { 
      ...o, 
      status, 
      payment_status: status === "Cancelled" ? "cancelled" : o.payment_status 
    } : o));

    const { error } = await supabase.from('orders').update({ 
      status, 
      payment_status: status === "Cancelled" ? "cancelled" : order?.payment_status 
    }).eq('id', id);
    if (error) throw error;

    // Restore stock if cancelled
    if (status === "Cancelled" && oldStatus !== "Cancelled" && order?.items) {
      for (const item of order.items) {
        const menuItem = menuItems.find(m => m.name === item.name);
        if (menuItem) {
          await updateStock(menuItem.id, menuItem.stockLevel + item.quantity);
        }
      }
    }
  };

  const confirmPayment = async (orderId) => {
    requireAdmin();
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: 'paid', status: 'Preparing' } : o));
    const { error } = await supabase.from('orders').update({ payment_status: 'paid', status: 'Preparing' }).eq('id', orderId);
    if (error) throw error;
  };

  const dismissActiveOrder = () => {
    setMyActiveOrderId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("hotwheels_coffee_active_order");
    }
  };

  const recoverOrder = (orderId) => {
    setMyActiveOrderId(orderId);
    if (typeof window !== 'undefined') {
      localStorage.setItem("hotwheels_coffee_active_order", orderId);
    }
  };

  // ==========================================
  // CHAT (Validated)
  // ==========================================
  const sendMessage = async (orderId, sender, rawMessage) => {
    const cleanMessage = String(rawMessage || "").trim();
    if (!cleanMessage) return;
    if (cleanMessage.length > 500) {
      throw new Error("Message length cannot exceed 500 characters.");
    }

    const cleanSender = (sender === "admin" && user) ? "admin" : "customer";
    const newMessage = { 
      order_id: orderId, 
      sender: cleanSender, 
      message: cleanMessage, 
      is_read: false 
    };

    const tempMessage = { 
      ...newMessage, 
      temp: true, 
      id: "temp-" + Date.now(), 
      created_at: new Date().toISOString() 
    };
    
    setChats(prev => [...prev, tempMessage]);
    const { error } = await supabase.from('chats').insert([newMessage]);
    if (error) throw error;
  };

  const markChatRead = async (orderId, viewerRole) => {
    const roleToMark = viewerRole === 'admin' ? 'customer' : 'admin';
    const hasUnread = chats.some(c => c.order_id === orderId && c.sender === roleToMark && !c.is_read);
    
    if (hasUnread) {
      setChats(prev => prev.map(c => c.order_id === orderId && c.sender === roleToMark ? { ...c, is_read: true } : c));
      await supabase.from('chats').update({ is_read: true }).eq('order_id', orderId).eq('sender', roleToMark);
    }
  };

  const markMessageRead = async (id) => {
    requireAdmin();
    setContactMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  };

  // ==========================================
  // PARTNERS (Admin Only)
  // ==========================================
  const addPartner = async (partner) => {
    requireAdmin();
    const cleanPartner = {
      company_name: String(partner.company_name || "").trim(),
      contact_number: String(partner.contact_number || "").trim(),
      website: String(partner.website || "").trim(),
      bio: String(partner.bio || "").trim(),
      images: Array.isArray(partner.images) ? partner.images.slice(0, 8) : [],
      sort_order: partners.length
    };
    if (!cleanPartner.company_name) throw new Error("Company name is required.");
    const { error } = await supabase.from('partners').insert([cleanPartner]);
    if (error) throw error;
  };

  const updatePartner = async (id, updates) => {
    requireAdmin();
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const { error } = await supabase.from('partners').update(updates).eq('id', id);
    if (error) throw error;
  };

  const removePartner = async (id) => {
    requireAdmin();
    setPartners(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) throw error;
  };

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: String(email).trim(), 
      password 
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  };

  // ==========================================
  // SECURE STORAGE UPLOAD (Validated)
  // ==========================================
  const uploadPaymentProof = async (orderId, file) => {
    if (!file) throw new Error("No file selected.");

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      throw new Error("Invalid file format. Please upload a JPG, PNG, or WEBP image.");
    }

    // Validate file size (5MB max)
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      throw new Error("File is too large. Payment receipt image must be under 5MB.");
    }

    // Sanitize filename & extension
    const rawExt = file.name.split('.').pop() || 'jpg';
    const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeOrderId = String(orderId).replace(/[^a-zA-Z0-9_-]/g, '');
    const fileName = `${safeOrderId}_${Date.now()}.${cleanExt}`;
    const filePath = `proofs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // Attach path to order
    await supabase.from('orders').update({ payment_proof: filePath }).eq('id', orderId);
    return filePath;
  };

  const getSignedImageUrl = async (path) => {
    requireAdmin();
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(path, 1800); // 30 minutes signed link for security

    if (error) throw error;
    return data.signedUrl;
  };

  return (
    <SupabaseContext.Provider value={{ 
      user, 
      session, 
      signIn, 
      signOut, 
      menuItems, 
      orders, 
      chats, 
      contactMessages, 
      partners, 
      myActiveOrderId, 
      updateItem, 
      updateStock, 
      addMenuItem, 
      removeMenuItem, 
      reorderMenuItems, 
      submitOrder, 
      updateOrderStatus, 
      dismissActiveOrder, 
      recoverOrder, 
      handleLookupOrder,
      lookupOrder, 
      sendMessage, 
      markChatRead, 
      markMessageRead, 
      addPartner, 
      updatePartner, 
      removePartner, 
      uploadPaymentProof, 
      getSignedImageUrl, 
      confirmPayment, 
      isLoaded 
    }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useDB() {
  return useContext(SupabaseContext);
}
