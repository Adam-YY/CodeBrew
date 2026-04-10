"use client";

import { COLORS } from "./colors";
import { PageContainer, SpriteImg } from "./shared";
import { useEffect, useState } from "react";
import { getFamilyMembers } from "@/supabase/queries/relations";

/* ---------------- helpers ---------------- */

const calculateAge = (dob) => {
  if (!dob) return null;

  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const getEmoji = (age, gender) => {
  if (!age) return "🙂";

  const g = (gender || "").toUpperCase();

  const isMale = g === "M";
  const isFemale = g === "F";

  // kids
  if (age < 13) return "🧒";

  // teens
  if (age < 20) return "🧑‍🎓";

  // adults
  if (age < 60) {
    if (isMale) return "👨";
    if (isFemale) return "👩";
    return "🧑";
  }

  // seniors
  if (isMale) return "👴";
  if (isFemale) return "👵";
  return "🧓";
};

/* ---------------- component ---------------- */

export default function PortraitPage({
  navigate,
  currentUser,
  setCurrentUser,
  boomerMode,
  sprites,
}) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const familyId =
          "bd1af34e-76cc-4bad-a302-c090957ad6d8";

        const data = await getFamilyMembers(familyId);

        console.log("Family members from Supabase:", data);

        setFamilyMembers(data);
      } catch (err) {
        console.error("Supabase error:", err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <PageContainer
      navigate={navigate}
      title="Family Portraits"
      boomerMode={boomerMode}
      description="Tap a family member's portrait to switch to their view. You'll see messages and notes left specifically for that person."
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
        {loading ? (
          <p style={{ textAlign: "center", width: "100%" }}>
            Loading family...
          </p>
        ) : (
          familyMembers.map((member) => {
            const isActive =
              currentUser.id === member.id;

            const age = calculateAge(
              member.date_of_birth
            );

            const emoji = getEmoji(
              age,
              member.gender
            );

            return (
              <button
                key={member.id}
                onClick={() => setCurrentUser(member)}
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
                  transform: isActive
                    ? "scale(1.05)"
                    : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.transform =
                      "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.transform =
                      "scale(1)";
                }}
              >
                <SpriteImg
                  src={sprites?.[member.id]}
                  fallback={member.avatar}
                  size={48}
                />

                {/* NAME + EMOJI */}
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily:
                      "'Playfair Display', serif",
                    fontSize: 15,
                    fontWeight: 600,
                    color: isActive
                      ? COLORS.paper
                      : COLORS.ink,
                  }}
                >
                  <span>{emoji}</span>
                  <span>
                    {member.first_name}{" "}
                    {member.last_name}
                  </span>
                </span>

                {/* ROLE */}
                <span
                  style={{
                    fontSize: 12,
                    color: isActive
                      ? COLORS.cream
                      : COLORS.inkLight,
                    fontFamily:
                      "'Crimson Text', serif",
                  }}
                >
                  Member
                </span>

                {/* OPTIONAL AGE DISPLAY */}
                <span
                  style={{
                    fontSize: 11,
                    color: isActive
                      ? COLORS.cream
                      : COLORS.inkLight,
                  }}
                >
                  {age
                    ? `${age} years old`
                    : "Unknown age"}
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
            fontFamily:
              "'Playfair Display', serif",
            fontSize: 22,
            textAlign: "center",
            color: COLORS.ink,
            marginBottom: 20,
          }}
        >
          Notes for{" "}
          {currentUser?.first_name ||
            currentUser?.name}
        </h2>

        <p
          style={{
            textAlign: "center",
            color: COLORS.inkLight,
          }}
        >
          Notes will be migrated to Supabase next.
        </p>
      </div>
    </PageContainer>
  );
}