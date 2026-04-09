import React from "react";

const DayCounter = ({
  label,
  days,
  best,
  isEditor,
  onClick,
  dateInputId,
  dateValue,
  onDateChange,
  inputRef,
}) => {
  return (
    <div
      className="day-count"
      onClick={onClick}
      style={{ cursor: isEditor ? "pointer" : "default" }}
    >
      <div className="day-count-label">{label}</div>
      {isEditor && (
        <input
          type="date"
          id={dateInputId}
          ref={inputRef}
          className="date-input"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
        />
      )}
      <div className="day-count-number" id={`${dateInputId}-display`}>
        {days}
      </div>
      <div className="day-count-best">LONGEST: {best}</div>
    </div>
  );
};

export default DayCounter;
