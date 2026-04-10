"use client";
import { useMemo } from "react";
import { COLORS } from "./colors";
import { FAMILY_MEMBERS, NOTES, getMember } from "./data";
import { PageContainer } from "./shared";

export default function PortraitPage({ navigate, currentUser, setCurrentUser, boomerMode, sprites, members, notes }) {
  const sortedNotes = useMemo(() => {
    const visible = notes.filter(n => n.to === currentUser.id || n.to === "all");
    return [...visible].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [notes, currentUser.id]);

  const getMember = (id) => members.find(m => m.id === id);
  
  return (
    <PageContainer navigate={navigate} title="Family Portraits" boomerMode={boomerMode}
      description="Tap a family member's portrait to switch to their view. You'll see messages and notes left specifically for that person.">
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 20, maxWidth: 700, margin: "0 auto",
      }}>
        {members.map(member => {
          const isActive = currentUser.id === member.id;
          const noteCount = notes.filter(n => n.to === member.id || n.to === "all").length;
          return (
            <button key={member.id} onClick={() => setCurrentUser(member)} style={{
              background: isActive
                ? `linear-gradient(145deg, ${COLORS.warm}, ${COLORS.warmDark})`
                : COLORS.paper,
              border: isActive ? `3px solid ${COLORS.accent}` : `2px solid ${COLORS.warm}`,
              borderRadius: 16, padding: "24px 16px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              transition: "all 0.3s", boxShadow: isActive ? `0 8px 25px ${COLORS.shadow}` : `0 2px 8px rgba(0,0,0,0.1)`,
              transform: isActive ? "scale(1.05)" : "scale(1)",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.transform = "scale(1.03)" }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.transform = "scale(1)" }}
            >
              <span style={{ fontSize: 48, lineHeight: 1 }}>{member.avatar}</span>
              <span style={{
                fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600,
                color: isActive ? COLORS.paper : COLORS.ink,
              }}>{member.name}</span>
              <span style={{
                fontSize: 12, color: isActive ? COLORS.cream : COLORS.inkLight,
                fontFamily: "'Crimson Text', serif",
              }}>{member.role}</span>
              <span style={{
                fontSize: 11, background: isActive ? "rgba(255,255,255,0.2)" : COLORS.cream,
                padding: "3px 10px", borderRadius: 20, color: isActive ? COLORS.paper : COLORS.inkLight,
              }}>{noteCount} notes</span>
            </button>
          );
        })}
      </div>

      {/* Notes for current user */}
      <div style={{ marginTop: 36 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, textAlign: "center", color: COLORS.ink, marginBottom: 20 }}>
          Notes for {currentUser.name}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sortedNotes.map(note => {
            const from = getMember(note.from);
            return (
              <div key={note.id} style={{
                background: COLORS.paper, border: `1px solid ${COLORS.warm}40`,
                borderRadius: 14, padding: 20, boxShadow: `0 2px 10px rgba(0,0,0,0.06)`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {from && <span style={{ fontSize: 22, lineHeight: 1 }}>{from.avatar}</span>}
                    <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{from?.name}</span>
                  </div>
                  <span style={{
                    fontSize: 11, background: note.type === "tradition" ? `${COLORS.green}22` : note.type === "letter" ? `${COLORS.accent}22` : `${COLORS.warm}22`,
                    color: note.type === "tradition" ? COLORS.green : note.type === "letter" ? COLORS.accent : COLORS.warmDark,
                    padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                  }}>
                    {note.type === "tradition" ? "Tradition" : note.type === "letter" ? "Letter" : "Heirloom"}
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, margin: "0 0 8px", color: COLORS.ink }}>{note.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.inkLight, margin: 0 }}>{note.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
