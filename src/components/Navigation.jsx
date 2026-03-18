"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShoppingCart, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/ThemeContext";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = pathname.startsWith("/admin");

  const links = [
    { name: "Home", href: "/" },
    { name: "Order", href: "/order" },
    { name: "Catering", href: "/catering" },
    { name: "Partners", href: "/partners" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="glass-panel" style={{ position: "sticky", top: 0, zIndex: 100, borderRadius: "0 0 12px 12px", margin: "0 10px", padding: "15px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href={isAdmin ? "/admin" : "/"} style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "2px" }}>
          Hotwheels <span style={{color: "var(--primary)"}}>Coffee</span>
        </Link>

        {/* Theme toggle always visible */}
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button onClick={toggleTheme} style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center" }}>
            {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
          </button>

          {/* Nav links — hidden on /admin */}
          {!isAdmin && (
            <>
              {/* Desktop Links */}
              <div style={{ display: "none", gap: "20px", alignItems: "center" }} className="desktop-nav">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} style={{ fontWeight: pathname === link.href ? "700" : "500", color: pathname === link.href ? "var(--accent-text)" : "inherit" }}>
                    {link.name}
                  </Link>
                ))}
                <Link href="/order" className="btn-primary" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShoppingCart size={18} /> Cart
                </Link>
              </div>

              {/* Mobile Hamburger */}
              <button onClick={() => setIsOpen(!isOpen)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "none" }} className="mobile-hamburger">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {!isAdmin && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginTop: "15px", display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} style={{ fontSize: "1.2rem", fontWeight: pathname === link.href ? "700" : "500", color: pathname === link.href ? "var(--accent-text)" : "inherit", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                  {link.name}
                </Link>
              ))}
              <Link href="/order" onClick={() => setIsOpen(false)} className="btn-primary" style={{ textAlign: "center", marginTop: "10px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                <ShoppingCart size={18} /> Order Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; align-items: center; }
          .mobile-hamburger { display: none !important; }
        }
        @media (max-width: 767px) {
          .mobile-hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
