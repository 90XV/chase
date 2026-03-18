"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/ThemeContext";

export default function Background() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    // Initialize to center
    setMousePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!isMounted) return <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: -1, backgroundColor: "var(--background)" }} />;

  const isDark = theme === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const aura1 = isDark ? "rgba(74, 112, 137, 0.15)" : "rgba(74, 112, 137, 0.1)";
  const aura2 = isDark ? "rgba(255, 251, 243, 0.05)" : "rgba(74, 112, 137, 0.05)";

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: -1, pointerEvents: "none", backgroundColor: "var(--background)", overflow: "hidden", transition: "background-color 0.3s ease" }}>
      
      {/* Base Grid */}
      <div 
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Primary Aura following mouse */}
      <motion.div
        animate={{
          x: mousePosition.x - 400,
          y: mousePosition.y - 400,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 1 }}
        style={{
          position: "absolute",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${aura1} 0%, rgba(0,0,0,0) 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Secondary accent aura */}
      <motion.div
        animate={{
          x: mousePosition.x - 200,
          y: mousePosition.y - 200,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${aura2} 0%, rgba(0,0,0,0) 70%)`,
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}
