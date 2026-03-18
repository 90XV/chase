"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

function ContactForm({ source = "general" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSending(true);
    await supabase.from("contact_messages").insert([{ name, email, message, source }]);
    setSent(true);
    setSending(false);
  };

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <CheckCircle size={48} color="var(--primary)" style={{ marginBottom: "20px" }} />
        <h3 style={{ marginBottom: "10px" }}>Transmission Sent!</h3>
        <p style={{ opacity: 0.7 }}>We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <input
        type="text"
        placeholder="Name or Callsign"
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
        placeholder="Message"
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "inherit", fontSize: "1rem", resize: "vertical" }}
      />
      <button type="submit" disabled={sending} className="btn-primary" style={{ alignSelf: "flex-start", marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Send size={16} /> {sending ? "Sending..." : "Send Transmission"}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="container section" style={{ maxWidth: "800px" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "40px", textTransform: "uppercase", color: "var(--accent)" }}>
        Hit Us <span style={{ color: "var(--primary)" }}>Up</span>
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "30px", marginBottom: "40px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: "30px", textAlign: "center" }}>
          <MapPin size={40} color="var(--primary)" style={{ marginBottom: "15px" }} />
          <h3>Location</h3>
          <p style={{ opacity: 0.7, marginTop: "10px" }}>Pandan 7<br />Kuala Belait</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel" style={{ padding: "30px", textAlign: "center" }}>
          <Mail size={40} color="var(--primary)" style={{ marginBottom: "15px" }} />
          <h3>Email</h3>
          <p style={{ opacity: 0.7, marginTop: "10px" }}>chase1610@gmail.com</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: "30px", textAlign: "center" }}>
          <Phone size={40} color="var(--primary)" style={{ marginBottom: "15px" }} />
          <h3>Contact Line</h3>
          <p style={{ opacity: 0.7, marginTop: "10px" }}>+673 868 3441</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-panel-dark" style={{ padding: "40px" }}>
        <h2 style={{ marginBottom: "20px" }}>Send a dispatch</h2>
        <ContactForm source="general" />
      </motion.div>
    </div>
  );
}
