"use client";
import { useEffect, useState } from "react";
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
        .or(
          `recipient_id.is.null,recipient_id.eq.${currentUser.id},sender_id.eq.${currentUser.id}`
        )
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Fetch error:", error);
        return;
      }
      setMessages(data || []);
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

  // 🔥 UPLOAD HANDLER
  const handleUpload = async () => {
    if (!file && !title.trim()) return;
    setUploading(true);
    try {
      const formattedEventDate = eventDate ? eventDate.slice(5) : null;
      let filePath = null;
      if (file) {
        const safeName = file.name
          .normalize("NFD")
          .replace(/[^\w\s.-]/g, "")   // strip non-ASCII and special chars
          .replace(/\s+/g, "_")          // spaces to underscores
          || "upload";
        filePath = `${currentUser.id}/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage
          .from("multimedia")
          .upload(filePath, file);
        if (error) {
          console.error("Upload error:", error);
          return;
        }
      }

      // media_type is NOT NULL enum in schema — map raw MIME type to enum value
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
        media_type: toMediaTypeEnum(file?.type),  // enum: IMAGE | AUDIO | VIDEO (NOT NULL)
        description: title || null,               // schema column is "description", not "content"
      };

      // Some environments may not have event_date yet; fallback keeps uploads working.
      const { error: insertErrorWithDate } = await supabase.from("message").insert({
        ...basePayload,
        event_date: formattedEventDate,
      });
      let insertError = insertErrorWithDate;
      if (insertErrorWithDate && String(insertErrorWithDate.message || "").toLowerCase().includes("event_date")) {
        const fallbackInsert = await supabase.from("message").insert(basePayload);
        insertError = fallbackInsert.error;
      }
      if (insertError) {
        console.error("Insert error:", insertError);
        return;
      }

      const newMsg = {
        id: Date.now(),
        sender_id: currentUser.id,
        recipient_id: recipient === "all" ? null : recipient,
        media_path: filePath,
        media_type: file?.type || null,  // raw MIME for isImage/isAudio/isVideo checks below
        description: title || null,
        event_date: formattedEventDate,
        created_at: new Date().toISOString(),
      };

      // Generate signed URL for optimistic update
      if (filePath) {
        const { data: signedData } = await supabase.storage
          .from("multimedia")
          .createSignedUrl(filePath, 3600);
        if (signedData?.signedUrl) {
          setSignedUrls((prev) => ({ ...prev, [newMsg.id]: signedData.signedUrl }));
        }
      }

      setMessages((prev) => [newMsg, ...prev]);
      addUpload?.(newMsg);
      setFile(null);
      setTitle("");
      setEventDate("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setUploading(false);
    }
  };

  const formatRecipient = (id) => {
    if (!id) return "Everyone";
    return getMember(id)?.name || "Family";
  };

  // Derive upload type from media_type for display
  const getUploadType = (mediaType) => {
    if (!mediaType) return "document";
    if (mediaType.startsWith("audio/")) return "voice";
    if (mediaType.startsWith("video/")) return "video";
    return "document";
  };

  useEffect(() => {
    if (calendarDraft?.target !== "cassette") return;
    setEventDate(calendarDraft.eventDate || "");
    consumeCalendarDraft?.("cassette");
  }, [calendarDraft, consumeCalendarDraft]);

  return (
    <PageContainer
      navigate={navigate}
      title="Cassette Player"
      boomerMode={boomerMode}
      description="Upload documents, voice recordings, or videos to share with your family. Choose the type of media, select who it is for, and tap Upload."
    >
      {/* Cassette visual + upload form */}
      <div style={{
        background: "#2c1810", borderRadius: 20, padding: "30px 24px",
        margin: "0 auto 32px", maxWidth: 520,
        border: "3px solid #5a3a28", position: "relative",
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          textAlign: "center", fontFamily: "'Caveat', cursive",
          color: COLORS.warm, fontSize: 22, marginBottom: 16, letterSpacing: 1,
        }}>
          Family Memories Recorder
        </div>

        {/* Reels */}
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
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
          {["document", "voice", "video"].map((type) => (
            <button key={type} onClick={() => setUploadType(type)} style={{
              background: uploadType === type ? COLORS.warm : "rgba(212,165,106,0.15)",
              border: `1px solid ${COLORS.warm}`, borderRadius: 10,
              padding: "8px 16px", cursor: "pointer",
              color: uploadType === type ? COLORS.ink : COLORS.warmLight,
              fontFamily: "'Crimson Text', serif", fontSize: 14, transition: "all 0.2s",
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
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>

          <label style={{ fontSize: 12, color: COLORS.warmLight, fontFamily: "'Crimson Text', serif" }}>
            Title (optional)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this memory a title"
              style={{
                width: "100%", marginTop: 6, padding: "8px 10px",
                borderRadius: 10, border: `1px solid ${COLORS.warm}60`,
                background: "#1f140c", color: COLORS.warmLight,
                fontFamily: "'Crimson Text', serif", boxSizing: "border-box",
              }}
            />
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

          <label style={{ fontSize: 12, color: COLORS.warmLight, fontFamily: "'Crimson Text', serif" }}>
            Calendar date (optional)
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              style={{
                width: "100%", marginTop: 6, padding: "8px 10px",
                borderRadius: 10, border: `1px solid ${COLORS.warm}60`,
                background: "#1f140c", color: COLORS.warmLight,
                fontFamily: "'Crimson Text', serif", boxSizing: "border-box",
              }}
            />
          </label>
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            display: "block", width: "100%", padding: "12px",
            background: uploading ? `${COLORS.accent}80` : COLORS.accent,
            border: "none", borderRadius: 10,
            cursor: uploading ? "not-allowed" : "pointer",
            fontFamily: "'Playfair Display', serif", fontSize: 16,
            color: COLORS.paper, transition: "all 0.2s", fontWeight: 600,
          }}
          onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.transform = "scale(1.02)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {uploading ? "Uploading..." : `Upload ${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}`}
        </button>

        {showSuccess && (
          <div style={{
            textAlign: "center", color: COLORS.greenLight, marginTop: 10,
            fontFamily: "'Caveat', cursive", fontSize: 18,
          }}>
            Uploaded successfully! 🎉
          </div>
        )}
      </div>

      {/* Archive list */}
      <h3 style={{
        fontFamily: "'Playfair Display', serif", fontSize: 20,
        textAlign: "center", marginBottom: 16,
      }}>
        Family Archive
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg) => {
          const from = getMember(msg.sender_id);
          const url = signedUrls[msg.id];
          // media_type may be raw MIME (optimistic) or enum from DB (on reload)
          const isImage = msg.media_type?.startsWith("image/") || msg.media_type === "IMAGE";
          const isAudio = msg.media_type?.startsWith("audio/") || msg.media_type === "AUDIO";
          const isVideo = msg.media_type?.startsWith("video/") || msg.media_type === "VIDEO";
          const type = getUploadType(msg.media_type);
          const date = new Date(msg.created_at).toLocaleDateString("en-AU", {
            day: "numeric", month: "short", year: "numeric",
          });

          return (
            <div key={msg.id} style={{
              display: "grid", gap: 8, padding: "14px 18px",
              background: COLORS.paper, borderRadius: 12,
              border: `1px solid ${COLORS.warm}30`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 26 }}>{typeIcons[type]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink }}>
                    {msg.description || "Untitled"}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.inkLight }}>
                    From {from?.name || "Family"} → {formatRecipient(msg.recipient_id)} • {date}
                  </div>
                </div>
                <span style={{
                  fontSize: 11,
                  background: `${typeColors[type]}18`,
                  color: typeColors[type],
                  padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                }}>
                  {type}
                </span>
              </div>

              {url && isImage && (
                <img src={url} alt="" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 10 }} />
              )}
              {url && isAudio && (
                <audio controls style={{ width: "100%" }}>
                  <source src={url} type={msg.media_type?.includes("/") ? msg.media_type : undefined} />
                </audio>
              )}
              {url && isVideo && (
                <video controls style={{ width: "100%", borderRadius: 10 }}>
                  <source src={url} type={msg.media_type?.includes("/") ? msg.media_type : undefined} />
                </video>
              )}
            </div>
          );
        })}

        {messages.length === 0 && (
          <div style={{
            textAlign: "center", color: COLORS.inkLight,
            fontFamily: "'Crimson Text', serif", fontSize: 16, padding: "32px 0",
          }}>
            No memories yet — be the first to upload one!
          </div>
        )}
      </div>
    </PageContainer>
  );
}