import React, { useRef, useState, useCallback, useEffect } from 'react';
import './LineSidebar.css';

const FALLOFF_CURVES = {
  linear: (p: number) => p,
  smooth: (p: number) => p * p * (3 - 2 * p),
  sharp: (p: number) => p * p * p
};

export interface LineSidebarItemObject {
  id?: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge?: string;
}

export type LineSidebarItem = string | LineSidebarItemObject;

const DEFAULT_ITEMS: LineSidebarItem[] = [
  'Overview',
  'Components',
  'Animations',
  'Backgrounds',
  'Showcase',
  'Playground',
  'Templates',
  'Changelog',
  'Community',
  'Resources',
  'Documentation',
  'Support'
];

export interface LineSidebarProps {
  items?: LineSidebarItem[];
  accentColor?: string;
  textColor?: string;
  markerColor?: string;
  showIndex?: boolean;
  showMarker?: boolean;
  proximityRadius?: number;
  maxShift?: number;
  falloff?: 'linear' | 'smooth' | 'sharp';
  markerLength?: number;
  markerGap?: number;
  tickScale?: number;
  scaleTick?: boolean;
  itemGap?: number;
  fontSize?: number;
  smoothing?: number;
  defaultActive?: number | null;
  activeId?: string | null;
  onItemClick?: (index: number, label: string, item?: LineSidebarItem) => void;
  className?: string;
}

export const LineSidebar: React.FC<LineSidebarProps> = ({
  items = DEFAULT_ITEMS,
  accentColor = '#10B981',
  textColor = '#64748B',
  markerColor = '#CBD5E1',
  showIndex = false,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 20,
  falloff = 'smooth',
  markerLength = 36,
  markerGap = 8,
  tickScale = 0.45,
  scaleTick = true,
  itemGap = 10,
  fontSize = 0.875,
  smoothing = 120,
  defaultActive = 0,
  activeId = null,
  onItemClick,
  className = ''
}) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const targetsRef = useRef<number[]>([]);
  const currentRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const activeRef = useRef<number | null>(defaultActive);
  const smoothingRef = useRef(smoothing);

  const resolveInitialIndex = () => {
    if (activeId !== null && activeId !== undefined) {
      const idx = items.findIndex((it) => (typeof it === 'string' ? it === activeId : it.id === activeId));
      if (idx !== -1) return idx;
    }
    return defaultActive;
  };

  const [activeIndex, setActiveIndex] = useState<number | null>(resolveInitialIndex);

  useEffect(() => {
    if (activeId !== null && activeId !== undefined) {
      const idx = items.findIndex((it) => (typeof it === 'string' ? it === activeId : it.id === activeId));
      if (idx !== -1 && idx !== activeIndex) {
        setActiveIndex(idx);
      }
    }
  }, [activeId, items, activeIndex]);

  activeRef.current = activeIndex;
  smoothingRef.current = smoothing;

  // Single rAF loop that eases every item's --effect toward its target using
  // frame-rate independent exponential smoothing, so color, shift and scale
  // all move together without staggering CSS transitions.
  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const tau = Math.max(smoothingRef.current, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    let moving = false;
    const itemElements = itemRefs.current;
    for (let i = 0; i < itemElements.length; i++) {
      const el = itemElements[i];
      if (!el) continue;
      const target = Math.max(targetsRef.current[i] || 0, activeRef.current === i ? 1 : 0);
      const cur = currentRef.current[i] || 0;
      const next = cur + (target - cur) * k;
      const settled = Math.abs(target - next) < 0.0015;
      const value = settled ? target : next;
      currentRef.current[i] = value;
      el.style.setProperty('--effect', value.toFixed(4));
      if (!settled) moving = true;
    }

    rafRef.current = moving ? requestAnimationFrame(runFrame) : null;
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }

    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLUListElement>) => {
      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const pointerY = e.clientY - rect.top;
      const ease = FALLOFF_CURVES[falloff] ?? FALLOFF_CURVES.linear;
      const itemElements = itemRefs.current;
      for (let i = 0; i < itemElements.length; i++) {
        const el = itemElements[i];
        if (!el) continue;
        const center = el.offsetTop + el.offsetHeight / 2;
        const distance = Math.abs(pointerY - center);
        targetsRef.current[i] = ease(Math.max(0, 1 - distance / proximityRadius));
      }
      startLoop();
    },
    [falloff, proximityRadius, startLoop]
  );

  const handlePointerLeave = useCallback(() => {
    targetsRef.current = targetsRef.current.map(() => 0);
    startLoop();
  }, [startLoop]);

  const handleClick = useCallback(
    (index: number, label: string, item: LineSidebarItem) => {
      setActiveIndex(index);
      onItemClick?.(index, label, item);
    },
    [onItemClick]
  );

  useEffect(() => {
    startLoop();
  }, [activeIndex, startLoop]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    },
    []
  );

  return (
    <nav
      className={`line-sidebar${showMarker ? ' line-sidebar--markers' : ''}${scaleTick ? ' line-sidebar--scale-tick' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--marker-color': markerColor,
        '--marker-length': `${markerLength}px`,
        '--marker-gap': `${markerGap}px`,
        '--tick-scale': tickScale,
        '--max-shift': `${maxShift}px`,
        '--item-gap': `${itemGap}px`,
        '--font-size': `${fontSize}rem`,
        '--smoothing': `${smoothing}ms`
      } as React.CSSProperties}
    >
      <ul 
        ref={listRef} 
        className="line-sidebar__list" 
        onPointerMove={handlePointerMove} 
        onPointerLeave={handlePointerLeave}
      >
        {items.map((item, index) => {
          const isObj = typeof item !== 'string';
          const label = isObj ? item.label : item;
          const Icon = isObj ? item.icon : undefined;
          const badge = isObj ? item.badge : undefined;
          const isCurrent = activeIndex === index;

          return (
            <li
              key={`${label}-${index}`}
              ref={el => {
                itemRefs.current[index] = el;
              }}
              className={`line-sidebar__item ${isCurrent ? 'line-sidebar__item--active' : ''}`}
              aria-current={isCurrent ? 'true' : undefined}
              onClick={() => handleClick(index, label, item)}
            >
              {showMarker && <span className="line-sidebar__marker" aria-hidden="true" />}
              <span className="line-sidebar__label">
                {showIndex && (
                  <span className="line-sidebar__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}

                {Icon && (
                  <span className={`mr-2.5 transition-colors duration-200 ${isCurrent ? 'text-primary' : 'text-current'}`}>
                    <Icon size={17} strokeWidth={isCurrent ? 2.5 : 2} />
                  </span>
                )}

                <span className="font-headline font-bold text-[13px] tracking-tight flex-1">
                  {label}
                </span>

                {badge && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ml-2 transition-all ${
                    isCurrent
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-surface-container text-primary'
                  }`}>
                    {badge}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default LineSidebar;
