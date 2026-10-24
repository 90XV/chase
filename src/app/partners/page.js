"use client";

import { useDB } from "@/lib/SupabaseContext";
import { motion } from "framer-motion";
import { Globe, Instagram, Phone, Info, ExternalLink } from "lucide-react";

export default function PartnersPage() {
  const { partners, isLoaded } = useDB();

  if (!isLoaded) {
    return (
      <div className="container section" style={{ textAlign: "center", padding: "80px 20px", opacity: 0.7 }}>
        Loading Partners Directory...
      </div>
    );
  }

  return (
    <div className="container section">
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "12px", textTransform: "uppercase", color: "var(--accent)" }}>
          Our <span style={{ color: "var(--primary)" }}>Partners</span>
        </h1>
        <p style={{ opacity: 0.8, maxWidth: "600px", margin: "0 auto", fontSize: "1rem" }}>
          We collaborate with local creators, artisanal vendors, and businesses across Brunei to fuel our community.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "25px", alignItems: "center" }}>
        {partners.map((partner, i) => {
          const rawUrl = partner.website ? String(partner.website).trim() : "";
          const safeWebsite = rawUrl ? (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`) : null;
          const isInstagram = safeWebsite && safeWebsite.includes("instagram.com");

          return (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.08, 0.4) }}
              className="glass-panel"
              style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "18px", backgroundColor: "var(--surface)", width: "min(95dvw, 800px)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.6rem", color: "var(--accent)", fontWeight: "800" }}>{partner.company_name}</h2>
                
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {safeWebsite && (
                    <a 
                      href={safeWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      title="Visit Partner Site"
                      style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "6px", 
                        color: "var(--primary)", 
                        background: "var(--surface-dark)", 
                        padding: "6px 14px", 
                        borderRadius: "20px", 
                        fontSize: "0.85rem", 
                        fontWeight: "700",
                        border: "1px solid var(--glass-border)" 
                      }}
                    >
                      {isInstagram ? <Instagram size={16} /> : <Globe size={16} />}
                      <span>{isInstagram ? "Instagram" : "Website"}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  {partner.contact_number && (
                    <a 
                      href={`tel:${partner.contact_number.replace(/[^\d+]/g, '')}`} 
                      title="Call Partner"
                      style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "6px", 
                        color: "var(--primary)", 
                        background: "var(--surface-dark)", 
                        padding: "6px 14px", 
                        borderRadius: "20px", 
                        fontSize: "0.85rem", 
                        fontWeight: "700",
                        border: "1px solid var(--glass-border)" 
                      }}
                    >
                      <Phone size={16} />
                      <span>Contact</span>
                    </a>
                  )}
                </div>
              </div>

              {partner.bio && (
                <p style={{ opacity: 0.85, fontSize: "0.95rem", lineHeight: "1.6" }}>
                  {partner.bio}
                </p>
              )}

              {partner.images && Array.isArray(partner.images) && partner.images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px", marginTop: "5px" }}>
                  {partner.images.slice(0, 8).map((img, idx) => (
                    <div key={idx} style={{ aspectRatio: "1/1", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--glass-border)", background: "var(--surface-dark)" }}>
                      <img 
                        src={img} 
                        alt={`${partner.company_name} showcase ${idx + 1}`} 
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}

        {partners.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", opacity: 0.6 }}>
            <Info size={40} style={{ margin: "0 auto 15px", color: "var(--primary)" }} />
            <p style={{ fontSize: "1rem" }}>No partners listed yet. Check back soon for exciting collaborations!</p>
          </div>
        )}
      </div>
    </div>
  );
}
