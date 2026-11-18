import React, { useEffect, useId, useRef } from 'react';

import { useSunnyGaze } from './useSunnyGaze';
import './sunny-face.css';

export type SunnyFaceVariant = 'interactive' | 'static';

export type SunnyFaceProps = {
  size?: number;
  variant?: SunnyFaceVariant;
  thinking?: boolean;
  className?: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

export function SunnyFace({
  size = 64,
  variant = 'interactive',
  thinking = false,
  className = '',
}: SunnyFaceProps) {
  const rawId = useId().replace(/:/g, '');
  const uid = `sunny-${rawId}`;
  const reducedMotion = usePrefersReducedMotion();
  const interactive = variant === 'interactive';
  const track = interactive && !reducedMotion;

  const rootRef = useRef<HTMLSpanElement>(null);
  const faceRef = useRef<SVGGElement>(null);
  const leftRef = useRef<SVGGElement>(null);
  const rightRef = useRef<SVGGElement>(null);

  useSunnyGaze(
    { root: rootRef, face: faceRef, left: leftRef, right: rightRef },
    track,
  );

  useEffect(() => {
    if (!interactive) return;
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    const timers = new Set<number>();

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const blinkOnce = (then: () => void) => {
      if (cancelled) return;
      root.classList.add('is-blinking');
      later(() => {
        root.classList.remove('is-blinking');
        then();
      }, 130);
    };

    const arm = () => {
      later(() => {
        const twice = Math.random() < 0.2;
        blinkOnce(() => {
          if (twice) later(() => blinkOnce(arm), 160);
          else arm();
        });
      }, 2400 + Math.random() * 4200);
    };

    arm();
    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
      root.classList.remove('is-blinking');
    };
  }, [interactive]);

  const onPointerDown = () => {
    if (!interactive || reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;
    root.classList.remove('is-bounce');
    void root.offsetWidth;
    root.classList.add('is-bounce');
  };

  const classes = [
    'sunny-face-wrap',
    interactive ? 'is-interactive' : 'is-static',
    thinking ? 'is-thinking' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      ref={rootRef}
      className={classes}
      style={{ width: size, height: size }}
      data-testid="sunny-face"
      data-variant={variant}
      onPointerDown={onPointerDown}
      onAnimationEnd={(event) => {
        if (event.animationName === 'sunny-squash') {
          event.currentTarget.classList.remove('is-bounce');
        }
      }}
    >
      <span className={interactive && !reducedMotion ? 'sunny-breathe block h-full w-full' : 'block h-full w-full'}>
        <span className="sunny-squash block h-full w-full">
          <svg
            className="sunny-face-svg"
            viewBox="0 0 128 128"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id={`${uid}-bg`} x1="18%" y1="0%" x2="86%" y2="100%">
                <stop offset="0%" stopColor="#1a2441" />
                <stop offset="55%" stopColor="#164a7b" />
                <stop offset="100%" stopColor="#1d6fd0" />
              </linearGradient>
              <linearGradient id={`${uid}-face`} x1="30%" y1="8%" x2="70%" y2="100%">
                <stop offset="0%" stopColor="#f5d15a" />
                <stop offset="100%" stopColor="#f0a80d" />
              </linearGradient>
              <radialGradient id={`${uid}-sheen`} cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#fff6c4" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#f0a80d" stopOpacity="0" />
              </radialGradient>
              <clipPath id={`${uid}-disc`}>
                <circle cx="64" cy="64" r="64" />
              </clipPath>
            </defs>

            <g clipPath={`url(#${uid}-disc)`}>
              <circle cx="64" cy="64" r="64" fill={`url(#${uid}-bg)`} />

              <g className="sunny-marks" stroke="#f5d15a" fill="none" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="54,18 64,9 74,18" />
                <path d="M29 36 L29 25 L41 25" />
                <path d="M99 36 L99 25 L87 25" />
                <circle cx="20" cy="66" r="6" strokeWidth="3.2" />
                <circle cx="108" cy="66" r="6" strokeWidth="3.2" />
              </g>

              <g ref={faceRef}>
                <circle cx="64" cy="70" r="32.5" fill={`url(#${uid}-face)`} />
                <circle cx="64" cy="70" r="32.5" fill={`url(#${uid}-sheen)`} />

                <g ref={leftRef}>
                  <g className="sunny-eye-blink">
                    <g className="sunny-eye-scale">
                      <ellipse cx="52" cy="67.5" rx="9.6" ry="11.6" fill="#1a2441" />
                      <circle cx="55.8" cy="62.8" r="3.4" fill="#ffffff" />
                      <circle cx="49" cy="71.4" r="1.1" fill="#ffffff" fillOpacity="0.9" />
                    </g>
                  </g>
                </g>

                <g ref={rightRef}>
                  <g className="sunny-eye-blink">
                    <g className="sunny-eye-scale">
                      <ellipse cx="76" cy="67.5" rx="9.6" ry="11.6" fill="#1a2441" />
                      <circle cx="79.8" cy="62.8" r="3.4" fill="#ffffff" />
                      <circle cx="73" cy="71.4" r="1.1" fill="#ffffff" fillOpacity="0.9" />
                    </g>
                  </g>
                </g>

                <path
                  className="sunny-smile"
                  d="M55 81.8 Q64 86.4 73 81.8"
                  fill="none"
                  stroke="#1a2441"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />
                <path
                  className="sunny-smile-wide"
                  d="M53 81 Q64 91 75 81"
                  fill="none"
                  stroke="#1a2441"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                <path className="sunny-sparkle" d="M28 48 l1.1 2.8 3 1.1-3 1.1-1.1 2.8-1.1-2.8-3-1.1 3-1.1z" fill="#ffffff" />
                <path className="sunny-sparkle" d="M100 46 l0.9 2.3 2.5 0.9-2.5 0.9-0.9 2.3-0.9-2.3-2.5-0.9 2.5-0.9z" fill="#ffffff" />
              </g>
            </g>
          </svg>
        </span>
      </span>
    </span>
  );
}

export default SunnyFace;
