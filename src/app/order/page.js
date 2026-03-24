"use client";

import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useDB } from "@/lib/SupabaseContext";
import { Coffee, CupSoda, Zap, Droplet, Plus, Minus, ShoppingBag, Leaf, Sprout, Bean, Snowflake, Flame } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OrderPage() {
  const { items, addToCart, removeFromCart, itemCount } = useCart();
  const { menuItems } = useDB();
  const iconMap = { Coffee, CupSoda, Zap, Droplet, Leaf, Sprout, Bean };
  
  const [selections, setSelections] = useState({}); // { itemId: 'ice' | 'hot' }

  const getQuantity = (id, selection = "ice") => {
    const item = items.find(i => i.id === id && i.selection === selection);
    return item ? item.quantity : 0;
  };

  return (
    <div className="container section" style={{ paddingBottom: "100px" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "40px", textAlign: "center", textTransform: "uppercase", color: "var(--accent)" }}>
        Order <span style={{ color: "var(--primary)" }}>Menu</span>
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
        {menuItems.map((item, i) => {
          const Icon = iconMap[item.iconName] || Coffee;
          const isSoldOut = item.status === "Sold Out" || item.stockLevel <= 0;
          const currentTemp = selections[item.id] || 'ice';
          const qty = getQuantity(item.id, currentTemp);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--background)", padding: "20px", gap: "15px", flexWrap: "wrap", opacity: isSoldOut ? 0.6 : 1, filter: isSoldOut ? "grayscale(100%)" : "none", width: "min(95dvw, 800px)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: "1 1 auto" }}>
                <div style={{ background: "rgba(74, 112, 137, 0.2)", padding: "15px", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Icon size={32} color={isSoldOut ? "var(--text-dark)" : "var(--primary)"} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "5px" }}>{item.name} {isSoldOut && <span style={{ fontSize: "0.8rem", color: "#e74c3c", marginLeft: "10px", fontWeight: "700" }}>OUT OF STOCK</span>}</h3>
                  <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: "5px" }}>{item.description}</p>
                  <p style={{ fontWeight: "700", color: isSoldOut ? "inherit" : "var(--accent)" }}>${item.price.toFixed(2)}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flex: "0 0 auto", marginLeft: "auto" }}>
                {item.supports_temp && !isSoldOut && (
                  <div style={{ display: "flex", background: "rgba(0,0,0,0.1)", borderRadius: "20px", padding: "2px" }}>
                    <button 
                      onClick={() => setSelections(prev => ({ ...prev, [item.id]: 'hot' }))}
                      style={{ padding: "4px 12px", borderRadius: "18px", border: "none", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer", background: currentTemp === 'hot' ? "var(--accent)" : "transparent", color: currentTemp === 'hot' ? "#fff" : "inherit" }}
                    >
                      HOT
                    </button>
                    <button 
                      onClick={() => setSelections(prev => ({ ...prev, [item.id]: 'ice' }))}
                      style={{ padding: "4px 12px", borderRadius: "18px", border: "none", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer", background: currentTemp === 'ice' ? "var(--primary)" : "transparent", color: currentTemp === 'ice' ? "#fff" : "inherit" }}
                    >
                      ICE
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {isSoldOut ? (
                    <button disabled className="btn-primary" style={{ padding: "8px 20px", background: "var(--surface)", border: "1px solid var(--glass-border)", color: "var(--text-dark)", opacity: 0.5, cursor: "not-allowed" }}>
                      Unavailable
                    </button>
                  ) : qty > 0 ? (
                    <>
                      <button onClick={() => removeFromCart(item.id, currentTemp)} style={{ background: "transparent", border: "1px solid var(--text-dark)", padding: "5px", borderRadius: "50%", cursor: "pointer", color: "inherit" }}>
                        <Minus size={18} />
                      </button>
                      <span style={{ fontWeight: "700", width: "20px", textAlign: "center" }}>{qty}</span>
                      <button onClick={() => addToCart(item, currentTemp)} style={{ background: "var(--primary)", border: "none", color: "#fff", padding: "5px", borderRadius: "50%", cursor: "pointer" }}>
                        <Plus size={18} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => addToCart(item, currentTemp)} className="btn-primary" style={{ padding: "8px 20px" }}>
                      Add
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 50, width: "calc(100% - 40px)", maxWidth: "400px" }}
        >
          <Link href="/checkout" className="btn-primary" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "15px 30px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "10px" }}><ShoppingBag size={20} /> Checkout</span>
            <span style={{ background: "rgba(0,0,0,0.2)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.9rem" }}>{itemCount} item{itemCount > 1 ? "s" : ""}</span>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
