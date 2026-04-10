"use client";
import { useState } from "react";
import { COLORS } from "./colors";

export default function RoomScene({ navigate, currentUser, boomerMode, setBoomerMode }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const items = [
    { id: "tree", label: "Family Tree", desc: "View your family tree and see notes left by each member", x: "75%", y: "10%",emoji: "😹",asset: "/assets/famtree.png" },
    { id: "portrait", label: "Portrait Frame", desc: "Switch between family members to see messages left for each person", x: "70%", y: "40%", emoji: "🖼️", asset: "/assets/photoframe.png" },
    { id: "calendar", label: "Family Calendar", desc: "View family traditions and messages organised by date", x: "14%", y:"50%",emoji: "📅", asset: "/assets/calendar.png" },
    { id: "cassette", label: "Cassette Player", desc: "Record or upload documents, voice recordings, and videos for the family", x: "47%", y: "53%",emoji: "📼", asset: "/assets/cassetplayer.png" },
    { id: "letters", label: "Family Letters", desc: "Read messages left for you — some may be locked until a special date", x: "33%", y:"78%",emoji: "✉️", asset: "/assets/letter.png" },
  ];

  return (
<div style={{
  width: "100%",
  maxWidth: 1920, // or whatever your design is based on
  aspectRatio: "1920 / 1080", // adjust to your image
  position: "relative",
  margin: "0 auto",
}}>
      {/* Background image */}
<img
  src="/assets/bg.png"
  alt=""
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain", // IMPORTANT
  }}
/>
      {/* Interactive items */}
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => navigate(item.id)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            position: "absolute", left: item.x, top: item.y,
transform: "translate(-50%, -50%)",
            background: hoveredItem === item.id
              ? `radial-gradient(circle, rgba(212,165,106,0.35) 0%, transparent 70%)`
              : "transparent",
            border: hoveredItem === item.id ? `2px solid rgba(212,165,106,0.6)` : "2px solid transparent",
            borderRadius: 12, cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hoveredItem === item.id ? "scale(1.05) translateY(-3px)" : "scale(1)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 4, zIndex: 10,
          }}
        >
          {item.asset
            ? <img src={item.asset} alt={item.label} style={{
              width: "clamp(280px, 6vw, 350px)",
              height: "auto",
                objectFit: "contain",
                filter: hoveredItem === item.id ? "drop-shadow(0 0 12px rgba(212,165,106,0.8))" : "none",
                transition: "filter 0.3s",
              }} />
            : <span style={{
                fontSize: "clamp(28px, 4vw, 52px)", lineHeight: 1, display: "inline-block",
                filter: hoveredItem === item.id ? "drop-shadow(0 0 12px rgba(212,165,106,0.8))" : "none",
                transition: "filter 0.3s",
              }}>{item.emoji}</span>
          }
          {(hoveredItem === item.id || boomerMode) && (
            <div style={{
              position: "absolute", bottom: "105%", left: "50%", transform: "translateX(-50%)",
              background: COLORS.paper, padding: "8px 14px", borderRadius: 8,
              boxShadow: `0 4px 15px ${COLORS.shadow}`, whiteSpace: "nowrap",
              fontSize: "clamp(11px, 1.4vw, 14px)", fontFamily: "'Playfair Display', serif",
              color: COLORS.ink, fontWeight: 600, border: `1px solid ${COLORS.warm}`,
              pointerEvents: "none",
            }}>
              {item.label}
              {boomerMode && (
                <div style={{ fontSize: "clamp(9px,1.1vw,12px)", fontWeight: 400, fontFamily: "'Crimson Text', serif", color: COLORS.inkLight, marginTop: 3, whiteSpace: "normal", maxWidth: 200, textAlign: "center" }}>
                  {item.desc}
                </div>
              )}
            </div>
          )}
        </button>
      ))}

      {/* Title */}
      <div style={{
        position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
        textAlign: "center", zIndex: 20,
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 3.5vw, 36px)",
          color: COLORS.warmLight, fontWeight: 700, margin: 0,
          textShadow: "0 2px 10px rgba(0,0,0,0.5)", letterSpacing: 1,
        }}>Heritage Home</h1>
        <p style={{
          fontFamily: "'Caveat', cursive", fontSize: "clamp(12px, 1.8vw, 18px)",
          color: COLORS.warm, margin: "2px 0 0", opacity: 0.8,
        }}>Preserving what matters, generation by generation</p>
      </div>

      {/* Current user indicator */}
      <div style={{
        position: "absolute", top: 14, right: 16, zIndex: 20,
        background: "rgba(90,58,40,0.8)", borderRadius: 12, padding: "6px 14px",
        display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(4px)",
        border: "1px solid rgba(212,165,106,0.3)",
      }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{currentUser.avatar}</span>
        <span style={{ fontFamily: "'Crimson Text', serif", color: COLORS.warmLight, fontSize: 14 }}>{currentUser.name}</span>
      </div>

      {/* Boomer mode toggle */}
      <button
        onClick={() => setBoomerMode(!boomerMode)}
        style={{
          position: "absolute", bottom: 16, right: 16, zIndex: 20,
          background: boomerMode ? COLORS.accent : "rgba(90,58,40,0.8)",
          border: "1px solid rgba(212,165,106,0.3)", borderRadius: 12,
          padding: "8px 16px", cursor: "pointer",
          fontFamily: "'Playfair Display', serif", fontSize: 13,
          color: COLORS.warmLight, display: "flex", alignItems: "center", gap: 6,
          transition: "all 0.3s",
        }}
      >
        {boomerMode ? "🔔" : "🔕"} Guide Mode {boomerMode ? "ON" : "OFF"}
      </button>
    </div>
  );
}
