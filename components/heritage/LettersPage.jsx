"use client";
import { COLORS } from "./colors";
import { NOTES, getMember } from "./data";
import { PageContainer, SpriteImg } from "./shared";

export default function LettersPage({ navigate, currentUser, boomerMode, sprites }) {
  const today = new Date();

  const isLocked = (note) => {
    if (!note.unlockDate) return false;
    return new Date(note.unlockDate) > today;
  };

  const allNotes = NOTES.filter(n => n.to === currentUser.id || n.to === "all");

  return (
    <PageContainer navigate={navigate} title="Family Letters" boomerMode={boomerMode}
      description="These are messages left for you by your family. Some letters are locked until a special date — they will open automatically when the time comes.">

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {allNotes.map(note => {
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
                {from && <SpriteImg src={sprites[from.id]} fallback={from.avatar} size={22} />}
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 14 }}>{from?.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.inkLight }}>
                    {note.type === "tradition" ? "🎋 Tradition" : note.type === "letter" ? "💌 Letter" : "📦 Heirloom"}
                  </div>
                </div>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, margin: "0 0 8px" }}>{note.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.inkLight, margin: 0, fontFamily: "'Crimson Text', serif" }}>{note.content}</p>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
