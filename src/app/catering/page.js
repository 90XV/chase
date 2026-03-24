"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import { Mail, Phone, Instagram, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CateringViewer = dynamic(() => import('@/components/CateringViewer'), {
  ssr: false,
  loading: () => <div style={{ padding: "50px", textAlign: "center" }}>Loading Catering Menu...</div>
});

export default function CateringPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSending(true);
    await supabase.from("contact_messages").insert([{ name, email, message, source: "catering" }]);
    setSent(true);
    setSending(false);
  };

  return (
    <div className="container section">
      <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "20px", textTransform: "uppercase", color: "var(--accent)", textAlign: "center" }}>
        Catering <span style={{ color: "var(--primary)" }}>Events</span>
      </h1>
      <p style={{ textAlign: "center", marginBottom: "40px", opacity: 0.8 }}>Browse our catering menu and configure your event package below.</p>

      {/* PDF Viewer */}
      <CateringViewer pdfUrl="/catering menu.pdf" />

      {/* Catering Contact */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ maxWidth: "800px", margin: "60px auto 0" }}
      >
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center", marginBottom: "30px", backdropFilter: "blur(10px)" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "10px", color: "var(--accent)" }}>
            Ready to Book your <span style={{ color: "var(--primary)" }}>Event?</span>
          </h2>
          <p style={{ opacity: 0.8, maxWidth: "500px", margin: "0 auto" }}>
            Use any of these contact methods to configure your catering package. We&apos;ll work with you to brew the perfect event experience.
          </p>
        </div>

        {/* Contact Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel" style={{ padding: "25px", textAlign: "center", backdropFilter: "blur(10px)" }}>
            <Mail size={36} color="var(--primary)" style={{ marginBottom: "12px" }} />
            <h3 style={{ marginBottom: "8px" }}>Email</h3>
            <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>chasecoffeebn@gmail.com</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel" style={{ padding: "25px", textAlign: "center", backdropFilter: "blur(10px)" }}>
            <Phone size={36} color="var(--primary)" style={{ marginBottom: "12px" }} />
            <h3 style={{ marginBottom: "8px" }}>Call / WhatsApp</h3>
            <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>+673 865 6170</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel" style={{ padding: "25px", textAlign: "center", backdropFilter: "blur(10px)" }}>
            <Instagram size={36} color="var(--primary)" style={{ marginBottom: "12px" }} />
            <h3 style={{ marginBottom: "8px" }}>Instagram</h3>
            <p style={{ opacity: 0.7, fontSize: "0.9rem" }}>@dzhotwheels</p>
          </motion.div>
        </div>

        {/* Catering Enquiry Form */}
        <div className="glass-panel-dark" style={{ padding: "40px", backdropFilter: "blur(10px)" }}>
          <h2 style={{ marginBottom: "8px" }}>Send a Catering Enquiry</h2>
          <p style={{ opacity: 0.7, marginBottom: "25px", fontSize: "0.95rem" }}>Prefer we contact you? Send us your event details and we&apos;ll reach out to configure your package.</p>

          {sent ? (
            <div style={{ textAlign: "center", padding: "30px" }}>
              <CheckCircle size={48} color="var(--primary)" style={{ marginBottom: "15px" }} />
              <h3 style={{ marginBottom: "8px" }}>Enquiry Received!</h3>
              <p style={{ opacity: 0.7 }}>We&apos;ll be in touch soon to configure your event.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <input
                type="text"
                placeholder="Your Name / Business Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "inherit", fontSize: "1rem" }}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "inherit", fontSize: "1rem" }}
              />
              <textarea
                placeholder="Tell us about your event — date, estimated guests, preferred drinks..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "inherit", fontSize: "1rem", resize: "vertical" }}
              />
              <button type="submit" disabled={sending} className="btn-primary" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px" }}>
                <Send size={16} /> {sending ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
