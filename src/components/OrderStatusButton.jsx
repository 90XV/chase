"use client";

import { useState, useEffect, useRef } from "react";
import { useDB } from "@/lib/SupabaseContext";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, Truck, CheckCircle, XCircle, X, Search } from "lucide-react";

export default function OrderStatusButton() {
  const { orders, myActiveOrderId, recoverOrder, dismissActiveOrder, chats, sendMessage, markChatRead, isLoaded } = useDB();
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [lookupInput, setLookupInput] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [showLookup, setShowLookup] = useState(false);
  const scrollRef = useRef(null);

  const order = orders.find(o => o.id === myActiveOrderId);

  const orderChats = chats.filter(c => c.order_id === myActiveOrderId).sort((a, b) => new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt));
  const unreadCount = orderChats.filter(c => c.sender === 'admin' && !c.is_read).length;

  useEffect(() => {
    if (myActiveOrderId && isLoaded && !order) {
      dismissActiveOrder();
    }
  }, [myActiveOrderId, isLoaded, order, dismissActiveOrder]);

  useEffect(() => {
    if (isOpen && myActiveOrderId) {
      markChatRead(myActiveOrderId, "customer");
    }
  }, [isOpen, orderChats.length, myActiveOrderId, markChatRead]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [orderChats.length, isOpen]);

  // Order Recovery lookup
  const handleLookup = () => {
    const raw = lookupInput.trim().toUpperCase().replace(/^#/, "");
    const found = orders.find(o => {
      const qn = String(o.queueNumber || o.queue_number || "");
      const id = (o.id || "").toUpperCase();
      return qn === raw || id === raw || id.endsWith(raw);
    });
    if (found) {
      recoverOrder(found.id);
      setShowLookup(false);
      setLookupInput("");
    } else {
      setLookupError("Order not found. Double-check your number.");
    }
  };

  // Show recovery prompt when no active order exists (and data is loaded)
  if (isLoaded && !myActiveOrderId) {
    return (
      <>
        <AnimatePresence>
          {showLookup && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="glass-panel"
              style={{
                position: "fixed",
                bottom: "110px",
                right: "20px",
                zIndex: 102,
                padding: "20px",
                width: "280px",
                background: "var(--surface)",
                color: "var(--text-dark)",
              }}
            >
              <button onClick={() => setShowLookup(false)} style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
                <X size={18} />
              </button>
              <p style={{ fontWeight: "700", marginBottom: "5px", fontSize: "0.95rem" }}>Have a pending order?</p>
              <p style={{ opacity: 0.7, fontSize: "0.8rem", marginBottom: "12px" }}>Enter your queue number to track it.</p>
              <div style={{ display: "flex" }}>
                <input
                  type="text"
                  placeholder="#13 or ORD-XXXXXX"
                  value={lookupInput}
                  onChange={e => { setLookupInput(e.target.value); setLookupError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleLookup()}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: "20px", border: "1px solid var(--glass-border)", background: "transparent", color: "inherit", outline: "none", fontSize: "0.9rem" }}
                />
                <button onClick={handleLookup} className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center" }}>
                  <Search size={14} /> Go
                </button>
              </div>
              {lookupError && <p style={{ color: "#e74c3c", fontSize: "0.8rem", marginTop: "8px" }}>{lookupError}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lookup trigger button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowLookup(prev => !prev)}
          title="Track a pending order"
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "var(--primary)",
            color: "#fff",
            border: "none",
            boxShadow: "0 8px 32px rgba(74,112,137,0.5)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
            opacity: 0.7,
          }}
        >
          <Search size={22} />
        </motion.button>
      </>
    );
  }

  if (!order) return null;

  const statusColors = {
    "Preparing": "#f1c40f",
    "Ready": "#2ecc71",
    "In Delivery": "#9b59b6",
    "Completed": "#2ecc71",
    "Cancelled": "#e74c3c",
  };

  const statusIcons = {
    "Preparing": <Coffee size={24} />,
    "Ready": <Package size={24} />,
    "In Delivery": <Truck size={24} />,
    "Completed": <CheckCircle size={24} />,
    "Cancelled": <XCircle size={24} />,
  };

  const currentColor = statusColors[order.status] || "#f1c40f";
  const Icon = statusIcons[order.status] || <Coffee size={24} />;

  return (
    <>
      <motion.button
        key={`status-btn-${order.status}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1, y: [0, -10, 0] }}
        transition={{
          scale: { type: "spring", stiffness: 260, damping: 20 },
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        }}
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "65px",
          height: "65px",
          borderRadius: "50%",
          backgroundColor: currentColor,
          color: "#fff",
          border: "none",
          boxShadow: `0 8px 32px ${currentColor}80`,
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        {Icon}
        {unreadCount > 0 ? (
          <div style={{ position: "absolute", top: "-5px", right: "-5px", width: "22px", height: "22px", borderRadius: "50%", background: "#e74c3c", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.8rem", fontWeight: "700" }}>
            {unreadCount}
          </div>
        ) : (
          <div style={{ position: "absolute", top: "5px", right: "5px", width: "12px", height: "12px", borderRadius: "50%", background: "var(--background)", border: `2px solid ${currentColor}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }} />
          </div>
        )}
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0, left: 0, width: "100%", height: "100%",
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(5px)",
              zIndex: 101,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px"
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
                maxWidth: "400px",
                padding: "30px",
                position: "relative",
                textAlign: "center",
                background: "var(--surface)",
                color: "var(--text-dark)"
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
              >
                <X size={24} />
              </button>

              <h2 style={{ marginBottom: "5px", color: "var(--accent)" }}>Order Tracker</h2>
              <p style={{ opacity: 0.7, marginBottom: "20px", fontSize: "0.85rem" }}>{order.id}</p>

              <motion.div
                key={order.status}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  margin: "0 auto 15px",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: `${currentColor}20`,
                  color: currentColor,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "2rem"
                }}>
                {Icon}
              </motion.div>

              <h1 style={{ fontSize: "3.5rem", fontWeight: "900", marginBottom: "5px", color: currentColor }}>
                #{order.queueNumber}
              </h1>
              <p style={{ fontSize: "1rem", fontWeight: "600", opacity: 0.8, marginBottom: "25px", textTransform: "uppercase", letterSpacing: "1px", color: currentColor }}>
                {order.status}
              </p>

              <div style={{ background: "var(--surface-dark)", borderRadius: "12px", border: "1px solid var(--glass-border)", padding: "10px", marginTop: "5px", display: "flex", flexDirection: "column", height: "200px" }}>
                <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "5px", marginBottom: "10px", textAlign: "left" }}>
                  {orderChats.length === 0 ? (
                    <p style={{ opacity: 0.5, textAlign: "center", marginTop: "40px", fontSize: "0.9rem" }}>No messages. Send us a text!</p>
                  ) : (
                    orderChats.map((c, i) => (
                      <div key={c.id || i} style={{ alignSelf: c.sender === "customer" ? "flex-end" : "flex-start", background: c.sender === "customer" ? "var(--primary)" : "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", padding: "8px 12px", borderRadius: "15px", maxWidth: "80%", fontSize: "0.9rem", color: c.sender === "customer" ? "#fff" : "var(--text-dark)" }}>
                        {c.message}
                      </div>
                    ))
                  )}
                </div>
                {(order.status === "Completed" || order.status === "Cancelled") ? (
                  <button
                    onClick={() => {
                      dismissActiveOrder();
                      setIsOpen(false);
                    }}
                    className="btn-primary"
                    style={{ width: "100%", padding: "8px", fontSize: "0.9rem" }}
                  >
                    Dismiss Order
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "5px" }}>
                    <input
                      type="text"
                      value={msg}
                      onChange={e => setMsg(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && msg) { sendMessage(myActiveOrderId, "customer", msg); setMsg(""); } }}
                      placeholder="Message..."
                      style={{ flex: 1, background: "transparent", border: "1px solid var(--glass-border)", color: "inherit", padding: "8px 12px", borderRadius: "20px", outline: "none", fontSize: "0.9rem" }}
                    />
                    <button
                      onClick={() => { if (msg) { sendMessage(myActiveOrderId, "customer", msg); setMsg(""); } }}
                      className="btn-primary"
                      style={{ padding: "8px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                      ✈️
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
