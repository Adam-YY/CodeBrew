"use client";
import { useMemo, useState } from "react";
import { COLORS } from "./colors";
import { NOTES, getMember } from "./data";
import { PageContainer } from "./shared";

export default function LettersPage({ navigate, currentUser, boomerMode }) {
  const today = new Date();
  const [composeOpen, setComposeOpen] = useState(false);
  const [toMember, setToMember] = useState("all");
  const [noteType, setNoteType] = useState("letter");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [eventDate, setEventDate] = useState("");

  const getMember = (id) => members.find(m => m.id === id);

  const isLocked = (note) => {
    if (!note.unlockDate) return false;
    return new Date(note.unlockDate) > today;
  };

  const visibleNotes = useMemo(() => {
    return notes
      .filter(n => n.to === currentUser.id || n.to === "all")
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [notes, currentUser.id]);

  const handleAddNote = () => {
    if (!title.trim() || !message.trim()) return;
    const formattedEventDate = eventDate ? eventDate.slice(5) : null;
    addNote({
      from: currentUser.id,
      to: toMember,
      type: noteType,
      title: title.trim(),
      content: message.trim(),
      unlockDate: unlockDate || null,
      eventDate: formattedEventDate,
    });
    setTitle("");
    setMessage("");
    setUnlockDate("");
    setEventDate("");
    setToMember("all");
    setComposeOpen(false);
  };

  return (
    <PageContainer navigate={navigate} title="Family Letters" boomerMode={boomerMode}
      description="These are messages left for you by your family. Some letters are locked until a special date — they will open automatically when the time comes.">

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <button onClick={() => setComposeOpen(true)} style={{
          background: COLORS.accent, color: COLORS.paper, border: "none", borderRadius: 12,
          padding: "10px 16px", cursor: "pointer", fontFamily: "'Playfair Display', serif",
          fontSize: 14, fontWeight: 600,
        }}>Write a New Message</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {visibleNotes.map(note => {
          const from = getMember(note.from);
          const locked = isLocked(note);
          return (
            <div key={note.id} style={{
              background: locked ? "#f5f0e8" : COLORS.paper,
              border: `1px solid ${locked ? "#ccc" : COLORS.warm + "40"}`,
              borderRadius: 14, padding: 20, position: "relative", overflow: "hidden",
              opacity: locked ? 0.75 : 1, transition: "all 0.3s",
            }}>
              {locked && (
                <div style={{
                  position: "absolute", inset: 0, backdropFilter: "blur(4px)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: "rgba(245,240,232,0.85)", zIndex: 2, borderRadius: 14,
                }}>
                  <span style={{ fontSize: 36, marginBottom: 8 }}>🔒</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: COLORS.ink }}>
                    Time-Locked Letter
                  </span>
                  <span style={{ fontSize: 13, color: COLORS.inkLight, marginTop: 4, fontFamily: "'Caveat', cursive" }}>
                    Opens on {new Date(note.unlockDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                {from && <span style={{ fontSize: 22, lineHeight: 1 }}>{from.avatar}</span>}
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 14 }}>{from?.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.inkLight }}>
                    {note.type === "tradition" ? "Tradition" : note.type === "letter" ? "Letter" : "Heirloom"}
                  </div>
                </div>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, margin: "0 0 8px" }}>{note.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.inkLight, margin: 0, fontFamily: "'Crimson Text', serif" }}>{note.content}</p>
            </div>
          );
        })}
      </div>

      {composeOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,10,5,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setComposeOpen(false)}>
          <div style={{
            background: COLORS.paper, borderRadius: 16, padding: "22px 24px",
            maxWidth: 560, width: "92%", boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, margin: 0 }}>Write a New Message</h3>
              <button onClick={() => setComposeOpen(false)} style={{
                background: "none", border: "none", fontSize: 20, cursor: "pointer", color: COLORS.ink,
              }}>{"✕"}</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                To
                <select value={toMember} onChange={(e) => setToMember(e.target.value)} style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }}>
                  <option value="all">Everyone</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Message type
                <select value={noteType} onChange={(e) => setNoteType(e.target.value)} style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }}>
                  <option value="letter">Letter</option>
                  <option value="tradition">Tradition</option>
                  <option value="item">Heirloom</option>
                </select>
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your message a title" style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }} />
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Message
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Write your message here" style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }} />
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Unlock date (optional)
                <input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }} />
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Calendar date (optional)
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }} />
              </label>
            </div>
            <button onClick={handleAddNote} style={{
              marginTop: 16, width: "100%", padding: "10px 14px",
              border: "none", borderRadius: 10, background: COLORS.accent,
              color: COLORS.paper, fontFamily: "'Playfair Display', serif", cursor: "pointer",
              fontSize: 15, fontWeight: 600,
            }}>
              Save Message
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
