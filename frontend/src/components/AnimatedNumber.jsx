import React, { useEffect, useState, useRef } from 'react';

/**
 * Parses numeric strings like "₹6,100", "29 kg", "+18%", "820 MW"
 */
function parseNumberParts(val) {
  if (typeof val === 'number') {
    return { prefix: '', number: val, suffix: '', decimals: Number.isInteger(val) ? 0 : 1, hasCommas: false };
  }
  if (typeof val !== 'string') return null;
  const match = val.match(/^([^\d-]*)([-+]?\d[\d,]*\.?\d*)(.*)$/);
  if (!match) return null;
  const prefix = match[1];
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3];
  const number = parseFloat(numStr);
  if (isNaN(number)) return null;
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const hasCommas = match[2].includes(',');
  return { prefix, number, suffix, decimals, hasCommas };
}

export default function AnimatedNumber({ value, duration = 500, className = '' }) {
  const parsed = parseNumberParts(value);
  const [displayNumber, setDisplayNumber] = useState(parsed ? parsed.number : 0);
  const prevNumberRef = useRef(parsed ? parsed.number : 0);
  const animRef = useRef(null);

  useEffect(() => {
    if (!parsed) return;
    const startNum = prevNumberRef.current;
    const targetNum = parsed.number;
    prevNumberRef.current = targetNum;

    if (startNum === targetNum) {
      setDisplayNumber(targetNum);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startNum + (targetNum - startNum) * ease;

      setDisplayNumber(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayNumber(targetNum);
      }
    };

    animRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [value, duration]);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  let formattedNum = parsed.decimals > 0
    ? displayNumber.toFixed(parsed.decimals)
    : Math.round(displayNumber).toString();

  if (parsed.hasCommas) {
    const parts = formattedNum.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formattedNum = parts.join('.');
  }

  return (
    <span className={`animated-number-wrapper tabular-nums ${className}`}>
      {parsed.prefix}
      {formattedNum}
      {parsed.suffix}
    </span>
  );
}
