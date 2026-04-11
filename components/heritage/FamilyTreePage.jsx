"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import { COLORS } from "./colors";
import { PageContainer } from "./shared";
import { createPerson } from "@/supabase/queries/person";
import { supabase } from "@/supabase/client";

/* --- Sub-Component: Handles Private Image Fetching --- */
const FamilyMemberAvatar = ({ path, gender, size = 18 }) => {
  const [signedUrl, setSignedUrl] = useState(null);
  const fallbackEmoji = gender === "F" ? "👩" : "👨";

  useEffect(() => {
    if (path && (path.startsWith("http") || path.includes("/"))) {
      if (path.startsWith("http")) {
        setSignedUrl(path);
        return;
      }

      const fetchSignedUrl = async () => {
        try {
          const { data, error } = await supabase.storage
            .from("profile")
            .createSignedUrl(path, 3600);

          if (error) throw error;
          setSignedUrl(data.signedUrl);
        } catch (err) {
          console.error("Error signing URL:", err);
        }
      };

      fetchSignedUrl();
    }
  }, [path]);

  if (signedUrl) {
    return (
      <img
        src={signedUrl}
        alt="Profile"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }

  return <span style={{ fontSize: size }}>{path && path.length < 4 ? path : fallbackEmoji}</span>;
};

/* --- Main Component --- */
export default function FamilyTreePage({ navigate, boomerMod, members, notes, addMember, familyId, viewSrc }) {
  const [selectedMember, setSelectedMember] = useState(null);

  // Form State
  const [showAdd, setShowAdd] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newGen, setNewGen] = useState("3");
  const [newGender, setNewGender] = useState("M");
  const [newDOB, setNewDOB] = useState("");
  const [uploading, setUploading] = useState(false);

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Handle Image Preview for Modal
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const generations = useMemo(() => {
    if (!members || members.length === 0) return [];
    const grouped = members.reduce((acc, member) => {
      const genValue = parseInt(member.generation, 10) || 1;
      if (!acc[genValue]) acc[genValue] = [];
      acc[genValue].push(member);
      return acc;
    }, {});
    const keys = Object.keys(grouped).map(Number);
    const maxGen = keys.length > 0 ? Math.max(...keys) : 1;
    return Array.from({ length: maxGen }, (_, i) => ({
      generation: i + 1,
      members: grouped[i + 1] || [],
    }));
  }, [members]);

  const handleAddMember = async () => {
    if (!newFirstName || !newLastName) return alert("Please enter a name.");

    setUploading(true);
    try {
      let finalPath = newGender === "M" ? "👨" : "👩";
      let signedAvatarUrl = finalPath; // fallback: emoji, no signing needed

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${familyId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("profile")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Use the relative path for the database
        finalPath = filePath;

        // ✅ FIX: Generate a signed URL immediately so avatar renders without a refresh
        const { data: signedData } = await supabase.storage
          .from("profile")
          .createSignedUrl(filePath, 3600);
        signedAvatarUrl = signedData?.signedUrl ?? filePath;
      }

      const created = await createPerson({
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
        generation: Number(newGen) || 1,
        date_of_birth: newDOB || null,
        gender: newGender,
        family_id: familyId,
        profile_picture_path: finalPath,
      });

      const memberForState = {
        ...created,
        id: created.id,
        name: `${newFirstName.trim()} ${newLastName.trim()}`,
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
        avatar: signedAvatarUrl,         // ✅ signed URL for immediate rendering
        profile_picture_path: finalPath, // raw path for DB operations & re-signing
        gender: newGender,
        generation: Number(newGen),
        date_of_birth: newDOB || null,
        role: "Family",
      };

      addMember?.(memberForState);

      setShowAdd(false);
      resetForm();
    } catch (err) {
      console.error("Failed to add member:", err);
      alert("Error adding member. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNewFirstName("");
    setNewLastName("");
    setNewGen("3");
    setNewGender("M");
    setNewDOB("");
    setImageFile(null);
    setPreviewUrl(null);
  };

  return (
    <PageContainer navigate={navigate} title="Family Tree" boomerMode={boomerMod} viewSrc={viewSrc}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>Family Generations</h2>
        <button onClick={() => setShowAdd(true)} style={addButtonStyle}>+ Add Member</button>
      </div>

      <div style={treeScrollContainer}>
        <div style={{ display: "flex", gap: 40, minWidth: "max-content" }}>
          {generations.map(gen => (
            <div key={gen.generation} style={{ width: 220 }}>
              <div style={genHeaderStyle}>GEN {gen.generation}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {gen.members.map(member => {
                  const active = selectedMember?.id === member.id;
                  const currentPath = member.profile_picture_path || member.avatar;

                  return (
                    <button key={member.id} onClick={() => setSelectedMember(member)} style={{
                      ...memberButtonStyle,
                      background: active ? COLORS.accent : "#fff",
                      border: `1px solid ${active ? COLORS.accent : COLORS.warm + "40"}`,
                      boxShadow: active ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
                    }}>
                      <div style={{ ...avatarCircleStyle, background: active ? "rgba(255,255,255,0.2)" : "#f0f0f0" }}>
                        <FamilyMemberAvatar
                          path={currentPath}
                          gender={member.gender}
                        />
                      </div>
                      <span style={{ ...nameStyle, color: active ? "#fff" : COLORS.ink }}>
                        {member.name || `${member.first_name} ${member.last_name}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAdd && (
        <div style={modalOverlay} onClick={() => setShowAdd(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, margin: 0 }}>New Family Member</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: COLORS.inkLight }}>✕</button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {/* Profile Preview */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <div style={previewCircleStyle}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 32, opacity: 0.4 }}>{newGender === "M" ? "👨" : "👩"}</span>
                  )}
                </div>
                <label style={{ cursor: "pointer", color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>
                  {imageFile ? "Change Photo" : "Upload Portrait"}
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ display: "none" }} />
                </label>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>First Name</label>
                  <input placeholder="Kai" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} style={modalInputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Last Name</label>
                  <input placeholder="Chen" value={newLastName} onChange={e => setNewLastName(e.target.value)} style={modalInputStyle} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Gender</label>
                  <select value={newGender} onChange={e => setNewGender(e.target.value)} style={modalInputStyle}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Generation</label>
                  <select value={newGen} onChange={e => setNewGen(e.target.value)} style={modalInputStyle}>
                    <option value="1">Gen 1 (Elders)</option>
                    <option value="2">Gen 2</option>
                    <option value="3">Gen 3</option>
                    <option value="4">Gen 4 (Youngest)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Birth Date</label>
                <input type="date" value={newDOB} onChange={e => setNewDOB(e.target.value)} style={modalInputStyle} />
              </div>

              <button
                onClick={handleAddMember}
                disabled={uploading}
                style={{
                  ...saveButtonStyle,
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.7 : 1,
                }}
              >
                {uploading ? "Creating..." : "Save Family Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

/* --- Styles --- */
const treeScrollContainer = { background: COLORS.paper, borderRadius: 16, padding: "32px 24px", border: `1px solid ${COLORS.warm}40`, overflowX: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" };
const genHeaderStyle = { color: COLORS.accent, fontWeight: 700, fontSize: 12, letterSpacing: "1px", marginBottom: 15, borderBottom: `1px solid ${COLORS.warm}20`, paddingBottom: 5 };
const memberButtonStyle = { borderRadius: 12, padding: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left", width: "100%" };
const avatarCircleStyle = { width: 32, height: 32, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" };
const nameStyle = { fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const modalOverlay = { position: "fixed", inset: 0, zIndex: 100, background: "rgba(20,10,5,0.7)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" };
const modalContent = { background: COLORS.paper, borderRadius: 24, padding: "30px", maxWidth: 450, width: "92%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" };
const previewCircleStyle = { width: 80, height: 80, borderRadius: "50%", background: "#f5f5f5", border: `1px dashed ${COLORS.warm}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" };
const addButtonStyle = { background: COLORS.accent, color: COLORS.paper, border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer", fontWeight: 600 };
const saveButtonStyle = { marginTop: 10, padding: "16px", border: "none", borderRadius: 14, background: COLORS.accent, color: "#fff", fontWeight: 700, fontSize: 16, boxShadow: `0 4px 12px ${COLORS.accent}40` };
const labelStyle = { fontSize: 11, fontWeight: 700, color: COLORS.inkLight, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, display: "block" };
const modalInputStyle = { width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${COLORS.warm}60`, backgroundColor: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };