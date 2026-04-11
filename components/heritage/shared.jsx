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

const ROOM_ITEMS = [
  { id: "tree",     x: "86.7%", y: "29%",   size: "21%",   asset: "/assets/famtree.png" },
  { id: "cassette", x: "59.2%", y: "66.5%", size: "32%",   asset: "/assets/cassetplayer.png" },
  { id: "portrait", x: "82.5%", y: "76%",   size: "25.5%", asset: "/assets/photoframe.png" },
  { id: "calendar", x: "28%",   y: "77%",   size: "28.5%", asset: "/assets/calendar.png" },
  { id: "letters",  x: "52.8%", y: "86%",   size: "22%",   asset: "/assets/letter.png" },
];

export function PageContainer({ children, title, navigate, boomerMode, description, viewSrc }) {
  return (
    <div style={{
      minHeight: "100vh", padding: "80px 20px 40px",
      position: "relative", overflow: "hidden",
      background: COLORS.bg,
    }}>
      {/* Live blurred room scene background */}
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none", zIndex: 0, overflow: "hidden",
      }}>
        <div style={{
          width: "100%", maxWidth: 1920,
          aspectRatio: "1920 / 1080",
          position: "relative", margin: "0 auto",
          filter: "blur(9.2px)", transform: "scale(1.05)",
        }}>
          <img src={viewSrc || "/assets/view.png"} alt="" style={{
            position: "absolute", top: "0%", left: "50%",
            transform: "translateX(-50%)",
            width: "43%", height: "auto", objectFit: "cover", zIndex: 0,
          }} />
          <img src="/assets/bg.png" alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "contain", zIndex: 1,
          }} />
          {ROOM_ITEMS.map(item => (
            <img key={item.id} src={item.asset} alt="" style={{
              position: "absolute",
              left: item.x, top: item.y,
              transform: "translate(-50%, -50%)",
              width: item.size, height: "auto",
              objectFit: "contain", zIndex: 10,
            }} />
          ))}
        </div>
      </div>
      <BackButton navigate={navigate} />
      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
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
