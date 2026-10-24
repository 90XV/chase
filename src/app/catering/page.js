"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { Mail, Phone, Instagram, Send, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CateringViewer = dynamic(() => import('@/components/CateringViewer'), {
  ssr: false,
  loading: () => <div style={{ padding: "50px", textAlign: "center", opacity: 0.7 }}>Loading Catering Menu...</div>
});

export default function CateringPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      setError("Please complete all fields before sending.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please provide a valid email address.");
      return;
    }

    try {
      setSending(true);
      const { error: insertError } = await supabase
        .from("contact_messages")
        .insert([{ 
          name: cleanName.slice(0, 100), 
          email: cleanEmail.slice(0, 150), 
          message: cleanMessage.slice(0, 2000), 
          source: "catering" 
        }]);

      if (insertError) throw insertError;

      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err.message || "Failed to submit catering enquiry. Please reach out via WhatsApp directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container section">
      <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "15px", textTransform: "uppercase", color: "var(--accent)", textAlign: "center" }}>
        Catering <span style={{ color: "var(--primary)" }}>Events</span>
      </h1>
      <p style={{ textAlign: "center", marginBottom: "35px", opacity: 0.8, maxWidth: "600px", margin: "0 auto 35px" }}>
        Browse our catering menu and configure your bespoke event coffee station.
      </p>

      {/* PDF Viewer */}
      <CateringViewer pdfUrl="/catering menu.pdf" />

      {/* Catering Contact */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ maxWidth: "800px", margin: "50px auto 0" }}
      >
        <div className="glass-panel" style={{ padding: "35px 25px", textAlign: "center", marginBottom: "25px", background: "var(--surface)" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "900", marginBottom: "10px", color: "var(--accent)" }}>
            Ready to Book your <span style={{ color: "var(--primary)" }}>Event?</span>
          </h2>
          <p style={{ opacity: 0.8, maxWidth: "500px", margin: "0 auto", fontSize: "0.95rem" }}>
            Reach out through our direct lines or dispatch an enquiry below. We&apos;ll work with you to configure the ideal package.
          </p>
        </div>

        {/* Contact Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "35px" }}>
          <motion.a 
            href="mailto:chasecoffeebn@gmail.com"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="glass-panel" 
            style={{ padding: "22px", textAlign: "center", background: "var(--surface)", display: "block", textDecoration: "none", color: "inherit" }}
          >
            <Mail size={32} color="var(--primary)" style={{ marginBottom: "10px" }} />
            <h3 style={{ fontSize: "1.05rem", marginBottom: "4px" }}>Email</h3>
            <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>chasecoffeebn@gmail.com</p>
          </motion.a>

          <motion.a 
            href="https://wa.me/6738656170"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }} 
            className="glass-panel" 
            style={{ padding: "22px", textAlign: "center", background: "var(--surface)", display: "block", textDecoration: "none", color: "inherit" }}
          >
            <Phone size={32} color="var(--primary)" style={{ marginBottom: "10px" }} />
            <h3 style={{ fontSize: "1.05rem", marginBottom: "4px" }}>WhatsApp / Call</h3>
            <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>+673 865 6170</p>
          </motion.a>

          <motion.a 
            href="https://instagram.com/dzhotwheels"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }} 
            className="glass-panel" 
            style={{ padding: "22px", textAlign: "center", background: "var(--surface)", display: "block", textDecoration: "none", color: "inherit" }}
          >
            <Instagram size={32} color="var(--primary)" style={{ marginBottom: "10px" }} />
            <h3 style={{ fontSize: "1.05rem", marginBottom: "4px" }}>Instagram</h3>
            <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>@dzhotwheels</p>
          </motion.a>
        </div>

        {/* Catering Enquiry Form */}
        <div className="glass-panel-dark" style={{ padding: "35px", background: "var(--surface-dark)" }}>
          <h2 style={{ marginBottom: "8px", color: "var(--accent)" }}>Send a Catering Enquiry</h2>
          <p style={{ opacity: 0.7, marginBottom: "20px", fontSize: "0.9rem" }}>
            Provide your event date, estimated guests, and beverage preferences.
          </p>

          {sent ? (
            <div style={{ textAlign: "center", padding: "30px" }}>
              <CheckCircle size={48} color="var(--primary)" style={{ marginBottom: "12px" }} />
              <h3 style={{ marginBottom: "8px", color: "var(--accent)" }}>Enquiry Received!</h3>
              <p style={{ opacity: 0.8, marginBottom: "15px" }}>We&apos;ll be in touch shortly to configure your event package.</p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="btn-primary"
                style={{ padding: "8px 20px", fontSize: "0.85rem" }}
              >
                Send Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(231, 76, 60, 0.15)", color: "#e74c3c", padding: "10px 14px", borderRadius: "8px", fontSize: "0.9rem" }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <input
                type="text"
                placeholder="Your Name or Business / Organizer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "1rem" }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={150}
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "1rem" }}
              />
              <textarea
                placeholder="Tell us about your event — tentative date, venue location, estimated head count, and preferred coffee styles..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                required
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "1rem", resize: "vertical" }}
              />
              <button 
                type="submit" 
                disabled={sending} 
                className="btn-primary" 
                style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", opacity: sending ? 0.7 : 1 }}
              >
                <Send size={16} /> {sending ? "Sending Enquiry..." : "Send Enquiry"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
