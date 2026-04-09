import { useState, useCallback } from "react";

export const useWheelSpin = (prizes) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);

  const TOTAL_WEIGHT = prizes.reduce((sum, p) => sum + p.weight, 0);

  const spin = useCallback(() => {
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
        let landedPrize = prizes[0];
        for (let i = 0; i < prizes.length; i++) {
          cumAngle += (prizes[i].weight / TOTAL_WEIGHT) * 360;
          if (pointerAngle < cumAngle) {
            landedPrize = prizes[i];
            break;
          }
        }

        setSelectedPrize(landedPrize);
        setIsSpinning(false);
      }
    };

    animate();
  }, [isSpinning, rotation, prizes, TOTAL_WEIGHT]);

  return {
    rotation,
    isSpinning,
    selectedPrize,
    spin,
  };
};
