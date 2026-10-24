"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

function ContactForm({ source = "general" }) {
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
      setError("Please fill out all fields.");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please provide a valid email address.");
      return;
    }

    if (cleanMessage.length > 2000) {
      setError("Message cannot exceed 2000 characters.");
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
          source 
        }]);

      if (insertError) throw insertError;

      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err.message || "Failed to dispatch transmission. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <CheckCircle size={56} color="var(--primary)" style={{ marginBottom: "15px" }} />
        <h3 style={{ marginBottom: "10px", fontSize: "1.4rem", color: "var(--accent)" }}>Transmission Received!</h3>
        <p style={{ opacity: 0.8, maxWidth: "400px", margin: "0 auto 20px" }}>
          Thank you for reaching out. The team at Chase will respond to your email as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="btn-primary"
          style={{ padding: "8px 20px", fontSize: "0.9rem" }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(231, 76, 60, 0.15)", color: "#e74c3c", padding: "10px 14px", borderRadius: "8px", fontSize: "0.9rem" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", opacity: 0.8 }}>
          Name or Callsign
        </label>
        <input
          type="text"
          placeholder="e.g. Alex"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "1rem" }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", opacity: 0.8 }}>
          Email Address
        </label>
        <input
          type="email"
          placeholder="alex@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={150}
          required
          style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "1rem" }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", opacity: 0.8 }}>
          Message
        </label>
        <textarea
          placeholder="Share your feedback, catering enquiry, or questions..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          required
          style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--background)", color: "inherit", fontSize: "1rem", resize: "vertical" }}
        />
        <div style={{ textAlign: "right", fontSize: "0.75rem", opacity: 0.5, marginTop: "4px" }}>
          {message.length}/2000
        </div>
      </div>

      <button 
        type="submit" 
        disabled={sending} 
        className="btn-primary" 
        style={{ alignSelf: "flex-start", marginTop: "5px", display: "flex", alignItems: "center", gap: "8px", opacity: sending ? 0.7 : 1 }}
      >
        <Send size={16} /> {sending ? "Transmitting..." : "Send Transmission"}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="container section" style={{ maxWidth: "850px" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "30px", textTransform: "uppercase", color: "var(--accent)" }}>
        Hit Us <span style={{ color: "var(--primary)" }}>Up</span>
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "35px" }}>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: "25px", textAlign: "center", background: "var(--surface)" }}>
          <MapPin size={36} color="var(--primary)" style={{ marginBottom: "10px" }} />
          <h3 style={{ fontSize: "1.1rem" }}>HQ Location</h3>
          <p style={{ opacity: 0.7, marginTop: "6px", fontSize: "0.9rem" }}>Pandan 7<br />Kuala Belait, Brunei</p>
        </motion.div>

        <motion.a 
          href="mailto:chasecoffeebn@gmail.com"
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="glass-panel" 
          style={{ padding: "25px", textAlign: "center", background: "var(--surface)", display: "block", textDecoration: "none", color: "inherit" }}
        >
          <Mail size={36} color="var(--primary)" style={{ marginBottom: "10px" }} />
          <h3 style={{ fontSize: "1.1rem" }}>Direct Email</h3>
          <p style={{ opacity: 0.7, marginTop: "6px", fontSize: "0.9rem" }}>chasecoffeebn@gmail.com</p>
        </motion.a>

        <motion.a 
          href="https://wa.me/6738683441"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="glass-panel" 
          style={{ padding: "25px", textAlign: "center", background: "var(--surface)", display: "block", textDecoration: "none", color: "inherit" }}
        >
          <Phone size={36} color="var(--primary)" style={{ marginBottom: "10px" }} />
          <h3 style={{ fontSize: "1.1rem" }}>WhatsApp / Call</h3>
          <p style={{ opacity: 0.7, marginTop: "6px", fontSize: "0.9rem" }}>+673 868 3441</p>
        </motion.a>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-panel-dark" style={{ padding: "35px", background: "var(--surface-dark)" }}>
        <h2 style={{ marginBottom: "10px", color: "var(--accent)" }}>Send a dispatch</h2>
        <p style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: "25px" }}>Have a question or request? Fill out the transmission form below.</p>
        <ContactForm source="general" />
      </motion.div>
    </div>
  );
}
