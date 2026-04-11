"use client";
import { useMemo, useState, useEffect } from "react";
import { COLORS } from "./colors";
import { DEFAULT_AVATARS, INITIAL_MEMBERS, INITIAL_NOTES, INITIAL_UPLOADS } from "./data";
import RoomScene from "./RoomScene";
import PortraitPage from "./PortraitPage";
import CalendarPage from "./CalendarPage";
import CassettePage from "./CassettePage";
import FamilyTreePage from "./FamilyTreePage";
import LettersPage from "./LettersPage";
import LoginPage from "./LoginPage";

import { getFamilyMembers } from "@/supabase/queries/relations";
import { createPerson } from "@/supabase/queries/person";
import { supabase } from "@/supabase/client";

export default function HeritageHome() {
  const [page, setPage] = useState("room");
  const [members, setMembers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [authUser, setAuthUser] = useState(null);       // Supabase auth session user
  const [authReady, setAuthReady] = useState(false);    // whether we've checked session yet

  const [loading, setLoading] = useState(true);
  const [boomerMode, setBoomerMode] = useState(false);
  const [transition, setTransition] = useState(false);
  const [sprites, setSprites] = useState({});
  const [calendarDraft, setCalendarDraft] = useState(null);
  const [viewSrc, setViewSrc] = useState("/assets/view.png");

  const [familyId, setFamilyId] = useState(null);

  // ── Auth: restore session on mount ──────────────────────────────────────────
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

  // ── Family data: load once authed ───────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Resolve the family this user belongs to (as owner or member)
        const { data: familyData, error: familyError } = await supabase
          .from("family")
          .select("id")
          .eq("owner_id", authUser.id)
          .single();

        if (familyError || !familyData) {
          console.error("Could not resolve family for user:", familyError);
          setLoading(false);
          return;
        }

        const resolvedFamilyId = familyData.id;
        setFamilyId(resolvedFamilyId);

        const familyMembers = await getFamilyMembers(resolvedFamilyId);

        const mappedMembers = familyMembers.map((m, index) => ({
          id: m.id,
          name: `${m.first_name} ${m.last_name}`,
          avatar: DEFAULT_AVATARS[index % DEFAULT_AVATARS.length],
          role: "Family",
          born: m.date_of_birth,
          parentId: null,
          generation: m.generation || 1,
        }));

        setMembers(mappedMembers);
        setCurrentUser(mappedMembers.length > 0 ? mappedMembers[0] : authUser);

        // Get all person IDs in this family, then fetch their messages
        const { data: familyPersons } = await supabase
          .from("family_person")
          .select("person_id")
          .eq("family_id", resolvedFamilyId);

        const personIds = (familyPersons || []).map(fp => fp.person_id);

        const { data, error } = personIds.length > 0
          ? await supabase
              .from("message")
              .select("*")
              .in("sender_id", personIds)
              .order("created_at", { ascending: false })
          : { data: [], error: null };

        if (error) console.error("Upload fetch error:", error);
        else setUploads(data || []);

      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authUser]);

  useEffect(() => {
    const loadUploads = async () => {
      if (!currentUser) return;

      if (!familyId) return;

      // Get all person IDs in this family, then fetch their messages
      const { data: familyPersons } = await supabase
        .from("family_person")
        .select("person_id")
        .eq("family_id", familyId);

      const personIds = (familyPersons || []).map(fp => fp.person_id);

      const { data, error } = personIds.length > 0
        ? await supabase
            .from("message")
            .select("*")
            .in("sender_id", personIds)
            .order("created_at", { ascending: false })
        : { data: [], error: null };

      if (error) console.error("Upload fetch error:", error);
      else setUploads(data || []);
    };

    loadUploads();
  }, [currentUser, familyId]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const navigate = (target) => {
    setTransition(true);
    setTimeout(() => { setPage(target); setTransition(false); }, 400);
  };

  const openMessageFromCalendar = (eventDate) => {
    setCalendarDraft({ target: "letters", eventDate });
    navigate("letters");
  };

  const openFileFromCalendar = (eventDate) => {
    setCalendarDraft({ target: "cassette", eventDate });
    navigate("cassette");
  };

  const consumeCalendarDraft = (target) => {
    setCalendarDraft((prev) => (prev?.target === target ? null : prev));
  };

  const nextAvatar = useMemo(() => {
    const used = new Set(members.map(member => member.avatar));
    return DEFAULT_AVATARS.find(avatar => !used.has(avatar)) || DEFAULT_AVATARS[0];
  }, [members]);

  const addMember = ({ name, generation, role, parentId }) => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;
    const gen = Number(generation) || 1;
    const newMember = {
      id: `m-${Date.now().toString(36)}`,
      name: trimmedName,
      role: role?.trim() || (gen === 1 ? "Elder" : gen === 2 ? "Parent" : gen === 3 ? "Child" : "Family"),
      avatar: nextAvatar,
      born: null,
      parentId: parentId || null,
      generation: gen,
    };
    setMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const addNote = (note) => {
    setNotes(prev => [
      { ...note, id: `n-${Date.now().toString(36)}`, createdAt: new Date().toISOString().split("T")[0] },
      ...prev,
    ]);
  };

  const addUpload = (upload) => {
    setUploads(prev => [
      { ...upload, id: `u-${Date.now().toString(36)}`, date: new Date().toISOString().split("T")[0] },
      ...prev,
    ]);
  };

  const updateSprite = (key, file) => {
    if (!file) return;
    setSprites(prev => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);
      return { ...prev, [key]: URL.createObjectURL(file) };
    });
  };

  const pageProps = {
    navigate,
    currentUser,
    setCurrentUser,
    boomerMode,
    setBoomerMode,
    sprites,
    updateSprite,
    members,
    viewSrc,
    setViewSrc,
    notes,
    uploads,
    addMember,
    addNote,
    addUpload,
    familyId,
    calendarDraft,
    openMessageFromCalendar,
    openFileFromCalendar,
    consumeCalendarDraft,
    onLogout: handleLogout,
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  // Still checking session — show nothing to avoid flash
  if (!authReady) return null;

  // Not logged in — show login page
  if (!authUser) return <LoginPage onLogin={handleLogin} />;

  // Logged in but family data still loading
  if (loading) {
    return <div style={{ padding: 40, fontFamily: "Georgia, serif" }}>Loading family data…</div>;
  }

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: COLORS.bg,
      fontFamily: "'Crimson Text', 'Georgia', serif",
      color: COLORS.ink, overflow: "hidden", position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@400;600;700;800&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Logout button — visible only in the main room */}
      {page === "room" && <button
        onClick={handleLogout}
        title="Sign out"
        style={{
          position: "fixed",
          top: 16,
          left: 20,
          zIndex: 1000,
          background: "rgba(255, 253, 247, 0.88)",
          backdropFilter: "blur(6px)",
          border: `1px solid ${COLORS.ink}33`,
          borderRadius: 6,
          padding: "6px 14px",
          fontFamily: "'Crimson Text', Georgia, serif",
          fontSize: 14,
          color: COLORS.ink,
          cursor: "pointer",
          letterSpacing: "0.04em",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          transition: "background 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,253,247,1)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.22)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,253,247,0.88)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)"; }}
      >
        Sign out
      </button>}

      <div style={{ opacity: transition ? 0 : 1, transition: "all 0.4s ease" }}>
        {page === "room"     && <RoomScene      {...pageProps} />}
        {page === "portrait" && <PortraitPage   {...pageProps} />}
        {page === "calendar" && <CalendarPage   {...pageProps} />}
        {page === "cassette" && <CassettePage   {...pageProps} />}
        {page === "tree"     && <FamilyTreePage {...pageProps} />}
        {page === "letters"  && <LettersPage    {...pageProps} />}
      </div>
    </div>
  );
}