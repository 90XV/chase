"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee, Truck, Sparkles, Users, ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="container section" style={{ display: "flex", flexDirection: "column", gap: "25px", alignItems: "center", minHeight: "80vh", justifyContent: "center" }}>

      {/* Hero Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="glass-panel"
        style={{ padding: "40px 30px", textAlign: "center", width: "min(95dvw, 620px)", backgroundColor: "var(--surface)", backdropFilter: "blur(20px)" }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          <div style={{ width: "240px", height: "240px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img 
              src="/CHASELOGO.png" 
              alt="Chase Logo" 
              onError={(e) => { e.target.style.display = 'none'; }} 
              style={{ width: "100%", height: "100%", objectFit: "contain" }} 
            />
          </div>
        </div>
        
        <h1 style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--accent)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
          Chase
        </h1>
        <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "4px", marginBottom: "30px", opacity: 0.9 }}>
          Chase the Caffeine
        </p>

        <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/order" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 30px" }}>
            <Coffee size={18} /> Start Order <ArrowRight size={16} />
          </Link>
          <Link href="/catering" className="glass-panel" style={{ padding: "14px 26px", borderRadius: "30px", fontWeight: "700", letterSpacing: "0.5px", textDecoration: "none", color: "inherit", border: "1px solid var(--glass-border)", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="var(--primary)" /> Catering Menu
          </Link>
        </div>
      </motion.div>

      {/* Why Chase Highlights */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="glass-panel-dark"
        style={{ padding: "30px", textAlign: "center", width: "min(95dvw, 620px)", backdropFilter: "blur(20px)" }}
      >
        <h2 style={{ color: "var(--accent)", marginBottom: "20px", fontSize: "1.4rem", textTransform: "uppercase" }}>Why Chase?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", textAlign: "left" }}>
          <div style={{ background: "var(--background)", padding: "18px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--primary)" }}>
              <Truck size={22} />
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--accent)" }}>Rapid Dispatch</h3>
            </div>
            <p style={{ opacity: 0.8, fontSize: "0.85rem", lineHeight: "1.5" }}>
              Home-based operation in Pandan 7 delivering piping hot or ice-cold beverages across Kuala Belait.
            </p>
          </div>

          <div style={{ background: "var(--background)", padding: "18px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--primary)" }}>
              <Sparkles size={22} />
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--accent)" }}>Specialty Roasts</h3>
            </div>
            <p style={{ opacity: 0.8, fontSize: "0.85rem", lineHeight: "1.5" }}>
              Single-origin and distinct blends curated to ignite your focus and fuel your engine.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Partners Banner */}
      <Link href="/partners" style={{ textDecoration: "none", color: "inherit", width: "min(95dvw, 620px)" }}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="glass-panel"
          style={{ padding: "24px 30px", textAlign: "left", width: "100%", backdropFilter: "blur(20px)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ background: "rgba(74, 112, 137, 0.2)", padding: "12px", borderRadius: "50%", color: "var(--primary)" }}>
              <Users size={24} />
            </div>
            <div>
              <h3 style={{ color: "var(--accent)", fontSize: "1.1rem", marginBottom: "4px" }}>Community & Collaborators</h3>
              <p style={{ opacity: 0.75, fontSize: "0.85rem" }}>Explore our local vendor partnerships and pop-up events.</p>
            </div>
          </div>
          <ArrowRight size={20} color="var(--primary)" />
        </motion.div>
      </Link>

    </div>
  );
}
