"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="container section" style={{ display: "flex", flexDirection: "column", gap: "60px", alignItems: "center", minHeight: "80vh", justifyContent: "center" }}>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="glass-panel"
        style={{ padding: "40px", textAlign: "center", maxWidth: "600px", width: "100%" }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
          <div style={{ width: "300px", height: "300px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img src="/CHASELOGO.png" alt="Chase Logo" onError={(e) => e.target.style.display = 'none'} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        </div>
        <p style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "5px", marginBottom: "40px", opacity: 0.8 }}>
          The Caffeine
        </p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/order" className="btn-primary">
            Start Order
          </Link>
          <Link href="/catering" className="glass-panel" style={{ padding: "12px 24px", borderRadius: "30px", fontWeight: "500", letterSpacing: "0.5px", textDecoration: "none", color: "inherit", border: "1px solid rgba(255,255,255,0.2)" }}>
            Catering Menu
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="glass-panel-dark"
        style={{ padding: "30px", textAlign: "center", maxWidth: "600px", width: "100%" }}
      >
        <h2 style={{ color: "var(--accent)", marginBottom: "15px" }}>Why Chase?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", textAlign: "left" }}>
          <div>
            <h3 style={{ marginBottom: "10px" }}>🏁 Fast Delivery</h3>
            <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>Home based operation allows us to deliver fast! (Belait District)</p>
          </div>
          <div>
            <h3 style={{ marginBottom: "10px" }}>🔥 Specialty Grade</h3>
            <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>We select unique beans from all over the world.</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="glass-panel-dark"
        style={{ padding: "30px", textAlign: "center", maxWidth: "600px", width: "100%" }}
      >
        <h2 style={{ color: "var(--accent)", marginBottom: "15px" }}>Partners are welcome!</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", textAlign: "left" }}>
          <div>
            <h3 style={{ marginBottom: "10px" }}>Small or Big</h3>
            <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>We welcome collaborators from all walks of life. </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
