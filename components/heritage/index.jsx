"use client";
import { useMemo, useState } from "react";
import { COLORS } from "./colors";
import { DEFAULT_AVATARS, INITIAL_MEMBERS, INITIAL_NOTES, INITIAL_UPLOADS } from "./data";
import RoomScene from "./RoomScene";
import PortraitPage from "./PortraitPage";
import CalendarPage from "./CalendarPage";
import CassettePage from "./CassettePage";
import FamilyTreePage from "./FamilyTreePage";
import LettersPage from "./LettersPage";

export default function HeritageHome() {
  const [page, setPage] = useState("room");
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [uploads, setUploads] = useState(INITIAL_UPLOADS);
  const [currentUser, setCurrentUser] = useState(INITIAL_MEMBERS[4]); // Brian
  const [boomerMode, setBoomerMode] = useState(false);
  const [transition, setTransition] = useState(false);
  const [sprites, setSprites] = useState({});

  const navigate = (target) => {
    setTransition(true);
    setTimeout(() => { setPage(target); setTransition(false); }, 400);
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
    notes,
    uploads,
    addMember,
    addNote,
    addUpload,
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: COLORS.bg,
      fontFamily: "'Crimson Text', 'Georgia', serif",
      color: COLORS.ink, overflow: "hidden", position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@400;600;700;800&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        opacity: transition ? 0 : 1,
        transform: transition ? "scale(0.98)" : "scale(1)",
        transition: "all 0.4s ease",
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
