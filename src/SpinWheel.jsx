import { useState } from "react";

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
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedPrize(null);

    const spins = 8 + Math.random() * 4;
    const randomAngle = Math.random() * 360;
    const startRotation = rotation;
    const currentAngleMod = ((startRotation % 360) + 360) % 360;
    let extraRotation = randomAngle - currentAngleMod;
    if (extraRotation < 0) extraRotation += 360;
    const targetRotation = spins * 360 + extraRotation;

    const startTime = Date.now();
    const duration = 10000;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const currentRotation = startRotation + targetRotation * eased;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Determine prize from final visual position
        const finalAngleMod = ((currentRotation % 360) + 360) % 360;
        const pointerAngle = (((360 - finalAngleMod) % 360) + 360) % 360;

        let cumAngle = 0;
        let landedPrize = PRIZES[0];
        for (let i = 0; i < PRIZES.length; i++) {
          cumAngle += (PRIZES[i].weight / TOTAL_WEIGHT) * 360;
          if (pointerAngle < cumAngle) {
            landedPrize = PRIZES[i];
            break;
          }
        }

        setSelectedPrize(landedPrize);
        setIsSpinning(false);
      }
    };

    animate();
  };

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

    // THIS WAS THE ISSUE - text needs to flip on left side
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
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>CLAIM REWARD</h1>
        <p style={styles.subtitle}>ALL 10 KEYS EARNED — SPIN TO REVEAL</p>

        <div style={styles.wheelWrapper}>
          <div style={styles.pointer}>▼</div>

          <svg
            viewBox="0 0 400 400"
            style={{
              ...styles.svg,
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
                          style={{
                            fontFamily: '"Cormorant Garamond", serif',
                            fontSize: "16px",
                            fontWeight: 300,
                          }}
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
                          style={{
                            fontFamily: '"Cormorant Garamond", serif',
                            fontSize: "16px",
                            fontWeight: 300,
                          }}
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
                        style={{
                          fontFamily: '"Cormorant Garamond", serif',
                          fontSize: "18px",
                          fontWeight: 300,
                        }}
                        y="-8"
                      >
                        {slice.name}
                      </text>
                    )}
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(218,165,32,0.5)"
                      style={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontSize: "11px",
                      }}
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
              style={{ fontSize: "32px" }}
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
              style={{ filter: "drop-shadow(0 0 10px rgba(218,165,32,0.3))" }}
            />
          </svg>
        </div>

        <div style={styles.legend}>
          {PRIZES.filter((p) => !p.showText).map((prize, i) => (
            <div key={i} style={styles.legendItem}>
              <div style={{ ...styles.swatch, backgroundColor: prize.color }} />
              <span style={styles.legendText}>
                {prize.name} ({prize.weight}%)
              </span>
            </div>
          ))}
        </div>

        {selectedPrize && <div style={styles.result}>{selectedPrize.name}</div>}

        <button
          onClick={
            selectedPrize ? () => onReset(selectedPrize.name) : spinWheel
          }
          disabled={isSpinning}
          style={{
            ...styles.button,
            ...(isSpinning && styles.buttonDisabled),
          }}
        >
          {selectedPrize ? "RESET KEYS" : "SPIN THE WHEEL"}
        </button>

        <p style={styles.disclaimer}>
          Results are final. No re-spins. Bae's discretion applies.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(165deg, #1a1a1a 0%, #0f0f0f 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: "28px",
    fontWeight: 300,
    color: "#daa520",
    margin: 0,
    letterSpacing: "6px",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: "9px",
    color: "#888",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginTop: "8px",
    marginBottom: "30px",
    fontFamily: '"Montserrat", sans-serif',
  },
  wheelWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: "25px",
  },
  pointer: {
    position: "absolute",
    top: "5px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "32px",
    color: "#daa520",
    zIndex: 10,
    filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.8))",
  },
  svg: {
    width: "100%",
    height: "auto",
    filter: "drop-shadow(0 5px 20px rgba(0,0,0,0.5))",
  },
  legend: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  swatch: {
    width: "18px",
    height: "18px",
    borderRadius: "2px",
    border: "1px solid rgba(218,165,32,0.25)",
  },
  legendText: {
    fontSize: "9px",
    color: "#888",
    fontFamily: '"Montserrat", sans-serif',
    letterSpacing: "0.5px",
  },
  result: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: "32px",
    fontWeight: 300,
    color: "#daa520",
    marginBottom: "20px",
    textAlign: "center",
    letterSpacing: "3px",
    textTransform: "uppercase",
  },
  button: {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: "10px",
    fontWeight: 300,
    color: "#daa520",
    background: "transparent",
    border: "1px solid rgba(218,165,32,0.45)",
    padding: "14px 50px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "15px",
  },
  buttonDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  disclaimer: {
    fontSize: "8px",
    color: "#666",
    textAlign: "center",
    fontFamily: '"Montserrat", sans-serif',
    letterSpacing: "0.5px",
    lineHeight: "1.4",
  },
};

export default SpinWheel;
