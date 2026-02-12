import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import "./App.css";

function App() {
  const [tick, setTick] = useState(0);
  const [stampedIndices, setStampedIndices] = useState([]);
  const [lastRuinedDate, setLastRuinedDate] = useState("");
  const [lastProperDate, setLastProperDate] = useState("");
  const [lockedDate, setLockedDate] = useState("");
  const [correctPin, setCorrectPin] = useState("");
  const [isEditor, setIsEditor] = useState(() => {
    return sessionStorage.getItem("isEditor") === "true";
  });

  const totalKeys = 10;

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("reward_card")
        .select("*")
        .eq("id", 1)
        .single();

      if (data && !error) {
        setStampedIndices(data.stamped_indices || []);
        setLockedDate(data.locked_date || "");
        setLastRuinedDate(data.last_ruined_date || "");
        setLastProperDate(data.last_proper_date || "");
        setCorrectPin(data.pin || "");
      }
    };

    fetchData();

    const channel = supabase
      .channel("reward_card_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reward_card" },
        (payload) => {
          setStampedIndices(payload.new.stamped_indices);
          setLockedDate(payload.new.locked_date);
          setLastRuinedDate(payload.new.last_ruined_date);
          setLastProperDate(payload.new.last_proper_date);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Time-based refresh logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 3600000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setTick((t) => t + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const updateSupabase = async (updates) => {
    const { error } = await supabase
      .from("reward_card")
      .update(updates)
      .eq("id", 1);

    if (error) console.error("Error updating Supabase:", error);
  };

  const handleEditorLogin = () => {
    if (isEditor) {
      setIsEditor(false);
      sessionStorage.removeItem("isEditor");
      return;
    }

    const pin = prompt("Enter 4-digit PIN to enable editing:");
    if (pin === correctPin && correctPin !== "") {
      setIsEditor(true);
      sessionStorage.setItem("isEditor", "true");
    } else if (pin !== null) {
      alert("Incorrect PIN");
    }
  };

  const toggleStamp = (index) => {
    if (!isEditor) return;

    let newIndices;
    if (stampedIndices.includes(index)) {
      newIndices = stampedIndices.filter((i) => i !== index);
    } else {
      newIndices = [...stampedIndices, index];
    }
    setStampedIndices(newIndices);
    updateSupabase({ stamped_indices: newIndices });
  };

  const resetCard = () => {
    if (!isEditor) return;
    if (confirm("Reset the card? This will clear all keys.")) {
      setStampedIndices([]);
      updateSupabase({ stamped_indices: [] });
    }
  };

  const stampCount = stampedIndices.length;
  const isUnlocked = stampCount === totalKeys;

  const calculateDays = (dateString) => {
    if (!dateString) return "—";
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    const diffTime = today - selectedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays;
  };

  const handleDateChange = (type, value) => {
    if (!isEditor) return;

    if (type === "ruined") {
      setLastRuinedDate(value);
      updateSupabase({ last_ruined_date: value });
    } else if (type === "proper") {
      setLastProperDate(value);
      updateSupabase({ last_proper_date: value });
    } else {
      setLockedDate(value);
      updateSupabase({ locked_date: value });
    }
  };

  return (
    <div className="card">
      <div
        className="header"
        onClick={handleEditorLogin}
        style={{ cursor: "pointer" }}
      >
        <span className="lock-icon">{isEditor ? "🔓" : "🔒"}</span>
        <h1>REWARD CARD</h1>
        <div className="subtitle">Earn 10 keys to unlock a reward...</div>
      </div>

      <div className={`lock-status ${isUnlocked ? "unlocked" : ""}`}>
        <span
          id="status-text"
          style={{ color: isUnlocked ? "#daa520" : "#999" }}
        >
          {isUnlocked
            ? "PRESENT TO KEYHOLDER TO CLAIM REWARD"
            : `🔒 LOCKED — ${totalKeys - stampCount} KEYS REMAINING`}
        </span>
      </div>

      <div className="stamps-container">
        {[...Array(totalKeys)].map((_, index) => (
          <div
            key={index}
            className={`stamp ${stampedIndices.includes(index) ? "stamped" : ""}`}
            style={{ cursor: isEditor ? "pointer" : "default" }}
            onClick={() => toggleStamp(index)}
          >
            <span className="key">🗝️</span>
          </div>
        ))}
      </div>

      {isEditor && (
        <button className="reset-btn" onClick={resetCard}>
          RESET KEYS
        </button>
      )}

      <div className="days-tracker">
        <div
          className="day-count"
          onClick={() =>
            isEditor && document.getElementById("locked-input").showPicker()
          }
          style={{ cursor: isEditor ? "pointer" : "default" }}
        >
          <div className="day-count-label">DAYS LOCKED</div>
          {isEditor && (
            <input
              type="date"
              id="locked-input"
              className="date-input"
              value={lockedDate}
              onChange={(e) => handleDateChange("locked", e.target.value)}
            />
          )}
          <div className="day-count-number" id="locked-display">
            {calculateDays(lockedDate)}
          </div>
        </div>
        <div
          className="day-count"
          onClick={() =>
            isEditor &&
            document.getElementById("last-ruined-input").showPicker()
          }
          style={{ cursor: isEditor ? "pointer" : "default" }}
        >
          <div className="day-count-label">LAST RUINED</div>
          {isEditor && (
            <input
              type="date"
              id="last-ruined-input"
              className="date-input"
              value={lastRuinedDate}
              onChange={(e) => handleDateChange("ruined", e.target.value)}
            />
          )}
          <div className="day-count-number" id="last-ruined-display">
            {calculateDays(lastRuinedDate)}
          </div>
        </div>
        <div
          className="day-count"
          onClick={() =>
            isEditor &&
            document.getElementById("last-proper-input").showPicker()
          }
          style={{ cursor: isEditor ? "pointer" : "default" }}
        >
          <div className="day-count-label">LAST PROPER</div>
          {isEditor && (
            <input
              type="date"
              id="last-proper-input"
              className="date-input"
              value={lastProperDate}
              onChange={(e) => handleDateChange("proper", e.target.value)}
            />
          )}
          <div className="day-count-number" id="last-proper-display">
            {calculateDays(lastProperDate)}
          </div>
        </div>
      </div>

      <div className="fine-print">
        Keys may be removed or reset at Bae's discretion without warning or
        explanation.
      </div>
    </div>
  );
}

export default App;
