"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShoppingCart, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/ThemeContext";
import { useCart } from "@/lib/CartContext";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const isAdmin = pathname.startsWith("/admin");

  const links = [
    { name: "Home", href: "/" },
    { name: "Order", href: "/order" },
    { name: "Catering", href: "/catering" },
    { name: "Partners", href: "/partners" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="glass-panel" style={{ position: "sticky", top: 0, zIndex: 100, borderRadius: "0 0 0px 0px", backgroundColor: "var(--background)", backdropFilter: "blur(12px)", margin: "0", padding: "14px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Brand */}
        <Link href={isAdmin ? "/admin" : "/"} style={{ display: "flex", flexDirection: "column", textDecoration: "none" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "2px", lineHeight: 1 }}>
            Chase
          </span>
          <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Chase the Caffeine
          </span>
        </Link>

        {/* Right Controls */}
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          {/* Theme toggle */}
          <button 
            type="button"
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}
          >
            {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
          </button>

          {/* Nav links — hidden on /admin */}
          {!isAdmin && (
            <>
              {/* Desktop Links */}
              <div style={{ display: "none", gap: "20px", alignItems: "center" }} className="desktop-nav">
                {links.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    style={{ 
                      fontWeight: pathname === link.href ? "800" : "500", 
                      color: pathname === link.href ? "var(--accent-text)" : "inherit",
                      borderBottom: pathname === link.href ? "2px solid var(--primary)" : "2px solid transparent",
                      paddingBottom: "2px",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <Link href="/checkout" className="btn-primary" style={{ padding: "8px 18px", display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
                  <ShoppingCart size={18} /> 
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span style={{ background: "var(--primary)", color: "#fff", borderRadius: "10px", padding: "1px 7px", fontSize: "0.75rem", fontWeight: "900" }}>
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Mobile Hamburger */}
              <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)} 
                aria-label="Toggle navigation menu"
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "none" }} 
                className="mobile-hamburger"
              >
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
              style={{ overflow: "hidden", marginTop: "15px", display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)} 
                  style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: pathname === link.href ? "800" : "500", 
                    color: pathname === link.href ? "var(--accent-text)" : "inherit", 
                    padding: "8px 0", 
                    borderBottom: "1px solid var(--glass-border)" 
                  }}
                >
                  {link.name}
                </Link>
              ))}
              <Link 
                href="/checkout" 
                onClick={() => setIsOpen(false)} 
                className="btn-primary" 
                style={{ textAlign: "center", marginTop: "10px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
              >
                <ShoppingCart size={18} /> View Cart {itemCount > 0 && `(${itemCount})`}
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
