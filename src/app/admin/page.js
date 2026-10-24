"use client";

import { useState, useEffect } from "react";
import { useDB } from "@/lib/SupabaseContext";
import { Lock, Unlock, Image as ImageIcon, Coffee, Clock, CheckCircle, MessageSquare, X, Mail, Inbox, Users, Trash2, Plus, Pencil, ChevronUp, ChevronDown, AlertCircle, Phone, Copy, Check, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const { 
    user, 
    signIn, 
    signOut, 
    menuItems, 
    orders, 
    chats, 
    contactMessages, 
    partners, 
    sendMessage, 
    markChatRead, 
    markMessageRead, 
    updateItem, 
    updateStock, 
    addMenuItem, 
    removeMenuItem, 
    reorderMenuItems, 
    updateOrderStatus, 
    confirmPayment, 
    getSignedImageUrl, 
    addPartner, 
    updatePartner, 
    removePartner 
  } = useDB();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' | 'orders' | 'inbox' | 'partners'
  const [orderFilter, setOrderFilter] = useState("active"); // 'active' | 'pending' | 'completed' | 'all'
  const [activeChatOrderId, setActiveChatOrderId] = useState(null);
  const [chatMsg, setChatMsg] = useState("");

  const [newPartner, setNewPartner] = useState({ company_name: "", contact_number: "", website: "", bio: "", images: [] });
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerImageUrl, setPartnerImageUrl] = useState("");

  const [newMenu, setNewMenu] = useState({ name: "", price: "", stockLevel: "", iconName: "Coffee", description: "", supports_temp: false, category: "Coffee" });
  const [showAddMenu, setShowAddMenu] = useState(false);

  const [viewingProofId, setViewingProofId] = useState(null);
  const [viewingProofUrl, setViewingProofUrl] = useState(null);
  const [isLoadingProof, setIsLoadingProof] = useState(false);

  const [toast, setToast] = useState(null);

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Mark chat as read whenever the active chat order is open and messages arrive
  useEffect(() => {
    if (activeChatOrderId) {
      markChatRead(activeChatOrderId, "admin");
    }
  }, [chats.length, activeChatOrderId, markChatRead]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);
    try {
      await signIn(email.trim(), password);
      showNotification("Admin authenticated successfully!");
    } catch (err) {
      setAuthError(err.message || "Login failed. Check your admin credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePriceChange = async (id, price) => {
    const safePrice = Math.max(0, parseFloat(price) || 0);
    try {
      await updateItem(id, { price: safePrice });
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const moveItem = async (index, direction) => {
    const newItems = [...menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    // Swap
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    try {
      await reorderMenuItems(newItems);
    } catch (err) {
      showNotification("Failed to reorder items: " + err.message, "error");
    }
  };

  const handleStockChange = async (id, val) => {
    try {
      await updateStock(id, parseInt(val, 10) || 0);
    } catch (err) {
      showNotification("Stock update failed: " + err.message, "error");
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === "pending") return o.status === "Pending Confirmation";
    if (orderFilter === "active") return o.status !== "Completed" && o.status !== "Cancelled";
    if (orderFilter === "completed") return o.status === "Completed" || o.status === "Cancelled";
    return true; // 'all'
  });

  // Not logged in view
  if (!user) {
    return (
      <div className="container section" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "65vh" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel-dark" style={{ padding: "40px", textAlign: "center", width: "100%", maxWidth: "420px", background: "var(--surface-dark)" }}>
          <div style={{ background: "rgba(74, 112, 137, 0.2)", width: "70px", height: "70px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto 20px" }}>
            <Lock size={36} color="var(--primary)" />
          </div>
          <h2 style={{ marginBottom: "8px", textTransform: "uppercase", color: "var(--accent)" }}>Staff Access</h2>
          <p style={{ opacity: 0.7, fontSize: "0.85rem", marginBottom: "25px" }}>Sign in to manage bar operations, stock, and dispatches.</p>

          {authError && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(231, 76, 60, 0.15)", color: "#e74c3c", padding: "10px 14px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "20px" }}>
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input
              type="email"
              placeholder="Admin Email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: "14px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "1rem" }}
            />
            <input
              type="password"
              placeholder="Password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: "14px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "1rem" }}
            />
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="btn-primary" 
              style={{ padding: "14px", fontSize: "1rem", opacity: isLoggingIn ? 0.7 : 1 }}
            >
              {isLoggingIn ? "Verifying..." : "Enter Portal"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container section">
      {/* Toast Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 200,
              padding: "12px 20px",
              borderRadius: "10px",
              background: toast.type === "error" ? "#e74c3c" : "#27ae60",
              color: "#fff",
              fontWeight: "700",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", textTransform: "uppercase", color: "var(--accent)" }}>
            Barista <span style={{ color: "var(--primary)" }}>HQ</span>
          </h1>
          <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>Logged in as {user.email}</p>
        </div>
        <button 
          onClick={signOut} 
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "1px solid var(--primary)", color: "var(--primary)", padding: "8px 18px", borderRadius: "20px", cursor: "pointer", fontWeight: "600" }}
        >
          <Unlock size={16} /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", overflowX: "auto", paddingBottom: "5px" }}>
        <button
          onClick={() => setActiveTab("inventory")}
          style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: activeTab === "inventory" ? "var(--primary)" : "var(--surface)", color: activeTab === "inventory" ? "#fff" : "inherit", cursor: "pointer", fontWeight: "700", whiteSpace: "nowrap" }}
        >
          Inventory & Menu
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: activeTab === "orders" ? "var(--primary)" : "var(--surface)", color: activeTab === "orders" ? "#fff" : "inherit", cursor: "pointer", fontWeight: "700", whiteSpace: "nowrap" }}
        >
          Orders Queue ({orders.filter(o => o.status !== "Completed" && o.status !== "Cancelled").length})
        </button>
        <button
          onClick={() => setActiveTab("inbox")}
          style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: activeTab === "inbox" ? "var(--primary)" : "var(--surface)", color: activeTab === "inbox" ? "#fff" : "inherit", cursor: "pointer", fontWeight: "700", position: "relative", whiteSpace: "nowrap" }}
        >
          <Inbox size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
          Inbox
          {contactMessages && contactMessages.filter(m => !m.is_read).length > 0 && (
            <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#e74c3c", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              {contactMessages.filter(m => !m.is_read).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("partners")}
          style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: activeTab === "partners" ? "var(--primary)" : "var(--surface)", color: activeTab === "partners" ? "#fff" : "inherit", cursor: "pointer", fontWeight: "700", whiteSpace: "nowrap" }}
        >
          <Users size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
          Partners
        </button>
      </div>

      {/* ======================================================== */}
      {/* INVENTORY TAB */}
      {/* ======================================================== */}
      {activeTab === "inventory" && (
        <div className="glass-panel" style={{ padding: "25px", overflowX: "auto", background: "var(--surface)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ color: "var(--accent)" }}>Menu & Stock Management</h2>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 18px", fontSize: "0.9rem" }}
            >
              {showAddMenu ? <X size={16} /> : <Plus size={16} />} {showAddMenu ? "Cancel" : "Add New Item"}
            </button>
          </div>

          {/* Add New Menu Item Form */}
          {showAddMenu && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-panel-dark" style={{ padding: "25px", marginBottom: "25px", overflow: "hidden", background: "var(--surface-dark)" }}>
              <h3 style={{ marginBottom: "15px", color: "var(--accent)" }}>Register New Menu Item</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", opacity: 0.8, display: "block", marginBottom: "4px" }}>Item Name</label>
                  <input
                    type="text" placeholder="e.g. Spanish Latte" value={newMenu.name}
                    onChange={e => setNewMenu({ ...newMenu, name: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", opacity: 0.8, display: "block", marginBottom: "4px" }}>Price ($)</label>
                  <input
                    type="number" step="0.50" min="0" placeholder="5.00" value={newMenu.price}
                    onChange={e => setNewMenu({ ...newMenu, price: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", opacity: 0.8, display: "block", marginBottom: "4px" }}>Stock Units</label>
                  <input
                    type="number" min="0" placeholder="50" value={newMenu.stockLevel}
                    onChange={e => setNewMenu({ ...newMenu, stockLevel: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", opacity: 0.8, display: "block", marginBottom: "4px" }}>Category</label>
                  <input
                    type="text" placeholder="Coffee, Fizzy, Tea, etc." value={newMenu.category}
                    onChange={e => setNewMenu({ ...newMenu, category: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}>
                  <input 
                    type="checkbox" 
                    id="supports_temp"
                    checked={newMenu.supports_temp} 
                    onChange={e => setNewMenu({ ...newMenu, supports_temp: e.target.checked })} 
                    style={{ width: "18px", height: "18px" }}
                  />
                  <label htmlFor="supports_temp" style={{ fontSize: "0.9rem", cursor: "pointer", fontWeight: "600" }}>
                    Supports Hot/Ice
                  </label>
                </div>
              </div>
              <div style={{ marginTop: "15px" }}>
                <label style={{ fontSize: "0.8rem", opacity: 0.8, display: "block", marginBottom: "4px" }}>Description</label>
                <textarea
                  placeholder="Notes, beans origin, flavor profile..." value={newMenu.description}
                  onChange={e => setNewMenu({ ...newMenu, description: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", height: "70px" }}
                />
              </div>
              <button
                onClick={async () => {
                  if (!newMenu.name.trim() || !newMenu.price) {
                    showNotification("Item name and price are required.", "error");
                    return;
                  }
                  try {
                    await addMenuItem(newMenu);
                    setNewMenu({ name: "", price: "", stockLevel: "", iconName: "Coffee", description: "", supports_temp: false, category: "Coffee" });
                    setShowAddMenu(false);
                    showNotification("Menu item added successfully!");
                  } catch (err) {
                    showNotification(err.message, "error");
                  }
                }}
                className="btn-primary" style={{ marginTop: "15px" }}
              >
                Confirm & Publish Item
              </button>
            </motion.div>
          )}

          {/* Menu Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "650px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                <th style={{ padding: "12px 10px", opacity: 0.7, width: "60px" }}>Order</th>
                <th style={{ padding: "12px 10px", opacity: 0.7 }}>Item</th>
                <th style={{ padding: "12px 10px", opacity: 0.7, width: "110px" }}>Price ($)</th>
                <th style={{ padding: "12px 10px", opacity: 0.7, width: "110px" }}>Stock</th>
                <th style={{ padding: "12px 10px", opacity: 0.7, width: "90px" }}>Hot/Ice</th>
                <th style={{ padding: "12px 10px", opacity: 0.7, width: "130px" }}>Status</th>
                <th style={{ padding: "12px 10px", opacity: 0.7, width: "80px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                  <td style={{ padding: "12px 10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <button 
                        onClick={() => moveItem(idx, 'up')} 
                        disabled={idx === 0}
                        style={{ background: "none", border: "none", color: "inherit", opacity: idx === 0 ? 0.2 : 0.6, cursor: idx === 0 ? "default" : "pointer" }}
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button 
                        onClick={() => moveItem(idx, 'down')} 
                        disabled={idx === menuItems.length - 1}
                        style={{ background: "none", border: "none", color: "inherit", opacity: idx === menuItems.length - 1 ? 0.2 : 0.6, cursor: idx === menuItems.length - 1 ? "default" : "pointer" }}
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <p style={{ fontWeight: "700" }}>{item.name}</p>
                    <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>{item.category || "General"}</p>
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      defaultValue={item.price}
                      onBlur={(e) => handlePriceChange(item.id, e.target.value)}
                      style={{ width: "80px", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "0.95rem" }}
                    />
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <input
                      type="number"
                      min="0"
                      defaultValue={item.stockLevel}
                      onBlur={(e) => handleStockChange(item.id, e.target.value)}
                      style={{ width: "80px", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "0.95rem" }}
                    />
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <input 
                      type="checkbox" 
                      checked={item.supports_temp} 
                      onChange={(e) => updateItem(item.id, { supports_temp: e.target.checked })}
                      style={{ width: "16px", height: "16px" }}
                    />
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800",
                      background: item.status === "In Stock" ? "rgba(46, 204, 113, 0.2)" : item.status === "Low Stock" ? "rgba(241, 196, 15, 0.2)" : "rgba(231, 76, 60, 0.2)",
                      color: item.status === "In Stock" ? "#27ae60" : item.status === "Low Stock" ? "#d35400" : "#c0392b"
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <button
                      onClick={async () => {
                        if (confirm(`Remove "${item.name}" from the menu?`)) {
                          try {
                            await removeMenuItem(item.id);
                            showNotification("Item removed.");
                          } catch (err) {
                            showNotification(err.message, "error");
                          }
                        }
                      }}
                      style={{ background: "rgba(231, 76, 60, 0.15)", border: "none", color: "#e74c3c", padding: "6px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================== */}
      {/* ORDERS QUEUE TAB */}
      {/* ======================================================== */}
      {activeTab === "orders" && (
        <div className="glass-panel" style={{ padding: "25px", background: "var(--surface)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <h2 style={{ color: "var(--accent)" }}>Order Dispatch Queue</h2>
            
            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "6px", background: "var(--surface-dark)", padding: "4px", borderRadius: "20px", border: "1px solid var(--glass-border)" }}>
              {["active", "pending", "completed", "all"].map(f => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "15px",
                    border: "none",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    background: orderFilter === f ? "var(--primary)" : "transparent",
                    color: orderFilter === f ? "#fff" : "inherit"
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <p style={{ opacity: 0.6, textAlign: "center", padding: "40px" }}>No orders matching current filter.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {filteredOrders.map(order => {
                const orderChats = chats.filter(c => c.order_id === order.id).sort((a, b) => new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt));
                const unreadCount = orderChats.filter(c => c.sender === 'customer' && !c.is_read).length;

                return (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "20px", background: "var(--surface-dark)", borderRadius: "14px", border: "1px solid var(--glass-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px" }}>
                      {/* Left: Order Info */}
                      <div style={{ flex: 1, minWidth: "260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                          <span style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--primary)" }}>#{order.queueNumber || order.queue_number}</span>
                          <span style={{ fontSize: "1rem", fontWeight: "800", color: "var(--accent)" }}>{order.id}</span>
                        </div>
                        <p style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: "8px" }}>{new Date(order.createdAt).toLocaleString()}</p>
                        
                        <div style={{ padding: "6px 10px", background: "var(--background)", borderRadius: "8px", display: "inline-block", fontSize: "0.85rem", marginBottom: "10px", fontWeight: "600" }}>
                          Method: {order.method?.toUpperCase()} {order.method === "delivery" && `(${order.distance || 0} mi)`}
                        </div>

                        {/* Order Items */}
                        <ul style={{ listStyle: "inside", opacity: 0.9, fontSize: "0.9rem", margin: "6px 0" }}>
                          {order.items?.map((item, idx) => (
                            <li key={idx}>
                              <strong>{item.quantity}x</strong> {item.name} 
                              {item.selection && <span style={{ fontSize: "0.75rem", opacity: 0.8, fontWeight: "700", marginLeft: "4px" }}>({item.selection.toUpperCase()})</span>}
                            </li>
                          ))}
                        </ul>

                        {/* Payment & Receipt Details */}
                        <div style={{ marginTop: "12px", padding: "10px 14px", background: "var(--background)", borderRadius: "8px", fontSize: "0.85rem", border: "1px solid var(--glass-border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span>Payment: <strong style={{ color: "var(--accent)" }}>{order.payment_method?.toUpperCase()}</strong></span>
                            <span>Status: <strong style={{ color: order.payment_status === 'paid' ? '#2ecc71' : '#f1c40f' }}>{order.payment_status?.toUpperCase()}</strong></span>
                          </div>
                          <div>Total Due: <strong>${Number(order.total || 0).toFixed(2)}</strong></div>

                          {order.payment_proof && (
                            <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--glass-border)" }}>
                              <button 
                                onClick={async () => {
                                  if (viewingProofId === order.id) {
                                    setViewingProofId(null);
                                    setViewingProofUrl(null);
                                  } else {
                                    try {
                                      setIsLoadingProof(true);
                                      const url = await getSignedImageUrl(order.payment_proof);
                                      setViewingProofId(order.id);
                                      setViewingProofUrl(url);
                                    } catch (err) {
                                      showNotification("Failed to load receipt: " + err.message, "error");
                                    } finally {
                                      setIsLoadingProof(false);
                                    }
                                  }
                                }}
                                style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--primary)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "0.85rem", fontWeight: "700" }}
                              >
                                <ImageIcon size={14} /> 
                                {isLoadingProof && viewingProofId === order.id ? "Loading..." : viewingProofId === order.id ? "Hide Receipt" : "View Customer Payment Receipt"}
                              </button>
                              
                              {viewingProofId === order.id && viewingProofUrl && (
                                <div style={{ marginTop: "10px" }}>
                                  <img 
                                    src={viewingProofUrl} 
                                    alt="Payment Screenshot" 
                                    style={{ width: "100%", maxWidth: "300px", borderRadius: "8px", border: "1px solid var(--glass-border)", display: "block" }} 
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button 
                            onClick={() => { setActiveChatOrderId(order.id); markChatRead(order.id, 'admin'); }} 
                            style={{ background: "var(--surface)", border: "1px solid var(--glass-border)", padding: "6px 14px", borderRadius: "20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "inherit", fontSize: "0.85rem", position: "relative" }}
                          >
                            <MessageSquare size={14} /> Chat
                            {unreadCount > 0 && <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#e74c3c", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{unreadCount}</span>}
                          </button>

                          <div style={{
                            padding: "6px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "800",
                            background: order.status === "Completed" || order.status === "Ready" ? "rgba(46, 204, 113, 0.2)" : order.status === "Cancelled" ? "rgba(231, 76, 60, 0.2)" : order.status === "In Delivery" ? "rgba(155, 89, 182, 0.2)" : "rgba(241, 196, 15, 0.2)",
                            color: order.status === "Completed" || order.status === "Ready" ? "#2ecc71" : order.status === "Cancelled" ? "#e74c3c" : order.status === "In Delivery" ? "#9b59b6" : "#f1c40f"
                          }}>
                            {order.status}
                          </div>
                        </div>

                        {/* Status Transition Action Buttons */}
                        {order.status === "Pending Confirmation" && (
                          <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button 
                              onClick={async () => {
                                try {
                                  await confirmPayment(order.id);
                                  showNotification("Order confirmed & sent to brew queue!");
                                } catch (e) {
                                  showNotification(e.message, "error");
                                }
                              }} 
                              className="btn-primary" 
                              style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                            >
                              Confirm & Prepare
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm("Cancel this order?")) {
                                  await updateOrderStatus(order.id, "Cancelled");
                                }
                              }} 
                              className="btn-primary" 
                              style={{ padding: "8px 16px", fontSize: "0.9rem", background: "#e74c3c", borderColor: "#e74c3c" }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {order.status === "Preparing" && (
                          <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button 
                              onClick={() => updateOrderStatus(order.id, "Ready")} 
                              className="btn-primary" 
                              style={{ padding: "6px 14px", fontSize: "0.85rem", background: "#2ecc71", borderColor: "#2ecc71", color: "#fff" }}
                            >
                              Ready for Pickup
                            </button>
                            <button 
                              onClick={() => updateOrderStatus(order.id, "In Delivery")} 
                              className="btn-primary" 
                              style={{ padding: "6px 14px", fontSize: "0.85rem", background: "#9b59b6", borderColor: "#9b59b6", color: "#fff" }}
                            >
                              Out for Delivery
                            </button>
                            <button 
                              onClick={() => confirm("Cancel order?") && updateOrderStatus(order.id, "Cancelled")} 
                              className="btn-primary" 
                              style={{ padding: "6px 14px", fontSize: "0.85rem", background: "#e74c3c", borderColor: "#e74c3c", color: "#fff" }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {(order.status === "Ready" || order.status === "In Delivery") && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, "Completed")} 
                            className="btn-primary" 
                            style={{ marginTop: "8px", padding: "8px 18px", fontSize: "0.9rem", background: "#27ae60", borderColor: "#27ae60", color: "#fff" }}
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chat Drawer */}
                    {activeChatOrderId === order.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: "15px", width: "100%", background: "var(--background)", borderRadius: "10px", border: "1px solid var(--glass-border)", padding: "12px", display: "flex", flexDirection: "column", height: "200px" }}>
                        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "6px", marginBottom: "10px" }}>
                          {orderChats.length === 0 ? (
                            <p style={{ opacity: 0.5, textAlign: "center", margin: "auto", fontSize: "0.85rem" }}>No messages yet. Send a note to the customer.</p>
                          ) : (
                            orderChats.map((c, i) => (
                              <div key={c.id || i} style={{ alignSelf: c.sender === "admin" ? "flex-end" : "flex-start", background: c.sender === "admin" ? "var(--primary)" : "var(--surface)", border: "1px solid var(--glass-border)", padding: "6px 12px", borderRadius: "12px", maxWidth: "80%", fontSize: "0.85rem", color: c.sender === "admin" ? "#fff" : "inherit" }}>
                                {c.message}
                              </div>
                            ))
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <input
                            type="text"
                            value={chatMsg}
                            onChange={e => setChatMsg(e.target.value)}
                            onKeyDown={e => { 
                              if (e.key === "Enter" && chatMsg.trim()) { 
                                sendMessage(order.id, "admin", chatMsg); 
                                setChatMsg(""); 
                              } 
                            }}
                            placeholder="Message customer..."
                            maxLength={500}
                            style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--glass-border)", color: "inherit", padding: "8px 12px", borderRadius: "18px", outline: "none", fontSize: "0.85rem" }}
                          />
                          <button
                            onClick={() => { 
                              if (chatMsg.trim()) { 
                                sendMessage(order.id, "admin", chatMsg); 
                                setChatMsg(""); 
                              } 
                            }}
                            className="btn-primary"
                            style={{ padding: "8px 14px", borderRadius: "20px", fontSize: "0.8rem" }}
                          >
                            Send
                          </button>
                          <button onClick={() => setActiveChatOrderId(null)} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "0 8px" }}>
                            <X size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* INBOX TAB */}
      {/* ======================================================== */}
      {activeTab === "inbox" && (
        <div className="glass-panel" style={{ padding: "25px", background: "var(--surface)" }}>
          <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "var(--accent)" }}>
            <Mail size={22} color="var(--primary)" /> Dispatches & Catering Enquiries
          </h2>
          {(!contactMessages || contactMessages.length === 0) ? (
            <p style={{ opacity: 0.6, textAlign: "center", padding: "40px" }}>No messages in inbox.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {contactMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: "18px",
                    background: msg.is_read ? "var(--surface-dark)" : "rgba(74, 112, 137, 0.15)",
                    borderRadius: "12px",
                    border: msg.is_read ? "1px solid var(--glass-border)" : "1px solid rgba(74, 112, 137, 0.4)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "800", fontSize: "1.05rem" }}>{msg.name}</span>
                      <span style={{
                        padding: "2px 10px", borderRadius: "14px", fontSize: "0.75rem", fontWeight: "700",
                        background: msg.source === "catering" ? "rgba(155, 89, 182, 0.2)" : "rgba(74, 112, 137, 0.2)",
                        color: msg.source === "catering" ? "#9b59b6" : "var(--primary)"
                      }}>
                        {msg.source === "catering" ? "🎪 Catering" : "📬 General"}
                      </span>
                      {!msg.is_read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e74c3c" }} />}
                    </div>
                    <a href={`mailto:${msg.email}`} style={{ fontSize: "0.85rem", color: "var(--primary)", textDecoration: "underline", display: "inline-block", marginBottom: "8px" }}>
                      {msg.email}
                    </a>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{msg.message}</p>
                    <p style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "8px" }}>{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                  {!msg.is_read && (
                    <button
                      onClick={() => markMessageRead(msg.id)}
                      style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid var(--glass-border)", background: "var(--surface)", cursor: "pointer", whiteSpace: "nowrap", color: "inherit", fontSize: "0.85rem", fontWeight: "600" }}
                    >
                      Mark as Read
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* PARTNERS TAB */}
      {/* ======================================================== */}
      {activeTab === "partners" && (
        <div className="glass-panel" style={{ padding: "25px", background: "var(--surface)" }}>
          <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "var(--accent)" }}>
            <Users size={22} color="var(--primary)" /> Partner Directory Management
          </h2>

          {/* Add/Edit Form */}
          <div className="glass-panel-dark" style={{ padding: "20px", marginBottom: "25px", background: "var(--surface-dark)" }}>
            <h3 style={{ marginBottom: "15px", color: "var(--accent)" }}>{editingPartner ? "Edit Partner" : "Add New Partner"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <input
                type="text" placeholder="Company / Brand Name" value={newPartner.company_name}
                onChange={e => setNewPartner({ ...newPartner, company_name: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit" }}
              />
              <input
                type="text" placeholder="Contact Number (e.g. +673...)" value={newPartner.contact_number}
                onChange={e => setNewPartner({ ...newPartner, contact_number: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit" }}
              />
              <input
                type="text" placeholder="Website or IG link" value={newPartner.website}
                onChange={e => setNewPartner({ ...newPartner, website: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit" }}
              />
              <textarea
                placeholder="Partner Bio / Description" value={newPartner.bio}
                onChange={e => setNewPartner({ ...newPartner, bio: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", height: "45px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button
                onClick={async () => {
                  if (!newPartner.company_name.trim()) {
                    showNotification("Company name is required.", "error");
                    return;
                  }
                  try {
                    if (editingPartner) {
                      await updatePartner(editingPartner.id, newPartner);
                      showNotification("Partner updated successfully!");
                      setEditingPartner(null);
                    } else {
                      await addPartner(newPartner);
                      showNotification("Partner added!");
                    }
                    setNewPartner({ company_name: "", contact_number: "", website: "", bio: "", images: [] });
                  } catch (err) {
                    showNotification(err.message, "error");
                  }
                }}
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.9rem" }}
              >
                {editingPartner ? "Save Changes" : "Publish Partner"}
              </button>
              {editingPartner && (
                <button
                  onClick={() => {
                    setEditingPartner(null);
                    setNewPartner({ company_name: "", contact_number: "", website: "", bio: "", images: [] });
                  }}
                  style={{ background: "transparent", border: "1px solid var(--glass-border)", padding: "8px 16px", borderRadius: "20px", cursor: "pointer", color: "inherit" }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Existing Partners */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px" }}>
            {partners.map(p => (
              <div key={p.id} className="glass-panel-dark" style={{ padding: "18px", position: "relative", background: "var(--surface-dark)" }}>
                <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setEditingPartner(p);
                      setNewPartner({ company_name: p.company_name, contact_number: p.contact_number, website: p.website, bio: p.bio, images: p.images || [] });
                    }}
                    style={{ background: "rgba(74, 112, 137, 0.2)", border: "none", color: "var(--primary)", padding: "6px", borderRadius: "50%", cursor: "pointer" }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Remove partner "${p.company_name}"?`)) {
                        await removePartner(p.id);
                        showNotification("Partner deleted.");
                      }
                    }}
                    style={{ background: "rgba(231, 76, 60, 0.2)", border: "none", color: "#e74c3c", padding: "6px", borderRadius: "50%", cursor: "pointer" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h4 style={{ color: "var(--accent)", fontSize: "1.1rem", marginBottom: "6px" }}>{p.company_name}</h4>
                <p style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: "8px" }}>{p.bio}</p>
                <div style={{ fontSize: "0.8rem", opacity: 0.8, display: "flex", flexDirection: "column", gap: "2px" }}>
                  {p.contact_number && <span>📞 {p.contact_number}</span>}
                  {p.website && <span>🌐 {p.website}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
