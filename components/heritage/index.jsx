"use client";
import { useState } from "react";
import { COLORS } from "./colors";
import { FAMILY_MEMBERS } from "./data";
import RoomScene from "./RoomScene";
import PortraitPage from "./PortraitPage";
import CalendarPage from "./CalendarPage";
import CassettePage from "./CassettePage";
import FamilyTreePage from "./FamilyTreePage";
import LettersPage from "./LettersPage";

export default function HeritageHome() {
  const [page, setPage] = useState("room");
  const [currentUser, setCurrentUser] = useState(FAMILY_MEMBERS[4]); // Brian
  const [boomerMode, setBoomerMode] = useState(false);
  const [transition, setTransition] = useState(false);

  const navigate = (target) => {
    setTransition(true);
    setTimeout(() => { setPage(target); setTransition(false); }, 400);
  };

  const pageProps = { navigate, currentUser, setCurrentUser, boomerMode, setBoomerMode };

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
