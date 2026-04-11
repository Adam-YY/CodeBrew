"use client";

import { useMemo, useEffect } from "react";
import { COLORS } from "./colors";
import { PageContainer } from "./shared";

/* ---------------- helpers ---------------- */

const calculateAge = (dob) => {
  if (!dob) return null;

  const birth = new Date(dob);

  if (isNaN(birth.getTime())) {
    console.log("Invalid DOB:", dob);
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const getEmoji = (age, gender) => {
  if (age == null) return "🙂";

  const g = (gender || "").toUpperCase();

  const isMale = g === "M";
  const isFemale = g === "F";

  if (age < 13) return "🧒";
  if (age < 20) return "🧑‍🎓";

  if (age < 60) {
    if (isMale) return "👨";
    if (isFemale) return "👩";
    return "🧑";
  }

  if (isMale) return "👴";
  if (isFemale) return "👵";
  return "🧓";
};

export default function PortraitPage({
  navigate,
  currentUser,
  setCurrentUser,
  boomerMode,
  members = [],
  notes = [],
  viewSrc,
}) {
  const safeMembers = Array.isArray(members) ? members : [];
  const safeNotes = Array.isArray(notes) ? notes : [];

  const safeCurrentUser = currentUser ?? {};

  /* ---------------- DEBUG LOGS ---------------- */

  useEffect(() => {
    console.log("=== PortraitPage DEBUG ===");
    console.log("members:", safeMembers);
    console.log("notes:", safeNotes);
    console.log("currentUser:", safeCurrentUser);
  }, [safeMembers, safeNotes, safeCurrentUser]);

  const sortedNotes = useMemo(() => {
    console.log("Recomputing notes for user:", safeCurrentUser?.id);

    const visible = safeNotes.filter(
      (n) => n.to === safeCurrentUser.id || n.to === "all"
    );

    console.log("Visible notes:", visible);

    return [...visible].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [safeNotes, safeCurrentUser.id]);

  const getMember = (id) => safeMembers.find((m) => m.id === id);

  return (
    <PageContainer
      navigate={navigate}
      title="Family Portraits"
      boomerMode={boomerMode}
      description="Tap a family member's portrait to switch to their view. You'll see messages and notes left specifically for that person."
      viewSrc={viewSrc}
    >
      {/* MEMBERS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 20,
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        {safeMembers.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%" }}>
            No members found (check console)
          </p>
        ) : (
          safeMembers.map((member) => {
            const isActive = safeCurrentUser?.id === member.id;

            const noteCount = safeNotes.filter(
              (n) => n.to === member.id || n.to === "all"
            ).length;

            const age = calculateAge(member.date_of_birth);
            const emoji = getEmoji(age, member.gender);

            const displayName =
              member.name ||
              `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim();

            console.log("Rendering member:", member);

            return (
              <button
                key={member.id}
                onClick={() => {
                  console.log("Switching current user to:", member);
                  setCurrentUser(member);
                }}
                style={{
                  background: isActive
                    ? `linear-gradient(145deg, ${COLORS.warm}, ${COLORS.warmDark})`
                    : COLORS.paper,
                  border: isActive
                    ? `3px solid ${COLORS.accent}`
                    : `2px solid ${COLORS.warm}`,
                  borderRadius: 16,
                  padding: "24px 16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.3s",
                  boxShadow: isActive
                    ? `0 8px 25px ${COLORS.shadow}`
                    : `0 2px 8px rgba(0,0,0,0.1)`,
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span style={{ fontSize: 48, lineHeight: 1 }}>
                  {emoji}
                </span>

                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 15,
                    fontWeight: 600,
                    color: isActive ? COLORS.paper : COLORS.ink,
                  }}
                >
                  {displayName}
                </span>

                <span
                  style={{
                    fontSize: 12,
                    color: isActive ? COLORS.cream : COLORS.inkLight,
                    fontFamily: "'Crimson Text', serif",
                  }}
                >
                  {member.role || "Member"}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    background: isActive
                      ? "rgba(255,255,255,0.2)"
                      : COLORS.cream,
                    padding: "3px 10px",
                    borderRadius: 20,
                    color: isActive ? COLORS.paper : COLORS.inkLight,
                  }}
                >
                  {noteCount} notes
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* NOTES SECTION */}
      <div style={{ marginTop: 36 }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            textAlign: "center",
            color: COLORS.ink,
            marginBottom: 20,
          }}
        >
          Notes for{" "}
          {safeCurrentUser?.name || safeCurrentUser?.first_name || "Unknown"}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sortedNotes.map((note) => {
            const from = getMember(note.from);

            return (
              <div
                key={note.id}
                style={{
                  background: COLORS.paper,
                  border: `1px solid ${COLORS.warm}40`,
                  borderRadius: 14,
                  padding: 20,
                  boxShadow: `0 2px 10px rgba(0,0,0,0.06)`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {from && (
                      <span style={{ fontSize: 22, lineHeight: 1 }}>
                        {getEmoji(
                          calculateAge(from.date_of_birth),
                          from.gender
                        )}
                      </span>
                    )}

                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: COLORS.ink,
                      }}
                    >
                      {from?.name ||
                        `${from?.first_name ?? ""} ${from?.last_name ?? ""}`}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      background:
                        note.type === "tradition"
                          ? `${COLORS.green}22`
                          : note.type === "letter"
                          ? `${COLORS.accent}22`
                          : `${COLORS.warm}22`,
                      color:
                        note.type === "tradition"
                          ? COLORS.green
                          : note.type === "letter"
                          ? COLORS.accent
                          : COLORS.warmDark,
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontWeight: 600,
                    }}
                  >
                    {note.type === "tradition"
                      ? "Tradition"
                      : note.type === "letter"
                      ? "Letter"
                      : "Heirloom"}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 17,
                    margin: "0 0 8px",
                    color: COLORS.ink,
                  }}
                >
                  {note.title}
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: COLORS.inkLight,
                    margin: 0,
                  }}
                >
                  {note.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}