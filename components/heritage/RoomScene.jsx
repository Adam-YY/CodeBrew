"use client";
import { useState } from "react";
import { COLORS } from "./colors";
import { SpriteImg } from "./shared";

export default function RoomScene({
  navigate,
  currentUser,
  setCurrentUser,
  boomerMode,
  setBoomerMode,
  sprites,
  updateSprite,
  members,
}) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showPortraitPicker, setShowPortraitPicker] = useState(false);

  const items = [
    { id: "portrait", label: "Portrait Frame", desc: "Switch between family members to see messages left for each person", x: "9%", y: "52%", w: "14%", h: "22%", emoji: "🖼️" },
    { id: "calendar", label: "Family Calendar", desc: "View family traditions and messages organised by date", x: "28%", y: "54%", w: "13%", h: "20%", emoji: "📅" },
    { id: "cassette", label: "Cassette Player", desc: "Record or upload documents, voice recordings, and videos for the family", x: "46%", y: "58%", w: "15%", h: "16%", emoji: "📼" },
    { id: "tree", label: "Family Tree", desc: "View your family tree and see notes left by each member", x: "65%", y: "14%", w: "28%", h: "32%", emoji: "🌳" },
    { id: "letters", label: "Family Letters", desc: "Read messages left for you - some may be locked until a special date", x: "73%", y: "56%", w: "14%", h: "18%", emoji: "✉️" },
  ];

  const FileInput = ({ spriteKey, label }) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 0" }}>
      <div style={{
        width: 48, height: 48, borderRadius: 8, border: `2px dashed ${COLORS.warm}60`,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: sprites[spriteKey] ? "transparent" : `${COLORS.warm}10`, overflow: "hidden", flexShrink: 0,
      }}>
        {sprites[spriteKey]
          ? <img src={sprites[spriteKey]} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
          : <span style={{ fontSize: 20, opacity: 0.4 }}>+</span>
        }
      </div>
      <span style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: COLORS.warmLight, flex: 1 }}>{label}</span>
      <input type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => e.target.files[0] && updateSprite(spriteKey, e.target.files[0])} />
    </label>
  );

  return (
    <div style={{
      width: "100%", height: "100vh", position: "relative", overflow: "hidden",
      background: sprites.bg ? "none" : `linear-gradient(180deg, #2c1f14 0%, #3d2b1a 40%, #4a3422 100%)`,
    }}>
      {/* Custom background image */}
      {sprites.bg && (
        <img src={sprites.bg} alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
        }} />
      )}

      {/* Window - hidden when custom bg is set */}
      {!sprites.bg && (
        <div style={{
          position: "absolute", left: "25%", top: "4%", width: "50%", height: "42%",
          background: `linear-gradient(180deg, #87CEEB 0%, #b8d4e8 60%, #f0e6d0 100%)`,
          border: `6px solid #5a3a20`, borderRadius: 6,
          boxShadow: `inset 0 0 40px rgba(255,248,220,0.3), 0 4px 20px rgba(0,0,0,0.5)`,
        }}>
          <div style={{ position: "absolute", left: "50%", top: 0, width: 5, height: "100%", background: "#5a3a20" }} />
          <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 5, background: "#5a3a20" }} />
          <div style={{ position: "absolute", left: -30, top: -10, width: 50, height: "110%", background: `linear-gradient(90deg, #8b3a3a, #a04040)`, borderRadius: "0 8px 8px 0", opacity: 0.85 }} />
          <div style={{ position: "absolute", right: -30, top: -10, width: 50, height: "110%", background: `linear-gradient(270deg, #8b3a3a, #a04040)`, borderRadius: "8px 0 0 8px", opacity: 0.85 }} />
          <div style={{ position: "absolute", right: "20%", top: "15%", width: 50, height: 50, borderRadius: "50%", background: "radial-gradient(circle, #fff8dc 0%, transparent 70%)", filter: "blur(10px)" }} />
        </div>
      )}

      {/* Wall decorations - hidden when custom bg is set */}
      {!sprites.bg && (
        <>
          <div style={{ position: "absolute", left: "8%", top: "8%", fontSize: "clamp(10px,1.5vw,16px)", color: COLORS.warmLight, opacity: 0.3, fontFamily: "'Caveat', cursive", transform: "rotate(-5deg)", letterSpacing: 1 }}>
            Family blessings
          </div>
          <div style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "48%",
            background: `linear-gradient(180deg, #6b4226 0%, #5a3720 5%, #7a4f30 10%, #6b4226 100%)`,
            borderTop: `4px solid #8b6340`, boxShadow: `inset 0 5px 15px rgba(0,0,0,0.3)` ,
          }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.08, backgroundImage: `repeating-linear-gradient(95deg, transparent, transparent 40px, rgba(0,0,0,0.15) 40px, rgba(0,0,0,0.15) 41px)`, pointerEvents: "none" }} />
          </div>
          <div style={{
            position: "absolute", left: "30%", top: "10%", width: "40%", height: "70%",
            background: `linear-gradient(180deg, rgba(255,248,220,0.06) 0%, transparent 100%)`,
            clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)", pointerEvents: "none",
          }} />
        </>
      )}

      {/* Interactive items */}
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => {
            if (item.id === "portrait") {
              setShowPortraitPicker(true);
              return;
            }
            navigate(item.id);
          }}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            position: "absolute", left: item.x, top: item.y, width: item.w, height: item.h,
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
          <SpriteImg
            src={sprites[item.id]}
            fallback={item.emoji}
            size="clamp(28px, 4vw, 52px)"
            style={{ filter: hoveredItem === item.id ? "drop-shadow(0 0 12px rgba(212,165,106,0.8))" : "none", transition: "filter 0.3s" }}
          />
          {(hoveredItem === item.id || boomerMode) && (
            <div style={{
              position: "absolute", bottom: "105%", left: "50%", transform: "translateX(-50%)",
              background: COLORS.paper, padding: "8px 14px", borderRadius: 8,
              boxShadow: `0 4px 15px ${COLORS.shadow}`, whiteSpace: "nowrap",
              fontSize: boomerMode ? "clamp(14px, 1.8vw, 18px)" : "clamp(11px, 1.4vw, 14px)",
              fontFamily: "'Playfair Display', serif",
              color: COLORS.ink, fontWeight: 600, border: `1px solid ${COLORS.warm}`,
              pointerEvents: "none",
            }}>
              {item.label}
              {boomerMode && (
                <div style={{ fontSize: boomerMode ? "clamp(12px, 1.4vw, 15px)" : "clamp(9px,1.1vw,12px)", fontWeight: 400, fontFamily: "'Crimson Text', serif", color: COLORS.inkLight, marginTop: 3, whiteSpace: "normal", maxWidth: 240, textAlign: "center" }}>
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
        <SpriteImg src={sprites[currentUser.id]} fallback={currentUser.avatar} size={22} />
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
        {boomerMode ? "i" : "i"} Guide Mode {boomerMode ? "ON" : "OFF"}
      </button>

      {/* Customize button */}
      <button
        onClick={() => setShowCustomize(true)}
        style={{
          position: "absolute", bottom: 16, left: 16, zIndex: 20,
          background: "rgba(90,58,40,0.8)", border: "1px solid rgba(212,165,106,0.3)",
          borderRadius: 12, padding: "8px 16px", cursor: "pointer",
          fontFamily: "'Playfair Display', serif", fontSize: 13,
          color: COLORS.warmLight, transition: "all 0.3s",
        }}
      >
        Customize Room
      </button>

      {/* Portrait quick switch */}
      {showPortraitPicker && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 60, background: "rgba(20,10,5,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setShowPortraitPicker(false)}>
          <div style={{
            background: "#2c1f14", border: `2px solid ${COLORS.warm}40`, borderRadius: 18,
            padding: "24px 26px", maxWidth: 520, width: "92%", boxShadow: `0 20px 60px rgba(0,0,0,0.6)` ,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: COLORS.warmLight, margin: 0, fontSize: 20 }}>
                Choose Your Portrait
              </h2>
              <button onClick={() => setShowPortraitPicker(false)} style={{
                background: "none", border: "none", color: COLORS.warmLight, fontSize: 22,
                cursor: "pointer", lineHeight: 1, padding: 0,
              }}>X</button>
            </div>
            <p style={{ fontFamily: "'Crimson Text', serif", color: COLORS.warm, fontSize: 13, margin: "0 0 18px", opacity: 0.8 }}>
              Switch to your view to see notes and letters meant for you.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
              {members.map(member => {
                const active = member.id === currentUser.id;
                return (
                  <button key={member.id} onClick={() => { setCurrentUser(member); setShowPortraitPicker(false); }} style={{
                    background: active ? `linear-gradient(145deg, ${COLORS.warm}, ${COLORS.warmDark})` : COLORS.paper,
                    border: active ? `3px solid ${COLORS.accent}` : `2px solid ${COLORS.warm}`,
                    borderRadius: 14, padding: "16px 12px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    transition: "all 0.2s",
                  }}>
                    <SpriteImg src={sprites[member.id]} fallback={member.avatar} size={40} />
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 600, color: active ? COLORS.paper : COLORS.ink }}>{member.name}</span>
                    <span style={{ fontSize: 11, color: active ? COLORS.cream : COLORS.inkLight, fontFamily: "'Crimson Text', serif" }}>{member.role}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setShowPortraitPicker(false); navigate("portrait"); }} style={{
              marginTop: 16, width: "100%", padding: "10px 14px",
              border: `1px solid ${COLORS.warm}`, borderRadius: 10,
              background: "rgba(212,165,106,0.15)", color: COLORS.warmLight,
              fontFamily: "'Playfair Display', serif", cursor: "pointer",
            }}>
              Open Portrait Gallery
            </button>
          </div>
        </div>
      )}

      {/* Customize panel */}
      {showCustomize && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50, background: "rgba(20,10,5,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setShowCustomize(false)}>
          <div style={{
            background: "#2c1f14", border: `2px solid ${COLORS.warm}40`, borderRadius: 18,
            padding: "28px 28px 24px", maxWidth: 440, width: "90%", maxHeight: "80vh",
            overflowY: "auto", boxShadow: `0 20px 60px rgba(0,0,0,0.6)` ,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: COLORS.warmLight, margin: 0, fontSize: 20 }}>
                Customize Room
              </h2>
              <button onClick={() => setShowCustomize(false)} style={{
                background: "none", border: "none", color: COLORS.warmLight, fontSize: 22,
                cursor: "pointer", lineHeight: 1, padding: 0,
              }}>X</button>
            </div>

            <p style={{ fontFamily: "'Crimson Text', serif", color: COLORS.warm, fontSize: 13, margin: "0 0 18px", opacity: 0.8 }}>
              Upload images to replace the background and emoji sprites. PNG or GIF recommended for sprites.
            </p>

            <div style={{ borderBottom: `1px solid ${COLORS.warm}20`, marginBottom: 14, paddingBottom: 4 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", color: COLORS.warm, fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>BACKGROUND</span>
            </div>
            <FileInput spriteKey="bg" label="Room background image" />

            <div style={{ borderBottom: `1px solid ${COLORS.warm}20`, margin: "18px 0 14px", paddingBottom: 4 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", color: COLORS.warm, fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>ROOM ITEMS</span>
            </div>
            {items.map(item => (
              <FileInput key={item.id} spriteKey={item.id} label={item.label} />
            ))}

            <div style={{ borderBottom: `1px solid ${COLORS.warm}20`, margin: "18px 0 14px", paddingBottom: 4 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", color: COLORS.warm, fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>FAMILY MEMBERS</span>
            </div>
            {members.map(member => (
              <FileInput key={member.id} spriteKey={member.id} label={`${member.name} (${member.role})`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
