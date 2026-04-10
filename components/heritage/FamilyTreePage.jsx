"use client";
import { useMemo, useState } from "react";
import { COLORS } from "./colors";
import { PageContainer, SpriteImg } from "./shared";
import { createPerson } from "@/supabase/queries/person";


export default function FamilyTreePage({ navigate, boomerMod,sprites,members,notes,addMember, familyId}) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newGen, setNewGen] = useState("3");
  const [newRole, setNewRole] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newGender, setNewGender] = useState("M");
  const [newDOB, setNewDOB] = useState("");

  const generations = useMemo(() => {
    const grouped = members.reduce((acc, member) => {
      const gen = member.generation || 1;
      if (!acc[gen]) acc[gen] = [];
      acc[gen].push(member);
      return acc;
    }, {});
    return Object.keys(grouped)
      .map(g => Number(g))
      .sort((a, b) => a - b)
      .map(g => ({ generation: g, members: grouped[g] }));
  }, [members]);

  const getMember = (id) => members.find(m => m.id === id);

  const memberNotes = selectedMember ? notes.filter(n => n.from === selectedMember.id) : [];

  const handleAddMember = async () => {
    try {

      const created = await createPerson({
        first_name: newFirstName,
        last_name: newLastName,
        generation: Number(newGen) || 1,
        date_of_birth: newDOB || null,
        gender: newGender,
        family_id: familyId,
      });

      console.log("DB created:", created);


      // update UI instantly (optimistic update)
      setShowAdd(false);
      setNewFirstName("");
      setNewLastName("");
      setNewGen("3");
      setNewRole("");
      setNewParent("");
      setNewGender("M");
      setNewDOB("");

      // IMPORTANT: update parent state
      // (need to pass setMembers OR refetch from index)
      addMember?.({
        id: created.id,
        name: `${created.first_name} ${created.last_name}`,
        avatar: newGender === "M" ? "👨" : "👩",
        role: newRole || "Family",
        born: created.date_of_birth,
        parentId: newParent || null,
        generation: created.generation,
      });

    } catch (err) {
      console.error("handleAddMember failed:", err);
    }
  };

  return (
    <PageContainer navigate={navigate} title="Family Tree" boomerMode={boomerMod}
      description="Browse family members by generation. Tap a person to see the notes they have left for the family. Use the plus button to add new family members.">

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600 }}>Family Generations</div>
          <div style={{ fontSize: 13, color: COLORS.inkLight }}>Scroll to see every generation in your family.</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          background: COLORS.accent, color: COLORS.paper, border: "none", borderRadius: 12,
          padding: "10px 16px", cursor: "pointer", fontFamily: "'Playfair Display', serif",
          fontSize: 14, fontWeight: 600,
        }}>+ Add Member</button>
      </div>

      <div style={{
        background: COLORS.paper, borderRadius: 16, padding: "24px 18px",
        border: `1px solid ${COLORS.warm}40`, overflowX: "auto",
      }}>
        <div style={{ display: "flex", gap: 24, minWidth: "max-content" }}>
          {generations.map(gen => (
            <div key={gen.generation} style={{ minWidth: 220 }}>
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600,
                marginBottom: 12, color: COLORS.ink,
              }}>
                Generation {gen.generation}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {gen.members.map(member => {
                  const active = selectedMember?.id === member.id;
                  return (
                    <button key={member.id} onClick={() => setSelectedMember(member)} style={{
                      background: active ? COLORS.warm : "#fff9f0",
                      border: active ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.warm}40`,
                      borderRadius: 12, padding: "10px 12px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                      transition: "all 0.2s",
                    }}>
                      <SpriteImg src={sprites[member.id]} fallback={member.avatar} size={28} />
                      <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 600, color: active ? COLORS.paper : COLORS.ink }}>{member.name}</div>
                        <div style={{ fontSize: 11, color: active ? COLORS.paper : COLORS.inkLight }}>{member.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMember && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, textAlign: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 20, lineHeight: 1, verticalAlign: "middle", marginRight: 6 }}>{selectedMember.avatar}</span> Notes by {selectedMember.name}
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
                      <span style={{ fontSize: 12, color: COLORS.inkLight, display: "flex", alignItems: "center", gap: 4 }}>
                        To: {toMember
                          ? <><span style={{ fontSize: 14, lineHeight: 1 }}>{toMember.avatar}</span> {toMember.name}</>
                          : "👨‍👩‍👧‍👦 Everyone"}
                      </span>
                      <span style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                        background: note.type === "tradition" ? `${COLORS.green}22` : note.type === "letter" ? `${COLORS.accent}22` : `${COLORS.warm}22`,
                        color: note.type === "tradition" ? COLORS.green : note.type === "letter" ? COLORS.accent : COLORS.warmDark,
                      }}>
                        {note.type === "tradition" ? "Tradition" : note.type === "letter" ? "Letter" : "Heirloom"}
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

      {showAdd && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,10,5,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setShowAdd(false)}>
          <div style={{
            background: COLORS.paper, borderRadius: 16, padding: "22px 24px",
            maxWidth: 520, width: "92%", boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, margin: 0 }}>Add New Family Member</h3>
              <button onClick={() => setShowAdd(false)} style={{
                background: "none", border: "none", fontSize: 20, cursor: "pointer", color: COLORS.ink,
              }}>{"✕"}</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                First Name
                <input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="e.g. Kai" style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }} />
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Last Name
                <input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} placeholder="e.g. Chen" style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }} />
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Gender
                <select value={newGender} onChange={(e) => setNewGender(e.target.value)} style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Date of Birth
                <input 
                  type="date" 
                  value={newDOB} 
                  onChange={(e) => setNewDOB(e.target.value)} 
                  style={{
                    width: "100%", 
                    marginTop: 6, 
                    padding: "8px 10px",
                    borderRadius: 10, 
                    border: `1px solid ${COLORS.warm}40`,
                    fontFamily: "'Crimson Text', serif",
                    boxSizing: "border-box" // Ensures padding doesn't break width
                  }} 
                />
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Generation
                <select value={newGen} onChange={(e) => setNewGen(e.target.value)} style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }}>
                  <option value="1">Generation 1</option>
                  <option value="2">Generation 2</option>
                  <option value="3">Generation 3</option>
                  <option value="4">Generation 4</option>
                </select>
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Role (optional)
                <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Aunt, Cousin" style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }} />
              </label>
              <label style={{ fontSize: 12, color: COLORS.inkLight }}>
                Parent (optional)
                <select value={newParent} onChange={(e) => setNewParent(e.target.value)} style={{
                  width: "100%", marginTop: 6, padding: "8px 10px",
                  borderRadius: 10, border: `1px solid ${COLORS.warm}40`,
                  fontFamily: "'Crimson Text', serif",
                }}>
                  <option value="">No parent selected</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <button onClick={handleAddMember} style={{
              marginTop: 16, width: "100%", padding: "10px 14px",
              border: "none", borderRadius: 10, background: COLORS.accent,
              color: COLORS.paper, fontFamily: "'Playfair Display', serif", cursor: "pointer",
              fontSize: 15, fontWeight: 600,
            }}>
              Add Member
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
