"use client";
import { useEffect, useMemo, useState } from "react";
import { COLORS } from "./colors";
import { PageContainer } from "./shared";
import { getLetters } from "@/supabase/queries/getLetter";
import { insertLetter } from "@/supabase/queries/insertLetter";

/* ---------------- HELPERS ---------------- */

const getTimeRemaining = (unlockDate) => {
  if (!unlockDate) return null;
  const now = Date.now();
  const target = new Date(unlockDate).getTime();
  const diff = target - now;
  if (diff <= 0) return "Unlocked";

  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const inputStyle = {
  width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10,
  border: `1px solid ${COLORS.warm}60`, fontFamily: "'Crimson Text', serif",
  fontSize: 15, outline: "none", background: "#fff",
};

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: COLORS.inkLight,
  textTransform: "uppercase", letterSpacing: "0.5px",
};

/* ---------------- COMPONENT ---------------- */

export default function LettersPage({
  navigate,
  currentUser,
  boomerMode,
  members,
  calendarDraft,
  consumeCalendarDraft,
  viewSrc,
}) {
  const [letters, setLetters] = useState([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [toMember, setToMember] = useState("all");
  const [noteType, setNoteType] = useState("Letter"); // Match MessageType case
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [now, setNow] = useState(Date.now());

  const getMember = (id) => members.find((m) => m.id === id);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isLocked = (note) => {
    if (note.from === currentUser.id) return false;
    if (!note.unlockDate) return false;
    return new Date(note.unlockDate).getTime() > now;
  };

  /* ----------- FETCH ----------- */
  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchLetters = async () => {
      try {
        const data = await getLetters(currentUser.id);
        const mapped = data.map((l) => ({
          id: l.id,
          from: l.sender_id,
          to: l.recipient_id,
          type: l.message_type,
          title: l.title,
          content: l.message,
          unlockDate: l.unlock_date,
          createdAt: l.created_date,
        }));
        setLetters(mapped);
      } catch (err) { console.error("Fetch failed:", err); }
    };
    fetchLetters();
  }, [currentUser]);

  /* ----------- DATA ORGANIZATION ----------- */
  const sections = useMemo(() => {
    const cats = { incomingUnlocked: [], incomingLocked: [], sentMessages: [] };
    letters.forEach((n) => {
      if (n.from === currentUser.id) cats.sentMessages.push(n);
      else if (isLocked(n)) cats.incomingLocked.push(n);
      else cats.incomingUnlocked.push(n);
    });
    const sortFn = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    Object.keys(cats).forEach(k => cats[k].sort(sortFn));
    return cats;
  }, [letters, now, currentUser.id]);

  /* ----------- INSERT ----------- */
  const handleAddNote = async () => {
    if (!title.trim() || !message.trim()) return;
    try {
      const recipientId = toMember === "all" ? null : toMember;

      const newLetter = await insertLetter({
        unlock_date: unlockDate || null,
        sender_id: currentUser.id,
        recipient_id: recipientId,
        message_type: noteType,
        title: title.trim(),
        message: message.trim(),
      });

      setLetters((prev) => [{
        id: newLetter.id,
        from: newLetter.sender_id,
        to: newLetter.recipient_id,
        type: newLetter.message_type,
        title: newLetter.title,
        content: newLetter.message,
        unlockDate: newLetter.unlock_date,
        createdAt: newLetter.created_date,
      }, ...prev]);

      setTitle(""); setMessage(""); setUnlockDate(""); setToMember("all"); setComposeOpen(false);
    } catch (err) { alert(err.message); }
  };

  /* ----------- CALENDAR DRAFT ----------- */
  useEffect(() => {
    if (calendarDraft?.target !== "letters") return;
    setComposeOpen(true);
    setUnlockDate(calendarDraft.eventDate || "");
    consumeCalendarDraft?.("letters");
  }, [calendarDraft, consumeCalendarDraft]);

  const renderNote = (note) => {
    const from = getMember(note.from);
    const locked = isLocked(note);
    return (
      <div key={note.id} style={{
        background: locked ? "#f5f0e8" : COLORS.paper,
        border: `1px solid ${locked ? "#ccc" : COLORS.warm + "40"}`,
        borderRadius: 14, padding: 20, position: "relative", overflow: "hidden",
      }}>
        {locked && (
          <div style={{
            position: "absolute", inset: 0, backdropFilter: "blur(5px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(245,240,232,0.85)", zIndex: 2, borderRadius: 14,
          }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>🔒</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: COLORS.ink }}>Time-Locked</span>
            <span style={{ fontSize: 13, color: COLORS.inkLight, marginTop: 4, fontFamily: "'Caveat', cursive" }}>Opens in: {getTimeRemaining(note.unlockDate)}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          {from && <span style={{ fontSize: 24 }}>{from.avatar}</span>}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 14 }}>{note.from === currentUser.id ? "Sent by You" : from?.name}</div>
            <div style={{ fontSize: 11, color: COLORS.inkLight }}>{note.type} • {note.to === null ? "Everyone" : "Private"}</div>
          </div>
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, margin: "0 0 6px" }}>{note.title}</h3>
        <p style={{ fontSize: 15, lineHeight: 1.6, fontFamily: "'Crimson Text', serif", whiteSpace: "pre-wrap" }}>{note.content}</p>
      </div>
    );
  };

  return (
    <PageContainer navigate={navigate} title="Family Letters" boomerMode={boomerMode} description="Preserve stories and messages for the future." viewSrc={viewSrc}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <button onClick={() => setComposeOpen(true)} style={{ background: COLORS.accent, color: COLORS.paper, border: "none", borderRadius: 12, padding: "12px 20px", cursor: "pointer", fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600 }}>+ Write New Message</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {sections.incomingUnlocked.length > 0 && (
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 16 }}>Messages for You</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{sections.incomingUnlocked.map(renderNote)}</div>
          </section>
        )}
        {sections.incomingLocked.length > 0 && (
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 16, opacity: 0.6 }}>Future Deliveries</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{sections.incomingLocked.map(renderNote)}</div>
          </section>
        )}
        {sections.sentMessages.length > 0 && (
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 16, opacity: 0.8 }}>Your Sent Archive</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{sections.sentMessages.map(renderNote)}</div>
          </section>
        )}
      </div>

      {composeOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(20,10,5,0.7)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }} onClick={() => setComposeOpen(false)}>
          <div style={{ background: COLORS.paper, borderRadius: 20, padding: 30, maxWidth: 500, width: "92%" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>New Message</h3>
              <button onClick={() => setComposeOpen(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Recipient</label>
                  <select value={toMember} onChange={(e) => setToMember(e.target.value)} style={inputStyle}>
                    <option value="all">Everyone</option>
                    {members.filter(m => m.id !== currentUser.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={noteType} onChange={(e) => setNoteType(e.target.value)} style={inputStyle}>
                    <option value="Letter">Letter</option>
                    <option value="Tradition">Tradition</option>
                    <option value="Heirloom">Heirloom</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Your message..." style={{ ...inputStyle, resize: "none" }} />
              </div>
              <div>
                <label style={labelStyle}>Unlock Date</label>
                <input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <button onClick={handleAddNote} style={{ marginTop: 24, width: "100%", padding: "14px", border: "none", borderRadius: 12, background: COLORS.accent, color: COLORS.paper, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600 }}>Save Message</button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}