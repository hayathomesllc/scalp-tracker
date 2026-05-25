import { useState, useEffect, useRef } from "react";

const GOAL_MINUTES = 36 * 60;
const STORAGE_KEY = "scalp_massage_log";

const formatTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function ScalpTracker() {
  const [sessions, setSessions] = useState([]);
  const [inputMinutes, setInputMinutes] = useState("");
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [flash, setFlash] = useState(false);
  const [goalHours, setGoalHours] = useState(36);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const inputRef = useRef(null);

  const goalMins = goalHours * 60;

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSessions(parsed.sessions || []);
        setGoalHours(parsed.goalHours || 36);
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions, goalHours }));
  }, [sessions, goalHours, loaded]);

  const totalMinutes = sessions.reduce((acc, s) => acc + s.minutes, 0);
  const pct = Math.min((totalMinutes / goalMins) * 100, 100);
  const remaining = Math.max(goalMins - totalMinutes, 0);

  const addSession = () => {
    const mins = parseFloat(inputMinutes);
    if (!mins || mins <= 0) return;
    const newSession = {
      id: Date.now(),
      minutes: mins,
      note: note.trim(),
      date: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setInputMinutes("");
    setNote("");
    setFlash(true);
    setTimeout(() => setFlash(false), 800);
    inputRef.current?.focus();
  };

  const deleteSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const completed = pct >= 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0d0d0d 0%, #1a1209 50%, #0d0d0d 100%)",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: "#e8d5b0",
        padding: "2rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem", maxWidth: 480 }}>
        <div style={{ fontSize: "2.2rem", letterSpacing: "0.08em", color: "#c9a84c", marginBottom: "0.3rem" }}>
          ✦ SCALP RITUAL ✦
        </div>
        <div style={{ fontSize: "0.78rem", letterSpacing: "0.25em", color: "#8a7050", textTransform: "uppercase" }}>
          Perfect Hair Health · Cumulative Progress
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 20,
          padding: "2rem 1.5rem",
          maxWidth: 460,
          width: "100%",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ marginBottom: "1.2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              fontSize: "0.82rem",
              color: "#8a7050",
              letterSpacing: "0.1em",
            }}
          >
            <span>PROGRESS</span>
            <span style={{ color: completed ? "#7ec87e" : "#c9a84c" }}>
              {pct.toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              height: 18,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 9,
              overflow: "hidden",
              border: "1px solid rgba(201,168,76,0.15)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 9,
                background: completed
                  ? "linear-gradient(90deg, #4caf7e, #7ec87e)"
                  : "linear-gradient(90deg, #8b5e1a, #c9a84c, #e8c96a)",
                transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: flash ? "0 0 20px rgba(201,168,76,0.8)" : "0 0 8px rgba(201,168,76,0.3)",
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          {[
            { label: "Logged", value: formatTime(totalMinutes), accent: "#c9a84c" },
            { label: "Remaining", value: completed ? "Done! 🎉" : formatTime(remaining), accent: completed ? "#7ec87e" : "#e8c96a" },
            { label: "Sessions", value: sessions.length, accent: "#c9a84c" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                textAlign: "center",
                padding: "0.8rem 0.5rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12,
                border: "1px solid rgba(201,168,76,0.12)",
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: s.accent }}>{s.value}</div>
              <div style={{ fontSize: "0.68rem", color: "#6a5030", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "1rem",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#6a5030",
            letterSpacing: "0.1em",
          }}
        >
          GOAL:{" "}
          <span
            style={{ color: "#c9a84c", cursor: "pointer", borderBottom: "1px dashed rgba(201,168,76,0.4)" }}
            onClick={() => setShowGoalEdit(!showGoalEdit)}
          >
            {goalHours} hours ({formatTime(goalMins)})
          </span>
          {" "}· tap to change
        </div>

        {showGoalEdit && (
          <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            {[36, 40, 44, 50].map((h) => (
              <button
                key={h}
                onClick={() => { setGoalHours(h); setShowGoalEdit(false); }}
                style={{
                  padding: "0.4rem 0.9rem",
                  background: goalHours === h ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${goalHours === h ? "#c9a84c" : "rgba(201,168,76,0.2)"}`,
                  borderRadius: 8,
                  color: goalHours === h ? "#c9a84c" : "#8a7050",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontFamily: "inherit",
                }}
              >
                {h}h
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 20,
          padding: "1.5rem",
          maxWidth: 460,
          width: "100%",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#8a7050", marginBottom: "1rem", textTransform: "uppercase" }}>
          Log a Session
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ flex: 1 }}>
            <input
              ref={inputRef}
              type="number"
              min="1"
              max="120"
              placeholder="Minutes"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSession()}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: 10,
                padding: "0.7rem 1rem",
                color: "#e8d5b0",
                fontSize: "1rem",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={addSession}
            style={{
              padding: "0.7rem 1.4rem",
              background: "linear-gradient(135deg, #8b5e1a, #c9a84c)",
              border: "none",
              borderRadius: 10,
              color: "#0d0d0d",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontFamily: "inherit",
              letterSpacing: "0.05em",
            }}
          >
            + ADD
          </button>
        </div>

        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSession()}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.15)",
            borderRadius: 10,
            padding: "0.6rem 1rem",
            color: "#8a7050",
            fontSize: "0.85rem",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          {[5, 10, 15, 20, 30].map((m) => (
            <button
              key={m}
              onClick={() => setInputMinutes(String(m))}
              style={{
                padding: "0.35rem 0.75rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: 7,
                color: "#8a7050",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontFamily: "inherit",
              }}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {sessions.length > 0 && (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(201,168,76,0.12)",
            borderRadius: 20,
            padding: "1.5rem",
            maxWidth: 460,
            width: "100%",
          }}
        >
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#6a5030", marginBottom: "1rem", textTransform: "uppercase" }}>
            Session History ({sessions.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: 300, overflowY: "auto" }}>
            {sessions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.6rem 0.75rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 10,
                  border: "1px solid rgba(201,168,76,0.08)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    color: "#c9a84c",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  {s.minutes}m
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem", color: "#8a7050" }}>{formatDate(s.date)}</div>
                  {s.note && (
                    <div style={{ fontSize: "0.75rem", color: "#5a4020", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.note}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteSession(s.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4a3010",
                    cursor: "pointer",
                    fontSize: "1rem",
                    padding: "0 0.25rem",
                    lineHeight: 1,
                  }}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "2rem", fontSize: "0.65rem", color: "#3a2810", letterSpacing: "0.15em", textAlign: "center" }}>
        DATA SAVED LOCALLY · PERFECT HAIR HEALTH METHOD
      </div>
    </div>
  );
}
