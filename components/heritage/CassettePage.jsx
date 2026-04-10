"use client";
import { useState } from "react";
import { COLORS } from "./colors";
import { getMember } from "./data";
import { PageContainer } from "./shared";

export default function CassettePage({ navigate, currentUser, boomerMode }) {
  const [uploadType, setUploadType] = useState("document");
  const [uploads, setUploads] = useState([
    { type: "document", name: "Grandma's Dumpling Recipe.pdf", from: "gm", date: "2024-12-01" },
    { type: "voice", name: "Grandpa's story about Melbourne.mp3", from: "gf", date: "2024-11-15" },
    { type: "video", name: "2024 CNY Family Dinner.mp4", from: "dad", date: "2024-02-10" },
  ]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpload = () => {
    setUploads(prev => [...prev, {
      type: uploadType,
      name: `New ${uploadType} from ${currentUser.name}`,
      from: currentUser.id,
      date: new Date().toISOString().split("T")[0],
    }]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const typeIcons = { document: "📄", voice: "🎙️", video: "🎬" };
  const typeColors = { document: COLORS.green, voice: COLORS.accent, video: COLORS.warmDark };

  return (
    <PageContainer navigate={navigate} title="Cassette Player" boomerMode={boomerMode}
      description="Upload documents, voice recordings, or videos to share with your family. Choose the type of media, then tap 'Upload' to add it.">

      {/* Cassette visual */}
      <div style={{
        background: "#2c1810", borderRadius: 20, padding: "30px 24px", margin: "0 auto 32px",
        maxWidth: 420, border: "3px solid #5a3a28", position: "relative",
        boxShadow: `0 8px 30px rgba(0,0,0,0.3)`,
      }}>
        <div style={{ textAlign: "center", fontFamily: "'Caveat', cursive", color: COLORS.warm, fontSize: 22, marginBottom: 16, letterSpacing: 1 }}>
          ⏺ Family Memories Recorder
        </div>
        {/* Reels */}
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 20 }}>
          {[0,1].map(i => (
            <div key={i} style={{
              width: 70, height: 70, borderRadius: "50%", border: `3px solid ${COLORS.warm}`,
              background: `radial-gradient(circle, #1a1410 30%, #3d2b1a 60%, #5a3a28 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "spin 4s linear infinite",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS.warm, opacity: 0.6 }} />
            </div>
          ))}
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        {/* Type selector */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          {["document", "voice", "video"].map(type => (
            <button key={type} onClick={() => setUploadType(type)} style={{
              background: uploadType === type ? COLORS.warm : "rgba(212,165,106,0.15)",
              border: `1px solid ${COLORS.warm}`, borderRadius: 10,
              padding: "8px 16px", cursor: "pointer",
              color: uploadType === type ? COLORS.ink : COLORS.warmLight,
              fontFamily: "'Crimson Text', serif", fontSize: 14,
              transition: "all 0.2s",
            }}>
              {typeIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Upload button */}
        <button onClick={handleUpload} style={{
          display: "block", width: "100%", padding: "12px", background: COLORS.accent,
          border: "none", borderRadius: 10, cursor: "pointer",
          fontFamily: "'Playfair Display', serif", fontSize: 16, color: COLORS.paper,
          transition: "all 0.2s", fontWeight: 600,
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Upload {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}
        </button>

        {showSuccess && (
          <div style={{
            textAlign: "center", color: COLORS.greenLight, marginTop: 10,
            fontFamily: "'Caveat', cursive", fontSize: 18,
          }}>✓ Uploaded successfully!</div>
        )}
      </div>

      {/* Uploads list */}
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, textAlign: "center", marginBottom: 16 }}>Family Archive</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {uploads.map((u, i) => {
          const from = getMember(u.from);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
              background: COLORS.paper, borderRadius: 12, border: `1px solid ${COLORS.warm}30`,
            }}>
              <span style={{ fontSize: 26 }}>{typeIcons[u.type]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{u.name}</div>
                <div style={{ fontSize: 12, color: COLORS.inkLight }}>By {from?.name} · {u.date}</div>
              </div>
              <span style={{
                fontSize: 11, background: `${typeColors[u.type]}18`, color: typeColors[u.type],
                padding: "3px 10px", borderRadius: 20, fontWeight: 600,
              }}>{u.type}</span>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
