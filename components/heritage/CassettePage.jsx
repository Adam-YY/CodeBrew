"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom"; 
import { COLORS } from "./colors";
import { PageContainer } from "./shared";
import { supabase } from "@/supabase/client";

export default function CassettePage({
  navigate,
  currentUser,
  boomerMode,
  members,
  addUpload,
  calendarDraft,
  consumeCalendarDraft,
  viewSrc,
}) {
  const [uploadType, setUploadType] = useState("document");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [eventDate, setEventDate] = useState("");
  const [messages, setMessages] = useState([]);
  const [signedUrls, setSignedUrls] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  const getMember = (id) => members.find((m) => m.id === id);

  const typeIcons = { document: "📄", voice: "🎙️", video: "🎞️" };
  const typeColors = {
    document: COLORS.green,
    voice: COLORS.accent,
    video: COLORS.warmDark,
  };
  const accepts = {
    document: ".pdf,.txt,.doc,.docx,image/*",
    voice: "audio/*",
    video: "video/*",
  };

  // 🔥 FETCH MESSAGES
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("message")
        .select("*")
        .or(`recipient_id.is.null,recipient_id.eq.${currentUser.id},sender_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false });
      if (error) return;
      setMessages(data || []);
    };
    fetchMessages();
  }, [currentUser.id]);

  // 🔥 SIGNED URLS
  useEffect(() => {
    const loadUrls = async () => {
      const map = {};
      for (const msg of messages) {
        if (!msg.media_path) continue;
        const { data } = await supabase.storage.from("multimedia").createSignedUrl(msg.media_path, 3600);
        if (data?.signedUrl) map[msg.id] = data.signedUrl;
      }
      setSignedUrls(map);
    };
    if (messages.length) loadUrls();
  }, [messages]);

  const handleDownload = async (url, filename, id) => {
    setDownloadingId(id);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || `family-memory-${id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  // 🔥 FIXED UPLOAD FUNCTIONALITY
  const handleUpload = async () => {
    if (!file && !title.trim()) return;
    setUploading(true);
    try {
      // FIX: Use the full YYYY-MM-DD format for the database
      const formattedEventDate = eventDate || null; 
      
      let filePath = null;
      if (file) {
        const safeName = file.name
          .normalize("NFD")
          .replace(/[^\w\s.-]/g, "") 
          .replace(/\s+/g, "_") 
          || "upload";
        filePath = `${currentUser.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("multimedia")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
      }

      const toMediaTypeEnum = (fileType) => {
        if (!fileType) return "IMAGE";
        if (fileType.startsWith("audio/")) return "AUDIO";
        if (fileType.startsWith("video/")) return "VIDEO";
        return "IMAGE";
      };

      const basePayload = {
        sender_id: currentUser.id,
        recipient_id: recipient === "all" ? null : recipient,
        media_path: filePath,
        media_type: toMediaTypeEnum(file?.type),
        description: title || null,
        display_date: formattedEventDate, // Now sends YYYY-MM-DD
      };

      const { data, error: insertError } = await supabase
        .from("message")
        .insert(basePayload)
        .select();

      if (insertError) throw insertError;

      if (data && data[0]) {
        const newMsg = data[0];
        if (filePath) {
          const { data: sData } = await supabase.storage.from("multimedia").createSignedUrl(filePath, 3600);
          if (sData?.signedUrl) setSignedUrls(prev => ({ ...prev, [newMsg.id]: sData.signedUrl }));
        }
        
        setMessages(prev => [newMsg, ...prev]);
        setFile(null); 
        setTitle(""); 
        setEventDate(""); 
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Upload process failed:", err);
      alert("Upload failed: " + err.message); // Helpful for immediate debugging
    } finally {
      setUploading(false);
    }
  };

  const getUploadType = (mediaType) => {
    if (!mediaType) return "document";
    if (mediaType.startsWith("audio/") || mediaType === "AUDIO") return "voice";
    if (mediaType.startsWith("video/") || mediaType === "VIDEO") return "video";
    return "document";
  };

  return (
    <PageContainer
      navigate={navigate}
      title="Cassette Player"
      boomerMode={boomerMode}
      description="Record family history. Choose a media type, write a title, and upload to the vault."
      viewSrc={viewSrc}
    >
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>

      {/* PORTAL MODAL */}
      {expandedImage && typeof document !== "undefined" && createPortal(
        <div 
          onClick={() => setExpandedImage(null)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(5px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 99999, cursor: "zoom-out", animation: "popIn 0.2s ease-out forwards"
          }}
        >
          <img 
            src={expandedImage} 
            style={{ maxWidth: "95vw", maxHeight: "90vh", borderRadius: "8px", boxShadow: "0 0 40px rgba(0,0,0,0.8)", objectFit: "contain" }} 
            alt="Enlarged" 
          />
          <div style={{ position: "absolute", top: 20, right: 20, color: "white", fontSize: "14px", background: "rgba(0,0,0,0.5)", padding: "5px 15px", borderRadius: "20px" }}>
            Close ×
          </div>
        </div>,
        document.body
      )}

      {/* RECORDER UI */}
      <div style={{
        background: "#2c1810", borderRadius: 24, padding: "30px",
        margin: "0 auto 32px", maxWidth: 520, border: "3px solid #5a3a28",
        boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", fontFamily: "'Caveat', cursive", color: COLORS.warm, fontSize: 24, marginBottom: 20 }}>
          Family Memories Recorder
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 25 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{
              width: 70, height: 70, borderRadius: "50%", border: `3px solid ${COLORS.warm}`,
              background: "radial-gradient(circle, #1a1410 30%, #3d2b1a 60%, #5a3a28 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: uploading ? "spin 1s linear infinite" : "spin 4s linear infinite",
            }}>
              <div style={{ width: 15, height: 15, borderRadius: "50%", background: COLORS.warm, opacity: 0.6 }} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
          {["document", "voice", "video"].map((type) => (
            <button key={type} onClick={() => setUploadType(type)} style={{
              background: uploadType === type ? COLORS.warm : "rgba(255,255,255,0.05)",
              border: `1px solid ${COLORS.warm}${uploadType === type ? '' : '40'}`,
              borderRadius: 12, padding: "10px 18px", cursor: "pointer",
              color: uploadType === type ? COLORS.ink : COLORS.warmLight,
              fontFamily: "'Crimson Text', serif", fontSize: 13, fontWeight: 700
            }}>
              {typeIcons[type]} {type.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gap: 15, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ fontSize: 11, color: COLORS.warmLight }}>
              Recipient
              <select value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "10px", borderRadius: 10, background: "#1a110a", color: COLORS.warmLight, border: `1px solid ${COLORS.warm}40` }}>
                <option value="all">Everyone</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 11, color: COLORS.warmLight }}>
              Memory Date
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "10px", borderRadius: 10, background: "#1a110a", color: COLORS.warmLight, border: `1px solid ${COLORS.warm}40` }} />
            </label>
          </div>

          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name this memory..." style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#1a110a", color: COLORS.warmLight, border: `1px solid ${COLORS.warm}40`, boxSizing: "border-box" }} />

          <div style={{ position: "relative", border: `2px dashed ${file ? COLORS.green : COLORS.warm + '40'}`, borderRadius: 12, padding: "20px", textAlign: "center", background: "rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{file ? "✅" : "📁"}</div>
            <div style={{ color: COLORS.warm, fontWeight: 700, fontSize: 14 }}>{file ? file.name : `Select ${uploadType}`}</div>
            <input type="file" accept={accepts[uploadType]} onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
          </div>
        </div>

        <button onClick={handleUpload} disabled={uploading} style={{
          width: "100%", padding: "16px", background: uploading ? "#4a352a" : COLORS.accent,
          color: COLORS.paper, border: "none", borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: "pointer",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
        }}>
          {uploading ? "Recording..." : "Save to Archive"}
        </button>
      </div>

      <h3 style={{ textAlign: "center", marginBottom: 20 }}>The Family Vault</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg) => {
          const url = signedUrls[msg.id];
          const type = getUploadType(msg.media_type);
          const isImage = msg.media_type === "IMAGE" || msg.media_type?.startsWith("image/");
          
          return (
            <div key={msg.id} style={{
              background: COLORS.paper, borderRadius: 20, padding: "15px",
              border: `1px solid ${COLORS.warm}20`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 24 }}>{typeIcons[type]}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: COLORS.ink }}>{msg.description || "Untitled"}</div>
                    <div style={{ fontSize: 11, color: COLORS.inkLight }}>{getMember(msg.sender_id)?.name} • {new Date(msg.display_date).toLocaleDateString()}</div>
                  </div>
                </div>
                {url && (
                   <button 
                    onClick={() => handleDownload(url, msg.description, msg.id)}
                    style={{ background: COLORS.ink, color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}
                   >
                     ⬇️ Save
                   </button>
                )}
              </div>

              {url && isImage && (
                <div style={{ borderRadius: 12, overflow: "hidden", marginTop: 8 }}>
                  <img 
                    src={url} 
                    onClick={() => setExpandedImage(url)} 
                    style={{ width: "100%", maxHeight: "300px", objectFit: "cover", cursor: "zoom-in", display: "block" }} 
                    alt="" 
                  />
                </div>
              )}
              {url && (msg.media_type === "AUDIO" || msg.media_type?.startsWith("audio/")) && <audio controls style={{ width: "100%", marginTop: 8 }} src={url} />}
              {url && (msg.media_type === "VIDEO" || msg.media_type?.startsWith("video/")) && <video controls style={{ width: "100%", marginTop: 8, borderRadius: 12 }} src={url} />}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}