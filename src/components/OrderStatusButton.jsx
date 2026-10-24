"use client";

import { useState, useEffect, useRef } from "react";
import { useDB } from "@/lib/SupabaseContext";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, Truck, CheckCircle, XCircle, X, Search, MessageSquare, Send, Clock, ShieldCheck, ChevronRight } from "lucide-react";

export default function OrderStatusButton() {
  const { orders, myActiveOrderId, recoverOrder, lookupOrder, dismissActiveOrder, chats, sendMessage, markChatRead, isLoaded } = useDB();
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [lookupInput, setLookupInput] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const scrollRef = useRef(null);

  const order = orders.find(o => o.id === myActiveOrderId);

  const orderChats = chats
    .filter(c => c.order_id === myActiveOrderId)
    .sort((a, b) => new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt));

  const unreadCount = orderChats.filter(c => c.sender === 'admin' && !c.is_read).length;

  useEffect(() => {
    if (myActiveOrderId && isLoaded && !order) {
      // Check if we can recover it
      lookupOrder(myActiveOrderId);
    }
  }, [myActiveOrderId, isLoaded, order, lookupOrder]);

  useEffect(() => {
    if (isOpen && myActiveOrderId) {
      markChatRead(myActiveOrderId, "customer");
    }
  }, [isOpen, orderChats.length, myActiveOrderId, markChatRead]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [orderChats.length, isOpen]);

  // Order Recovery lookup
  const handleLookup = async () => {
    if (!lookupInput.trim()) return;
    setIsSearching(true);
    setLookupError("");

    try {
      const found = await lookupOrder(lookupInput.trim());
      if (found) {
        recoverOrder(found.id);
        setShowLookup(false);
        setLookupInput("");
        setIsOpen(true);
      } else {
        setLookupError("Order not found. Check your order number or reference.");
      }
    } catch {
      setLookupError("Could not connect to tracking server. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const statusColors = {
    "Pending Confirmation": "#e67e22",
    "Preparing": "#f39c12",
    "Ready": "#27ae60",
    "In Delivery": "#8e44ad",
    "Completed": "#2ecc71",
    "Cancelled": "#e74c3c",
  };

  const statusIcons = {
    "Pending Confirmation": <Clock size={24} />,
    "Preparing": <Coffee size={24} />,
    "Ready": <Package size={24} />,
    "In Delivery": <Truck size={24} />,
    "Completed": <CheckCircle size={24} />,
    "Cancelled": <XCircle size={24} />,
  };

  // If no active order exists, display the subtle tracking finder button
  if (isLoaded && !myActiveOrderId) {
    return (
      <>
        <AnimatePresence>
          {showLookup && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass-panel"
              style={{
                position: "fixed",
                bottom: "95px",
                right: "25px",
                zIndex: 102,
                padding: "24px",
                width: "310px",
                background: "var(--surface)",
                color: "var(--text-dark)",
                boxShadow: "0 10px 35px rgba(0,0,0,0.25)"
              }}
            >
              <button 
                type="button"
                onClick={() => setShowLookup(false)} 
                aria-label="Close lookup modal"
                style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "inherit", cursor: "pointer", opacity: 0.6 }}
              >
                <X size={18} />
              </button>
              <h4 style={{ fontWeight: "800", marginBottom: "4px", fontSize: "1rem", color: "var(--accent)" }}>Track An Order</h4>
              <p style={{ opacity: 0.7, fontSize: "0.8rem", marginBottom: "15px" }}>Enter your Queue # (e.g. 1) or Order Reference (e.g. ORD-1234).</p>
              
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  placeholder="#1 or ORD-XXXX"
                  value={lookupInput}
                  onChange={e => { setLookupInput(e.target.value); setLookupError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleLookup()}
                  disabled={isSearching}
                  style={{ 
                    flex: 1, 
                    padding: "10px 14px", 
                    borderRadius: "20px", 
                    border: "1px solid var(--glass-border)", 
                    background: "var(--background)", 
                    color: "inherit", 
                    outline: "none", 
                    fontSize: "0.9rem" 
                  }}
                />
                <button 
                  type="button"
                  onClick={handleLookup} 
                  disabled={isSearching}
                  className="btn-primary" 
                  style={{ padding: "10px 16px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Search size={14} /> {isSearching ? "..." : "Go"}
                </button>
              </div>
              {lookupError && <p style={{ color: "#e74c3c", fontSize: "0.8rem", marginTop: "10px", fontWeight: "600" }}>{lookupError}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lookup trigger button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowLookup(prev => !prev)}
          title="Track an order"
          aria-label="Track an order"
          style={{
            position: "fixed",
            bottom: "25px",
            right: "25px",
            width: "55px",
            height: "55px",
            borderRadius: "50%",
            backgroundColor: "var(--primary)",
            color: "#fff",
            border: "none",
            boxShadow: "0 6px 25px rgba(74,112,137,0.45)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
            transition: "transform 0.2s ease"
          }}
          whileHover={{ scale: 1.08 }}
        >
          <Search size={22} />
        </motion.button>
      </>
    );
  }

  if (!order) return null;

  const currentColor = statusColors[order.status] || "#f39c12";
  const Icon = statusIcons[order.status] || <Coffee size={24} />;

  // Timeline Steps
  const steps = [
    { label: "Confirmed", active: ["Pending Confirmation", "Preparing", "Ready", "In Delivery", "Completed"].includes(order.status) },
    { label: "Brewing", active: ["Preparing", "Ready", "In Delivery", "Completed"].includes(order.status) },
    { label: order.method === "delivery" ? "On Delivery" : "Ready for Pickup", active: ["Ready", "In Delivery", "Completed"].includes(order.status) },
    { label: "Done", active: order.status === "Completed" },
  ];

  return (
    <>
      {/* Floating Animated Status Pill Button */}
      <motion.button
        key={`status-btn-${order.status}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1, y: [0, -6, 0] }}
        transition={{
          scale: { type: "spring", stiffness: 260, damping: 20 },
          y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        }}
        onClick={() => setIsOpen(true)}
        aria-label="Open Order Tracker"
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          height: "58px",
          borderRadius: "30px",
          padding: "0 20px 0 16px",
          backgroundColor: currentColor,
          color: "#fff",
          border: "none",
          boxShadow: `0 8px 30px ${currentColor}70`,
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          zIndex: 100,
          fontWeight: "800",
          fontSize: "0.95rem"
        }}
        whileHover={{ scale: 1.05 }}
      >
        {Icon}
        <span>#{order.queueNumber || order.queue_number} {order.status}</span>

        {unreadCount > 0 && (
          <div style={{ background: "#e74c3c", color: "#fff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.75rem", fontWeight: "900" }}>
            {unreadCount}
          </div>
        )}
      </motion.button>

      {/* Order Tracker Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0, left: 0, width: "100%", height: "100%",
              backgroundColor: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
              zIndex: 101,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "15px"
            }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-panel"
              style={{
                width: "100%",
                maxWidth: "440px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "28px",
                position: "relative",
                textAlign: "center",
                background: "var(--surface)",
                color: "var(--text-dark)",
                borderRadius: "20px"
              }}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
                style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "inherit", cursor: "pointer", opacity: 0.7 }}
              >
                <X size={22} />
              </button>

              <h2 style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--accent)" }}>Order Status</h2>
              <p style={{ opacity: 0.6, fontSize: "0.8rem", marginBottom: "15px" }}>ID: {order.id}</p>

              {/* Status Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `${currentColor}15`, color: currentColor, padding: "8px 18px", borderRadius: "20px", fontWeight: "800", fontSize: "0.95rem", marginBottom: "15px" }}>
                {Icon} <span>{order.status}</span>
              </div>

              {/* Queue Number Callout */}
              <div style={{ background: "var(--surface-dark)", padding: "12px", borderRadius: "14px", marginBottom: "20px" }}>
                <span style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px" }}>Your Queue Number</span>
                <h1 style={{ fontSize: "2.8rem", fontWeight: "900", color: currentColor, lineHeight: 1.1, margin: "4px 0" }}>
                  #{order.queueNumber || order.queue_number}
                </h1>
                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  Method: {order.method === "delivery" ? `Delivery (${order.distance || 0} mi)` : "Pickup"}
                </span>
              </div>

              {/* Visual Progress Stepper */}
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: "25px", padding: "0 10px" }}>
                {steps.map((st, i) => (
                  <div key={st.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 1 }}>
                    <div style={{ 
                      width: "28px", 
                      height: "28px", 
                      borderRadius: "50%", 
                      background: st.active ? currentColor : "var(--surface-dark)", 
                      color: st.active ? "#fff" : "var(--text-dark)", 
                      display: "flex", 
                      justifyContent: "center", 
                      alignItems: "center",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      border: st.active ? `2px solid ${currentColor}` : "1px solid var(--glass-border)"
                    }}>
                      {st.active ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: "0.7rem", opacity: st.active ? 1 : 0.5, fontWeight: st.active ? "700" : "500", maxWidth: "70px", textAlign: "center" }}>
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Itemized Order Summary */}
              {order.items && order.items.length > 0 && (
                <div style={{ background: "var(--surface-dark)", padding: "12px 16px", borderRadius: "12px", marginBottom: "18px", textAlign: "left", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", marginBottom: "6px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "4px" }}>
                    <span>Order Items</span>
                    <span>${order.total ? Number(order.total).toFixed(2) : "0.00"}</span>
                  </div>
                  {order.items.map((it, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", opacity: 0.85 }}>
                      <span>{it.quantity}x {it.name} {it.selection ? `(${it.selection})` : ""}</span>
                      <span>${((it.price || 0) * (it.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Realtime Barista Chat Box */}
              <div style={{ background: "var(--surface-dark)", borderRadius: "14px", border: "1px solid var(--glass-border)", padding: "12px", display: "flex", flexDirection: "column", height: "190px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontSize: "0.8rem", fontWeight: "700", opacity: 0.8 }}>
                  <MessageSquare size={14} /> Barista Dispatch Chat
                </div>

                <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "4px", marginBottom: "8px", textAlign: "left" }}>
                  {orderChats.length === 0 ? (
                    <p style={{ opacity: 0.5, textAlign: "center", margin: "auto", fontSize: "0.8rem" }}>
                      Need updates or custom notes? Message your barista here!
                    </p>
                  ) : (
                    orderChats.map((c, i) => (
                      <div 
                        key={c.id || i} 
                        style={{ 
                          alignSelf: c.sender === "customer" ? "flex-end" : "flex-start", 
                          background: c.sender === "customer" ? "var(--primary)" : "var(--surface)", 
                          border: "1px solid var(--glass-border)", 
                          padding: "6px 12px", 
                          borderRadius: "14px", 
                          maxWidth: "80%", 
                          fontSize: "0.85rem", 
                          color: c.sender === "customer" ? "#fff" : "inherit" 
                        }}
                      >
                        {c.message}
                      </div>
                    ))
                  )}
                </div>

                {order.status === "Completed" || order.status === "Cancelled" ? (
                  <button
                    type="button"
                    onClick={() => {
                      dismissActiveOrder();
                      setIsOpen(false);
                    }}
                    className="btn-primary"
                    style={{ width: "100%", padding: "8px", fontSize: "0.85rem" }}
                  >
                    Dismiss Order from Screen
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      value={msg}
                      onChange={e => setMsg(e.target.value)}
                      onKeyDown={e => { 
                        if (e.key === "Enter" && msg.trim()) { 
                          sendMessage(myActiveOrderId, "customer", msg); 
                          setMsg(""); 
                        } 
                      }}
                      placeholder="Message barista..."
                      maxLength={500}
                      style={{ 
                        flex: 1, 
                        background: "var(--background)", 
                        border: "1px solid var(--glass-border)", 
                        color: "inherit", 
                        padding: "8px 12px", 
                        borderRadius: "18px", 
                        outline: "none", 
                        fontSize: "0.85rem" 
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => { 
                        if (msg.trim()) { 
                          sendMessage(myActiveOrderId, "customer", msg); 
                          setMsg(""); 
                        } 
                      }}
                      aria-label="Send message"
                      className="btn-primary"
                      style={{ padding: "8px 12px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                      <Send size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
