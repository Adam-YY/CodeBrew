"use client";
import { useState, useRef } from "react";
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
  const [viewSrc, setViewSrc] = useState("/assets/view.png");
  const viewInputRef = useRef(null);

  const handleViewUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setViewSrc(URL.createObjectURL(file));
    e.target.value = "";
  };

  const items = [
    {
      id: "tree",
      label: "Family Tree",
      desc: "View your family tree and see notes left by each member",
      x: "86.7%",
      y: "29%",
      size: "21%",
      emoji: "😹",
      asset: "/assets/famtree.png",
    },
    {
      id: "cassette",
      label: "Cassette Player",
      desc: "Record or upload documents, voice recordings, and videos for the family",
      x: "59.2%",
      y: "66.5%",
      size: "32%",
      emoji: "📼",
      asset: "/assets/cassetplayer.png",
      hoverAsset: "/assets/cassetplayeropen.png",
    },
    {
      id: "portrait",
      label: "Portrait Frame",
      desc: "Switch between family members to see messages left for each person",
      x: "82.5%",
      y: "76%",
      size: "25.5%",
      emoji: "🖼️",
      asset: "/assets/photoframe.png",
    },
    {
      id: "calendar",
      label: "Family Calendar",
      desc: "View family traditions and messages organised by date",
      x: "28%",
      y: "77%",
      size: "28.5%",
      emoji: "📅",
      asset: "/assets/calendar.png",
      hoverAsset: "/assets/calendaropen.png",
    },
    {
      id: "letters",
      label: "Family Letters",
      desc: "Read messages left for you — some may be locked until a special date",
      x: "52.8%",
      y: "86%",
      size: "22%",
      emoji: "✉️",
      asset: "/assets/letter.png",
      hoverAsset: "/assets/letteropen.png",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
      }}
    >
    <div
      style={{
        width: "100%",
        maxWidth: 1920,
        aspectRatio: "1920 / 1080",
        position: "relative",
        margin: "0 auto",
      }}
    >
      {/* Window view layer — sits beneath the background, visible through transparent window pixels */}
      <img
        src={viewSrc}
        alt=""
        style={{
          position: "absolute",
          top: "0%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "43%",
          height: "auto",
          objectFit: "cover",
          zIndex: 0,
        }}
      />

      {/* Background image */}
      <img
        src="/assets/bg.png"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          zIndex: 1,
        }}
      />

      {/* Hidden file input for view upload */}
      <input
        ref={viewInputRef}
        type="file"
        accept="image/*"
        onChange={handleViewUpload}
        style={{ display: "none" }}
      />
      {/* Interactive items */}
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            if (item.id === "portrait") {
              navigate("portrait");
              return;
            }
            navigate(item.id);
          }}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            position: "absolute",
            left: item.x,
            top: item.y,
            // ✅ Combine both transforms into one
            transform: "translate(-50%, -50%)",
            background:
              hoveredItem === item.id
                ? `radial-gradient(circle, rgba(212,165,106,0.35) 0%, transparent 70%)`
                : "transparent",
            border:
              hoveredItem === item.id
                ? `2px solid transparent`
                : "2px solid transparent",
            borderRadius: 12,
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            zIndex: 10,
            width: item.size,
          }}
        >
          {item.asset ? (
            <img
              src={hoveredItem === item.id && item.hoverAsset ? item.hoverAsset : item.asset}
              alt={item.label}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                filter:
                  hoveredItem === item.id
                    ? "drop-shadow(0 0 12px rgba(212,165,106,0.8))"
                    : "none",
                transition: "filter 0.3s",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: "clamp(28px, 4vw, 52px)",
                lineHeight: 1,
                display: "inline-block",
                filter:
                  hoveredItem === item.id
                    ? "drop-shadow(0 0 12px rgba(212,165,106,0.8))"
                    : "none",
                transition: "filter 0.3s",
              }}
            >
              {item.emoji}
            </span>
          )}
          {(hoveredItem === item.id || boomerMode) && (
            <div
              style={{
                position: "absolute",
                bottom: "105%",
                left: "50%",
                transform: "translateX(-50%)",
                background: COLORS.paper,
                padding: "8px 14px",
                borderRadius: 8,
                boxShadow: `0 4px 15px ${COLORS.shadow}`,
                whiteSpace: "nowrap",
                fontSize: boomerMode
                  ? "clamp(14px, 1.8vw, 18px)"
                  : "clamp(11px, 1.4vw, 14px)",
                fontFamily: "'Playfair Display', serif",
                color: COLORS.ink,
                fontWeight: 600,
                border: `1px solid ${COLORS.warm}`,
                pointerEvents: "none",
              }}
            >
              {item.label}
              {boomerMode && (
                <div
                  style={{
                    fontSize: boomerMode
                      ? "clamp(12px, 1.4vw, 15px)"
                      : "clamp(9px,1.1vw,12px)",
                    fontWeight: 400,
                    fontFamily: "'Crimson Text', serif",
                    color: COLORS.inkLight,
                    marginTop: 3,
                    whiteSpace: "normal",
                    maxWidth: 240,
                    textAlign: "center",
                  }}
                >
                  {item.desc}
                </div>
              )}
            </div>
          )}
        </button>
      ))}

      

      {/* Current user indicator */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 16,
          zIndex: 20,
          background: "rgba(90,58,40,0.8)",
          borderRadius: 12,
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(212,165,106,0.3)",
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>
          {currentUser.avatar}
        </span>
        <span
          style={{
            fontFamily: "'Crimson Text', serif",
            color: COLORS.warmLight,
            fontSize: 14,
          }}
        >
          {currentUser.name}
        </span>
      </div>

      {/* Customize view button */}
      <button
        onClick={() => viewInputRef.current?.click()}
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          zIndex: 20,
          background: "rgba(90,58,40,0.8)",
          border: "1px solid rgba(212,165,106,0.3)",
          borderRadius: 12,
          padding: "8px 16px",
          cursor: "pointer",
          fontFamily: "'Playfair Display', serif",
          fontSize: 13,
          color: COLORS.warmLight,
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.3s",
        }}
      >
        Change View
      </button>

      {/* Boomer mode toggle */}
      <button
        onClick={() => setBoomerMode(!boomerMode)}
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 20,
          background: boomerMode ? COLORS.accent : "rgba(90,58,40,0.8)",
          border: "1px solid rgba(212,165,106,0.3)",
          borderRadius: 12,
          padding: "8px 16px",
          cursor: "pointer",
          fontFamily: "'Playfair Display', serif",
          fontSize: 13,
          color: COLORS.warmLight,
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.3s",
        }}
      >
        Boomer Mode: {boomerMode ? "ON" : "OFF"}
      </button>
    </div>
    </div>
  );
}
