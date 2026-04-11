"use client";
import { useMemo, useState, useEffect } from "react";
import { COLORS } from "./colors";
import { DEFAULT_AVATARS } from "./data";
import RoomScene from "./RoomScene";
import PortraitPage from "./PortraitPage";
import CalendarPage from "./CalendarPage";
import CassettePage from "./CassettePage";
import FamilyTreePage from "./FamilyTreePage";
import LettersPage from "./LettersPage";
import LoginPage from "./LoginPage";

import { getFamilyMembers } from "@/supabase/queries/relations";
import { supabase } from "@/supabase/client";

// Pages that require at least one family member to exist
const MEMBER_GATED_PAGES = ["letters", "cassette", "portrait", "calendar"];

export default function HeritageHome() {
  const [page, setPage] = useState("room");
  const [members, setMembers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [loading, setLoading] = useState(true);
  const [boomerMode, setBoomerMode] = useState(false);
  const [transition, setTransition] = useState(false);
  const [lockedFlash, setLockedFlash] = useState(false); // brief flash when a locked page is tapped
  const [sprites, setSprites] = useState({});
  const [calendarDraft, setCalendarDraft] = useState(null);
  const [viewSrc, setViewSrc] = useState("/assets/view.png");

  const [familyId, setFamilyId] = useState(null);

  const hasMembers = members.length > 0 && currentUser !== null;

  // Pages that are currently locked
  const lockedPages = hasMembers
    ? new Set()
    : new Set(MEMBER_GATED_PAGES);

  // ── Auth Logic ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user) => setAuthUser(user);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLoading(true);
    setAuthUser(null);
    setCurrentUser(null);
    setFamilyId(null);
    setMembers([]);
    setUploads([]);
    setNotes([]);
    setPage("room");
  };

  // ── Data Loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const { data: familyData } = await supabase
          .from("family")
          .select("id")
          .eq("owner_id", authUser.id)
          .single();

        if (!familyData) {
          setLoading(false);
          return;
        }

        const resolvedFamilyId = familyData.id;
        setFamilyId(resolvedFamilyId);

        const familyMembers = await getFamilyMembers(resolvedFamilyId);

        const mappedMembers = await Promise.all(familyMembers.map(async (m, index) => {
          let avatarUrl = DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];

          if (m.profile_picture_path) {
            const { data, error } = await supabase.storage
              .from("profile")
              .createSignedUrl(m.profile_picture_path, 3600);

            if (data?.signedUrl) avatarUrl = data.signedUrl;
          }

          return {
            ...m,
            id: m.id,
            name: `${m.first_name} ${m.last_name}`,
            avatar: avatarUrl,
            profile_picture_path: m.profile_picture_path,
            role: "Family",
            born: m.date_of_birth,
            parentId: null,
            generation: m.generation || 1,
          };
        }));

        setMembers(mappedMembers);

        const currentInFamily = mappedMembers.find(m => m.id === authUser.id) || mappedMembers[0];
        setCurrentUser(currentInFamily);

      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authUser]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const updateProfilePicture = async (personId, file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${personId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("person")
        .update({ profile_picture_path: filePath })
        .eq("id", personId);

      if (dbError) throw dbError;

      const { data: signedData } = await supabase.storage
        .from("profile")
        .createSignedUrl(filePath, 3600);

      const newAvatarUrl = signedData?.signedUrl;

      setMembers(prev => prev.map(m =>
        m.id === personId
          ? { ...m, avatar: newAvatarUrl, profile_picture_path: filePath }
          : m
      ));

      if (currentUser?.id === personId) {
        setCurrentUser(prev => ({
          ...prev,
          avatar: newAvatarUrl,
          profile_picture_path: filePath
        }));
      }

      return true;
    } catch (err) {
      console.error("Upload failed:", err);
      return false;
    }
  };

  const navigate = (target) => {
    // Block gated pages until at least one member exists
    if (lockedPages.has(target)) {
      // Brief flash to signal the item is locked
      setLockedFlash(true);
      setTimeout(() => setLockedFlash(false), 600);
      return;
    }
    setTransition(true);
    setTimeout(() => { setPage(target); setTransition(false); }, 400);
  };

  const handleMemberAdded = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
    // If no currentUser yet (new family), promote the first added member
    setCurrentUser((prev) => prev ?? newMember);
  };

  const pageProps = {
    navigate,
    currentUser,
    setCurrentUser,
    boomerMode,
    setBoomerMode,
    sprites,
    updateSprite: (key, file) => {
      if (!file) return;
      setSprites(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    },
    updateProfilePicture,
    members,
    lockedPages,   // RoomScene can use this to show lock indicators
    viewSrc,
    setViewSrc,
    notes,
    uploads,
    familyId,
    calendarDraft,
    onLogout: handleLogout,
    addMember: handleMemberAdded,
  };

  if (!authReady) return null;
  if (!authUser) return <LoginPage onLogin={handleLogin} />;
  if (loading) return <div style={{ padding: 40, fontFamily: "Georgia, serif" }}>Loading family data…</div>;

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: COLORS.bg,
      fontFamily: "'Crimson Text', 'Georgia', serif",
      color: COLORS.ink, overflow: "hidden", position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@400;600;700;800&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {page === "room" && (
        <button
          onClick={handleLogout}
          style={{
            position: "fixed", top: 16, left: 20, zIndex: 1000,
            background: "rgba(255, 253, 247, 0.88)", backdropFilter: "blur(6px)",
            border: `1px solid ${COLORS.ink}33`, borderRadius: 6,
            padding: "6px 14px", cursor: "pointer"
          }}
        >
          Sign out
        </button>
      )}

      {/* Toast shown when a locked page is tapped */}
      {lockedFlash && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          zIndex: 2000, background: COLORS.ink, color: COLORS.paper,
          padding: "10px 20px", borderRadius: 10, fontSize: 14,
          fontFamily: "'Crimson Text', serif", pointerEvents: "none",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          animation: "fadeInUp 0.2s ease",
        }}>
          Add a family member first 🌿
        </div>
      )}

      <div style={{
        filter: transition ? "blur(18px)" : "none",
        opacity: transition ? 0.6 : 1,
        transition: "filter 0.45s ease, opacity 0.45s ease",
      }}>
        {page === "room" && <RoomScene {...pageProps} />}
        {page === "portrait" && <PortraitPage {...pageProps} />}
        {page === "calendar" && <CalendarPage {...pageProps} />}
        {page === "cassette" && <CassettePage {...pageProps} />}
        {page === "tree" && <FamilyTreePage {...pageProps} />}
        {page === "letters" && <LettersPage {...pageProps} />}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}