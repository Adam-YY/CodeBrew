"use client";
import { useState, useEffect, useRef } from "react";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const FAMILY_MEMBERS = [
  { id: "gf", name: "Grandpa Chen", role: "Grandfather", avatar: "👴", born: 1945, parentId: null },
  { id: "gm", name: "Grandma Chen", role: "Grandmother", avatar: "👵", born: 1948, parentId: null },
  { id: "dad", name: "Wei Chen", role: "Father", avatar: "👨", born: 1972, parentId: "gf" },
  { id: "mom", name: "Mei Lin", role: "Mother", avatar: "👩", born: 1975, parentId: null },
  { id: "son", name: "Brian Chen", role: "Son", avatar: "👦", born: 2004, parentId: "dad" },
  { id: "daughter", name: "Lily Chen", role: "Daughter", avatar: "👧", born: 2007, parentId: "dad" },
];

const FAMILY_TREE = {
  id: "gf", spouse: "gm",
  children: [
    { id: "dad", spouse: "mom", children: [{ id: "son" }, { id: "daughter" }] }
  ]
};

const NOTES = [
  { id: 1, from: "gf", to: "son", type: "tradition", title: "Chinese New Year Preparations", date: "01-28", content: "Every year, 3 days before Chinese New Year, we must clean the entire house — this sweeps away bad luck. On New Year's Eve, make sure to prepare these dishes: whole steamed fish (年年有餘), dumplings (shaped like gold ingots for wealth), and nian gao (年糕). The fish must never be fully eaten — always leave some for the next day. After dinner, stay up past midnight together. This is called 守歲. In the morning, wear new red clothes and give red envelopes to the children. Visit the eldest family members first.", unlockDate: null },
  { id: 2, from: "gm", to: "daughter", type: "letter", title: "For Your Wedding Day", date: "future", content: "My dear Lily, if I am not there to see you in your dress, know that I am watching from somewhere beautiful. Remember: a strong marriage is two people who choose each other every single day. Your grandfather and I had hard years — war, immigration, poverty — but we chose each other through all of it. Wear my jade bracelet. It was given to me by my mother, and her mother before her. It carries the love of four generations now. Be brave, be kind, and always keep your own name in your heart.", unlockDate: "2030-06-15" },
  { id: 3, from: "gf", to: "all", type: "tradition", title: "Qingming Festival — Tomb Sweeping", date: "04-05", content: "On Qingming (清明節), we visit the graves of our ancestors. Bring fresh flowers, incense, and the rice wine your great-grandfather liked. Clean the gravestone. Burn joss paper. Tell them about the year — they are listening. After, we have a family picnic nearby. This is not a sad day. It is a day of connection.", unlockDate: null },
  { id: 4, from: "gm", to: "son", type: "item", title: "The Jade Pendant", date: null, content: "This pendant was carved in Fujian province in 1920. Your great-great-grandfather wore it when he first sailed to Southeast Asia to start a new life. It has been passed to the eldest son of each generation. When you hold it, you hold the courage of everyone who came before you. Keep it safe. One day, give it to your child and tell them this story.", unlockDate: null },
  { id: 5, from: "dad", to: "son", type: "tradition", title: "Mid-Autumn Festival", date: "09-17", content: "We gather on the night of the full moon. Your grandmother's mooncake recipe is in the brown notebook in the kitchen — the one with lotus paste and salted egg yolk. We set up a table outside, light lanterns, and share mooncakes under the moon. Tell the story of Chang'e to the little ones. Your grandfather used to say: 'The moon is the same one our ancestors watched. When you look up, you see what they saw.'", unlockDate: null },
  { id: 6, from: "gf", to: "daughter", type: "letter", title: "For Your 18th Birthday", date: "birthday", content: "Little Lily, you are a woman now. When I was 18, the world was very different — but the important things are the same. Be honest even when it is hard. Work with your hands as well as your mind. And never forget where your family comes from. I have put money aside for your education. Use it well. Make us proud — but more importantly, make yourself proud.", unlockDate: "2025-03-20" },
  { id: 7, from: "mom", to: "all", type: "tradition", title: "Family Dumpling Night — Every Sunday", date: "weekly", content: "Every Sunday evening, we make dumplings together. This is not about the food — it is about the time. Grandpa rolls the dough, the children fold (even badly — that's okay), and we talk about our week. The recipe: 500g pork mince, Chinese cabbage (salted and squeezed dry), ginger, soy sauce, sesame oil, a little sugar. Mix well. Grandma says the secret is to let the filling rest for 1 hour.", unlockDate: null },
  { id: 8, from: "gm", to: "all", type: "item", title: "The Family Photo Album (1960-1990)", date: null, content: "This album contains photographs from our first years in Melbourne. Page 12 has the photo of our shop on Little Bourke Street — that is where everything began. We worked 16-hour days, but we were free. Every photo has a story. Ask me while I can still tell them.", unlockDate: null },
];

