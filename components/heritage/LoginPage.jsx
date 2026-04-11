"use client";
import { useState } from "react";
import { supabase } from "@/supabase/client";
import { COLORS } from "./colors";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    onLogin(data.user);
  };

  const handleSignup = async () => {
    if (!familyName.trim()) throw new Error("Please enter a family name.");

    const { data: result, error: fnError } = await supabase.functions.invoke("family-sign-up", {
      body: { email, password, family_name: familyName.trim() },
    });

    if (fnError || !result?.success) {
      const msg = result?.error?.message || result?.error || fnError?.message || "Sign-up failed.";
      throw new Error(msg);
    }

    // Edge fn auto-confirms the user, so sign in immediately
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;

    onLogin(data.user);
  };

  const handleSubmit = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "login") await handleLogin();
      else await handleSignup();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: `1.5px solid ${COLORS.ink}33`,
    borderRadius: 6,
    background: "#fffdf7",
    fontFamily: "'Crimson Text', Georgia, serif",
    fontSize: 17,
    color: COLORS.ink,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const buttonStyle = {
    width: "100%",
    padding: "11px",
    background: COLORS.ink,
    color: "#fffdf7",
    border: "none",
    borderRadius: 6,
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 17,
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    letterSpacing: "0.03em",
    transition: "opacity 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Crimson Text', Georgia, serif",
      color: COLORS.ink,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@400;600;700;800&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        background: "#fffdf7",
        border: `1.5px solid ${COLORS.ink}22`,
        borderRadius: 12,
        padding: "48px 40px 40px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}>
        {/* Decorative top line */}
        <div style={{
          width: 48, height: 3, background: COLORS.ink,
          borderRadius: 2, margin: "0 auto 20px", opacity: 0.3,
        }} />

        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 30, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.01em",
        }}>
          Heritage Home
        </h1>
        <p style={{ fontSize: 15, opacity: 0.55, margin: "0 0 32px", fontStyle: "italic" }}>
          Your family's story, preserved.
        </p>

        {/* Mode toggle */}
        <div style={{
          display: "flex", background: `${COLORS.ink}0d`,
          borderRadius: 8, padding: 3, marginBottom: 24,
        }}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setInfo(""); }}
              style={{
                flex: 1, padding: "8px 0", border: "none", borderRadius: 6,
                background: mode === m ? "#fffdf7" : "transparent",
                fontFamily: "'Crimson Text', Georgia, serif",
                fontSize: 15, fontWeight: mode === m ? 600 : 400,
                color: COLORS.ink, cursor: "pointer",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
              }}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={inputStyle}
          />

          {/* Family name — animated in on signup only */}
          <div style={{
            maxHeight: mode === "signup" ? 60 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease",
          }}>
            <input
              type="text"
              placeholder="Family name (e.g. The Nguyens)"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <p style={{ color: "#b94040", fontSize: 14, margin: "0 0 14px", textAlign: "left" }}>
            {error}
          </p>
        )}
        {info && (
          <p style={{ color: "#2e7d52", fontSize: 14, margin: "0 0 14px", textAlign: "left" }}>
            {info}
          </p>
        )}

        <button onClick={handleSubmit} disabled={loading} style={buttonStyle}>
          {loading
            ? mode === "signup" ? "Creating your family…" : "Signing in…"
            : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={{
          marginTop: 28, fontSize: 13, opacity: 0.35,
          fontStyle: "italic", letterSpacing: "0.02em",
        }}>
          ✦ &nbsp; Memories kept safe &nbsp; ✦
        </div>
      </div>
    </div>
  );
}