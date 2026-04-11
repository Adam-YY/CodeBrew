"use client";

import { useMemo, useEffect, useState } from "react";
import { COLORS } from "./colors";
import { PageContainer } from "./shared";
import { getLetters } from "@/supabase/queries/getLetter";

/* ---------------- helpers ---------------- */

const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
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

const getTimeRemaining = (unlockDate) => {
  if (!unlockDate) return null;
  const diff = new Date(unlockDate).getTime() - Date.now();
  if (diff <= 0) return "Unlocked";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const seconds = Math.floor(diff / 1000) % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

/* ---------------- component ---------------- */

export default function PortraitPage({
  navigate,
  currentUser,
  setCurrentUser,
  boomerMode,
  members = [],
  viewSrc,
}) {
  const safeMembers = Array.isArray(members) ? members : [];
  const safeCurrentUser = currentUser ?? {};

  const [letters, setLetters] = useState([]);
  const [now, setNow] = useState(Date.now());

  // Tick for countdown timers
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch letters whenever the selected user changes
  useEffect(() => {
    if (!safeCurrentUser?.id) return;
    const fetchLetters = async () => {
      try {
        const data = await getLetters(safeCurrentUser.id);
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
      } catch (err) {
        console.error("Failed to fetch letters:", err);
      }
    };
    fetchLetters();
  }, [safeCurrentUser?.id]);

  const getMember = (id) => safeMembers.find((m) => m.id === id);

  const isLocked = (note) => {
    if (note.from === safeCurrentUser.id) return false;
    if (!note.unlockDate) return false;
    return new Date(note.unlockDate).getTime() > now;
  };

  const sections = useMemo(() => {
    const cats = { incomingUnlocked: [], incomingLocked: [], sentMessages: [] };
    letters.forEach((n) => {
      if (n.from === safeCurrentUser.id) cats.sentMessages.push(n);
      else if (isLocked(n)) cats.incomingLocked.push(n);
      else cats.incomingUnlocked.push(n);
    });
    const sortFn = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    Object.keys(cats).forEach((k) => cats[k].sort(sortFn));
    return cats;
  }, [letters, now, safeCurrentUser.id]);

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
            <span style={{ fontSize: 13, color: COLORS.inkLight, marginTop: 4, fontFamily: "'Caveat', cursive" }}>
              Opens in: {getTimeRemaining(note.unlockDate)}
            </span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          {from && (
            <span style={{ fontSize: 24 }}>
              {getEmoji(calculateAge(from.date_of_birth), from.gender)}
            </span>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 14 }}>
              {note.from === safeCurrentUser.id ? "Sent by You" : from?.name}
            </div>
            <div style={{ fontSize: 11, color: COLORS.inkLight }}>
              {note.type} • {note.to === null ? "Everyone" : "Private"}
            </div>
          </div>
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, margin: "0 0 6px" }}>
          {note.title}
        </h3>
        <p style={{ fontSize: 15, lineHeight: 1.6, fontFamily: "'Crimson Text', serif", whiteSpace: "pre-wrap" }}>
          {note.content}
        </p>
      </div>
    );
  };

  return (
    <PageContainer
      navigate={navigate}
      title="Family Portraits"
      boomerMode={boomerMode}
      description="Tap a family member's portrait to switch to their view. You'll see messages and notes left specifically for that person."
      viewSrc={viewSrc}
    >
      {/* MEMBERS GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 20,
        maxWidth: 700,
        margin: "0 auto",
      }}>
        {safeMembers.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%" }}>Currently no family members!</p>
        ) : (
          safeMembers.map((member) => {
            const isActive = safeCurrentUser?.id === member.id;
            const age = calculateAge(member.date_of_birth);
            const emoji = getEmoji(age, member.gender);
            const displayName = member.name || `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim();

            return (
              <button
                key={member.id}
                onClick={() => setCurrentUser(member)}
                style={{
                  background: isActive
                    ? `linear-gradient(145deg, ${COLORS.warm}, ${COLORS.warmDark})`
                    : COLORS.paper,
                  border: isActive ? `3px solid ${COLORS.accent}` : `2px solid ${COLORS.warm}`,
                  borderRadius: 16, padding: "24px 16px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  transition: "all 0.3s",
                  boxShadow: isActive ? `0 8px 25px ${COLORS.shadow}` : `0 2px 8px rgba(0,0,0,0.1)`,
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.transform = "scale(1)"; }}
              >
                <span style={{ fontSize: 48, lineHeight: 1 }}>{emoji}</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: isActive ? COLORS.paper : COLORS.ink }}>
                  {displayName}
                </span>
                <span style={{ fontSize: 12, color: isActive ? COLORS.cream : COLORS.inkLight, fontFamily: "'Crimson Text', serif" }}>
                  {member.role || "Member"}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* LETTERS SECTION */}
      <div style={{ marginTop: 36 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, textAlign: "center", color: COLORS.ink, marginBottom: 24 }}>
          Letters for {safeCurrentUser?.name || safeCurrentUser?.first_name || "Unknown"}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {sections.incomingUnlocked.length > 0 && (
            <section>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}>Messages for Them</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{sections.incomingUnlocked.map(renderNote)}</div>
            </section>
          )}
          {sections.incomingLocked.length > 0 && (
            <section>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16, opacity: 0.6 }}>Future Deliveries</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{sections.incomingLocked.map(renderNote)}</div>
            </section>
          )}
          {sections.sentMessages.length > 0 && (
            <section>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16, opacity: 0.8 }}>Sent by Them</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{sections.sentMessages.map(renderNote)}</div>
            </section>
          )}
          {letters.length === 0 && (
            <p style={{ textAlign: "center", color: COLORS.inkLight, fontStyle: "italic", fontFamily: "'Crimson Text', serif", fontSize: 16 }}>
              No letters yet for this family member.
            </p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}