const getMember = (id) => FAMILY_MEMBERS.find(m => m.id === id);

// ─── Styles ──────────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#1a1410",
  warm: "#d4a56a",
  warmLight: "#e8c99b",
  warmDark: "#8b6914",
  cream: "#f5ead6",
  paper: "#faf3e6",
  ink: "#2c1810",
  inkLight: "#5a3a28",
  accent: "#c44536",
  accentSoft: "#e07a5f",
  green: "#606c38",
  greenLight: "#8a9a5b",
  shadow: "rgba(20,10,5,0.4)",
  windowBlue: "#87CEEB",
  windowGlow: "#FFF8DC",
};

// ─── Main App ────────────────────────────────────────────────────────────────
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

// ─── Shared Components ───────────────────────────────────────────────────────
function BackButton({ navigate }) {
  return (
    <button onClick={() => navigate("room")} style={{
      position: "fixed", top: 20, left: 20, zIndex: 100,
      background: COLORS.warm, border: "none", borderRadius: 12,
      padding: "10px 20px", cursor: "pointer", fontFamily: "'Playfair Display', serif",
      fontSize: 15, color: COLORS.ink, boxShadow: `0 2px 8px ${COLORS.shadow}`,
      display: "flex", alignItems: "center", gap: 8,
      transition: "transform 0.2s", letterSpacing: 0.5,
    }}
    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      ← Back to Room
    </button>
  );
}

