import React from "react";
import { useWheelSpin } from "./hooks/useWheelSpin";

const PRIZES = [
  { name: "Handjob", weight: 20, color: "#4A1A2A", showText: true },
  { name: "Blowjob", weight: 15, color: "#2a1a00", showText: true },
  { name: "Facesitting", weight: 15, color: "#2e1a2e", showText: true },
  { name: "Pegging", weight: 12, color: "#1a2e1a", showText: true },
  { name: "Self Facial", weight: 10, color: "#2e2a1a", showText: true },
  { name: "Bae Body Worship", weight: 8, color: "#1a1a2e", showText: true },
  { name: "PIV", weight: 8, color: "#1a2e2e", showText: true },
  { name: "The Ruin", weight: 5, color: "#3a1a1a", showText: true },
  { name: "Anal", weight: 3, color: "#8B7335", showText: false },
  { name: "Best Bae's Choice", weight: 2, color: "#1e1e1e", showText: false },
  { name: "The Bae's Choice", weight: 2, color: "#2a2a2a", showText: false },
];

const TOTAL_WEIGHT = PRIZES.reduce((sum, p) => sum + p.weight, 0);

function SpinWheel({ onReset }) {
  const { rotation, isSpinning, selectedPrize, spin } = useWheelSpin(PRIZES);

  // Generate wheel slices
  const radius = 180;
  const centerX = 200;
  const centerY = 200;

  let currentAngle = 0;
  const slices = PRIZES.map((prize) => {
    const sliceAngle = (prize.weight / TOTAL_WEIGHT) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const midAngle = (startAngle + endAngle) / 2;

    // Create path for slice
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    // Text position (70% of radius from center)
    const textRadius = radius * 0.7;
    const textAngle = ((midAngle - 90) * Math.PI) / 180;
    const textX = centerX + textRadius * Math.cos(textAngle);
    const textY = centerY + textRadius * Math.sin(textAngle);

    // Text rotation flip on left side
    let textRotation = midAngle + 90;
    if (midAngle > 90 && midAngle < 270) {
      textRotation = midAngle - 90;
    }

    currentAngle = endAngle;

    return {
      path,
      color: prize.color,
      textX,
      textY,
      textRotation,
      name: prize.name,
      weight: prize.weight,
      showText: prize.showText,
    };
  });

  return (
    <div className="wheel-container">
      <div className="wheel-content">
        <h1 className="wheel-title">CLAIM REWARD</h1>
        <p className="wheel-subtitle">ALL 10 KEYS EARNED — SPIN TO REVEAL</p>

        <div className="wheel-wrapper">
          <div className="wheel-pointer">▼</div>

          <svg
            viewBox="0 0 400 400"
            className="wheel-svg"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? "none" : "transform 0.3s ease-out",
            }}
          >
            {slices.map((slice, i) => (
              <g key={i}>
                <path
                  d={slice.path}
                  fill={slice.color}
                  stroke="rgba(218,165,32,0.3)"
                  strokeWidth="1.5"
                />
                {slice.showText && (
                  <g
                    transform={`translate(${slice.textX}, ${slice.textY}) rotate(${slice.textRotation})`}
                  >
                    {slice.name.split(" ").length > 2 ? (
                      <>
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#daa520"
                          className="wheel-svg-text-small"
                          y="-16"
                        >
                          {slice.name
                            .split(" ")
                            .slice(
                              0,
                              Math.ceil(slice.name.split(" ").length / 2),
                            )
                            .join(" ")}
                        </text>
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#daa520"
                          className="wheel-svg-text-small"
                          y="0"
                        >
                          {slice.name
                            .split(" ")
                            .slice(Math.ceil(slice.name.split(" ").length / 2))
                            .join(" ")}
                        </text>
                      </>
                    ) : (
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#daa520"
                        className="wheel-svg-text"
                        y="-8"
                      >
                        {slice.name}
                      </text>
                    )}
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(218,165,32,0.5)"
                      className="wheel-svg-weight"
                      y="14"
                    >
                      {slice.weight}%
                    </text>
                  </g>
                )}
              </g>
            ))}

            <circle
              cx={centerX}
              cy={centerY}
              r="45"
              fill="#0f0f0f"
              stroke="#daa520"
              strokeWidth="2"
            />

            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="wheel-center-emoji"
            >
              🗝️
            </text>

            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="rgba(218,165,32,0.5)"
              strokeWidth="2"
              className="wheel-outer-ring"
            />
          </svg>
        </div>

        <div className="wheel-legend">
          {PRIZES.filter((p) => !p.showText).map((prize, i) => (
            <div key={i} className="wheel-legend-item">
              <div
                className="wheel-legend-swatch"
                style={{ backgroundColor: prize.color }}
              />
              <span className="wheel-legend-text">
                {prize.name} ({prize.weight}%)
              </span>
            </div>
          ))}
        </div>

        {selectedPrize && (
          <div className="wheel-result">{selectedPrize.name}</div>
        )}

        <button
          onClick={selectedPrize ? () => onReset(selectedPrize.name) : spin}
          disabled={isSpinning}
          className="wheel-btn"
        >
          {selectedPrize ? "RESET KEYS" : "SPIN THE WHEEL"}
        </button>

        <p className="wheel-disclaimer">
          Results are final. No re-spins. Bae's discretion applies.
        </p>
      </div>
    </div>
  );
}

export default SpinWheel;
