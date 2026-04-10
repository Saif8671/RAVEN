import { useRef, useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";

export function GlowCard({ children, className = "", delay = 0 }) {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateMousePosition = (ev) => {
      if (!cardRef.current) return;
      const { clientX, clientY } = ev;
      const { left, top } = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: clientX - left,
        y: clientY - top,
      });
    };

    if (isHovered) {
      window.addEventListener("mousemove", updateMousePosition);
      return () => {
        window.removeEventListener("mousemove", updateMousePosition);
      };
    }
  }, [isHovered]);

  return (
    <Motion.div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-panel ${className}`}
      style={{ position: "relative", cursor: "default" }}
    >
      <div 
        className="glow-pointer"
        style={{
          position: "absolute",
          top: mousePosition.y,
          left: mousePosition.x,
          width: "400px",
          height: "400px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(208,188,255,0.1) 0%, transparent 70%)",
          opacity: isHovered ? 1 : 0,
          pointerEvents: "none",
          transition: "opacity 0.5s ease",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </Motion.div>
  );
}
