"use client";

import { useCart } from "@/lib/CartContext";
import { useDB } from "@/lib/SupabaseContext";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Car, MapPin, CheckCircle, Copy, Check, Upload, AlertCircle, ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { submitOrder, uploadPaymentProof, recoverOrder } = useDB();
  const [method, setMethod] = useState("pickup"); // 'pickup' | 'delivery'
  const [distance, setDistance] = useState(0);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("transfer"); // 'cash' | 'transfer'
  const [paymentFile, setPaymentFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedBank, setCopiedBank] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [error, setError] = useState("");

  const safeDistance = Math.max(0, Math.min(100, parseFloat(distance) || 0));
  const deliveryFee = method === "delivery" ? safeDistance * 1.5 : 0;
  const finalTotal = total + deliveryFee;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) {
      setPaymentFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, or WEBP).");
      setPaymentFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit. Please upload a smaller screenshot.");
      setPaymentFile(null);
      setPreviewUrl(null);
      return;
    }

    setPaymentFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const copyToClipboard = (text, bankKey) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (bankKey === "orderId") {
        setCopiedOrderId(true);
        setTimeout(() => setCopiedOrderId(false), 2000);
      } else {
        setCopiedBank(bankKey);
        setTimeout(() => setCopiedBank(null), 2000);
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError("Your cart is empty. Please add items to proceed.");
      return;
    }

    if (method === "delivery" && safeDistance <= 0) {
      setError("Please enter a valid delivery distance (greater than 0 miles).");
      return;
    }

    if (paymentMethod === "transfer" && !paymentFile) {
      setError("Please upload your payment screenshot to verify your bank transfer.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const orderData = {
        items,
        method,
        distance: safeDistance,
        total: finalTotal,
        paymentMethod
      };

      // Submit order
      const newOrder = await submitOrder(orderData);

      // Upload proof if bank transfer
      if (paymentMethod === "transfer" && paymentFile && newOrder?.id) {
        try {
          await uploadPaymentProof(newOrder.id, paymentFile);
        } catch (uploadErr) {
          console.error("Proof upload warning:", uploadErr);
          // Non-blocking for order placement, but notify barista
        }
      }

      setPlacedOrder(newOrder);
      clearCart();
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="container section" style={{ maxWidth: "600px", textAlign: "center", minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ padding: "40px", width: "100%", background: "var(--surface)" }}>
          <CheckCircle size={70} color="var(--primary)" style={{ margin: "0 auto 20px" }} />
          <h1 style={{ fontSize: "2rem", marginBottom: "10px", color: "var(--accent)" }}>Order Confirmed!</h1>
          
          <div style={{ background: "var(--surface-dark)", padding: "15px 20px", borderRadius: "12px", margin: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: "0.8rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px" }}>Order Reference</span>
              <p style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--accent)" }}>{placedOrder.id}</p>
            </div>
            <button 
              onClick={() => copyToClipboard(placedOrder.id, "orderId")}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--surface)", border: "1px solid var(--glass-border)", padding: "8px 14px", borderRadius: "20px", cursor: "pointer", color: "var(--text-dark)", fontSize: "0.85rem", fontWeight: "600" }}
            >
              {copiedOrderId ? <Check size={14} color="#2ecc71" /> : <Copy size={14} />}
              {copiedOrderId ? "Copied" : "Copy ID"}
            </button>
          </div>

          <div style={{ background: "rgba(74, 112, 137, 0.1)", padding: "15px", borderRadius: "12px", marginBottom: "25px" }}>
            <p style={{ fontSize: "0.95rem", lineHeight: "1.5", opacity: 0.9 }}>
              Queue Position: <strong style={{ color: "var(--primary)", fontSize: "1.2rem" }}>#{placedOrder.queue_number || placedOrder.queueNumber || 1}</strong>
            </p>
            <p style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "5px" }}>
              Your order is queued! You can track live progress and message the barista using the floating tracker button at the bottom-right of your screen.
            </p>
          </div>

          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                recoverOrder(placedOrder.id);
              }}
              className="btn-primary"
              style={{ padding: "12px 24px" }}
            >
              Track Live Order
            </button>
            <Link 
              href="/" 
              className="glass-panel" 
              style={{ padding: "12px 24px", borderRadius: "30px", fontWeight: "500", textDecoration: "none", color: "inherit", border: "1px solid var(--glass-border)" }}
            >
              Return Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container section" style={{ maxWidth: "650px" }}>
      <Link href="/order" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "25px", opacity: 0.7, fontWeight: "600" }}>
        <ArrowLeft size={18} /> Back to Menu
      </Link>

      <h1 style={{ fontSize: "2.5rem", marginBottom: "25px", textTransform: "uppercase", color: "var(--accent)" }}>
        Checkout
      </h1>

      {items.length === 0 ? (
        <div className="glass-panel" style={{ padding: "50px 20px", textAlign: "center", background: "var(--surface)" }}>
          <ShoppingBag size={48} style={{ margin: "0 auto 15px", opacity: 0.4 }} />
          <h3 style={{ marginBottom: "10px" }}>Your cup is empty</h3>
          <p style={{ opacity: 0.7, marginBottom: "25px" }}>Add your favorite drinks from the menu to proceed.</p>
          <Link href="/order" className="btn-primary">Browse Menu</Link>
        </div>
      ) : (
        <>
          {/* Order Summary */}
          <div className="glass-panel" style={{ padding: "25px", marginBottom: "25px", background: "var(--surface)" }}>
            <h3 style={{ marginBottom: "15px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "10px", color: "var(--accent)" }}>
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {items.map((item, idx) => (
                <div key={`${item.id}-${item.selection}-${idx}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: "700", marginRight: "8px" }}>{item.quantity}x</span>
                    <span>{item.name}</span>
                    {item.selection && (
                      <span style={{ marginLeft: "8px", fontSize: "0.75rem", padding: "2px 8px", borderRadius: "10px", background: item.selection === "hot" ? "rgba(231,76,60,0.15)" : "rgba(74,112,137,0.15)", color: item.selection === "hot" ? "#e74c3c" : "var(--primary)", fontWeight: "700" }}>
                        {item.selection.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span style={{ fontWeight: "600" }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfillment Method */}
          <div className="glass-panel" style={{ padding: "25px", marginBottom: "25px", background: "var(--surface)" }}>
            <h3 style={{ marginBottom: "15px", color: "var(--accent)" }}>Fulfillment Method</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button 
                type="button"
                onClick={() => setMethod("pickup")}
                style={{ 
                  padding: "16px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: "8px", 
                  borderRadius: "12px", 
                  border: method === "pickup" ? "2px solid var(--primary)" : "1px solid var(--glass-border)", 
                  background: method === "pickup" ? "rgba(74, 112, 137, 0.15)" : "rgba(0,0,0,0.03)", 
                  cursor: "pointer", 
                  color: "inherit",
                  transition: "all 0.2s ease"
                }}
              >
                <MapPin size={26} color={method === "pickup" ? "var(--primary)" : "currentColor"} /> 
                <span style={{ fontWeight: method === "pickup" ? "700" : "500", fontSize: "1rem" }}>Pickup</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>Self-collect at HQ (Pandan 7)</span>
              </button>

              <button 
                type="button"
                onClick={() => setMethod("delivery")}
                style={{ 
                  padding: "16px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: "8px", 
                  borderRadius: "12px", 
                  border: method === "delivery" ? "2px solid var(--primary)" : "1px solid var(--glass-border)", 
                  background: method === "delivery" ? "rgba(74, 112, 137, 0.15)" : "rgba(0,0,0,0.03)", 
                  cursor: "pointer", 
                  color: "inherit",
                  transition: "all 0.2s ease"
                }}
              >
                <Car size={26} color={method === "delivery" ? "var(--primary)" : "currentColor"} /> 
                <span style={{ fontWeight: method === "delivery" ? "700" : "500", fontSize: "1rem" }}>Delivery</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>Belait District ($1.50/mi)</span>
              </button>
            </div>

            {method === "delivery" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: "20px", overflow: "hidden" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600" }}>
                  Estimated Distance from HQ (in miles)
                </label>
                <input 
                  type="number" 
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={distance || ""} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDistance(isNaN(val) ? 0 : Math.max(0, Math.min(100, val)));
                  }}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "1rem" }}
                  placeholder="e.g. 2.5"
                />
                <p style={{ marginTop: "8px", fontSize: "0.8rem", opacity: 0.7 }}>
                  Delivery rate is $1.50 per mile. Current delivery fee: <strong>+${deliveryFee.toFixed(2)}</strong>
                </p>
              </motion.div>
            )}
          </div>

          {/* Payment Method */}
          <div className="glass-panel" style={{ padding: "25px", marginBottom: "25px", background: "var(--surface)" }}>
            <h3 style={{ marginBottom: "15px", color: "var(--accent)" }}>Payment Option</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <button 
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                style={{ 
                  padding: "14px", 
                  borderRadius: "10px", 
                  border: paymentMethod === "transfer" ? "2px solid var(--primary)" : "1px solid var(--glass-border)", 
                  background: paymentMethod === "transfer" ? "rgba(74, 112, 137, 0.15)" : "transparent", 
                  cursor: "pointer", 
                  color: "inherit", 
                  fontWeight: "700" 
                }}
              >
                Bank Transfer
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod("cash")}
                style={{ 
                  padding: "14px", 
                  borderRadius: "10px", 
                  border: paymentMethod === "cash" ? "2px solid var(--primary)" : "1px solid var(--glass-border)", 
                  background: paymentMethod === "cash" ? "rgba(74, 112, 137, 0.15)" : "transparent", 
                  cursor: "pointer", 
                  color: "inherit", 
                  fontWeight: "700" 
                }}
              >
                Cash on Hand
              </button>
            </div>

            {paymentMethod === "transfer" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "var(--surface-dark)", padding: "20px", borderRadius: "12px" }}>
                <p style={{ marginBottom: "12px", fontWeight: "700", color: "var(--accent)" }}>
                  Transfer Details:
                </p>

                {/* Account 1: Baiduri */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--background)", borderRadius: "8px", marginBottom: "10px", border: "1px solid var(--glass-border)" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", opacity: 0.7, display: "block" }}>Baiduri Bank</span>
                    <strong style={{ fontSize: "0.95rem", letterSpacing: "1px" }}>00-00-000-000000</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("00-00-000-000000", "baiduri")}
                    style={{ display: "flex", alignItems: "center", gap: "5px", background: "transparent", border: "1px solid var(--glass-border)", padding: "6px 12px", borderRadius: "15px", cursor: "pointer", color: "inherit", fontSize: "0.8rem" }}
                  >
                    {copiedBank === "baiduri" ? <Check size={14} color="#2ecc71" /> : <Copy size={14} />}
                    {copiedBank === "baiduri" ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Account 2: BIBD */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--background)", borderRadius: "8px", marginBottom: "18px", border: "1px solid var(--glass-border)" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", opacity: 0.7, display: "block" }}>BIBD</span>
                    <strong style={{ fontSize: "0.95rem", letterSpacing: "1px" }}>00-00-00-00000000</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("00-00-00-00000000", "bibd")}
                    style={{ display: "flex", alignItems: "center", gap: "5px", background: "transparent", border: "1px solid var(--glass-border)", padding: "6px 12px", borderRadius: "15px", cursor: "pointer", color: "inherit", fontSize: "0.8rem" }}
                  >
                    {copiedBank === "bibd" ? <Check size={14} color="#2ecc71" /> : <Copy size={14} />}
                    {copiedBank === "bibd" ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Screenshot Upload */}
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600" }}>
                  Attach Transfer Screenshot (Max 5MB)
                </label>
                <div style={{ border: "2px dashed var(--glass-border)", borderRadius: "10px", padding: "15px", textAlign: "center", background: "var(--background)", cursor: "pointer", position: "relative" }}>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    onChange={handleFileChange}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <Upload size={24} color="var(--primary)" />
                    <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                      {paymentFile ? paymentFile.name : "Tap to browse receipt screenshot"}
                    </span>
                    <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>Supports JPG, PNG, WEBP up to 5MB</span>
                  </div>
                </div>

                {previewUrl && (
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px", background: "var(--background)", padding: "8px", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                    <img src={previewUrl} alt="Receipt Preview" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }} />
                    <div style={{ fontSize: "0.8rem", textAlign: "left" }}>
                      <p style={{ fontWeight: "700" }}>Receipt Attached</p>
                      <p style={{ opacity: 0.7 }}>{(paymentFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {paymentMethod === "cash" && (
              <p style={{ fontSize: "0.9rem", opacity: 0.8, fontStyle: "italic", padding: "10px", background: "var(--surface-dark)", borderRadius: "8px" }}>
                💵 Please prepare the exact cash amount (${finalTotal.toFixed(2)}) upon collection or delivery.
              </p>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="glass-panel-dark" style={{ padding: "20px 25px", marginBottom: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.95rem" }}>
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {method === "delivery" && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent)", fontSize: "0.95rem" }}>
                <span>Delivery ({safeDistance} mi @ $1.50)</span>
                <span>+${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <hr style={{ margin: "15px 0", borderColor: "rgba(255,255,255,0.1)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem", fontWeight: "900", color: "var(--accent)" }}>
              <span>Total Due</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e74c3c", background: "rgba(231, 76, 60, 0.1)", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem", border: "1px solid rgba(231, 76, 60, 0.3)" }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="btn-primary" 
            style={{ width: "100%", padding: "16px", fontSize: "1.1rem", opacity: isSubmitting ? 0.7 : 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
          >
            {isSubmitting ? "Brewing Order..." : `Confirm & Place Order ($${finalTotal.toFixed(2)})`}
          </button>
        </>
      )}
    </div>
  );
}
