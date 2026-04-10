"use client";
import { useState } from "react";
import { COLORS } from "./colors";
import { FAMILY_TREE, NOTES, getMember } from "./data";
import { PageContainer, SpriteImg } from "./shared";

export default function FamilyTreePage({ navigate, currentUser, boomerMode, sprites }) {
  const [selectedMember, setSelectedMember] = useState(null);

  const PersonBubble = ({ member, onClick, isSelected }) => (
    <button onClick={onClick} style={{
      background: isSelected ? COLORS.warm : COLORS.paper,
      border: isSelected ? `2px solid ${COLORS.accent}` : `2px solid ${COLORS.warm}60`,
      borderRadius: 14, padding: "10px 14px", cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      transition: "all 0.3s", minWidth: 80,
      boxShadow: isSelected ? `0 4px 15px ${COLORS.shadow}` : "none",
      transform: isSelected ? "scale(1.08)" : "scale(1)",
    }}
    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = "scale(1.05)" }}
    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.transform = "scale(1)" }}
    >
      <SpriteImg src={sprites[member.id]} fallback={member.avatar} size={30} />
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, fontWeight: 600, color: isSelected ? COLORS.paper : COLORS.ink }}>{member.name}</span>
    </button>
  );

  const TreeNode = ({ id, spouse, children: kids, depth = 0 }) => {
    const member = getMember(id);
    const spouseMember = spouse ? getMember(spouse) : null;
    if (!member) return null;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Couple row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PersonBubble member={member} onClick={() => setSelectedMember(member)} isSelected={selectedMember?.id === member.id} />
          {spouseMember && (
            <>
              <div style={{ width: 20, height: 2, background: COLORS.warm }} />
              <PersonBubble member={spouseMember} onClick={() => setSelectedMember(spouseMember)} isSelected={selectedMember?.id === spouseMember.id} />
            </>
          )}
        </div>
        {/* Children */}
        {kids && kids.length > 0 && (
          <>
            <div style={{ width: 2, height: 24, background: COLORS.warm, opacity: 0.4 }} />
            <div style={{ display: "flex", gap: "clamp(16px, 4vw, 40px)", position: "relative" }}>
              {kids.length > 1 && (
                <div style={{
                  position: "absolute", top: -12, left: "25%", right: "25%",
                  height: 2, background: COLORS.warm, opacity: 0.4,
                }} />
              )}
              {kids.map(child => (
                <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {kids.length > 1 && <div style={{ width: 2, height: 12, background: COLORS.warm, opacity: 0.4, marginTop: -12 }} />}
                  <TreeNode {...child} depth={depth + 1} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const memberNotes = selectedMember ? NOTES.filter(n => n.from === selectedMember.id) : [];

  return (
    <PageContainer navigate={navigate} title="Family Tree" boomerMode={boomerMode}
      description="This is your family tree. Tap on any family member to see all the notes and messages they have left for the family.">

      <div style={{
        background: COLORS.paper, borderRadius: 16, padding: "32px 16px",
        border: `1px solid ${COLORS.warm}40`, display: "flex", justifyContent: "center",
        overflowX: "auto",
      }}>
        <TreeNode {...FAMILY_TREE} />
      </div>

      {selectedMember && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, textAlign: "center", marginBottom: 6 }}>
            <SpriteImg src={sprites[selectedMember.id]} fallback={selectedMember.avatar} size={20} style={{ verticalAlign: "middle", marginRight: 6 }} /> Notes by {selectedMember.name}
          </h3>
          <p style={{ textAlign: "center", fontSize: 13, color: COLORS.inkLight, marginBottom: 20 }}>
            {memberNotes.length} note{memberNotes.length !== 1 ? "s" : ""} left for the family
          </p>
          {memberNotes.length === 0 ? (
            <p style={{ textAlign: "center", color: COLORS.inkLight, fontStyle: "italic" }}>No notes from {selectedMember.name} yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {memberNotes.map(note => {
                const toMember = note.to === "all" ? null : getMember(note.to);
                return (
                  <div key={note.id} style={{
                    background: COLORS.paper, border: `1px solid ${COLORS.warm}40`,
                    borderRadius: 14, padding: 20,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: COLORS.inkLight, display: "flex", alignItems: "center", gap: 4 }}>
                        To: {toMember
                          ? <><SpriteImg src={sprites[toMember.id]} fallback={toMember.avatar} size={14} /> {toMember.name}</>
                          : "👨‍👩‍👧‍👦 Everyone"}
                      </span>
                      <span style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                        background: note.type === "tradition" ? `${COLORS.green}22` : note.type === "letter" ? `${COLORS.accent}22` : `${COLORS.warm}22`,
                        color: note.type === "tradition" ? COLORS.green : note.type === "letter" ? COLORS.accent : COLORS.warmDark,
                      }}>
                        {note.type === "tradition" ? "🎋 Tradition" : note.type === "letter" ? "💌 Letter" : "📦 Heirloom"}
                      </span>
                    </div>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", margin: "0 0 6px", fontSize: 16 }}>{note.title}</h4>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.inkLight, margin: 0 }}>{note.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
