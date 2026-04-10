"use client";
import { useEffect, useMemo, useState } from "react";
import { COLORS } from "./colors";
import { PageContainer } from "./shared";
import { supabase } from "@/supabase/client";

export default function CassettePage({ navigate, currentUser, boomerMode, members }) {
  // Form State
  const [uploadType, setUploadType] = useState("document");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Data State
  const [messages, setMessages] = useState([]);
  const [signedUrls, setSignedUrls] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const getMember = (id) => members.find((m) => m.id === id);

  // 🔥 FETCH MESSAGES
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("message")
        .select("*")
        .or(`recipient_id.is.null,recipient_id.eq.${currentUser.id},sender_id.eq.${currentUser.id}`)
        .order("display_date", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const filtered = (data || []).filter((msg) => {
        // sender ALWAYS sees
        if (String(msg.sender_id) === String(currentUser.id)) return true;
        // no date → visible
        if (!msg.display_date) return true;
        // normalize date
        const msgDate = String(msg.display_date).split("T")[0];
        return msgDate <= today;
      });

      setMessages(filtered);
    };

    fetchMessages();
  }, [currentUser.id]);

  // 🔥 GENERATE SIGNED URLS
  useEffect(() => {
    const loadUrls = async () => {
      const map = {};
      for (const msg of messages) {
        if (!msg.media_path) continue;
        const { data } = await supabase.storage
          .from("multimedia")
          .createSignedUrl(msg.media_path, 3600);
        if (data?.signedUrl) map[msg.id] = data.signedUrl;
      }
      setSignedUrls(map);
    };
    if (messages.length) loadUrls();
  }, [messages]);

  // 🔥 DOWNLOAD HANDLER
  const handleDownload = async (url, filename, id) => {
    setDownloadingId(id);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "family-memory";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  // 🔥 UPLOAD HANDLER
  const handleUpload = async () => {
    if (!file && !title.trim()) return;
    setUploading(true);
    try {
      let filePath = null;
      if (file) {
        const safeName = file.name
          .normalize("NFD")
          .replace(/[^\w\s.-]/g, "")
          .replace(/\s+/g, "_")
          || "upload";
        filePath = `${currentUser.id}/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage
          .from("multimedia")
          .upload(filePath, file);
        if (error) throw error;
      }

      const toMediaTypeEnum = (fileType) => {
        if (!fileType) return "IMAGE";
        if (fileType.startsWith("audio/")) return "AUDIO";
        if (fileType.startsWith("video/")) return "VIDEO";
        return "IMAGE";
      };

      const { data, error: insertError } = await supabase.from("message").insert({
        sender_id: currentUser.id,
        recipient_id: recipient === "all" ? null : recipient,
        media_path: filePath,
        media_type: toMediaTypeEnum(file?.type),
        description: title || null,
        display_date: memoryDate, // Using our new date state
      }).select();

      if (insertError) throw insertError;

      // Optimistic update for the UI
      const newMsg = {
        ...data[0],
        created_at: new Date().toISOString(),
      };

      if (filePath) {
        const { data: signedData } = await supabase.storage
          .from("multimedia")
          .createSignedUrl(filePath, 3600);
        if (signedData?.signedUrl) {
          setSignedUrls((prev) => ({ ...prev, [newMsg.id]: signedData.signedUrl }));
        }
      }

      setMessages((prev) => [newMsg, ...prev]);
      setFile(null);
      setTitle("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const formatRecipient = (id) => {
    if (!id) return "Everyone";
    return getMember(id)?.name || "Family";
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
      description="Record memories for the future. You can backdate items or set them for a future family reveal."
    >
      {/* RECORDING UNIT (UPLOAD FORM) */}
      <div style={{
        background: "#2c1810", borderRadius: 20, padding: "30px 24px",
        margin: "0 auto 32px", maxWidth: 520, border: "3px solid #5a3a28",
        position: "relative", boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          textAlign: "center", fontFamily: "'Caveat', cursive",
          color: COLORS.warm, fontSize: 22, marginBottom: 16, letterSpacing: 1,
        }}>
          Family Memories Recorder
        </div>

        {/* Animated Reels */}
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 20 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{
              width: 70, height: 70, borderRadius: "50%",
              border: `3px solid ${COLORS.warm}`,
              background: "radial-gradient(circle, #1a1410 30%, #3d2b1a 60%, #5a3a28 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: uploading ? "spin 1s linear infinite" : "spin 4s linear infinite",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS.warm, opacity: 0.6 }} />
            </div>
          ))}
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        {/* Type selector */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {["document", "voice", "video"].map((type) => (
            <button key={type} onClick={() => { setUploadType(type); setFile(null); }} style={{
              background: uploadType === type ? COLORS.warm : "rgba(212,165,106,0.1)",
              border: `1px solid ${COLORS.warm}`, borderRadius: 10,
              padding: "8px 16px", cursor: "pointer",
              color: uploadType === type ? COLORS.ink : COLORS.warmLight,
              fontFamily: "'Crimson Text', serif", fontSize: 14, transition: "all 0.2s",
            }}>
              {typeIcons[type]} {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Form Inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: COLORS.warmLight, fontFamily: "'Crimson Text', serif" }}>
            Memory Date
            <input type="date" value={memoryDate} onChange={(e) => setMemoryDate(e.target.value)} style={{
              width: "100%", marginTop: 6, padding: "10px", borderRadius: 10,
              border: `1px solid ${COLORS.warm}60`, background: "#1f140c",
              color: COLORS.warmLight, fontFamily: "sans-serif", boxSizing: "border-box"
            }} />
          </label>
          <label style={{ fontSize: 12, color: COLORS.warmLight, fontFamily: "'Crimson Text', serif" }}>
            Recipient
            <select value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{
              width: "100%", marginTop: 6, padding: "10px", borderRadius: 10,
              border: `1px solid ${COLORS.warm}60`, background: "#1f140c",
              color: COLORS.warmLight, fontFamily: "'Crimson Text', serif", boxSizing: "border-box"
            }}>
              <option value="all">Everyone</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
        </div>

        <label style={{ fontSize: 12, color: COLORS.warmLight, fontFamily: "'Crimson Text', serif", display: "block", marginBottom: 14 }}>
          Title / Description
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is this memory?" style={{
            width: "100%", marginTop: 6, padding: "12px", borderRadius: 10,
            border: `1px solid ${COLORS.warm}60`, background: "#1f140c",
            color: COLORS.warmLight, fontFamily: "'Crimson Text', serif", boxSizing: "border-box"
          }} />
        </label>

        {/* Enhanced File Zone */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            border: `2px dashed ${file ? COLORS.green : COLORS.warm + "40"}`,
            borderRadius: 15, padding: "30px 20px", textAlign: "center",
            background: "rgba(0,0,0,0.2)", position: "relative", transition: "all 0.3s"
          }}>
            {!file ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 10 }}>{typeIcons[uploadType]}</div>
                <div style={{ color: COLORS.warm, fontSize: 14, fontWeight: 600 }}>Click to select {uploadType}</div>
                <div style={{ color: COLORS.warmLight, fontSize: 11, marginTop: 4 }}>Drag & Drop also works</div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>📎</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: COLORS.warmLight, fontWeight: 600, fontSize: 13, maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.name}
                  </div>
                  <button onClick={() => setFile(null)} style={{ background: "none", border: "none", color: COLORS.accent, padding: 0, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>
                    Change File
                  </button>
                </div>
              </div>
            )}
            <input type="file" accept={accepts[uploadType]} onChange={(e) => setFile(e.target.files?.[0] || null)} style={{
              position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%"
            }} />
          </div>
        </div>

        <button onClick={handleUpload} disabled={uploading} style={{
          display: "block", width: "100%", padding: "16px",
          background: uploading ? "#4a352a" : COLORS.accent, border: "none", borderRadius: 12,
          cursor: uploading ? "not-allowed" : "pointer", color: COLORS.paper,
          fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
          boxShadow: "0 4px 0 #8b4513", transition: "all 0.1s"
        }}>
          {uploading ? "Recording..." : "Upload to Archive"}
        </button>

        {showSuccess && (
          <div style={{ textAlign: "center", color: COLORS.greenLight, marginTop: 15, fontFamily: "'Caveat', cursive", fontSize: 20 }}>
            Saved to the vault! 🎉
          </div>
        )}
      </div>

      {/* ARCHIVE LIST */}
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, textAlign: "center", marginBottom: 20 }}>
        Family Archive
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg) => {
          const from = getMember(msg.sender_id);
          const url = signedUrls[msg.id];
          const isImage = msg.media_type?.startsWith("image/") || msg.media_type === "IMAGE";
          const isAudio = msg.media_type?.startsWith("audio/") || msg.media_type === "AUDIO";
          const isVideo = msg.media_type?.startsWith("video/") || msg.media_type === "VIDEO";
          const type = getUploadType(msg.media_type);
          const fileName = `${msg.description?.replace(/\s+/g, "_") || "memory"}`;
          
          const date = new Date(msg.display_date || msg.created_at).toLocaleDateString("en-AU", {
            day: "numeric", month: "short", year: "numeric",
          });

          return (
            <div key={msg.id} style={{
              display: "grid", gap: 12, padding: "20px",
              background: COLORS.paper, borderRadius: 16,
              border: `1px solid ${COLORS.warm}30`,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ fontSize: 32 }}>{typeIcons[type]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.ink, marginBottom: 2 }}>
                    {msg.description || "Untitled Memory"}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.inkLight }}>
                    From <strong>{from?.name || "Family"}</strong> → {formatRecipient(msg.recipient_id)}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 4, fontWeight: 600 }}>
                    📅 {date}
                  </div>
                </div>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{
                    fontSize: 10, background: `${typeColors[type]}15`, color: typeColors[type],
                    padding: "4px 10px", borderRadius: 20, fontWeight: 800, textTransform: "uppercase"
                  }}>
                    {type}
                  </span>
                  
                  {url && (
                    <button 
                      onClick={() => handleDownload(url, fileName, msg.id)}
                      disabled={downloadingId === msg.id}
                      style={{
                        background: COLORS.ink, color: COLORS.paper, border: "none", 
                        borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 5, alignSelf: "flex-end"
                      }}
                    >
                      {downloadingId === msg.id ? "..." : "⬇️ Download"}
                    </button>
                  )}
                </div>
              </div>

              {url && (
                <div style={{ marginTop: 8 }}>
                  {isImage && (
                    <img src={url} alt="" style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 12 }} />
                  )}
                  {isAudio && (
                    <audio controls style={{ width: "100%" }}>
                      <source src={url} type={msg.media_type?.includes("/") ? msg.media_type : undefined} />
                    </audio>
                  )}
                  {isVideo && (
                    <video controls style={{ width: "100%", borderRadius: 12 }}>
                      <source src={url} type={msg.media_type?.includes("/") ? msg.media_type : undefined} />
                    </video>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: COLORS.inkLight, padding: "40px 0", fontStyle: "italic" }}>
            The archive is empty. Start recording history!
          </div>
        )}
      </div>
    </PageContainer>
  );
}