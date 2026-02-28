import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import SpinWheel from "./SpinWheel";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showUnlock, setShowUnlock] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [tick, setTick] = useState(0);
  const [stampedIndices, setStampedIndices] = useState([]);
  const [lastRuinedDate, setLastRuinedDate] = useState("");
  const [lastProperDate, setLastProperDate] = useState("");
  const [lockedDate, setLockedDate] = useState("");
  const [lastReward, setLastReward] = useState("");
  const [correctPin, setCorrectPin] = useState("");
  const [bestLocked, setBestLocked] = useState(0);
  const [bestRuined, setBestRuined] = useState(0);
  const [bestProper, setBestProper] = useState(0);
  const [showWheel, setShowWheel] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showRuinedModal, setShowRuinedModal] = useState(false);
  const [showProperModal, setShowProperModal] = useState(false);
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
        setLastReward(data.last_reward || "");
        setCorrectPin(data.pin || "");
        setBestLocked(data.best_locked || 0);
        setBestRuined(data.best_ruined || 0);
        setBestProper(data.best_proper || 0);

        // Loading transition sequence
        setShowUnlock(true);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
        }, 300);
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
          setLastReward(payload.new.last_reward || "");
          setBestLocked(payload.new.best_locked || 0);
          setBestRuined(payload.new.best_ruined || 0);
          setBestProper(payload.new.best_proper || 0);
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

  useEffect(() => {
    const updates = {};

    const currentLocked = calculateDays(lockedDate);
    if (typeof currentLocked === "number" && currentLocked > bestLocked) {
      setBestLocked(currentLocked);
      updates.best_locked = currentLocked;
    }

    const currentRuined = calculateDays(lastRuinedDate);
    if (typeof currentRuined === "number" && currentRuined > bestRuined) {
      setBestRuined(currentRuined);
      updates.best_ruined = currentRuined;
    }

    const currentProper = calculateDays(lastProperDate);
    if (typeof currentProper === "number" && currentProper > bestProper) {
      setBestProper(currentProper);
      updates.best_proper = currentProper;
    }

    if (Object.keys(updates).length > 0) {
      updateSupabase(updates);
    }
  }, [
    tick,
    lockedDate,
    lastRuinedDate,
    lastProperDate,
    bestLocked,
    bestRuined,
    bestProper,
  ]);

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

  const handleWheelReset = (prize) => {
    // Save prize, clear stamps, return to card
    setLastReward(prize);
    setStampedIndices([]);
    setShowWheel(false);
    updateSupabase({
      last_reward: prize,
      stamped_indices: [],
    });
  };

  const stampCount = stampedIndices.length;
  const isUnlocked = stampCount === totalKeys;

  const calculateDays = (dateString) => {
    if (!dateString) return 0;
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

  // Show wheel screen
  if (showWheel && !isLoading) {
    return (
      <div className="card">
        <SpinWheel onReset={handleWheelReset} />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`loading-screen ${isFadingOut ? "fade-out" : ""}`}>
          <div className={`loading-emoji ${showUnlock ? "pop" : ""}`}>
            {showUnlock ? "🔓" : "🔒"}
          </div>
          <div className="loading-text">
            Loading<span className="loading-dots">...</span>
          </div>
        </div>
      )}
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
              ? "🔓 ALL 10 KEYS EARNED — REWARD UNLOCKED"
              : `🔒 LOCKED — ${totalKeys - stampCount} KEYS REMAINING`}
          </span>
          {lastReward && (
            <div className="last-reward">Last reward — {lastReward}</div>
          )}
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

        {isUnlocked ? (
          <button
            className="reset-btn spin-trigger"
            onClick={() => setShowWheel(true)}
          >
            SPIN THE WHEEL TO REVEAL YOUR REWARD
          </button>
        ) : isEditor ? (
          <button className="reset-btn" onClick={resetCard}>
            RESET KEYS
          </button>
        ) : null}

        <div className="days-tracker">
          <div
            className="day-count"
            onClick={() => {
              if (!isEditor) return;
              setShowLockModal(true);
            }}
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
            <div
              style={{
                fontSize: "8px",
                color: "#555",
                marginTop: "4px",
                letterSpacing: "1px",
                fontWeight: 300,
              }}
            >
              LONGEST: {bestLocked}
            </div>
          </div>
          <div
            className="day-count"
            onClick={() => {
              if (!isEditor) return;
              setShowRuinedModal(true);
            }}
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
            <div
              style={{
                fontSize: "8px",
                color: "#555",
                marginTop: "4px",
                letterSpacing: "1px",
                fontWeight: 300,
              }}
            >
              LONGEST: {bestRuined}
            </div>
          </div>
          <div
            className="day-count"
            onClick={() => {
              if (!isEditor) return;
              setShowProperModal(true);
            }}
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
            <div
              style={{
                fontSize: "8px",
                color: "#555",
                marginTop: "4px",
                letterSpacing: "1px",
                fontWeight: 300,
              }}
            >
              LONGEST: {bestProper}
            </div>
          </div>
        </div>

        <div className="fine-print">
          Keys may be removed or reset at Bae's discretion without warning or
          explanation.
        </div>
      </div>
      {showLockModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(218,165,32,0.3)",
              padding: "30px",
              textAlign: "center",
              maxWidth: "300px",
              width: "90%",
            }}
          >
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                color: "#daa520",
                fontSize: "18px",
                marginBottom: "20px",
                letterSpacing: "2px",
              }}
            >
              DAYS LOCKED
            </div>
            <button
              onClick={() => {
                setShowLockModal(false);
                setTimeout(
                  () => document.getElementById("locked-input").showPicker(),
                  100,
                );
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                background: "transparent",
                border: "1px solid rgba(218,165,32,0.45)",
                color: "#daa520",
                fontSize: "10px",
                fontWeight: 300,
                cursor: "pointer",
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              SET DATE
            </button>
            <button
              onClick={() => {
                setLockedDate("");
                updateSupabase({ locked_date: "" });
                setShowLockModal(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                background: "transparent",
                border: "1px solid rgba(218,165,32,0.45)",
                color: "#daa520",
                fontSize: "10px",
                fontWeight: 300,
                cursor: "pointer",
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              NOT LOCKED
            </button>
            <button
              onClick={() => setShowLockModal(false)}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                background: "transparent",
                border: "1px solid rgba(100,100,100,0.3)",
                color: "#666",
                fontSize: "10px",
                fontWeight: 300,
                cursor: "pointer",
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {showRuinedModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(218,165,32,0.3)",
              padding: "30px",
              textAlign: "center",
              maxWidth: "300px",
              width: "90%",
            }}
          >
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                color: "#daa520",
                fontSize: "18px",
                marginBottom: "20px",
                letterSpacing: "2px",
              }}
            >
              LAST RUINED
            </div>
            <button
              onClick={() => {
                setShowRuinedModal(false);
                setTimeout(
                  () =>
                    document.getElementById("last-ruined-input").showPicker(),
                  100,
                );
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                background: "transparent",
                border: "1px solid rgba(218,165,32,0.45)",
                color: "#daa520",
                fontSize: "10px",
                fontWeight: 300,
                cursor: "pointer",
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              SET DATE
            </button>
            <button
              onClick={() => {
                setLastRuinedDate("");
                updateSupabase({ last_ruined_date: "" });
                setShowRuinedModal(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                background: "transparent",
                border: "1px solid rgba(218,165,32,0.45)",
                color: "#daa520",
                fontSize: "10px",
                fontWeight: 300,
                cursor: "pointer",
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              NOT TRACKING
            </button>
            <button
              onClick={() => setShowRuinedModal(false)}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                background: "transparent",
                border: "1px solid rgba(100,100,100,0.3)",
                color: "#666",
                fontSize: "10px",
                fontWeight: 300,
                cursor: "pointer",
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {showProperModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(218,165,32,0.3)",
              padding: "30px",
              textAlign: "center",
              maxWidth: "300px",
              width: "90%",
            }}
          >
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                color: "#daa520",
                fontSize: "18px",
                marginBottom: "20px",
                letterSpacing: "2px",
              }}
            >
              LAST PROPER
            </div>
            <button
              onClick={() => {
                setShowProperModal(false);
                setTimeout(
                  () =>
                    document.getElementById("last-proper-input").showPicker(),
                  100,
                );
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                background: "transparent",
                border: "1px solid rgba(218,165,32,0.45)",
                color: "#daa520",
                fontSize: "10px",
                fontWeight: 300,
                cursor: "pointer",
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              SET DATE
            </button>
            <button
              onClick={() => {
                setLastProperDate("");
                updateSupabase({ last_proper_date: "" });
                setShowProperModal(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                background: "transparent",
                border: "1px solid rgba(218,165,32,0.45)",
                color: "#daa520",
                fontSize: "10px",
                fontWeight: 300,
                cursor: "pointer",
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              NOT TRACKING
            </button>
            <button
              onClick={() => setShowProperModal(false)}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                background: "transparent",
                border: "1px solid rgba(100,100,100,0.3)",
                color: "#666",
                fontSize: "10px",
                fontWeight: 300,
                cursor: "pointer",
                fontFamily: '"Montserrat", sans-serif',
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
