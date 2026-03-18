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
        style={{ padding: "40px", textAlign: "center", maxWidth: "800px", width: "100%" }}
      >
        <h1 style={{ fontSize: "4rem", fontWeight: "900", marginBottom: "20px", textTransform: "uppercase", lineHeight: "1.1" }}>
          Fuel Your <br/> <span style={{ color: "var(--accent)", textShadow: "0 0 20px rgba(255,251,243,0.3)"}}>Engine</span>
        </h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.8, marginBottom: "30px" }}>
          High-octane brews. Delivered to your garage.
        </p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/order" className="btn-primary">
            Start Order
          </Link>
          <Link href="/catering" className="glass-panel" style={{ padding: "12px 24px", borderRadius: "30px", fontWeight: "500", letterSpacing: "0.5px", textDecoration: "none", color: "inherit", border: "1px solid rgba(255,255,255,0.2)"}}>
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
        <h2 style={{ color: "var(--accent)", marginBottom: "15px" }}>Why Hotwheels Coffee?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", textAlign: "left" }}>
          <div>
            <h3 style={{ marginBottom: "10px" }}>🏁 Fast Delivery</h3>
            <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>Distance-based dynamic delivery fee directly to your location.</p>
          </div>
          <div>
            <h3 style={{ marginBottom: "10px" }}>🔥 Small Batch</h3>
            <p style={{ opacity: 0.8, fontSize: "0.9rem" }}>We roast our own beans right in our home garage roastery.</p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
