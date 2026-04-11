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
import { BlurredRoomBackground } from "./shared";

import { getFamilyMembers } from "@/supabase/queries/relations";
import { createPerson } from "@/supabase/queries/person";
import { supabase } from "@/supabase/client";

export default function HeritageHome() {
  const [page, setPage] = useState("room");
  const [members, setMembers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [boomerMode, setBoomerMode] = useState(false);
  const [transition, setTransition] = useState(false);
  const [sprites, setSprites] = useState({});
  const [calendarDraft, setCalendarDraft] = useState(null);
  const [viewSrc, setViewSrc] = useState("/assets/view.png");

  const [familyId, setFamilyId] = useState("bd1af34e-76cc-4bad-a302-c090957ad6d8"); //temporary

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
      {
        ...note,
        id: `n-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
  };

  const addUpload = (upload) => {
    setUploads(prev => [
      {
        ...upload,
        id: `u-${Date.now().toString(36)}`,
        date: new Date().toISOString().split("T")[0],
      },
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
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading family data...");

        const familyMembers = await getFamilyMembers(familyId);

        console.log("Raw DB members:", familyMembers);

        const mappedMembers = familyMembers.map((m, index) => ({
          id: m.id,
          name: `${m.first_name} ${m.last_name}`,
          avatar: DEFAULT_AVATARS[index % DEFAULT_AVATARS.length],
          role: "Family",
          born: m.date_of_birth,
          parentId: null,
          generation: m.generation || 1,
        }));

        console.log("Mapped members:", mappedMembers);

        setMembers(mappedMembers);

        const firstUser = mappedMembers[0] || null;
        setCurrentUser(firstUser);

        console.log("Current user:", firstUser);

        // load uploads AFTER user is ready
        const { data, error } = await supabase
          .from("message")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Upload fetch error:", error);
        } else {
          console.log("Messages:", data);
          setUploads(data || []);
        }

      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadUploads = async () => {
      if (!currentUser) return;

      console.log("📦 Loading uploads/messages...");

      const { data, error } = await supabase
        .from("message")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Upload fetch error:", error);
        return;
      }

      console.log("📦 Messages from DB:", data);
      setUploads(data || []);
    };

    loadUploads();
  }, [currentUser]);

  if (loading || !currentUser) {
    return <div style={{ padding: 40 }}>Loading family data...</div>;
  }

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: COLORS.bg,
      fontFamily: "'Crimson Text', 'Georgia', serif",
      color: COLORS.ink, overflow: "hidden", position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@400;600;700;800&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {page !== "room" && <BlurredRoomBackground viewSrc={viewSrc} />}

      <div style={{
        filter: transition ? "blur(18px)" : "none",
        opacity: transition ? 0.6 : 1,
        transition: "filter 0.45s ease, opacity 0.45s ease, transform 0.45s ease",
      }}>
        {page === "room" && <RoomScene {...pageProps} />}
        {page === "portrait" && <PortraitPage {...pageProps} />}
        {page === "calendar" && <CalendarPage {...pageProps} />}
        {page === "cassette" && <CassettePage {...pageProps} />}
        {page === "tree" && <FamilyTreePage {...pageProps} />}
        {page === "letters" && <LettersPage {...pageProps} />}
      </div>
    </div>
  );
}
