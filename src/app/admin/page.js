"use client";

import { useState, useEffect } from "react";
import { useDB } from "@/lib/SupabaseContext";
import { Lock, Unlock, Image as ImageIcon, Coffee, Clock, CheckCircle, MessageSquare, X, Mail, Inbox, Users, Trash2, Plus, Pencil } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPage() {
  const { menuItems, orders, chats, contactMessages, partners, sendMessage, markChatRead, markMessageRead, updateItem, updateStock, updateOrderStatus, addPartner, updatePartner, removePartner } = useDB();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' | 'orders' | 'inbox' | 'partners'
  const [activeChatOrderId, setActiveChatOrderId] = useState(null);
  const [chatMsg, setChatMsg] = useState("");
  const [newPartner, setNewPartner] = useState({ company_name: "", contact_number: "", website: "", bio: "", images: [] });
  const [editingPartner, setEditingPartner] = useState(null);

  // Mark as read whenever the chat active tab is open and chats update
  useEffect(() => {
    if (activeChatOrderId) {
      markChatRead(activeChatOrderId, "admin");
    }
  }, [chats.length, activeChatOrderId, markChatRead]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_KEY) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect master key.");
    }
  };

  const handlePriceChange = (id, val) => {
    updateItem(id, { price: parseFloat(val) || 0 });
  };

  const handleStockChange = (id, val) => {
    updateStock(id, parseInt(val) || 0);
  };

  const handleImageChange = (id) => {
    const url = prompt("Enter image URL (mock upload):");
    if (url) {
      updateItem(id, { image: url });
      alert("Image updated!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container section" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel-dark" style={{ padding: "40px", textAlign: "center", width: "100%", maxWidth: "400px" }}>
          <Lock size={48} color="var(--accent)" style={{ marginBottom: "20px" }} />
          <h2 style={{ marginBottom: "30px", textTransform: "uppercase" }}>Admin Access</h2>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input 
              type="password" 
              placeholder="Enter Master Key..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "1rem" }}
            />
            <button type="submit" className="btn-primary">Unlock</button>
          </form>
          <p style={{ marginTop: "20px", fontSize: "0.85rem", opacity: 0.6 }}>Use your master key to unlock</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", textTransform: "uppercase", color: "var(--accent)" }}>
          Admin <span style={{ color: "var(--primary)" }}>Dashboard</span>
        </h1>
        <button onClick={() => setIsAuthenticated(false)} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "1px solid var(--primary)", color: "var(--primary)", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" }}>
          <Unlock size={16} /> Lock System
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <button 
          onClick={() => setActiveTab("inventory")}
          style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: activeTab === "inventory" ? "var(--primary)" : "var(--surface)", color: activeTab === "inventory" ? "#fff" : "inherit", cursor: "pointer", fontWeight: "700" }}
        >
          Inventory Management
        </button>
        <button 
          onClick={() => setActiveTab("orders")}
          style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: activeTab === "orders" ? "var(--primary)" : "var(--surface)", color: activeTab === "orders" ? "#fff" : "inherit", cursor: "pointer", fontWeight: "700" }}
        >
          Barista Queue ({orders.filter(o => o.status !== "Completed").length})
        </button>
        <button 
          onClick={() => setActiveTab("inbox")}
          style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: activeTab === "inbox" ? "var(--primary)" : "var(--surface)", color: activeTab === "inbox" ? "#fff" : "inherit", cursor: "pointer", fontWeight: "700", position: "relative" }}
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
          style={{ padding: "10px 20px", borderRadius: "20px", border: "none", background: activeTab === "partners" ? "var(--primary)" : "var(--surface)", color: activeTab === "partners" ? "#fff" : "inherit", cursor: "pointer", fontWeight: "700" }}
        >
          <Users size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
          Partners
        </button>
      </div>

      {activeTab === "inventory" && (
        <div className="glass-panel" style={{ padding: "30px", overflowX: "auto" }}>
        <h2 style={{ marginBottom: "20px" }}>Inventory & Menu Management</h2>
        
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <th style={{ padding: "15px 10px", opacity: 0.8 }}>Item</th>
              <th style={{ padding: "15px 10px", opacity: 0.8, width: "120px" }}>Price ($)</th>
              <th style={{ padding: "15px 10px", opacity: 0.8, width: "120px" }}>Stock Level</th>
              <th style={{ padding: "15px 10px", opacity: 0.8, width: "150px" }}>Status</th>
              <th style={{ padding: "15px 10px", opacity: 0.8, width: "150px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <td style={{ padding: "15px 10px", fontWeight: "700" }}>{item.name}</td>
                <td style={{ padding: "15px 10px" }}>
                  <input 
                    type="number" 
                    step="0.50"
                    value={item.price} 
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    style={{ width: "80px", padding: "8px", borderRadius: "5px", border: "1px solid rgba(0,0,0,0.2)", background: "rgba(255,255,255,0.5)", color: "inherit", fontSize: "1rem" }}
                  />
                </td>
                <td style={{ padding: "15px 10px" }}>
                  <input 
                    type="number" 
                    value={item.stockLevel} 
                    onChange={(e) => handleStockChange(item.id, e.target.value)}
                    style={{ width: "80px", padding: "8px", borderRadius: "5px", border: "1px solid rgba(0,0,0,0.2)", background: "rgba(255,255,255,0.5)", color: "inherit", fontSize: "1rem" }}
                  />
                </td>
                <td style={{ padding: "15px 10px" }}>
                  <span style={{ 
                    padding: "4px 8px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: "700",
                    background: item.status === "In Stock" ? "rgba(46, 204, 113, 0.2)" : item.status === "Low Stock" ? "rgba(241, 196, 15, 0.2)" : "rgba(231, 76, 60, 0.2)",
                    color: item.status === "In Stock" ? "#27ae60" : item.status === "Low Stock" ? "#d35400" : "#c0392b"
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: "15px 10px" }}>
                  <button onClick={() => handleImageChange(item.id)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", background: "var(--primary)", border: "none", color: "#fff", borderRadius: "15px", cursor: "pointer", fontSize: "0.8rem" }}>
                    <ImageIcon size={14} /> Update Pic
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {activeTab === "orders" && (
      <div className="glass-panel" style={{ padding: "30px" }}>
        <h2 style={{ marginBottom: "20px" }}>Active Order Queue</h2>
        {orders.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No orders in the system.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {orders.map(order => {
              const orderChats = chats.filter(c => c.order_id === order.id).sort((a,b) => new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt));
              const unreadCount = orderChats.filter(c => c.sender === 'customer' && !c.is_read).length;

              return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "20px", background: "var(--surface-dark)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px" }}>
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <h3 style={{ fontSize: "1.2rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: "10px" }}>
                      {order.id}
                    </h3>
                    <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "10px" }}>{new Date(order.createdAt).toLocaleString()}</p>
                    <p style={{ fontWeight: "700", marginBottom: "5px" }}>Method: {order.method.toUpperCase()} {order.method === "delivery" && `(${order.distance} miles)`}</p>
                    <ul style={{ listStyle: "inside", opacity: 0.9 }}>
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item.quantity}x {item.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => { setActiveChatOrderId(order.id); markChatRead(order.id, 'admin'); }} style={{ background: "var(--surface)", border: "1px solid var(--glass-border)", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dark)", fontSize: "0.9rem", position: "relative" }}>
                        <MessageSquare size={16} /> Chat
                        {unreadCount > 0 && <span style={{ position: "absolute", top: "-5px", right: "-5px", background: "#e74c3c", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{unreadCount}</span>}
                      </button>
                      
                      <div style={{ 
                        display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "20px", fontSize: "0.9rem", fontWeight: "700",
                        background: order.status === "Completed" || order.status === "Ready" ? "rgba(46, 204, 113, 0.2)" : order.status === "Cancelled" ? "rgba(231, 76, 60, 0.2)" : order.status === "In Delivery" ? "rgba(155, 89, 182, 0.2)" : "rgba(241, 196, 15, 0.2)", 
                        color: order.status === "Completed" || order.status === "Ready" ? "#2ecc71" : order.status === "Cancelled" ? "#e74c3c" : order.status === "In Delivery" ? "#9b59b6" : "#f1c40f"
                      }}>
                        {order.status === "Completed" ? <CheckCircle size={16}/> : <Clock size={16}/>} {order.status}
                      </div>
                    </div>
                    {order.status === "Preparing" && (
                      <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <button onClick={() => updateOrderStatus(order.id, "Ready")} className="btn-primary" style={{ padding: "6px 16px", fontSize: "0.9rem", background: "#2ecc71", borderColor: "#2ecc71", color: "#fff" }}>Ready for Pickup</button>
                        <button onClick={() => updateOrderStatus(order.id, "In Delivery")} className="btn-primary" style={{ padding: "6px 16px", fontSize: "0.9rem", background: "#9b59b6", borderColor: "#9b59b6", color: "#fff" }}>Out for Delivery</button>
                        <button onClick={() => updateOrderStatus(order.id, "Cancelled")} className="btn-primary" style={{ padding: "6px 16px", fontSize: "0.9rem", background: "#e74c3c", borderColor: "#e74c3c", color: "#fff" }}>Cancel Order</button>
                      </div>
                    )}
                    {(order.status === "Ready" || order.status === "In Delivery") && (
                      <button onClick={() => updateOrderStatus(order.id, "Completed")} className="btn-primary" style={{ marginTop: "10px", padding: "6px 16px", fontSize: "0.9rem", background: "#27ae60", borderColor: "#27ae60", color: "#fff" }}>Complete Order</button>
                    )}
                  </div>
                </div>

                {/* Optional Chat View */}
                {activeChatOrderId === order.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: "15px", width: "100%", background: "var(--background)", borderRadius: "8px", border: "1px solid var(--glass-border)", padding: "10px", display: "flex", flexDirection: "column", height: "180px", overflow: "hidden" }}>
                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "5px", marginBottom: "10px" }}>
                      {orderChats.length === 0 ? (
                        <p style={{ opacity: 0.5, textAlign: "center", marginTop: "20px", fontSize: "0.85rem" }}>No messages. Send a heads up!</p>
                      ) : (
                        orderChats.map((c, i) => (
                          <div key={c.id || i} style={{ alignSelf: c.sender === "admin" ? "flex-end" : "flex-start", background: c.sender === "admin" ? "var(--primary)" : "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", padding: "6px 10px", borderRadius: "10px", maxWidth: "80%", fontSize: "0.85rem", color: c.sender === "admin" ? "#fff" : "var(--text-dark)" }}>
                            {c.message}
                          </div>
                        ))
                      )}
                    </div>
                    {(order.status === "Completed" || order.status === "Cancelled") ? (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--glass-border)", paddingTop: "10px" }}>
                        <span style={{ opacity: 0.7, fontSize: "0.85rem", fontStyle: "italic", color: "var(--accent)" }}>Order {order.status}. Chat closed.</span>
                        <button onClick={() => setActiveChatOrderId(null)} className="btn-primary" style={{ padding: "6px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", background: "transparent", border: "1px solid var(--glass-border)", color: "var(--text-dark)" }}>
                          <X size={14}/>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "5px" }}>
                        <input 
                          type="text" 
                          value={chatMsg} 
                          onChange={e => setChatMsg(e.target.value)} 
                          onKeyDown={e => { if (e.key === "Enter" && chatMsg) { sendMessage(order.id, "admin", chatMsg); setChatMsg(""); } }}
                          placeholder="Reply to customer..." 
                          style={{ flex: 1, background: "transparent", border: "1px solid var(--glass-border)", color: "inherit", padding: "6px 10px", borderRadius: "15px", outline: "none", fontSize: "0.85rem" }}
                        />
                        <button 
                          onClick={() => { if(chatMsg) { sendMessage(order.id, "admin", chatMsg); setChatMsg(""); } }}
                          className="btn-primary" 
                          style={{ padding: "6px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                          ✈️
                        </button>
                        <button onClick={() => setActiveChatOrderId(null)} className="btn-primary" style={{ padding: "6px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", background: "transparent", border: "1px solid var(--glass-border)", color: "var(--text-dark)" }}>
                          <X size={14}/>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
              );
            })}
          </div>
        )}
      </div>
      )}
      {activeTab === "inbox" && (
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Mail size={24} color="var(--primary)" /> Contact Inbox
          </h2>
          {(!contactMessages || contactMessages.length === 0) ? (
            <p style={{ opacity: 0.6 }}>No messages yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {contactMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: "20px",
                    background: msg.is_read ? "var(--surface)" : "rgba(74, 112, 137, 0.1)",
                    borderRadius: "12px",
                    border: msg.is_read ? "1px solid var(--glass-border)" : "1px solid rgba(74, 112, 137, 0.4)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "700", fontSize: "1rem" }}>{msg.name}</span>
                      <span style={{
                        padding: "2px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700",
                        background: msg.source === "catering" ? "rgba(155, 89, 182, 0.2)" : "rgba(74, 112, 137, 0.2)",
                        color: msg.source === "catering" ? "#9b59b6" : "var(--primary)"
                      }}>
                        {msg.source === "catering" ? "🎪 Catering" : "📬 General"}
                      </span>
                      {!msg.is_read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e74c3c", display: "inline-block" }} />}
                    </div>
                    <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "5px" }}>{msg.email}</p>
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>{msg.message}</p>
                    <p style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "8px" }}>{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                  {!msg.is_read && (
                    <button
                      onClick={() => markMessageRead(msg.id)}
                      style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid var(--glass-border)", background: "transparent", cursor: "pointer", whiteSpace: "nowrap", color: "var(--text-dark)", fontSize: "0.85rem" }}
                    >
                      Mark Read
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "partners" && (
        <div className="glass-panel" style={{ padding: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={24} color="var(--primary)" /> Partner Management
            </h2>
          </div>

          {/* Add Partner Form */}
          <div className="glass-panel-dark" style={{ padding: "20px", marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "15px" }}>Add New Partner</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
              <input 
                type="text" placeholder="Company Name" value={newPartner.company_name} 
                onChange={e => setNewPartner({...newPartner, company_name: e.target.value})}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "inherit" }}
              />
              <input 
                type="text" placeholder="Contact Number" value={newPartner.contact_number} 
                onChange={e => setNewPartner({...newPartner, contact_number: e.target.value})}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "inherit" }}
              />
              <input 
                type="text" placeholder="Website / IG Link" value={newPartner.website} 
                onChange={e => setNewPartner({...newPartner, website: e.target.value})}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "inherit" }}
              />
              <textarea 
                placeholder="Bio / Description" value={newPartner.bio} 
                onChange={e => setNewPartner({...newPartner, bio: e.target.value})}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "inherit", gridColumn: "span 1" }}
              />
            </div>
            <div style={{ marginTop: "15px" }}>
              <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "8px" }}>Image URLs (Max 8, separate by comma)</p>
              <input 
                type="text" placeholder="https://image1.jpg, https://image2.jpg..." 
                onChange={e => setNewPartner({...newPartner, images: e.target.value.split(",").map(url => url.trim()).filter(Boolean)})}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "inherit" }}
              />
            </div>
            <button 
              onClick={async () => {
                if (!newPartner.company_name) return alert("Company name is required");
                if (editingPartner) {
                  await updatePartner(editingPartner.id, newPartner);
                  alert("Partner updated!");
                  setEditingPartner(null);
                } else {
                  await addPartner(newPartner);
                  alert("Partner added!");
                }
                setNewPartner({ company_name: "", contact_number: "", website: "", bio: "", images: [] });
              }}
              className="btn-primary" style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Plus size={16} /> {editingPartner ? "Update Partner" : "Add Partner"}
            </button>
            {editingPartner && (
              <button 
                onClick={() => {
                  setEditingPartner(null);
                  setNewPartner({ company_name: "", contact_number: "", website: "", bio: "", images: [] });
                }}
                style={{ marginTop: "15px", marginLeft: "10px", background: "transparent", border: "1px solid var(--glass-border)", color: "inherit", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" }}
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Partners List */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {partners.map(p => (
              <div key={p.id} className="glass-panel-dark" style={{ padding: "20px", position: "relative" }}>
                <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "10px" }}>
                  <button 
                    onClick={() => {
                      setEditingPartner(p);
                      setNewPartner({ company_name: p.company_name, contact_number: p.contact_number, website: p.website, bio: p.bio, images: p.images });
                    }}
                    style={{ background: "rgba(74, 112, 137, 0.2)", border: "none", color: "var(--primary)", padding: "5px", borderRadius: "50%", cursor: "pointer" }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => confirm("Delete this partner?") && removePartner(p.id)}
                    style={{ background: "rgba(231, 76, 60, 0.2)", border: "none", color: "#e74c3c", padding: "5px", borderRadius: "50%", cursor: "pointer" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h4 style={{ marginBottom: "5px", color: "var(--accent)" }}>{p.company_name}</h4>
                <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "10px" }}>{p.bio}</p>
                <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span>📞 {p.contact_number || "No contact"}</span>
                  <span>🌐 {p.website || "No link"}</span>
                </div>
                {p.images && p.images.length > 0 && (
                  <div style={{ display: "flex", gap: "5px", marginTop: "10px", overflowX: "auto", paddingBottom: "5px" }}>
                    {p.images.map((img, idx) => (
                      <img key={idx} src={img} style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
