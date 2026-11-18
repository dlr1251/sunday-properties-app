import { useEffect, type RefObject } from 'react';

type GazeTarget = {
  root: Element;
  face: SVGElement;
  left: SVGElement;
  right: SVGElement;
  curX: number;
  curY: number;
  cx: number;
  cy: number;
};

const pointer = { x: 0, y: 0, active: false };
const targets = new Set<GazeTarget>();

let attached = 0;
let raf = 0;
let idleTimer = 0;
let lastRectAt = 0;
let listenersBound = false;

const IDLE_MS = 2200;
const LERP = 0.1;
const FACE = 1.7;
const EYE = 5.1;
const EPS = 0.008;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function refreshRects(now: number): void {
  if (now - lastRectAt < 200) return;
  lastRectAt = now;
  for (const target of targets) {
    const rect = target.root.getBoundingClientRect();
    target.cx = rect.left + rect.width / 2;
    target.cy = rect.top + rect.height / 2;
  }
}

function applyTarget(target: GazeTarget, tx: number, ty: number): void {
  target.curX += (tx - target.curX) * LERP;
  target.curY += (ty - target.curY) * LERP;
  if (Math.abs(target.curX) < EPS) target.curX = 0;
  if (Math.abs(target.curY) < EPS) target.curY = 0;
  const fx = target.curX * FACE;
  const fy = target.curY * FACE * 0.85;
  const ex = target.curX * EYE;
  const ey = target.curY * EYE * 0.82;
  target.face.setAttribute('transform', `translate(${fx} ${fy})`);
  target.left.setAttribute('transform', `translate(${ex} ${ey})`);
  target.right.setAttribute('transform', `translate(${ex} ${ey})`);
}

function frame(now: number): void {
  refreshRects(now);
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  for (const target of targets) {
    const tx = pointer.active ? clamp((pointer.x - target.cx) / (vw * 0.34), -1, 1) : 0;
    const ty = pointer.active ? clamp((pointer.y - target.cy) / (vh * 0.34), -1, 1) : 0;
    applyTarget(target, tx, ty);
  }
  raf = targets.size > 0 ? window.requestAnimationFrame(frame) : 0;
}

function ensureLoop(): void {
  if (raf || targets.size === 0) return;
  raf = window.requestAnimationFrame(frame);
}

function onPointer(event: PointerEvent): void {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
  if (idleTimer) window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    pointer.active = false;
  }, IDLE_MS);
}

function onLeave(): void {
  pointer.active = false;
}

function bindListeners(): void {
  if (listenersBound || typeof window === 'undefined') return;
  listenersBound = true;
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });
  window.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);
}

function unbindListeners(): void {
  if (!listenersBound || attached > 0) return;
  listenersBound = false;
  window.removeEventListener('pointermove', onPointer);
  window.removeEventListener('pointerdown', onPointer);
  window.removeEventListener('pointerleave', onLeave);
  window.removeEventListener('blur', onLeave);
  if (idleTimer) window.clearTimeout(idleTimer);
  pointer.active = false;
}

export type SunnyGazeRefs = {
  root: RefObject<Element | null>;
  face: RefObject<SVGElement | null>;
  left: RefObject<SVGElement | null>;
  right: RefObject<SVGElement | null>;
};

/** Shared pointer + one rAF loop. Mutates SVG transforms; does not setState. */
export function useSunnyGaze(refs: SunnyGazeRefs, enabled: boolean): void {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const root = refs.root.current;
    const face = refs.face.current;
    const left = refs.left.current;
    const right = refs.right.current;
    if (!root || !face || !left || !right) return;

    const target: GazeTarget = {
      root,
      face,
      left,
      right,
      curX: 0,
      curY: 0,
      cx: 0,
      cy: 0,
    };
    attached += 1;
    bindListeners();
    targets.add(target);
    lastRectAt = 0;
    ensureLoop();

    return () => {
      targets.delete(target);
      attached = Math.max(0, attached - 1);
      if (targets.size === 0 && raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      unbindListeners();
    };
  }, [enabled, refs.face, refs.left, refs.right, refs.root]);
}
