"use client";
import { useState } from "react";
import { COLORS } from "./colors";
import { NOTES, getMember } from "./data";
import { PageContainer, SpriteImg } from "./shared";

export default function CalendarPage({ navigate, currentUser, boomerMode, sprites }) {
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
                  {from && <SpriteImg src={sprites[from.id]} fallback={from.avatar} size={22} />}
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
