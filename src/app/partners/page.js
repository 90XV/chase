"use client";

import { useDB } from "@/lib/SupabaseContext";
import { motion } from "framer-motion";
import { Globe, Instagram, Phone, Info } from "lucide-react";

export default function PartnersPage() {
  const { partners, isLoaded } = useDB();

  if (!isLoaded) {
    return <div style={{ padding: "100px", textAlign: "center" }}>Loading Partners...</div>;
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "20px", textTransform: "uppercase", color: "var(--accent)", textAlign: "center" }}>
        Our <span style={{ color: "var(--primary)" }}>Partners</span>
      </h1>
      <p style={{ textAlign: "center", marginBottom: "60px", opacity: 0.8, maxWidth: "600px", margin: "0 auto 60px" }}>
        We collaborate with local vendors and businesses to bring you the best quality products and community experiences.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "40px", alignItems: "center" }}>
        {partners.map((partner, i) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel"
            style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "20px", backgroundColor: "var(--background)", width: "min(95dvw, 800px)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px" }}>
              <h2 style={{ fontSize: "1.8rem", color: "var(--accent)" }}>{partner.company_name}</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>
                    {partner.website.includes("instagram.com") ? <Instagram size={20} /> : <Globe size={20} />}
                  </a>
                )}
                {partner.contact_number && (
                  <a href={`tel:${partner.contact_number}`} style={{ color: "var(--primary)" }}>
                    <Phone size={20} />
                  </a>
                )}
              </div>
            </div>

            <p style={{ opacity: 0.8, fontStyle: "italic", fontSize: "0.95rem" }}>{partner.bio}</p>

            {partner.images && partner.images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px", marginTop: "10px" }}>
                {partner.images.slice(0, 8).map((img, idx) => (
                  <div key={idx} style={{ aspectRatio: "1/1", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
                    <img src={img} alt={`${partner.company_name} ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {
        partners.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px", opacity: 0.5 }}>
            <Info size={48} style={{ margin: "0 auto 20px" }} />
            <p>No partners listed yet. Check back soon!</p>
          </div>
        )
      }
    </div >
  );
}
