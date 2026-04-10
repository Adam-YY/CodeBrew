"use client";
import { COLORS } from "./colors";

export function BackButton({ navigate }) {
  return (
    <button onClick={() => navigate("room")} style={{
      position: "fixed", top: 20, left: 20, zIndex: 100,
      background: COLORS.warm, border: "none", borderRadius: 12,
      padding: "10px 20px", cursor: "pointer", fontFamily: "'Playfair Display', serif",
      fontSize: 15, color: COLORS.ink, boxShadow: `0 2px 8px ${COLORS.shadow}`,
      display: "flex", alignItems: "center", gap: 8,
      transition: "transform 0.2s", letterSpacing: 0.5,
    }}
    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <span style={{ fontSize: 16 }}>{"<"}</span> Back to Room
    </button>
  );
}

export function PageContainer({ children, title, navigate, boomerMode, description }) {
  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.paper} 50%, ${COLORS.warmLight}33 100%)`,
      padding: "80px 20px 40px",
    }}>
      <BackButton navigate={navigate} />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)",
          color: COLORS.ink, textAlign: "center", marginBottom: 8,
          fontWeight: 700, letterSpacing: -0.5,
        }}>{title}</h1>
        {boomerMode && description && (
          <div style={{
            background: "#fff9e6", border: `2px solid ${COLORS.warm}`, borderRadius: 12,
            padding: "14px 20px", margin: "12px auto 24px", maxWidth: 600, textAlign: "center",
            fontSize: 19, lineHeight: 1.7, color: COLORS.inkLight,
            fontFamily: "'Caveat', cursive", fontWeight: 500,
          }}>
            {description}
          </div>
        )}
        <div style={{ width: 60, height: 3, background: COLORS.warm, margin: "0 auto 32px", borderRadius: 2 }} />
        {children}
      </div>
    </div>
  );
}

export function SpriteImg({ src, fallback, size, style = {} }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{ width: size, height: size, objectFit: "contain", imageRendering: "pixelated", ...style }}
      />
    );
  }
  return <span style={{ fontSize: size, lineHeight: 1, display: "inline-block", ...style }}>{fallback}</span>;
}
