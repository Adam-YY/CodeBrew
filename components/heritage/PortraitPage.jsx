"use client";

import { useMemo, useEffect, useState, useRef } from "react";
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

// Modified to prioritize the actual image URL (avatar) over emojis
const PortraitImage = ({ member, size = 48, isActive, onUploadClick }) => {
  const age = calculateAge(member.date_of_birth);
  const isImage = member.avatar && member.avatar.startsWith("http");

  return (
    <div 
      onClick={(e) => {
        if (isActive && onUploadClick) {
          e.stopPropagation();
          onUploadClick();
        }
      }}
      style={{
        width: size * 1.5,
        height: size * 1.5,
        borderRadius: "50%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isActive ? COLORS.cream + "40" : COLORS.warm + "20",
        border: `2px solid ${isActive ? COLORS.accent : COLORS.warm}`,
        position: "relative",
        cursor: isActive ? "pointer" : "default",
      }}
    >
      {isImage ? (
        <img 
          src={member.avatar} 
          alt={member.name} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      ) : (
        <span style={{ fontSize: size }}>{getEmoji(age, member.gender)}</span>
      )}
      
      {/* Visual indicator that active user can change photo */}
      {isActive && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0, transition: "opacity 0.2s", color: "white", fontSize: 12
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          Change
        </div>
      )}
    </div>
  );
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
  updateProfilePicture, // Received from HeritageHome
  boomerMode,
  members = [],
  viewSrc,
}) {
  const safeMembers = Array.isArray(members) ? members : [];
  const safeCurrentUser = currentUser ?? {};
  
  const [letters, setLetters] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !safeCurrentUser?.id) return;

    setIsUploading(true);
    const success = await updateProfilePicture(safeCurrentUser.id, file);
    setIsUploading(false);
    
    if (success) {
      console.log("Profile picture updated successfully!");
    }
  };

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
          {from && <PortraitImage member={from} size={20} isActive={false} />}
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
      description={isUploading ? "Uploading new portrait..." : "Tap a portrait to switch views. Click your own portrait to upload a photo."}
      viewSrc={viewSrc}
    >
      {/* Hidden Upload Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: "none" }} 
      />

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
              >
                <PortraitImage 
                  member={member} 
                  isActive={isActive} 
                  onUploadClick={() => fileInputRef.current?.click()} 
                />
                
                <span style={{ 
                  fontFamily: "'Playfair Display', serif", 
                  fontSize: 15, 
                  fontWeight: 600, 
                  color: isActive ? COLORS.paper : COLORS.ink,
                  textAlign: "center" 
                }}>
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

      <div style={{ marginTop: 36 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, textAlign: "center", color: COLORS.ink, marginBottom: 24 }}>
          Letters for {safeCurrentUser?.name || safeCurrentUser?.first_name || "Unknown"}
        </h2>

        {/* ... Rest of the letters section remains same ... */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
           {/* ... Same logic as your provided code ... */}
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