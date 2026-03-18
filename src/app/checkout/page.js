"use client";

import { useCart } from "@/lib/CartContext";
import { useDB } from "@/lib/SupabaseContext";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Car, MapPin, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { submitOrder } = useDB();
  const [method, setMethod] = useState("pickup"); // 'pickup' | 'delivery'
  const [distance, setDistance] = useState(0);
  const [placed, setPlaced] = useState(false);

  // Mock distance rate: $1.50 per km/mile
  const deliveryFee = method === "delivery" ? distance * 1.5 : 0;
  const finalTotal = total + deliveryFee;

  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    try {
      setError("");
      await submitOrder({
        items,
        method,
        distance,
        total: finalTotal
      });
      setPlaced(true);
      clearCart();
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    }
  };

  if (placed) {
    return (
      <div className="container section" style={{ textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <CheckCircle size={80} color="var(--primary)" style={{ marginBottom: "20px" }} />
        <h1>Order Confirmed!</h1>
        <p style={{ margin: "20px 0", maxWidth: "400px", lineHeight: "1.5", opacity: 0.8 }}>
          Your engine fuel is entering the queue. Check the bouncing tracker in the bottom right corner of your screen to monitor your order status live!
        </p>
        <Link href="/" className="btn-primary">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="container section" style={{ maxWidth: "600px" }}>
      <Link href="/order" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px", opacity: 0.7 }}>
        <ArrowLeft size={18} /> Back to Menu
      </Link>

      <h1 style={{ fontSize: "2.5rem", marginBottom: "30px", textTransform: "uppercase" }}>Checkout</h1>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="glass-panel" style={{ padding: "20px", marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "15px", borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "10px" }}>Order Summary</h3>
            {items.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span><span style={{opacity:0.7, marginRight:"8px"}}>{item.quantity}x</span> {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: "20px", marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "15px" }}>Pickup or Delivery?</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button 
                onClick={() => setMethod("pickup")}
                style={{ flex: "1 1 150px", padding: "15px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", borderRadius: "12px", border: method === "pickup" ? "1px solid var(--text-light)" : "1px solid rgba(255,255,255,0.1)", background: method === "pickup" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", cursor: "pointer", color: "inherit" }}
              >
                <MapPin size={24} color={method === "pickup" ? "var(--accent)" : "currentColor"} /> 
                <span style={{ fontWeight: method === "pickup" ? "700" : "500" }}>Pickup</span>
              </button>
              <button 
                onClick={() => setMethod("delivery")}
                style={{ flex: "1 1 150px", padding: "15px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", borderRadius: "12px", border: method === "delivery" ? "1px solid var(--text-light)" : "1px solid rgba(255,255,255,0.1)", background: method === "delivery" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", cursor: "pointer", color: "inherit" }}
              >
                <Car size={24} color={method === "delivery" ? "var(--accent)" : "currentColor"} /> 
                <span style={{ fontWeight: method === "delivery" ? "700" : "500" }}>Delivery</span>
              </button>
            </div>

            {method === "delivery" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: "20px", overflow: "hidden" }}>
                <label style={{ display: "block", marginBottom: "10px", fontSize: "0.9rem", opacity: 0.8 }}>Distance from our HQ (in miles) - *Mock Input*</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.1"
                  value={distance} 
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.2)", background: "rgba(255,255,255,0.5)", color: "inherit", fontSize: "1rem" }}
                  placeholder="Enter distance..."
                />
                <p style={{ marginTop: "10px", fontSize: "0.85rem", opacity: 0.7 }}>We charge $1.50 per mile.</p>
              </motion.div>
            )}
          </div>

          <div className="glass-panel-dark" style={{ padding: "20px", marginBottom: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {method === "delivery" && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent)" }}>
                <span>Delivery Fee</span>
                <span>+${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <hr style={{ margin: "15px 0", borderColor: "rgba(255,255,255,0.1)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "700" }}>
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div style={{ color: "#e74c3c", background: "rgba(231, 76, 60, 0.1)", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem", border: "1px solid rgba(231, 76, 60, 0.2)", textAlign: "center" }}>
              {error}
            </div>
          )}

          <button 
            onClick={handlePlaceOrder}
            className="btn-primary" 
            style={{ width: "100%", padding: "15px", fontSize: "1.1rem" }}
          >
            Place Order
          </button>
        </>
      )}
    </div>
  );
}
