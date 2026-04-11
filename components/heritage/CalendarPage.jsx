"use client";
import { useEffect, useState } from "react";
import { COLORS } from "./colors";
import { PageContainer, SpriteImg } from "./shared";
import { supabase } from "@/supabase/client";

export default function CalendarPage({
  navigate,
  currentUser,
  boomerMode,
  members,
  notes,
  sprites,
  uploads,
  openMessageFromCalendar,
  openFileFromCalendar,
  viewSrc,
}) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [signedUrls, setSignedUrls] = useState({});
  const year = 2026;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const getMember = (id) => members.find((m) => m.id === id);

  const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(year, selectedMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getNotesForDay = (day) => {
    const mm = String(selectedMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return notes.filter(n => n.eventDate === `${mm}-${dd}` && (n.to === currentUser.id || n.to === "all"));
  };

  const getUploadsForDay = (day) => {
    const mm = String(selectedMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const target = `${mm}-${dd}`;
    return (uploads || []).filter((u) => {
      const uploadDate = u.event_date || u.eventDate || null;
      const visibleToCurrentUser =
        u.recipient_id == null ||
        u.recipient_id === currentUser.id ||
        u.to === "all" ||
        u.to === currentUser.id;
      return uploadDate === target && visibleToCurrentUser;
    });
  };

  const allMonthEvents = days.flatMap((d) => [
    ...getNotesForDay(d).map((n) => ({ kind: "note", day: d, id: `note-${n.id}`, data: n })),
    ...getUploadsForDay(d).map((u) => ({ kind: "upload", day: d, id: `upload-${u.id}`, data: u })),
  ]);

  const getSelectedISODate = () => {
    if (!selectedDay) return "";
    const mm = String(selectedMonth + 1).padStart(2, "0");
    const dd = String(selectedDay).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  useEffect(() => {
    const loadUrls = async () => {
      const map = {};
      for (const item of uploads || []) {
        if (!item.media_path) continue;
        const { data } = await supabase.storage
          .from("multimedia")
          .createSignedUrl(item.media_path, 3600);
        if (data?.signedUrl) map[item.id] = data.signedUrl;
      }
      setSignedUrls(map);
    };
    if ((uploads || []).length > 0) loadUrls();
  }, [uploads]);

  return (
    <PageContainer navigate={navigate} title="Family Calendar" boomerMode={boomerMode} viewSrc={viewSrc}
      description="This calendar shows family traditions and special messages on their dates. Tap a date with a dot to see the notes for that day.">

      {/* Month selector */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => {
            setSelectedMonth(Math.max(0, selectedMonth - 1));
            setSelectedDay(null);
            setShowDayModal(false);
          }}
          style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.ink }}
        >{"<"}</button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, minWidth: 160, textAlign: "center" }}>{months[selectedMonth]} {year}</span>
        <button
          onClick={() => {
            setSelectedMonth(Math.min(11, selectedMonth + 1));
            setSelectedDay(null);
            setShowDayModal(false);
          }}
          style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.ink }}
        >{">"}</button>
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
            const dayUploads = getUploadsForDay(day);
            const hasEvents = dayNotes.length > 0 || dayUploads.length > 0;
            const isSelected = selectedDay === day;
            return (
              <button key={day} onClick={() => {
                setSelectedDay(isSelected ? null : day);
                setShowDayModal(!isSelected);
              }} style={{
                background: isSelected ? COLORS.warm : hasEvents ? `${COLORS.warm}15` : "transparent",
                border: hasEvents ? `1px solid ${COLORS.warm}50` : "1px solid transparent",
                borderRadius: 10, padding: "8px 4px", cursor: hasEvents ? "pointer" : "default",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                minHeight: 42, transition: "all 0.2s",
                color: isSelected ? COLORS.paper : COLORS.ink,
              }}>
                <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 400 }}>{day}</span>
                {hasEvents && <div style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? COLORS.paper : COLORS.accent }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day modal */}
      {showDayModal && selectedDay && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,10,5,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => { setShowDayModal(false); setSelectedDay(null); }}>
          <div style={{
            background: COLORS.paper, borderRadius: 16, padding: "22px 24px",
            maxWidth: 640, width: "92%", boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, margin: 0 }}>
                {months[selectedMonth]} {selectedDay}
              </h3>
              <button onClick={() => { setShowDayModal(false); setSelectedDay(null); }} style={{
                background: "none", border: "none", fontSize: 20, cursor: "pointer", color: COLORS.ink,
              }}>{"✕"}</button>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <button
                onClick={() => openMessageFromCalendar?.(getSelectedISODate())}
                style={{
                  border: "none", borderRadius: 10, padding: "8px 12px",
                  background: COLORS.accent, color: COLORS.paper, cursor: "pointer", fontWeight: 600,
                }}
              >
                Add message
              </button>
              <button
                onClick={() => openFileFromCalendar?.(getSelectedISODate())}
                style={{
                  border: `1px solid ${COLORS.accent}60`, borderRadius: 10, padding: "8px 12px",
                  background: COLORS.paper, color: COLORS.accent, cursor: "pointer", fontWeight: 600,
                }}
              >
                Add file
              </button>
            </div>
            {getNotesForDay(selectedDay).map(note => {
              const from = getMember(note.from);
              return (
                <div key={note.id} style={{
                  background: "#fff9f0", border: `1px solid ${COLORS.warm}40`,
                  borderRadius: 14, padding: 16, marginBottom: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    {from && <SpriteImg src={sprites[from.id]} fallback={from.avatar} size={20} />}
                    <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 14 }}>{from?.name}</span>
                  </div>
                  <h4 style={{ fontFamily: "'Playfair Display', serif", margin: "0 0 6px", fontSize: 16 }}>{note.title}</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.inkLight, margin: 0 }}>{note.content}</p>
                </div>
              );
            })}
            {getUploadsForDay(selectedDay).map((upload) => {
              const from = getMember(upload.sender_id || upload.from);
              const link = signedUrls[upload.id];
              const mediaType = upload.media_type || "";
              const typeLabel = mediaType === "AUDIO" || mediaType.startsWith("audio/") ? "Voice"
                : mediaType === "VIDEO" || mediaType.startsWith("video/") ? "Video"
                : "Document";
              return (
                <div key={`upload-${upload.id}`} style={{
                  background: "#f2f7ff", border: `1px solid ${COLORS.accent}35`,
                  borderRadius: 14, padding: 16, marginBottom: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 15 }}>
                        {upload.description || "Shared family file"}
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.inkLight }}>
                        {typeLabel} from {from?.name || "Family"}
                      </div>
                    </div>
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          textDecoration: "none", background: COLORS.accent, color: COLORS.paper,
                          borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600,
                        }}
                      >
                        Open file
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: COLORS.inkLight }}>Preparing link...</span>
                    )}
                  </div>
                </div>
              );
            })}
            {getNotesForDay(selectedDay).length === 0 && getUploadsForDay(selectedDay).length === 0 && (
              <p style={{ margin: 0, color: COLORS.inkLight, fontStyle: "italic" }}>No events yet for this date.</p>
            )}
          </div>
        </div>
      )}

      {/* All events this month */}
      {allMonthEvents.length > 0 && !showDayModal && !selectedDay && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 14 }}>This Month&apos;s Events</h3>
          {allMonthEvents.map((event) => (
            <div key={event.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              background: COLORS.paper, borderRadius: 10, marginBottom: 8,
              border: `1px solid ${COLORS.warm}30`, cursor: "pointer",
            }} onClick={() => { setSelectedDay(event.day); setShowDayModal(true); }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: COLORS.warm, minWidth: 30, textAlign: "center" }}>{event.day}</span>
              <div>
                {event.kind === "note" ? (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{event.data.title}</div>
                    <div style={{ fontSize: 12, color: COLORS.inkLight }}>From {getMember(event.data.from)?.name}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{event.data.description || "Shared family file"}</div>
                    <div style={{ fontSize: 12, color: COLORS.inkLight }}>File upload</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
