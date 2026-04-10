"use client";
import { useMemo, useState } from "react";
import { COLORS } from "./colors";
import { PageContainer } from "./shared";

export default function CassettePage({ navigate, currentUser, boomerMode, uploads, addUpload, members }) {
  const [uploadType, setUploadType] = useState("document");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [showSuccess, setShowSuccess] = useState(false);

  const typeIcons = { document: "📄", voice: "🎙️", video: "🎞️" };
  const typeColors = { document: COLORS.green, voice: COLORS.accent, video: COLORS.warmDark };
  const accepts = {
    document: ".pdf,.txt,.doc,.docx,image/*",
    voice: "audio/*",
    video: "video/*",
  };

  const visibleUploads = useMemo(() => {
    return uploads.filter(u => u.to === "all" || u.to === currentUser.id || u.from === currentUser.id);
  }, [uploads, currentUser.id]);

  const getMember = (id) => members.find(m => m.id === id);

  const handleUpload = () => {
    if (!file && !title.trim()) return;
    const name = title.trim() || file?.name || `New ${uploadType}`;
    const url = file ? URL.createObjectURL(file) : "";
    addUpload({
      type: uploadType,
      name,
      from: currentUser.id,
      to: recipient,
      url,
      fileType: file?.type || "",
    });
    setFile(null);
    setTitle("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const formatRecipient = (value) => {
    if (value === "all") return "Everyone";
    return getMember(value)?.name || "Family";
  };

  return (
    <PageContainer navigate={navigate} title="Cassette Player" boomerMode={boomerMode}
      description="Upload documents, voice recordings, or videos to share with your family. Choose the type of media, select who it is for, and tap Upload.">

      {/* Cassette visual */}
      <div style={{
        background: "#2c1810", borderRadius: 20, padding: "30px 24px", margin: "0 auto 32px",
        maxWidth: 520, border: "3px solid #5a3a28", position: "relative",
        boxShadow: `0 8px 30px rgba(0,0,0,0.3)`,
      }}>
        <div style={{ textAlign: "center", fontFamily: "'Caveat', cursive", color: COLORS.warm, fontSize: 22, marginBottom: 16, letterSpacing: 1 }}>
          Family Memories Recorder
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
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
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

        {/* Upload form */}
        <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: COLORS.warmLight, fontFamily: "'Crimson Text', serif" }}>
            Share with
            <select value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{
              width: "100%", marginTop: 6, padding: "8px 10px",
              borderRadius: 10, border: `1px solid ${COLORS.warm}60`,
              background: "#1f140c", color: COLORS.warmLight, fontFamily: "'Crimson Text', serif",
            }}>
              <option value="all">Everyone</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 12, color: COLORS.warmLight, fontFamily: "'Crimson Text', serif" }}>
            Title (optional)
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give this memory a title" style={{
              width: "100%", marginTop: 6, padding: "8px 10px",
              borderRadius: 10, border: `1px solid ${COLORS.warm}60`,
              background: "#1f140c", color: COLORS.warmLight, fontFamily: "'Crimson Text', serif",
            }} />
          </label>
          <label style={{ fontSize: 12, color: COLORS.warmLight, fontFamily: "'Crimson Text', serif" }}>
            Upload file
            <input
              type="file"
              accept={accepts[uploadType]}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: "block", marginTop: 6, color: COLORS.warmLight }}
            />
          </label>
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
          }}>Uploaded successfully!</div>
        )}
      </div>

      {/* Uploads list */}
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, textAlign: "center", marginBottom: 16 }}>Family Archive</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleUploads.map((u) => {
          const from = getMember(u.from);
          const toName = formatRecipient(u.to);
          const isImage = u.fileType?.startsWith("image/");
          const isAudio = u.fileType?.startsWith("audio/");
          const isVideo = u.fileType?.startsWith("video/");
          return (
            <div key={u.id} style={{
              display: "grid", gap: 8, padding: "14px 18px",
              background: COLORS.paper, borderRadius: 12, border: `1px solid ${COLORS.warm}30`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 26 }}>{typeIcons[u.type]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.inkLight }}>
                    From {from?.name || "Family"} to {toName} • {u.date}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, background: `${typeColors[u.type]}18`, color: typeColors[u.type],
                  padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                }}>{u.type}</span>
              </div>
              {u.url && isImage && (
                <img src={u.url} alt="" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 10 }} />
              )}
              {u.url && isAudio && (
                <audio controls style={{ width: "100%" }}>
                  <source src={u.url} />
                </audio>
              )}
              {u.url && isVideo && (
                <video controls style={{ width: "100%", borderRadius: 10 }}>
                  <source src={u.url} />
                </video>
              )}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
