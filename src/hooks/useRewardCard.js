import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabase";

export const useRewardCard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showUnlock, setShowUnlock] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [stampedIndices, setStampedIndices] = useState([]);
  const [lastRuinedDate, setLastRuinedDate] = useState("");
  const [lastProperDate, setLastProperDate] = useState("");
  const [lockedDate, setLockedDate] = useState("");
  const [lastReward, setLastReward] = useState("");
  const [correctPin, setCorrectPin] = useState("");
  const [bestLocked, setBestLocked] = useState(0);
  const [bestRuined, setBestRuined] = useState(0);
  const [bestProper, setBestProper] = useState(0);
  const [totalDaysLocked, setTotalDaysLocked] = useState(0);
  const [showWheel, setShowWheel] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showRuinedModal, setShowRuinedModal] = useState(false);
  const [showProperModal, setShowProperModal] = useState(false);
  const [isEditor, setIsEditor] = useState(() => {
    return sessionStorage.getItem("isEditor") === "true";
  });

  const totalKeys = 10;
  const pendingUpdates = useRef({});
  const debounceTimer = useRef(null);
  const bestRef = useRef({ locked: 0, ruined: 0, proper: 0 });

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

  const flushUpdates = useCallback(async () => {
    if (Object.keys(pendingUpdates.current).length === 0) return;

    const updates = { ...pendingUpdates.current };
    pendingUpdates.current = {};

    const { error } = await supabase
      .from("reward_card")
      .update(updates)
      .eq("id", 1);

    if (error) {
      console.error("Error updating Supabase:", error);
      // Optional: restore pending updates on failure
      pendingUpdates.current = { ...updates, ...pendingUpdates.current };
    }
  }, []);

  const queueUpdate = useCallback(
    (updates) => {
      pendingUpdates.current = { ...pendingUpdates.current, ...updates };

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        flushUpdates();
      }, 300);
    },
    [flushUpdates],
  );

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
        setTotalDaysLocked(data.total_days_locked || 0);

        bestRef.current = {
          locked: data.best_locked || 0,
          ruined: data.best_ruined || 0,
          proper: data.best_proper || 0,
        };

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
    window.addEventListener("beforeunload", flushUpdates);

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
          setTotalDaysLocked(payload.new.total_days_locked || 0);

          bestRef.current = {
            locked: payload.new.best_locked || 0,
            ruined: payload.new.best_ruined || 0,
            proper: payload.new.best_proper || 0,
          };
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("beforeunload", flushUpdates);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [flushUpdates]);

  // Simplified streak check effect (on mount and visibility change)
  useEffect(() => {
    const checkStreaks = () => {
      const updates = {};
      const currentLockedDays = calculateDays(lockedDate);
      const currentRuinedDays = calculateDays(lastRuinedDate);
      const currentProperDays = calculateDays(lastProperDate);

      if (currentLockedDays > bestRef.current.locked) {
        updates.best_locked = currentLockedDays;
        setBestLocked(currentLockedDays);
        bestRef.current.locked = currentLockedDays;
      }
      if (currentRuinedDays > bestRef.current.ruined) {
        updates.best_ruined = currentRuinedDays;
        setBestRuined(currentRuinedDays);
        bestRef.current.ruined = currentRuinedDays;
      }
      if (currentProperDays > bestRef.current.proper) {
        updates.best_proper = currentProperDays;
        setBestProper(currentProperDays);
        bestRef.current.proper = currentProperDays;
      }

      if (Object.keys(updates).length > 0) {
        queueUpdate(updates);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkStreaks();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    checkStreaks();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [lockedDate, lastRuinedDate, lastProperDate, queueUpdate]);

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
    queueUpdate({ stamped_indices: newIndices });
  };

  const resetCard = () => {
    if (!isEditor) return;
    if (confirm("Reset the card? This will clear all keys.")) {
      setStampedIndices([]);
      queueUpdate({ stamped_indices: [] });
    }
  };

  const handleWheelReset = (prize) => {
    setLastReward(prize);
    setStampedIndices([]);
    setShowWheel(false);
    queueUpdate({
      last_reward: prize,
      stamped_indices: [],
    });
  };

  const handleDateChange = (type, value) => {
    if (!isEditor) return;

    if (type === "ruined") {
      setLastRuinedDate(value);
      queueUpdate({ last_ruined_date: value });
    } else if (type === "proper") {
      setLastProperDate(value);
      queueUpdate({ last_proper_date: value });
    } else {
      setLockedDate(value);
      queueUpdate({ locked_date: value });
    }
  };

  const clearLockedDate = () => {
    const currentStreak = calculateDays(lockedDate);
    const newTotal = totalDaysLocked + currentStreak;
    setTotalDaysLocked(newTotal);
    setLockedDate("");
    queueUpdate({
      locked_date: "",
      total_days_locked: newTotal,
    });
    setShowLockModal(false);
  };

  const clearRuinedDate = () => {
    setLastRuinedDate("");
    queueUpdate({ last_ruined_date: "" });
    setShowRuinedModal(false);
  };

  const clearProperDate = () => {
    setLastProperDate("");
    queueUpdate({ last_proper_date: "" });
    setShowProperModal(false);
  };

  const stampCount = stampedIndices.length;
  const isUnlocked = stampCount === totalKeys;

  return {
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
  };
};
