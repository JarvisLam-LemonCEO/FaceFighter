import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const DEFAULT_FACE_FIT = { x: 0, y: -5, zoom: 1.08 };

const BRUISE_PALETTES = [
  'radial-gradient(ellipse at 50% 45%, rgba(61,18,94,.92) 0%, rgba(119,35,74,.72) 42%, rgba(181,61,48,.28) 68%, transparent 82%)',
  'radial-gradient(ellipse at 46% 48%, rgba(37,22,92,.9) 0%, rgba(90,38,112,.74) 40%, rgba(159,49,61,.3) 69%, transparent 83%)',
  'radial-gradient(ellipse at 54% 42%, rgba(91,24,68,.9) 0%, rgba(134,42,61,.7) 43%, rgba(190,79,54,.25) 70%, transparent 84%)',
];

function generateRandomBruises(count = 9) {
  return Array.from({ length: count }, (_, index) => {
    // Keep marks inside the visible oval of the aligned face.
    const band = index % 3;
    const xRanges = band === 0 ? [14, 38] : band === 1 ? [38, 62] : [62, 86];
    return {
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
      x: xRanges[0] + Math.random() * (xRanges[1] - xRanges[0]),
      y: 18 + Math.random() * 60,
      width: 15 + Math.random() * 16,
      height: 8 + Math.random() * 13,
      rotation: -28 + Math.random() * 56,
      threshold: 7 + index * 8 + Math.random() * 6,
      strength: 0.58 + Math.random() * 0.34,
      palette: BRUISE_PALETTES[Math.floor(Math.random() * BRUISE_PALETTES.length)],
    };
  }).sort((a, b) => a.threshold - b.threshold);
}

