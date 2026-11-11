import { useEffect, useRef, useState } from 'react';

/** Anel que acompanha o mouse (so em dispositivos com ponteiro fino e sem "reduzir movimento"). */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let scale = 1;
    let targetScale = 1;
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        rx = x;
        ry = y;
        if (ringRef.current) ringRef.current.style.opacity = '1';
        if (dotRef.current) dotRef.current.style.opacity = '1';
      }
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest?.('a, button, [role="button"], [role="link"], input, textarea, select');
      targetScale = interactive ? 1.9 : 1;
    };
    const onLeave = () => {
      visible = false;
      if (ringRef.current) ringRef.current.style.opacity = '0';
      if (dotRef.current) dotRef.current.style.opacity = '0';
    };

    const tick = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      scale += (targetScale - scale) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0) scale(${scale})`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x - 2}px, ${y - 2}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  const base: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 10000,
    opacity: 0,
    transition: 'opacity 200ms',
    mixBlendMode: 'difference',
  };

  return (
    <>
      <div ref={ringRef} style={{ ...base, width: 36, height: 36, borderRadius: 18, border: '1px solid #fff' }} />
      <div ref={dotRef} style={{ ...base, width: 4, height: 4, borderRadius: 2, background: '#fff' }} />
    </>
  );
}
