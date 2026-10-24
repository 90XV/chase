"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/lib/CartContext";
import { useDB } from "@/lib/SupabaseContext";
import { Coffee, CupSoda, Zap, Droplet, Plus, Minus, ShoppingBag, Leaf, Sprout, Bean, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function OrderPage() {
  const { items, addToCart, removeFromCart, itemCount, total } = useCart();
  const { menuItems, isLoaded } = useDB();
  const iconMap = { Coffee, CupSoda, Zap, Droplet, Leaf, Sprout, Bean };
  
  const [selections, setSelections] = useState({}); // { itemId: 'ice' | 'hot' }
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set(["All"]);
    menuItems.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === "All" || (item.category || "General").toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const getQuantity = (id, selection = "ice") => {
    const item = items.find(i => i.id === id && i.selection === selection);
    return item ? item.quantity : 0;
  };

  return (
    <div className="container section" style={{ paddingBottom: "120px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "35px" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "10px", textTransform: "uppercase", color: "var(--accent)" }}>
          Order <span style={{ color: "var(--primary)" }}>Menu</span>
        </h1>
        <p style={{ opacity: 0.8, fontSize: "1rem", maxWidth: "500px", margin: "0 auto" }}>
          Hand-crafted brews and high-octane caffeine fuel. Freshly prepared upon order.
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div style={{ width: "min(95dvw, 800px)", margin: "0 auto 30px", display: "flex", flexDirection: "column", gap: "15px" }}>
        {/* Search Bar */}
        <div style={{ position: "relative", width: "100%" }}>
          <Search size={18} style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Search espresso, cold brew, matcha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 15px 12px 45px",
              borderRadius: "25px",
              border: "1px solid var(--glass-border)",
              background: "var(--surface)",
              color: "inherit",
              fontSize: "0.95rem",
              outline: "none"
            }}
          />
        </div>

        {/* Category Pills */}
        {categories.length > 1 && (
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "5px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  border: "none",
                  background: selectedCategory === cat ? "var(--primary)" : "var(--surface)",
                  color: selectedCategory === cat ? "#fff" : "inherit",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
        {filteredItems.map((item, i) => {
          const Icon = iconMap[item.iconName] || Coffee;
          const isSoldOut = item.status === "Sold Out" || item.stockLevel <= 0;
          const currentTemp = selections[item.id] || (item.supports_temp ? 'ice' : 'standard');
          const qty = getQuantity(item.id, currentTemp);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
              className="glass-panel"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface)",
                padding: "20px",
                gap: "15px",
                flexWrap: "wrap",
                opacity: isSoldOut ? 0.6 : 1,
                filter: isSoldOut ? "grayscale(70%)" : "none",
                width: "min(95dvw, 800px)"
              }}
            >
              {/* Item Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "18px", flex: "1 1 280px" }}>
                <div style={{ background: "rgba(74, 112, 137, 0.15)", padding: "14px", borderRadius: "14px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Icon size={28} color={isSoldOut ? "var(--text-dark)" : "var(--primary)"} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>{item.name}</h3>
                    {isSoldOut ? (
                      <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(231, 76, 60, 0.2)", color: "#e74c3c", fontWeight: "800" }}>
                        SOLD OUT
                      </span>
                    ) : item.stockLevel <= 10 && item.stockLevel > 0 ? (
                      <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(241, 196, 15, 0.2)", color: "#d35400", fontWeight: "700" }}>
                        Only {item.stockLevel} Left
                      </span>
                    ) : null}
                  </div>
                  <p style={{ opacity: 0.75, fontSize: "0.9rem", margin: "4px 0" }}>{item.description}</p>
                  <p style={{ fontWeight: "800", color: isSoldOut ? "inherit" : "var(--accent)", fontSize: "1.1rem" }}>
                    ${Number(item.price).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flex: "0 0 auto", marginLeft: "auto" }}>
                {/* Temperature Switch (Hot / Ice) */}
                {item.supports_temp && !isSoldOut && (
                  <div style={{ display: "flex", background: "var(--surface-dark)", borderRadius: "20px", padding: "3px", border: "1px solid var(--glass-border)" }}>
                    <button 
                      type="button"
                      onClick={() => setSelections(prev => ({ ...prev, [item.id]: 'hot' }))}
                      style={{ 
                        padding: "4px 12px", 
                        borderRadius: "16px", 
                        border: "none", 
                        fontSize: "0.75rem", 
                        fontWeight: "700", 
                        cursor: "pointer", 
                        background: currentTemp === 'hot' ? "#e74c3c" : "transparent", 
                        color: currentTemp === 'hot' ? "#fff" : "inherit",
                        transition: "all 0.2s ease"
                      }}
                    >
                      HOT
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelections(prev => ({ ...prev, [item.id]: 'ice' }))}
                      style={{ 
                        padding: "4px 12px", 
                        borderRadius: "16px", 
                        border: "none", 
                        fontSize: "0.75rem", 
                        fontWeight: "700", 
                        cursor: "pointer", 
                        background: currentTemp === 'ice' ? "var(--primary)" : "transparent", 
                        color: currentTemp === 'ice' ? "#fff" : "inherit",
                        transition: "all 0.2s ease"
                      }}
                    >
                      ICE
                    </button>
                  </div>
                )}

                {/* Cart Quantity Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {isSoldOut ? (
                    <button disabled className="btn-primary" style={{ padding: "8px 18px", background: "var(--surface-dark)", border: "1px solid var(--glass-border)", color: "var(--text-dark)", opacity: 0.4, cursor: "not-allowed" }}>
                      Sold Out
                    </button>
                  ) : qty > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--surface-dark)", padding: "4px 8px", borderRadius: "25px", border: "1px solid var(--glass-border)" }}>
                      <button 
                        type="button"
                        onClick={() => removeFromCart(item.id, currentTemp)} 
                        aria-label={`Remove one ${item.name}`}
                        style={{ background: "transparent", border: "none", padding: "4px", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center" }}
                      >
                        <Minus size={16} />
                      </button>
                      <span style={{ fontWeight: "800", width: "24px", textAlign: "center", fontSize: "0.95rem" }}>{qty}</span>
                      <button 
                        type="button"
                        onClick={() => addToCart(item, currentTemp)} 
                        aria-label={`Add one more ${item.name}`}
                        style={{ background: "var(--primary)", border: "none", color: "#fff", padding: "4px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => addToCart(item, currentTemp)} 
                      className="btn-primary" 
                      style={{ padding: "8px 22px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <Plus size={16} /> Add
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px 20px", opacity: 0.6 }}>
            <p>No menu items found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Cart Bar */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ 
              position: "fixed", 
              bottom: "25px", 
              left: "50%", 
              transform: "translateX(-50%)", 
              zIndex: 90, 
              width: "calc(100% - 30px)", 
              maxWidth: "460px" 
            }}
          >
            <Link 
              href="/checkout" 
              className="btn-primary" 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                width: "100%", 
                padding: "16px 24px", 
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                borderRadius: "30px"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "700" }}>
                <ShoppingBag size={20} />
                View Cart ({itemCount} item{itemCount > 1 ? "s" : ""})
              </span>
              <span style={{ background: "rgba(0,0,0,0.25)", padding: "4px 12px", borderRadius: "15px", fontSize: "0.95rem", fontWeight: "900" }}>
                ${total.toFixed(2)}
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
