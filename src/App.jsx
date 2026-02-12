import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tick, setTick] = useState(0);
  const [stampedIndices, setStampedIndices] = useState(() => {
    const saved = localStorage.getItem("stampedIndices");
    return saved ? JSON.parse(saved) : [];
  });
  const [lastRuinedDate, setLastRuinedDate] = useState(
    localStorage.getItem("lastRuinedDate") || "",
  );
  const [lastProperDate, setLastProperDate] = useState(
    localStorage.getItem("lastProperDate") || "",
  );
  const [lockedDate, setLockedDate] = useState(
    localStorage.getItem("lockedDate") || "",
  );

  const totalKeys = 10;

  useEffect(() => {
    localStorage.setItem("stampedIndices", JSON.stringify(stampedIndices));
  }, [stampedIndices]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 3600000); // Once per hour

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

  const toggleStamp = (index) => {
    if (stampedIndices.includes(index)) {
      setStampedIndices(stampedIndices.filter((i) => i !== index));
    } else {
      setStampedIndices([...stampedIndices, index]);
    }
  };

  const resetCard = () => {
    if (confirm("Reset the card? This will clear all keys.")) {
      setStampedIndices([]);
      localStorage.removeItem("stampedIndices");
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
    if (type === "ruined") {
      setLastRuinedDate(value);
      localStorage.setItem("lastRuinedDate", value);
    } else if (type === "proper") {
      setLastProperDate(value);
      localStorage.setItem("lastProperDate", value);
    } else {
      setLockedDate(value);
      localStorage.setItem("lockedDate", value);
    }
  };

  return (
    <div className="card">
      <div className="header">
        <span className="lock-icon">🔒</span>
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
            onClick={() => toggleStamp(index)}
          >
            <span className="key">🗝️</span>
          </div>
        ))}
      </div>

      <button className="reset-btn" onClick={resetCard}>
        RESET KEYS
      </button>

      <div className="days-tracker">
        <div
          className="day-count"
          onClick={() => document.getElementById("locked-input").showPicker()}
        >
          <div className="day-count-label">DAYS LOCKED</div>
          <input
            type="date"
            id="locked-input"
            className="date-input"
            value={lockedDate}
            onChange={(e) => handleDateChange("locked", e.target.value)}
          />
          <div className="day-count-number" id="locked-display">
            {calculateDays(lockedDate)}
          </div>
        </div>
        <div
          className="day-count"
          onClick={() =>
            document.getElementById("last-ruined-input").showPicker()
          }
        >
          <div className="day-count-label">LAST RUINED</div>
          <input
            type="date"
            id="last-ruined-input"
            className="date-input"
            value={lastRuinedDate}
            onChange={(e) => handleDateChange("ruined", e.target.value)}
          />
          <div className="day-count-number" id="last-ruined-display">
            {calculateDays(lastRuinedDate)}
          </div>
        </div>
        <div
          className="day-count"
          onClick={() =>
            document.getElementById("last-proper-input").showPicker()
          }
        >
          <div className="day-count-label">LAST PROPER</div>
          <input
            type="date"
            id="last-proper-input"
            className="date-input"
            value={lastProperDate}
            onChange={(e) => handleDateChange("proper", e.target.value)}
          />
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
