import { useEffect, useState, useCallback } from 'react';

interface RetroLoaderProps {
  duration?: number;
}

const DEFAULT_DURATION = 5000;

export default function RetroLoader(props: RetroLoaderProps = {}) {
  const duration = props.duration ?? DEFAULT_DURATION;
  const [progress, setProgress] = useState(0);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const dispatchDone = useCallback(() => {
    document.body.classList.remove('is-loading');
    (window as Window & { __portfolioLoaderDone?: boolean }).__portfolioLoaderDone = true;
    window.dispatchEvent(new CustomEvent('preloader:done'));
  }, []);

  useEffect(() => {
    document.body.classList.add('is-loading');

    const startTime = performance.now();
    let rafId: number;

    const updateProgress = (time: number) => {
      const elapsed = time - startTime;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);

      if (p < 1) {
        rafId = requestAnimationFrame(updateProgress);
      } else {
        setIsShuttingDown(true);
        setTimeout(() => {
          document.body.classList.remove('is-loading');
          setIsVisible(false);
          dispatchDone();
        }, 600);
      }
    };

    rafId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(rafId);
  }, [duration, dispatchDone]);

  if (!isVisible) return null;

  const counterStr = String(Math.floor(progress * 10000)).padStart(5, '0');
  const digits = counterStr.split('').map(Number);

  const getCounterColor = () => {
    if (progress < 0.5) {
      const t = progress * 2;
      const r = Math.round(255 + (255 - 255) * t);
      const g = Math.round(255 + (255 - 0) * t);
      const b = Math.round(255 + (0 - 255) * t);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const t = (progress - 0.5) * 2;
      const r = Math.round(255 + (255 - 255) * t);
      const g = Math.round(255 + (0 - 255) * t);
      const b = Math.round(255 + (0 - 0) * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const scannerPosition = progress * 100;

  return (
    <div
      className={`retro-loader ${isShuttingDown ? 'shutting-down' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0A0A0F',
        pointerEvents: 'all',
        overflow: 'hidden',
      }}
    >
      <div
        className="scanner-line"
        style={{ left: `${scannerPosition}%` }}
      />

      <div className="digit-container">
        {digits.map((digit, i) => (
          <div key={i} className="digit-wrapper">
            <div
              className="digit-glow"
              style={{ color: getCounterColor() }}
            >
              {digit}
            </div>
            <div
              className="digit-projection"
              style={{ color: getCounterColor() }}
            >
              {digit}
            </div>
            <div
              className="digit"
              style={{ color: getCounterColor() }}
            >
              {digit}
            </div>
          </div>
        ))}
        <div className="percent-sign">%</div>
      </div>

      <div className="scanline-overlay" />

      <style>{`
        @keyframes retro-flicker {
          0% { opacity: 0; }
          10% { opacity: 1; }
          15% { opacity: 0.8; }
          20% { opacity: 1; }
          50% { opacity: 0.95; }
          100% { opacity: 1; }
        }

        @keyframes crt-off {
          0% {
            transform: scale(1, 1);
            filter: brightness(1);
          }
          30% {
            transform: scale(1, 0.005);
            filter: brightness(3);
          }
          60% {
            transform: scale(0.005, 0.005);
            filter: brightness(5);
          }
          100% {
            transform: scale(0, 0);
            filter: brightness(0);
            opacity: 0;
          }
        }

        .retro-loader {
          animation: retro-flicker 0.15s ease-in-out;
        }

        .retro-loader.shutting-down {
          animation: crt-off 0.6s ease-in forwards;
        }

        .scanner-line {
          position: absolute;
          top: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(0, 255, 255, 0.3) 30%,
            rgba(0, 255, 255, 0.7) 50%,
            rgba(0, 255, 255, 0.3) 70%,
            transparent 100%
          );
          box-shadow:
            0 0 30px rgba(0, 255, 255, 0.5),
            0 0 60px rgba(0, 255, 255, 0.3),
            0 0 100px rgba(0, 255, 255, 0.2);
          transform: translateX(-50%);
          transition: left 200ms linear;
          z-index: 10;
        }

        .digit-container {
          position: absolute;
          top: 38%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: clamp(0.5rem, 3vw, 3rem);
        }

        .digit-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .digit {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: clamp(6rem, 25vw, 20rem);
          font-weight: 700;
          line-height: 1;
          text-shadow:
            0 0 20px currentColor,
            0 0 40px currentColor,
            0 0 60px currentColor;
        }

        .digit-glow {
          position: absolute;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: clamp(6rem, 25vw, 20rem);
          font-weight: 700;
          line-height: 1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          filter: blur(40px);
          opacity: 0.6;
          text-shadow: 0 0 60px currentColor;
        }

        .digit-projection {
          position: absolute;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: clamp(6rem, 25vw, 20rem);
          font-weight: 700;
          line-height: 1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(1.5);
          opacity: 0.15;
          mix-blend-mode: hard-light;
          text-shadow: 0 0 80px currentColor;
          filter: blur(2px);
        }

        .percent-sign {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: clamp(2rem, 10vw, 8rem);
          font-weight: 700;
          color: ${getCounterColor()};
          margin-left: clamp(0.5rem, 2vw, 2rem);
          text-shadow:
            0 0 15px currentColor,
            0 0 30px currentColor;
          align-self: flex-end;
          margin-bottom: 0.5rem;
        }

        .scanline-overlay {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 255, 0.03) 2px,
            rgba(0, 255, 255, 0.03) 4px
          );
          pointer-events: none;
          mix-blend-mode: overlay;
        }
      `}</style>
    </div>
  );
}