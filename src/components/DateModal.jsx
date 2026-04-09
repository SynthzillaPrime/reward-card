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
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-title">{title}</div>
        <button onClick={onSetDate} className="modal-btn">
          SET DATE
        </button>
        <button onClick={onClear} className="modal-btn">
          {clearLabel}
        </button>
        <button onClick={onClose} className="modal-btn modal-btn-cancel">
          CANCEL
        </button>
      </div>
    </div>
  );
};

export default DateModal;
