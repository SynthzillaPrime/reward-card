import React from "react";

const DateModal = ({
  title,
  isOpen,
  onClose,
  onSetDate,
  onClear,
  clearLabel,
}) => {
  if (!isOpen) return null;

  return (
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
          {title}
        </div>
        <button
          onClick={onSetDate}
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
          onClick={onClear}
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
          {clearLabel}
        </button>
        <button
          onClick={onClose}
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
  );
};

export default DateModal;