function HealthBar({ label, value, align = 'left' }) {
  const pct = clamp(value, 0, 100);
  const bar = pct > 55 ? 'bg-emerald-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className={`w-full ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <div className="mb-1.5 flex items-end justify-between gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        <span>{label}</span>
        <span className="tabular-nums">{pct} HP</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-black/10 ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
        <div className={`h-full rounded-full transition-[width] duration-300 ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.4 14.4A8 8 0 0 1 9.6 3.6 8.5 8.5 0 1 0 20.4 14.4Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 16V4m0 0-4 4m4-4 4 4" />
      <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

function FaceImage({ image, fit, className = '' }) {
  if (!image) return null;
  return (
    <img
      src={image}
      alt="Uploaded opponent"
      draggable="false"
      className={`absolute inset-0 h-full w-full select-none object-cover ${className}`}
      style={{ transform: `translate(${fit.x}%, ${fit.y}%) scale(${fit.zoom})`, transformOrigin: '50% 50%' }}
    />
  );
}

function FaceEditor({ image, fit, setFit, onClose }) {
  const previewRef = useRef(null);
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);
  const fitRef = useRef(fit);

  useEffect(() => {
    fitRef.current = fit;
  }, [fit]);

  const applyFit = useCallback((nextFit) => {
    const safeFit = {
      x: clamp(Number.isFinite(nextFit.x) ? nextFit.x : 0, -40, 40),
      y: clamp(Number.isFinite(nextFit.y) ? nextFit.y : -5, -40, 40),
      zoom: clamp(Number.isFinite(nextFit.zoom) ? nextFit.zoom : 1.08, 1, 2.1),
    };
    fitRef.current = safeFit;
    setFit(safeFit);
  }, [setFit]);

  const beginSingleDrag = useCallback((pointer) => {
    if (!pointer) {
      gestureRef.current = null;
      return;
    }
    gestureRef.current = {
      type: 'drag',
      pointerId: pointer.id,
      startX: pointer.x,
      startY: pointer.y,
      startFit: { ...fitRef.current },
    };
  }, []);

  const beginPinch = useCallback(() => {
    const points = Array.from(pointersRef.current.values()).slice(0, 2);
    if (points.length < 2) return;
    const [a, b] = points;
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    gestureRef.current = {
      type: 'pinch',
      startDistance: Math.max(distance, 1),
      startCenterX: (a.x + b.x) / 2,
      startCenterY: (a.y + b.y) / 2,
      startFit: { ...fitRef.current },
    };
  }, []);

  const onPointerDown = (event) => {
    if (!previewRef.current) return;
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Some mobile browsers may reject capture during a gesture transition.
    }

    pointersRef.current.set(event.pointerId, {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size >= 2) {
      beginPinch();
    } else {
      beginSingleDrag(pointersRef.current.get(event.pointerId));
    }
  };

  const onPointerMove = (event) => {
    const pointer = pointersRef.current.get(event.pointerId);
    const preview = previewRef.current;
    if (!pointer || !preview) return;

    event.preventDefault();
    const nextPointer = { ...pointer, x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, nextPointer);

    const rect = preview.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    if (pointersRef.current.size >= 2) {
      if (gestureRef.current?.type !== 'pinch') beginPinch();
      const gesture = gestureRef.current;
      const points = Array.from(pointersRef.current.values()).slice(0, 2);
      if (!gesture || gesture.type !== 'pinch' || points.length < 2) return;

      const [a, b] = points;
      const distance = Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1);
      const centerX = (a.x + b.x) / 2;
      const centerY = (a.y + b.y) / 2;
      const scale = distance / gesture.startDistance;
      const dx = ((centerX - gesture.startCenterX) / rect.width) * 100;
      const dy = ((centerY - gesture.startCenterY) / rect.height) * 100;

      applyFit({
        x: gesture.startFit.x + dx,
        y: gesture.startFit.y + dy,
        zoom: gesture.startFit.zoom * scale,
      });
      return;
    }

    const gesture = gestureRef.current;
    if (!gesture || gesture.type !== 'drag' || gesture.pointerId !== event.pointerId) {
      beginSingleDrag(nextPointer);
      return;
    }

    const dx = ((event.clientX - gesture.startX) / rect.width) * 100;
    const dy = ((event.clientY - gesture.startY) / rect.height) * 100;
    applyFit({
      ...gesture.startFit,
      x: gesture.startFit.x + dx,
      y: gesture.startFit.y + dy,
    });
  };

  const endPointer = (event) => {
    // pointerup/pointercancel and lostpointercapture can arrive back-to-back.
    // Only process the first cleanup for a given pointer.
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.delete(event.pointerId);

    const remaining = Array.from(pointersRef.current.values());
    if (remaining.length >= 2) {
      beginPinch();
    } else if (remaining.length === 1) {
      beginSingleDrag(remaining[0]);
    } else {
      gestureRef.current = null;
    }
  };

  useEffect(() => () => {
    pointersRef.current.clear();
    gestureRef.current = null;
  }, []);

  return (
    <div
      className="fixed inset-0 z-[120] overflow-y-auto overscroll-y-contain bg-black/[.55] backdrop-blur-md"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div
        className="flex min-h-full w-full items-start justify-center px-3 sm:items-center sm:px-6"
        style={{
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="glass my-auto w-full max-w-[760px] rounded-[26px] border border-white/20 bg-white/95 p-4 shadow-2xl dark:border-white/10 dark:bg-zinc-950/95 sm:rounded-[30px] sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.22em] text-zinc-500 dark:text-zinc-400 sm:text-[11px]">Face alignment</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-.04em] sm:text-2xl">Fit the face inside the guide</h2>
              <p className="mt-1.5 max-w-xl text-xs leading-5 text-zinc-600 dark:text-zinc-300 sm:mt-2 sm:text-sm sm:leading-6">Drag with one finger to reposition. Pinch with two fingers to zoom, then line up the eyes and chin with the guide.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close face editor" className="grid h-10 w-10 shrink-0 touch-manipulation place-items-center rounded-full bg-black/[.06] text-xl active:scale-95 dark:bg-white/10">×</button>
          </div>

          <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 md:grid-cols-[minmax(0,1fr)_250px]">
            <div>
              <div
                ref={previewRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endPointer}
                onPointerCancel={endPointer}
                onLostPointerCapture={endPointer}
                className="relative mx-auto aspect-[4/5] w-[min(78vw,320px)] touch-none cursor-grab overflow-hidden rounded-[24px] bg-zinc-200 shadow-inner active:cursor-grabbing dark:bg-zinc-800 sm:w-full sm:max-w-[360px] sm:rounded-[28px]"
                style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
              >
                <FaceImage image={image} fit={fit} />
                <div className="pointer-events-none absolute inset-[9%_13%_8%] rounded-[46%_46%_48%_48%/38%_38%_58%_58%] border-2 border-dashed border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,.28)]" />
                <div className="pointer-events-none absolute left-[26%] right-[26%] top-[39%] border-t border-white/80" />
                <div className="pointer-events-none absolute bottom-[18%] left-1/2 top-[13%] border-l border-white/45" />
                <div className="pointer-events-none absolute left-1/2 top-[39%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/[.55] px-2 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-white">Eyes</div>
              </div>
              <p className="mt-2 text-center text-[11px] font-medium text-zinc-500 dark:text-zinc-400">1 finger: move · 2 fingers: pinch to zoom</p>
            </div>

            <div className="flex min-w-0 flex-col justify-between gap-4 sm:gap-5">
              <div className="space-y-4 sm:space-y-5">
                <label className="block text-sm font-semibold">
                  Zoom <span className="float-right tabular-nums text-zinc-500">{fit.zoom.toFixed(2)}×</span>
                  <input className="mt-2 h-8 w-full touch-manipulation accent-blue-600" type="range" min="1" max="2.1" step="0.01" value={fit.zoom} onChange={(e) => applyFit({ ...fitRef.current, zoom: Number(e.target.value) })} />
                </label>
                <label className="block text-sm font-semibold">
                  Horizontal <span className="float-right tabular-nums text-zinc-500">{Math.round(fit.x)}</span>
                  <input className="mt-2 h-8 w-full touch-manipulation accent-blue-600" type="range" min="-40" max="40" step="1" value={fit.x} onChange={(e) => applyFit({ ...fitRef.current, x: Number(e.target.value) })} />
                </label>
                <label className="block text-sm font-semibold">
                  Vertical <span className="float-right tabular-nums text-zinc-500">{Math.round(fit.y)}</span>
                  <input className="mt-2 h-8 w-full touch-manipulation accent-blue-600" type="range" min="-40" max="40" step="1" value={fit.y} onChange={(e) => applyFit({ ...fitRef.current, y: Number(e.target.value) })} />
                </label>
                <button type="button" onClick={() => applyFit(DEFAULT_FACE_FIT)} className="w-full touch-manipulation rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold active:scale-[.99] hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10">Reset alignment</button>
              </div>
              <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-white via-white/95 to-transparent px-1 pb-1 pt-3 dark:from-zinc-950 dark:via-zinc-950/95 md:static md:m-0 md:bg-none md:p-0">
                <button type="button" onClick={onClose} className="w-full touch-manipulation rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 active:scale-[.99] hover:bg-blue-500">Use this fit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaceDamage({ damage, bruises = [] }) {
  const early = clamp((damage - 4) / 24, 0, 1);
  const medium = clamp((damage - 18) / 32, 0, 1);
  const heavy = clamp((damage - 38) / 34, 0, 1);
  const severe = clamp((damage - 62) / 28, 0, 1);
  const noseBlood = clamp((damage - 28) / 32, 0, 1);
  const bloodHeavy = clamp((damage - 58) / 30, 0, 1);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]">
      {/* Randomized surface bruises. Positions are generated once per round so they do not jump around. */}
      {bruises.map((bruise) => {
        const reveal = clamp((damage - bruise.threshold) / 20, 0, 1);
        if (reveal <= 0) return null;
        return (
          <div
            key={bruise.id}
            className="absolute rounded-[50%] mix-blend-multiply blur-[1.25px]"
            style={{
              left: `${bruise.x - bruise.width / 2}%`,
              top: `${bruise.y - bruise.height / 2}%`,
              width: `${bruise.width}%`,
              height: `${bruise.height}%`,
              opacity: reveal * bruise.strength,
              transform: `rotate(${bruise.rotation}deg) scale(${0.82 + reveal * 0.28})`,
              background: bruise.palette,
            }}
          />
        );
      })}
      {/* Left eye / upper cheek */}
      <div
        className="absolute left-[10%] top-[27%] h-[24%] w-[38%] rounded-[48%] mix-blend-multiply blur-[1.4px]"
        style={{
          opacity: early * 0.92,
          transform: `scale(${1 + heavy * 0.16}) rotate(-5deg)`,
          background: 'radial-gradient(ellipse at 58% 43%, rgba(35,8,61,.98) 0%, rgba(76,29,149,.9) 27%, rgba(145,34,55,.68) 55%, rgba(185,56,45,.22) 72%, transparent 82%)',
        }}
      />
      <div
        className="absolute left-[12%] top-[31%] h-[10%] w-[33%] rounded-[50%] bg-[#431327] shadow-[0_8px_18px_rgba(63,8,28,.58)] blur-[1px]"
        style={{ opacity: medium * 0.94, transform: `scaleY(${1 + medium * 2.8 + severe * 1.35}) scaleX(${1 + heavy * 0.14})` }}
      />
      <div
        className="absolute left-[16%] top-[36.5%] h-[3.5%] w-[25%] rounded-full bg-black/90 blur-[.45px]"
        style={{ opacity: heavy * 0.88, transform: `scaleY(${1 + severe * 1.9})` }}
      />

      {/* Right eye / upper cheek */}
      <div
        className="absolute right-[9%] top-[26%] h-[25%] w-[39%] rounded-[48%] mix-blend-multiply blur-[1.5px]"
        style={{
          opacity: medium * 0.96,
          transform: `scale(${1 + heavy * 0.2}) rotate(5deg)`,
          background: 'radial-gradient(ellipse at 42% 45%, rgba(38,7,65,.99) 0%, rgba(86,28,143,.91) 29%, rgba(147,35,57,.7) 57%, rgba(189,61,46,.22) 73%, transparent 83%)',
        }}
      />
      <div
        className="absolute right-[11%] top-[31%] h-[10%] w-[33%] rounded-[50%] bg-[#431327] shadow-[0_8px_18px_rgba(63,8,28,.58)] blur-[1px]"
        style={{ opacity: medium * 0.94, transform: `scaleY(${1 + medium * 2.8 + severe * 1.35}) scaleX(${1 + heavy * 0.14})` }}
      />
      <div
        className="absolute right-[15%] top-[36.5%] h-[3.5%] w-[25%] rounded-full bg-black/90 blur-[.45px]"
        style={{ opacity: heavy * 0.88, transform: `scaleY(${1 + severe * 1.9})` }}
      />

      {/* Cheeks / jaw */}
      <div
        className="absolute left-[1%] top-[45%] h-[34%] w-[48%] rounded-[52%] mix-blend-multiply blur-[1.7px]"
        style={{ opacity: early * 0.86, transform: `scale(${1 + heavy * 0.18})`, background: 'radial-gradient(circle at 58% 40%, rgba(58,18,92,.93), rgba(132,32,52,.68) 45%, rgba(176,56,47,.24) 68%, transparent 80%)' }}
      />
      <div
        className="absolute right-[1%] top-[44%] h-[35%] w-[48%] rounded-[52%] mix-blend-multiply blur-[1.8px]"
        style={{ opacity: heavy * 0.84, transform: `scale(${1 + severe * 0.2})`, background: 'radial-gradient(circle at 42% 43%, rgba(58,18,92,.94), rgba(133,32,52,.7) 46%, rgba(176,56,47,.24) 69%, transparent 81%)' }}
      />
      <div
        className="absolute bottom-[1%] left-[18%] h-[30%] w-[65%] rounded-[52%] mix-blend-multiply blur-[2px]"
        style={{ opacity: heavy * 0.7, background: 'radial-gradient(ellipse, rgba(109,28,50,.72), rgba(71,25,105,.48) 52%, transparent 78%)' }}
      />

      {/* Nose trauma */}
      <div
        className="absolute left-1/2 top-[39%] h-[29%] w-[23%] -translate-x-1/2 rounded-[48%] mix-blend-multiply blur-[1.2px]"
        style={{ opacity: medium * 0.8, transform: `translateX(-50%) scaleX(${1 + heavy * 0.2})`, background: 'radial-gradient(ellipse at 50% 56%, rgba(92,22,57,.9), rgba(148,39,49,.58) 54%, transparent 79%)' }}
      />
      <div
        className="absolute left-[42.5%] top-[58%] h-[3.2%] w-[7%] rounded-full bg-[#3a0b0e] blur-[.3px]"
        style={{ opacity: noseBlood * 0.92 }}
      />
      <div
        className="absolute right-[42.5%] top-[58%] h-[3.2%] w-[7%] rounded-full bg-[#3a0b0e] blur-[.3px]"
        style={{ opacity: noseBlood * 0.82 }}
      />
      <div
        className="nose-blood-stream absolute left-[47.8%] top-[59.5%] w-[4.6%] origin-top rounded-b-full bg-gradient-to-b from-[#7f1118] via-[#a5121d] to-[#5c0a10] shadow-[0_2px_5px_rgba(76,4,10,.45)]"
        style={{ opacity: noseBlood, height: `${8 + noseBlood * 13 + bloodHeavy * 6}%`, transform: `rotate(${2 + bloodHeavy * 3}deg) scaleX(${0.76 + bloodHeavy * 0.35})` }}
      />
      <div
        className="absolute left-[50.3%] top-[69%] h-[9%] w-[3.2%] rounded-full bg-[#8f111b] blur-[.35px]"
        style={{ opacity: bloodHeavy * 0.9, transform: `rotate(-7deg) scaleY(${0.8 + bloodHeavy * 1.25})` }}
      />
      <div className="absolute left-[48.7%] top-[78%] h-[4.5%] w-[7%] rounded-full bg-[#6d0910] blur-[.45px]" style={{ opacity: bloodHeavy * 0.74 }} />

      {/* Mouth / lower face */}
      <div
        className="absolute bottom-[12%] left-[31%] h-[10%] w-[39%] rounded-full bg-[#641324] blur-[.9px]"
        style={{ opacity: heavy * 0.9, transform: `scaleY(${1 + heavy * 1.1 + severe * 0.75}) scaleX(${1 + severe * 0.2})` }}
      />
      <div className="absolute inset-0 rounded-[inherit] mix-blend-multiply" style={{ opacity: severe * 0.24, background: 'radial-gradient(circle at 50% 52%, transparent 18%, rgba(83,20,48,.62) 100%)' }} />
      <div className="absolute inset-0 rounded-[inherit] ring-inset" style={{ boxShadow: `inset 0 0 ${18 + severe * 16}px rgba(72, 12, 31, ${severe * 0.2})` }} />
    </div>
  );
}

function Opponent({ image, fit, hp, hitKey, attack, bruises }) {
  const damage = 100 - hp;
  const faceDamage = clamp((damage - 38) / 50, 0, 1);
  const leftAttacking = attack?.side === 'left';
  const rightAttacking = attack?.side === 'right';

  return (
    <div
      key={`opponent-${hitKey}`}
      className={`relative z-20 mx-auto flex h-[46vh] min-h-[300px] max-h-[560px] w-[min(72vw,410px)] flex-col items-center justify-end ${hitKey ? 'opponent-hit' : 'opponent-idle'} ${attack ? 'opponent-attack-body' : ''}`}
    >
      {attack && (
        <div key={attack.id} className={`opponent-camera-glove ${attack.side === 'left' ? 'camera-glove-left' : 'camera-glove-right'}`}>
          <div className="h-full w-full rounded-[46%_46%_42%_42%] bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 shadow-[0_25px_70px_rgba(0,0,0,.45)] ring-2 ring-black/20" />
          <div className="absolute bottom-[-18%] left-1/2 h-[38%] w-[58%] -translate-x-1/2 rounded-b-[28px] bg-zinc-950" />
        </div>
      )}

      <div
        className="relative z-20 mb-[-10px] h-[210px] w-[178px] overflow-hidden rounded-[42%_42%_46%_46%/36%_36%_58%_58%] border border-white/30 bg-zinc-300 shadow-[0_26px_55px_rgba(0,0,0,.4)] dark:border-white/10 dark:bg-zinc-700 sm:h-[240px] sm:w-[200px]"
        style={{ filter: `saturate(${1 - faceDamage * 0.14}) contrast(${1 + faceDamage * 0.1})` }}
      >
        {image ? (
          <FaceImage image={image} fit={fit} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-zinc-200 to-zinc-400 px-5 text-center text-zinc-600 dark:from-zinc-700 dark:to-zinc-900 dark:text-zinc-300">
            <div className="mb-4 text-5xl">🥊</div>
            <p className="text-sm font-semibold">Upload a face to enter the ring</p>
          </div>
        )}
        {image && <FaceDamage damage={damage} bruises={bruises} />}
      </div>

      <div className="relative z-10 h-[180px] w-[260px] rounded-t-[48%] bg-gradient-to-b from-zinc-900 to-black shadow-2xl sm:w-[300px]">
        <div className={`opponent-arm opponent-arm-left absolute left-[-29px] top-7 h-28 w-24 origin-bottom-right ${leftAttacking ? 'opponent-left-punch' : ''}`}>
          <div className="absolute bottom-0 right-2 h-20 w-12 rotate-[22deg] rounded-full bg-zinc-900" />
          <div className="absolute left-0 top-0 h-24 w-20 rotate-[16deg] rounded-[45%] bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 shadow-lg ring-1 ring-black/20" />
        </div>
        <div className={`opponent-arm opponent-arm-right absolute right-[-29px] top-7 h-28 w-24 origin-bottom-left ${rightAttacking ? 'opponent-right-punch' : ''}`}>
          <div className="absolute bottom-0 left-2 h-20 w-12 rotate-[-22deg] rounded-full bg-zinc-900" />
          <div className="absolute right-0 top-0 h-24 w-20 rotate-[-16deg] rounded-[45%] bg-gradient-to-bl from-blue-400 via-blue-600 to-blue-800 shadow-lg ring-1 ring-black/20" />
        </div>
        <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[.26em] text-white/80">FACE FIGHTER</div>
      </div>
    </div>
  );
}

function PlayerGlove({ side, active }) {
  const isLeft = side === 'left';
  return (
    <div className={`pointer-events-none absolute bottom-[-22px] z-40 h-[155px] w-[122px] sm:h-[190px] sm:w-[148px] ${isLeft ? 'left-[-18px] sm:left-[4%]' : 'right-[-18px] sm:right-[4%]'} ${active ? (isLeft ? 'left-punch' : 'right-punch') : ''}`} style={{ transform: isLeft ? 'rotate(18deg)' : 'rotate(-18deg)' }}>
      <div className="absolute bottom-0 left-1/2 h-[88%] w-[78%] -translate-x-1/2 rounded-[44%_44%_32%_32%/48%_48%_28%_28%] bg-gradient-to-b from-red-500 to-red-700 shadow-[0_25px_55px_rgba(0,0,0,.28)] ring-1 ring-black/10" />
      <div className={`absolute top-[13%] h-[52%] w-[58%] rounded-full bg-red-600 ${isLeft ? 'right-[-2%]' : 'left-[-2%]'}`} />
      <div className="absolute bottom-[1%] left-1/2 h-[30%] w-[58%] -translate-x-1/2 rounded-b-[28px] bg-zinc-950/90" />
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('ff-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  const [opponentImage, setOpponentImage] = useState('');
  const [faceFit, setFaceFit] = useState(DEFAULT_FACE_FIT);
  const [faceEditorOpen, setFaceEditorOpen] = useState(false);
  const [opponentHp, setOpponentHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [punchSide, setPunchSide] = useState(null);
  const [hitKey, setHitKey] = useState(0);
  const [damageText, setDamageText] = useState(null);
  const [incomingDamageText, setIncomingDamageText] = useState(null);
  const [opponentAttack, setOpponentAttack] = useState(null);
  const [playerHit, setPlayerHit] = useState(false);
  const [roundBruises, setRoundBruises] = useState(() => generateRandomBruises());
  const [roundStarted, setRoundStarted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef(null);

  const isOver = opponentHp <= 0 || playerHp <= 0;
  const result = opponentHp <= 0 ? 'Opponent KO' : playerHp <= 0 ? 'You are down' : null;

  const playImpact = useCallback(() => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioRef.current || new AudioCtx();
      audioRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(95, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.11, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } catch {
      // Optional audio only.
    }
  }, [soundOn]);

  const startRound = useCallback(() => {
    if (!opponentImage) return;
    setOpponentHp(100);
    setPlayerHp(100);
    setPunchSide(null);
    setDamageText(null);
    setIncomingDamageText(null);
    setOpponentAttack(null);
    setPlayerHit(false);
    setRoundBruises(generateRandomBruises());
    setRoundStarted(true);
  }, [opponentImage]);

  const performPunch = useCallback((side) => {
    if (!opponentImage || punchSide) return;
    const damage = Math.floor(7 + Math.random() * 10);
    setPunchSide(side);
    setHitKey((n) => n + 1);
    setDamageText({ value: damage, id: Date.now() });
    setOpponentHp((hp) => clamp(hp - damage, 0, 100));
    playImpact();
    window.setTimeout(() => setPunchSide(null), 350);
    window.setTimeout(() => setDamageText(null), 720);
  }, [opponentImage, punchSide, playImpact]);

  const requestPunch = useCallback((side) => {
    if (!opponentImage || faceEditorOpen) return;
    if (!roundStarted || isOver) {
      startRound();
      window.setTimeout(() => performPunch(side), 80);
      return;
    }
    performPunch(side);
  }, [opponentImage, faceEditorOpen, roundStarted, isOver, startRound, performPunch]);

  const resetToReady = useCallback(() => {
    setOpponentHp(100);
    setPlayerHp(100);
    setPunchSide(null);
    setDamageText(null);
    setIncomingDamageText(null);
    setOpponentAttack(null);
    setPlayerHit(false);
    setRoundStarted(false);
  }, []);

  const status = useMemo(() => {
    if (!opponentImage) return 'Upload a face, adjust the fit, then press A / D or Enter.';
    if (!roundStarted) return 'Ready. Press A / D, ← / →, Enter, or Space to start.';
    if (opponentHp <= 0) return 'KO. Press any fight key to rematch instantly.';
    if (playerHp <= 0) return 'You are down. Press any fight key to rematch instantly.';
    return 'Fight: A / D or ← / →. The opponent will punch back.';
  }, [opponentImage, roundStarted, opponentHp, playerHp]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ff-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const onKey = (event) => {
      if (faceEditorOpen) return;
      const key = event.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') {
        event.preventDefault();
        requestPunch('left');
      }
      if (key === 'd' || key === 'arrowright') {
        event.preventDefault();
        requestPunch('right');
      }
      if ((key === 'enter' || key === ' ') && opponentImage) {
        event.preventDefault();
        if (!roundStarted || isOver) startRound();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [faceEditorOpen, requestPunch, opponentImage, roundStarted, isOver, startRound]);

  useEffect(() => {
    if (!roundStarted || isOver) return undefined;

    const pending = [];
    const timer = window.setInterval(() => {
      if (Math.random() > 0.26) {
        const incoming = Math.floor(5 + Math.random() * 9);
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const attackId = Date.now();
        setOpponentAttack({ side, id: attackId });

        pending.push(window.setTimeout(() => {
          setPlayerHp((hp) => clamp(hp - incoming, 0, 100));
          setIncomingDamageText({ value: incoming, id: attackId });
          setPlayerHit(true);
          playImpact();
        }, 420));
        pending.push(window.setTimeout(() => {
          setPlayerHit(false);
          setIncomingDamageText(null);
        }, 790));
        pending.push(window.setTimeout(() => setOpponentAttack(null), 900));
      }
    }, 1500);

    return () => {
      clearInterval(timer);
      pending.forEach((id) => clearTimeout(id));
      setOpponentAttack(null);
      setPlayerHit(false);
      setIncomingDamageText(null);
    };
  }, [roundStarted, isOver, playImpact]);

  const onUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setOpponentImage((old) => {
      if (old?.startsWith('blob:')) URL.revokeObjectURL(old);
      return url;
    });
    setFaceFit(DEFAULT_FACE_FIT);
    resetToReady();
    setFaceEditorOpen(true);
    event.target.value = '';
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-zinc-950 transition-colors dark:bg-[#050505] dark:text-white">
      {faceEditorOpen && opponentImage && <FaceEditor image={opponentImage} fit={faceFit} setFit={setFaceFit} onClose={() => setFaceEditorOpen(false)} />}

      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col p-3 sm:p-5 lg:p-6">
        <header className="glass relative z-50 flex items-center justify-between rounded-[24px] border border-black/5 bg-white/75 px-4 py-3 shadow-apple dark:border-white/10 dark:bg-zinc-900/70 sm:px-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.24em] text-zinc-500 dark:text-zinc-400">Stress release mini game</div>
            <h1 className="mt-0.5 text-xl font-semibold tracking-[-.03em] sm:text-2xl">Face Fighter</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSoundOn((v) => !v)} className="hidden rounded-full border border-black/5 bg-black/[.04] px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-black/[.07] dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15 sm:block">Sound {soundOn ? 'On' : 'Off'}</button>
            <button onClick={() => setDark((v) => !v)} aria-label="Toggle theme" className="grid h-10 w-10 place-items-center rounded-full border border-black/5 bg-black/[.04] text-zinc-700 transition hover:scale-[1.03] hover:bg-black/[.07] dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">{dark ? <SunIcon /> : <MoonIcon />}</button>
          </div>
        </header>

        <section className="mt-3 grid min-h-0 flex-1 gap-3 lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="glass order-2 rounded-[28px] border border-black/5 bg-white/75 p-5 shadow-apple dark:border-white/10 dark:bg-zinc-900/70 lg:order-1">
            <p className="text-[11px] font-bold uppercase tracking-[.22em] text-zinc-500 dark:text-zinc-400">Opponent</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-.04em]">Choose a face</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">Upload a clear portrait, then align the eyes and chin with the face guide. The image stays in this browser session.</p>

            <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] active:scale-[.99] dark:bg-white dark:text-black">
              <UploadIcon />
              {opponentImage ? 'Choose another photo' : 'Upload photo'}
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>

            {opponentImage && (
              <button onClick={() => setFaceEditorOpen(true)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10">Adjust face fit</button>
            )}

            <div className="mt-6 space-y-5">
              <HealthBar label="You" value={playerHp} />
              <HealthBar label="Opponent" value={opponentHp} />
            </div>

            <div className="mt-6 rounded-2xl border border-black/5 bg-black/[.03] p-4 dark:border-white/10 dark:bg-white/[.06]">
              <div className="text-xs font-bold uppercase tracking-[.16em] text-zinc-500 dark:text-zinc-400">Controls</div>
              <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">A / D or ← / → punch. Enter or Space starts a round. After a KO, press any fight key for an instant rematch.</p>
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={startRound} disabled={!opponentImage || (roundStarted && !isOver)} className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{isOver ? 'Fight again' : roundStarted ? 'Round active' : 'Start round'}</button>
              <button onClick={resetToReady} className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/10">Reset</button>
            </div>
          </aside>

          <div className={`relative order-1 min-h-[62vh] overflow-hidden rounded-[30px] border border-black/5 bg-gradient-to-b from-sky-100 via-zinc-100 to-zinc-300 shadow-apple dark:border-white/10 dark:from-zinc-800 dark:via-zinc-900 dark:to-black lg:order-2 lg:min-h-[690px] ${playerHit ? 'player-hit-screen' : ''}`}>
            <div className="absolute inset-x-0 top-0 z-30 p-4 sm:p-5">
              <div className="glass mx-auto grid max-w-5xl grid-cols-2 gap-5 rounded-[22px] border border-white/20 bg-white/60 p-3 shadow-lg dark:border-white/10 dark:bg-black/[.35] sm:p-4">
                <HealthBar label="Player" value={playerHp} />
                <HealthBar label="Opponent" value={opponentHp} align="right" />
              </div>
            </div>

            <div className="boxing-arena pointer-events-none absolute inset-0 overflow-hidden">
              <div className="arena-ceiling" />
              <div className="arena-spotlight arena-spotlight-left" />
              <div className="arena-spotlight arena-spotlight-right" />
              <div className="arena-scoreboard">
                <span>FACE FIGHTER</span>
                <span className="scoreboard-live">LIVE</span>
              </div>
              <div className="arena-crowd">
                {Array.from({ length: 54 }).map((_, index) => (
                  <i
                    key={index}
                    style={{
                      left: `${(index * 37) % 101}%`,
                      top: `${(index * 53) % 83}%`,
                      width: `${5 + (index % 4)}px`,
                      height: `${10 + (index % 5) * 2}px`,
                      opacity: 0.18 + (index % 5) * 0.07,
                      background: `hsl(${210 + (index % 4) * 12} 12% ${55 + (index % 3) * 8}%)`,
                    }}
                  />
                ))}
              </div>

              <div className="ring-back-post ring-post-left"><span>FACE</span><span>FIGHTER</span></div>
              <div className="ring-back-post ring-post-right"><span>FACE</span><span>FIGHTER</span></div>
              <div className="ring-rope ring-rope-1" />
              <div className="ring-rope ring-rope-2" />
              <div className="ring-rope ring-rope-3" />
              <div className="ring-rope ring-rope-4" />
              <div className="ring-canvas">
                <div className="canvas-center-mark">FF</div>
                <div className="canvas-sponsor canvas-sponsor-left">CHAMPIONSHIP</div>
                <div className="canvas-sponsor canvas-sponsor-right">FACE FIGHTER</div>
              </div>
              <div className="ring-apron"><span>FACE FIGHTER · MAIN EVENT</span></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pt-20 sm:pt-24">
              <Opponent image={opponentImage} fit={faceFit} hp={opponentHp} hitKey={hitKey} attack={opponentAttack} bruises={roundBruises} />
            </div>

            {damageText && <div key={damageText.id} className="damage-pop pointer-events-none absolute left-1/2 top-[35%] z-50 -translate-x-1/2 rounded-full bg-black/75 px-3 py-1.5 text-lg font-bold text-white shadow-xl">-{damageText.value}</div>}
            {incomingDamageText && <div key={incomingDamageText.id} className="incoming-damage-pop pointer-events-none absolute left-1/2 top-[17%] z-[90] -translate-x-1/2 rounded-full bg-red-600/90 px-3 py-1.5 text-lg font-bold text-white shadow-xl">-{incomingDamageText.value} HP</div>}
            {playerHit && <div className="hit-vignette pointer-events-none absolute inset-0 z-[85]" />}

            {result && (
              <div className="glass pointer-events-none absolute left-1/2 top-1/2 z-[60] w-[min(88%,450px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/20 bg-white/[.88] p-6 text-center shadow-2xl dark:border-white/10 dark:bg-zinc-950/[.88]">
                <div className="text-xs font-bold uppercase tracking-[.24em] text-zinc-500 dark:text-zinc-400">Round complete</div>
                <div className="mt-2 text-4xl font-bold tracking-[-.05em]">{result}</div>
                <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">A / D · ← / → to rematch and punch immediately<br />Enter / Space to restart</div>
              </div>
            )}

            <button aria-label="Left punch" onClick={() => requestPunch('left')} className="absolute inset-y-0 left-0 z-30 w-1/2 cursor-crosshair bg-transparent" />
            <button aria-label="Right punch" onClick={() => requestPunch('right')} className="absolute inset-y-0 right-0 z-30 w-1/2 cursor-crosshair bg-transparent" />

            <PlayerGlove side="left" active={punchSide === 'left'} />
            <PlayerGlove side="right" active={punchSide === 'right'} />

            <div className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-black/[.55] px-4 py-2 text-center text-[11px] font-semibold tracking-wide text-white/90 backdrop-blur-xl sm:bottom-5 sm:text-xs">{status}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
