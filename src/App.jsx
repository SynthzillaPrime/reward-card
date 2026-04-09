import React, { useRef } from "react";
import SpinWheel from "./SpinWheel";
import DateModal from "./components/DateModal";
import DayCounter from "./components/DayCounter";
import { useRewardCard } from "./hooks/useRewardCard";
import "./App.css";

function App() {
  const {
    isLoading,
    showUnlock,
    isFadingOut,
    stampedIndices,
    lastRuinedDate,
    lastProperDate,
    lockedDate,
    lastReward,
    bestLocked,
    bestRuined,
    bestProper,
    totalDaysLocked,
    showWheel,
    showLockModal,
    showRuinedModal,
    showProperModal,
    isEditor,
    totalKeys,
    stampCount,
    isUnlocked,
    calculateDays,
    handleEditorLogin,
    toggleStamp,
    resetCard,
    handleWheelReset,
    handleDateChange,
    setShowWheel,
    setShowLockModal,
    setShowRuinedModal,
    setShowProperModal,
    clearLockedDate,
    clearRuinedDate,
    clearProperDate,
  } = useRewardCard();

  const lockedInputRef = useRef(null);
  const ruinedInputRef = useRef(null);
  const properInputRef = useRef(null);

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
          <DayCounter
            label="DAYS LOCKED"
            days={calculateDays(lockedDate)}
            best={bestLocked}
            isEditor={isEditor}
            onClick={() => isEditor && setShowLockModal(true)}
            dateInputId="locked-input"
            dateValue={lockedDate}
            onDateChange={(val) => handleDateChange("locked", val)}
            inputRef={lockedInputRef}
          />
          <DayCounter
            label="LAST RUINED"
            days={calculateDays(lastRuinedDate)}
            best={bestRuined}
            isEditor={isEditor}
            onClick={() => isEditor && setShowRuinedModal(true)}
            dateInputId="last-ruined-input"
            dateValue={lastRuinedDate}
            onDateChange={(val) => handleDateChange("ruined", val)}
            inputRef={ruinedInputRef}
          />
          <DayCounter
            label="LAST PROPER"
            days={calculateDays(lastProperDate)}
            best={bestProper}
            isEditor={isEditor}
            onClick={() => isEditor && setShowProperModal(true)}
            dateInputId="last-proper-input"
            dateValue={lastProperDate}
            onDateChange={(val) => handleDateChange("proper", val)}
            inputRef={properInputRef}
          />
        </div>

        <div className="total-days-locked">
          TOTAL DAYS LOCKED: {totalDaysLocked + calculateDays(lockedDate)}
        </div>

        <div className="fine-print">
          Keys may be removed or reset at Bae's discretion without warning or
          explanation.
        </div>
      </div>

      <DateModal
        title="DAYS LOCKED"
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onSetDate={() => {
          setShowLockModal(false);
          lockedInputRef.current?.showPicker();
        }}
        onClear={clearLockedDate}
        clearLabel="NOT LOCKED"
      />

      <DateModal
        title="LAST RUINED"
        isOpen={showRuinedModal}
        onClose={() => setShowRuinedModal(false)}
        onSetDate={() => {
          setShowRuinedModal(false);
          ruinedInputRef.current?.showPicker();
        }}
        onClear={clearRuinedDate}
        clearLabel="NOT TRACKING"
      />

      <DateModal
        title="LAST PROPER"
        isOpen={showProperModal}
        onClose={() => setShowProperModal(false)}
        onSetDate={() => {
          setShowProperModal(false);
          properInputRef.current?.showPicker();
        }}
        onClear={clearProperDate}
        clearLabel="NOT TRACKING"
      />
    </>
  );
}

export default App;