function PageContainer({ children, title, navigate, boomerMode, description }) {
  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(135deg, ${COLORS.cream} 0%, ${COLORS.paper} 50%, ${COLORS.warmLight}33 100%)`,
      padding: "80px 20px 40px",
    }}>
      <BackButton navigate={navigate} />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 42px)",
          color: COLORS.ink, textAlign: "center", marginBottom: 8,
          fontWeight: 700, letterSpacing: -0.5,
        }}>{title}</h1>
        {boomerMode && description && (
          <div style={{
            background: "#fff9e6", border: `2px solid ${COLORS.warm}`, borderRadius: 12,
            padding: "14px 20px", margin: "12px auto 24px", maxWidth: 600, textAlign: "center",
            fontSize: 17, lineHeight: 1.6, color: COLORS.inkLight,
            fontFamily: "'Caveat', cursive", fontWeight: 500,
          }}>
            💡 {description}
          </div>
        )}
        <div style={{ width: 60, height: 3, background: COLORS.warm, margin: "0 auto 32px", borderRadius: 2 }} />
        {children}
      </div>
    </div>
  );
}

// ─── Room Scene ──────────────────────────────────────────────────────────────
function RoomScene({ navigate, currentUser, boomerMode, setBoomerMode }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const items = [
    { id: "portrait", label: "Portrait Frame", desc: "Switch between family members to see messages left for each person", x: "9%", y: "52%", w: "14%", h: "22%", emoji: "🖼️" },
    { id: "calendar", label: "Family Calendar", desc: "View family traditions and messages organised by date", x: "28%", y: "54%", w: "13%", h: "20%", emoji: "📅" },
    { id: "cassette", label: "Cassette Player", desc: "Record or upload documents, voice recordings, and videos for the family", x: "46%", y: "58%", w: "15%", h: "16%", emoji: "📼" },
    { id: "tree", label: "Family Tree", desc: "View your family tree and see notes left by each member", x: "65%", y: "14%", w: "28%", h: "32%", emoji: "🌳" },
    { id: "letters", label: "Family Letters", desc: "Read messages left for you — some may be locked until a special date", x: "73%", y: "56%", w: "14%", h: "18%", emoji: "✉️" },
  ];

  return (
    <div style={{
      width: "100%", height: "100vh", position: "relative", overflow: "hidden",
      background: `linear-gradient(180deg, #2c1f14 0%, #3d2b1a 40%, #4a3422 100%)`,
    }}>
      {/* Window */}
      <div style={{
        position: "absolute", left: "25%", top: "4%", width: "50%", height: "42%",
        background: `linear-gradient(180deg, #87CEEB 0%, #b8d4e8 60%, #f0e6d0 100%)`,
        border: `6px solid #5a3a20`, borderRadius: 6,
        boxShadow: `inset 0 0 40px rgba(255,248,220,0.3), 0 4px 20px rgba(0,0,0,0.5)`,
      }}>
        {/* Window panes */}
        <div style={{ position: "absolute", left: "50%", top: 0, width: 5, height: "100%", background: "#5a3a20" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 5, background: "#5a3a20" }} />
        {/* Curtains */}
        <div style={{ position: "absolute", left: -30, top: -10, width: 50, height: "110%", background: `linear-gradient(90deg, #8b3a3a, #a04040)`, borderRadius: "0 8px 8px 0", opacity: 0.85 }} />
        <div style={{ position: "absolute", right: -30, top: -10, width: 50, height: "110%", background: `linear-gradient(270deg, #8b3a3a, #a04040)`, borderRadius: "8px 0 0 8px", opacity: 0.85 }} />
        {/* Sun glow */}
        <div style={{ position: "absolute", right: "20%", top: "15%", width: 50, height: 50, borderRadius: "50%", background: "radial-gradient(circle, #fff8dc 0%, transparent 70%)", filter: "blur(10px)" }} />
      </div>

      {/* Wall decorations */}
      <div style={{ position: "absolute", left: "8%", top: "8%", fontSize: "clamp(10px,1.5vw,16px)", color: COLORS.warmLight, opacity: 0.3, fontFamily: "'Caveat', cursive", transform: "rotate(-5deg)", letterSpacing: 1 }}>
        家 和 万 事 兴
      </div>

      {/* Wallpaper texture */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px)`,
        pointerEvents: "none",
      }} />

      {/* Table surface */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "48%",
        background: `linear-gradient(180deg, #6b4226 0%, #5a3720 5%, #7a4f30 10%, #6b4226 100%)`,
        borderTop: `4px solid #8b6340`,
        boxShadow: `inset 0 5px 15px rgba(0,0,0,0.3)`,
      }}>
        {/* Wood grain */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.08, backgroundImage: `repeating-linear-gradient(95deg, transparent, transparent 40px, rgba(0,0,0,0.15) 40px, rgba(0,0,0,0.15) 41px)`, pointerEvents: "none" }} />
      </div>

      {/* Interactive items */}
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => navigate(item.id)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            position: "absolute", left: item.x, top: item.y, width: item.w, height: item.h,
            background: hoveredItem === item.id
              ? `radial-gradient(circle, rgba(212,165,106,0.35) 0%, transparent 70%)`
              : "transparent",
            border: hoveredItem === item.id ? `2px solid rgba(212,165,106,0.6)` : "2px solid transparent",
            borderRadius: 12, cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hoveredItem === item.id ? "scale(1.05) translateY(-3px)" : "scale(1)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 4, zIndex: 10,
          }}
        >
          <span style={{
            fontSize: "clamp(28px, 4vw, 52px)",
            filter: hoveredItem === item.id ? "drop-shadow(0 0 12px rgba(212,165,106,0.8))" : "none",
            transition: "filter 0.3s",
          }}>{item.emoji}</span>
          {(hoveredItem === item.id || boomerMode) && (
            <div style={{
              position: "absolute", bottom: "105%", left: "50%", transform: "translateX(-50%)",
              background: COLORS.paper, padding: "8px 14px", borderRadius: 8,
              boxShadow: `0 4px 15px ${COLORS.shadow}`, whiteSpace: "nowrap",
              fontSize: "clamp(11px, 1.4vw, 14px)", fontFamily: "'Playfair Display', serif",
              color: COLORS.ink, fontWeight: 600, border: `1px solid ${COLORS.warm}`,
              pointerEvents: "none",
            }}>
              {item.label}
              {boomerMode && (
                <div style={{ fontSize: "clamp(9px,1.1vw,12px)", fontWeight: 400, fontFamily: "'Crimson Text', serif", color: COLORS.inkLight, marginTop: 3, whiteSpace: "normal", maxWidth: 200, textAlign: "center" }}>
                  {item.desc}
                </div>
              )}
            </div>
          )}
        </button>
      ))}

      {/* Title */}
      <div style={{
        position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
        textAlign: "center", zIndex: 20,
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 3.5vw, 36px)",
          color: COLORS.warmLight, fontWeight: 700, margin: 0,
          textShadow: "0 2px 10px rgba(0,0,0,0.5)", letterSpacing: 1,
        }}>Heritage Home</h1>
        <p style={{
          fontFamily: "'Caveat', cursive", fontSize: "clamp(12px, 1.8vw, 18px)",
          color: COLORS.warm, margin: "2px 0 0", opacity: 0.8,
        }}>Preserving what matters, generation by generation</p>
      </div>

      {/* Current user indicator */}
      <div style={{
        position: "absolute", top: 14, right: 16, zIndex: 20,
        background: "rgba(90,58,40,0.8)", borderRadius: 12, padding: "6px 14px",
        display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(4px)",
        border: "1px solid rgba(212,165,106,0.3)",
      }}>
        <span style={{ fontSize: 22 }}>{currentUser.avatar}</span>
        <span style={{ fontFamily: "'Crimson Text', serif", color: COLORS.warmLight, fontSize: 14 }}>{currentUser.name}</span>
      </div>

      {/* Boomer mode toggle */}
      <button
        onClick={() => setBoomerMode(!boomerMode)}
        style={{
          position: "absolute", bottom: 16, right: 16, zIndex: 20,
          background: boomerMode ? COLORS.accent : "rgba(90,58,40,0.8)",
          border: "1px solid rgba(212,165,106,0.3)", borderRadius: 12,
          padding: "8px 16px", cursor: "pointer",
          fontFamily: "'Playfair Display', serif", fontSize: 13,
          color: COLORS.warmLight, display: "flex", alignItems: "center", gap: 6,
          transition: "all 0.3s",
        }}
      >
        {boomerMode ? "🔔" : "🔕"} Guide Mode {boomerMode ? "ON" : "OFF"}
      </button>

      {/* Light rays from window */}
      <div style={{
        position: "absolute", left: "30%", top: "10%", width: "40%", height: "70%",
        background: `linear-gradient(180deg, rgba(255,248,220,0.06) 0%, transparent 100%)`,
        clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ─── Portrait Page ───────────────────────────────────────────────────────────
function PortraitPage({ navigate, currentUser, setCurrentUser, boomerMode }) {
  return (
    <PageContainer navigate={navigate} title="Family Portraits" boomerMode={boomerMode}
      description="Tap a family member's portrait to switch to their view. You'll see messages and notes left specifically for that person.">
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 20, maxWidth: 700, margin: "0 auto",
      }}>
        {FAMILY_MEMBERS.map(member => {
          const isActive = currentUser.id === member.id;
          const noteCount = NOTES.filter(n => n.to === member.id || n.to === "all").length;
          return (
            <button key={member.id} onClick={() => setCurrentUser(member)} style={{
              background: isActive
                ? `linear-gradient(145deg, ${COLORS.warm}, ${COLORS.warmDark})`
                : COLORS.paper,
              border: isActive ? `3px solid ${COLORS.accent}` : `2px solid ${COLORS.warm}`,
              borderRadius: 16, padding: "24px 16px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              transition: "all 0.3s", boxShadow: isActive ? `0 8px 25px ${COLORS.shadow}` : `0 2px 8px rgba(0,0,0,0.1)`,
              transform: isActive ? "scale(1.05)" : "scale(1)",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.transform = "scale(1.03)" }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.transform = "scale(1)" }}
            >
              <span style={{ fontSize: 48 }}>{member.avatar}</span>
              <span style={{
                fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600,
                color: isActive ? COLORS.paper : COLORS.ink,
              }}>{member.name}</span>
              <span style={{
                fontSize: 12, color: isActive ? COLORS.cream : COLORS.inkLight,
                fontFamily: "'Crimson Text', serif",
              }}>{member.role}</span>
              <span style={{
                fontSize: 11, background: isActive ? "rgba(255,255,255,0.2)" : COLORS.cream,
                padding: "3px 10px", borderRadius: 20, color: isActive ? COLORS.paper : COLORS.inkLight,
              }}>{noteCount} notes</span>
            </button>
          );
        })}
      </div>

      {/* Notes for current user */}
      <div style={{ marginTop: 36 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, textAlign: "center", color: COLORS.ink, marginBottom: 20 }}>
          Notes for {currentUser.name}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {NOTES.filter(n => n.to === currentUser.id || n.to === "all").map(note => {
            const from = getMember(note.from);
            return (
              <div key={note.id} style={{
                background: COLORS.paper, border: `1px solid ${COLORS.warm}40`,
                borderRadius: 14, padding: 20, boxShadow: `0 2px 10px rgba(0,0,0,0.06)`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{from?.avatar}</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{from?.name}</span>
                  </div>
                  <span style={{
                    fontSize: 11, background: note.type === "tradition" ? `${COLORS.green}22` : note.type === "letter" ? `${COLORS.accent}22` : `${COLORS.warm}22`,
                    color: note.type === "tradition" ? COLORS.green : note.type === "letter" ? COLORS.accent : COLORS.warmDark,
                    padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                  }}>
                    {note.type === "tradition" ? "🎋 Tradition" : note.type === "letter" ? "💌 Letter" : "📦 Heirloom"}
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, margin: "0 0 8px", color: COLORS.ink }}>{note.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.inkLight, margin: 0 }}>{note.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}

// ─── Calendar Page ───────────────────────────────────────────────────────────
function CalendarPage({ navigate, currentUser, boomerMode }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const year = 2026;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(year, selectedMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getNotesForDay = (day) => {
    const mm = String(selectedMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return NOTES.filter(n => n.date === `${mm}-${dd}`);
  };

  const allMonthNotes = days.flatMap(d => getNotesForDay(d).map(n => ({ ...n, day: d })));

  return (
    <PageContainer navigate={navigate} title="Family Calendar" boomerMode={boomerMode}
      description="This calendar shows family traditions and special messages on their dates. Tap a date with a dot to see the notes for that day.">

      {/* Month selector */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.ink }}>‹</button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, minWidth: 160, textAlign: "center" }}>{months[selectedMonth]} {year}</span>
        <button onClick={() => setSelectedMonth(Math.min(11, selectedMonth + 1))} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.ink }}>›</button>
      </div>

      {/* Calendar grid */}
      <div style={{
        background: COLORS.paper, borderRadius: 16, padding: 20,
        border: `1px solid ${COLORS.warm}40`, boxShadow: `0 4px 20px rgba(0,0,0,0.08)`,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 8 }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: 12, color: COLORS.inkLight, fontWeight: 600, padding: 6 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {days.map(day => {
            const dayNotes = getNotesForDay(day);
            const hasNotes = dayNotes.length > 0;
            const isSelected = selectedDay === day;
            return (
              <button key={day} onClick={() => setSelectedDay(isSelected ? null : day)} style={{
                background: isSelected ? COLORS.warm : hasNotes ? `${COLORS.warm}15` : "transparent",
                border: hasNotes ? `1px solid ${COLORS.warm}50` : "1px solid transparent",
                borderRadius: 10, padding: "8px 4px", cursor: hasNotes ? "pointer" : "default",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                minHeight: 42, transition: "all 0.2s",
                color: isSelected ? COLORS.paper : COLORS.ink,
              }}>
                <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 400 }}>{day}</span>
                {hasNotes && <div style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? COLORS.paper : COLORS.accent }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day notes */}
      {selectedDay && getNotesForDay(selectedDay).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 14 }}>
            {months[selectedMonth]} {selectedDay}
          </h3>
          {getNotesForDay(selectedDay).map(note => {
            const from = getMember(note.from);
            return (
              <div key={note.id} style={{
                background: COLORS.paper, border: `1px solid ${COLORS.warm}40`,
                borderRadius: 14, padding: 20, marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span>{from?.avatar}</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 14 }}>{from?.name}</span>
                </div>
                <h4 style={{ fontFamily: "'Playfair Display', serif", margin: "0 0 6px", fontSize: 16 }}>{note.title}</h4>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.inkLight, margin: 0 }}>{note.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* All events this month */}
      {allMonthNotes.length > 0 && !selectedDay && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 14 }}>This Month's Events</h3>
          {allMonthNotes.map((note, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              background: COLORS.paper, borderRadius: 10, marginBottom: 8,
              border: `1px solid ${COLORS.warm}30`, cursor: "pointer",
            }} onClick={() => setSelectedDay(note.day)}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: COLORS.warm, minWidth: 30, textAlign: "center" }}>{note.day}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{note.title}</div>
                <div style={{ fontSize: 12, color: COLORS.inkLight }}>From {getMember(note.from)?.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

// ─── Cassette Page ───────────────────────────────────────────────────────────
function CassettePage({ navigate, currentUser, boomerMode }) {
  const [uploadType, setUploadType] = useState("document");
  const [uploads, setUploads] = useState([
    { type: "document", name: "Grandma's Dumpling Recipe.pdf", from: "gm", date: "2024-12-01" },
    { type: "voice", name: "Grandpa's story about Melbourne.mp3", from: "gf", date: "2024-11-15" },
    { type: "video", name: "2024 CNY Family Dinner.mp4", from: "dad", date: "2024-02-10" },
  ]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpload = () => {
    setUploads(prev => [...prev, {
      type: uploadType,
      name: `New ${uploadType} from ${currentUser.name}`,
      from: currentUser.id,
      date: new Date().toISOString().split("T")[0],
    }]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const typeIcons = { document: "📄", voice: "🎙️", video: "🎬" };
  const typeColors = { document: COLORS.green, voice: COLORS.accent, video: COLORS.warmDark };

  return (
    <PageContainer navigate={navigate} title="Cassette Player" boomerMode={boomerMode}
      description="Upload documents, voice recordings, or videos to share with your family. Choose the type of media, then tap 'Upload' to add it.">

      {/* Cassette visual */}
      <div style={{
        background: "#2c1810", borderRadius: 20, padding: "30px 24px", margin: "0 auto 32px",
        maxWidth: 420, border: "3px solid #5a3a28", position: "relative",
        boxShadow: `0 8px 30px rgba(0,0,0,0.3)`,
      }}>
        <div style={{ textAlign: "center", fontFamily: "'Caveat', cursive", color: COLORS.warm, fontSize: 22, marginBottom: 16, letterSpacing: 1 }}>
          ⏺ Family Memories Recorder
        </div>
        {/* Reels */}
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 20 }}>
          {[0,1].map(i => (
            <div key={i} style={{
              width: 70, height: 70, borderRadius: "50%", border: `3px solid ${COLORS.warm}`,
              background: `radial-gradient(circle, #1a1410 30%, #3d2b1a 60%, #5a3a28 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "spin 4s linear infinite",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS.warm, opacity: 0.6 }} />
            </div>
          ))}
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        {/* Type selector */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          {["document", "voice", "video"].map(type => (
            <button key={type} onClick={() => setUploadType(type)} style={{
              background: uploadType === type ? COLORS.warm : "rgba(212,165,106,0.15)",
              border: `1px solid ${COLORS.warm}`, borderRadius: 10,
              padding: "8px 16px", cursor: "pointer",
              color: uploadType === type ? COLORS.ink : COLORS.warmLight,
              fontFamily: "'Crimson Text', serif", fontSize: 14,
              transition: "all 0.2s",
            }}>
              {typeIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Upload button */}
        <button onClick={handleUpload} style={{
          display: "block", width: "100%", padding: "12px", background: COLORS.accent,
          border: "none", borderRadius: 10, cursor: "pointer",
          fontFamily: "'Playfair Display', serif", fontSize: 16, color: COLORS.paper,
          transition: "all 0.2s", fontWeight: 600,
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Upload {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)}
        </button>

        {showSuccess && (
          <div style={{
            textAlign: "center", color: COLORS.greenLight, marginTop: 10,
            fontFamily: "'Caveat', cursive", fontSize: 18,
          }}>✓ Uploaded successfully!</div>
        )}
      </div>

      {/* Uploads list */}
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, textAlign: "center", marginBottom: 16 }}>Family Archive</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {uploads.map((u, i) => {
          const from = getMember(u.from);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
              background: COLORS.paper, borderRadius: 12, border: `1px solid ${COLORS.warm}30`,
            }}>
              <span style={{ fontSize: 26 }}>{typeIcons[u.type]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{u.name}</div>
                <div style={{ fontSize: 12, color: COLORS.inkLight }}>By {from?.name} · {u.date}</div>
              </div>
              <span style={{
                fontSize: 11, background: `${typeColors[u.type]}18`, color: typeColors[u.type],
                padding: "3px 10px", borderRadius: 20, fontWeight: 600,
              }}>{u.type}</span>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

// ─── Family Tree Page ────────────────────────────────────────────────────────
function FamilyTreePage({ navigate, currentUser, boomerMode }) {
  const [selectedMember, setSelectedMember] = useState(null);

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
      <span style={{ fontSize: 30 }}>{member.avatar}</span>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, fontWeight: 600, color: isSelected ? COLORS.paper : COLORS.ink }}>{member.name}</span>
    </button>
  );

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
            {selectedMember.avatar} Notes by {selectedMember.name}
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
                      <span style={{ fontSize: 12, color: COLORS.inkLight }}>
                        To: {toMember ? `${toMember.avatar} ${toMember.name}` : "👨‍👩‍👧‍👦 Everyone"}
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

// ─── Letters Page ────────────────────────────────────────────────────────────
function LettersPage({ navigate, currentUser, boomerMode }) {
  const today = new Date();

  const myLetters = NOTES.filter(n =>
    (n.to === currentUser.id || n.to === "all") && n.type === "letter"
  );

  const isLocked = (note) => {
    if (!note.unlockDate) return false;
    return new Date(note.unlockDate) > today;
  };

  const allNotes = NOTES.filter(n => n.to === currentUser.id || n.to === "all");

  return (
    <PageContainer navigate={navigate} title="Family Letters" boomerMode={boomerMode}
      description="These are messages left for you by your family. Some letters are locked until a special date — they will open automatically when the time comes.">

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {allNotes.map(note => {
          const from = getMember(note.from);
          const locked = isLocked(note);
          return (
            <div key={note.id} style={{
              background: locked ? "#f5f0e8" : COLORS.paper,
              border: `1px solid ${locked ? "#ccc" : COLORS.warm + "40"}`,
              borderRadius: 14, padding: 20, position: "relative", overflow: "hidden",
              opacity: locked ? 0.75 : 1, transition: "all 0.3s",
            }}>
              {locked && (
                <div style={{
                  position: "absolute", inset: 0, backdropFilter: "blur(4px)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: "rgba(245,240,232,0.85)", zIndex: 2, borderRadius: 14,
                }}>
                  <span style={{ fontSize: 36, marginBottom: 8 }}>🔒</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: COLORS.ink }}>
                    Time-Locked Letter
                  </span>
                  <span style={{ fontSize: 13, color: COLORS.inkLight, marginTop: 4, fontFamily: "'Caveat', cursive" }}>
                    Opens on {new Date(note.unlockDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{from?.avatar}</span>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 14 }}>{from?.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.inkLight }}>
                    {note.type === "tradition" ? "🎋 Tradition" : note.type === "letter" ? "💌 Letter" : "📦 Heirloom"}
                  </div>
                </div>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, margin: "0 0 8px" }}>{note.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.inkLight, margin: 0, fontFamily: "'Crimson Text', serif" }}>{note.content}</p>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
