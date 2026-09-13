import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './PillNav.css';

export interface PillNavItem {
  label: string;
  href?: string;
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface PillNavProps {
  logo?: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoverCircleColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

export const PillNav: React.FC<PillNavProps> = React.memo(({
  logo = '/logo-green.svg',
  logoAlt = 'Cresco CN Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#12131C',
  pillColor = 'rgba(255, 255, 255, 0.05)',
  hoverCircleColor = '#10B981',
  hoveredPillTextColor = '#FFFFFF',
  pillTextColor = '#94A3B8',
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLButtonElement | null>(null);

  // Guarantee initial load entrance runs strictly ONCE across the entire lifecycle
  const hasAnimatedMountRef = useRef(false);

  // Generate stable key of item labels
  const itemsKey = useMemo(() => items.map(i => i.label).join('|'), [items]);

  const calculateLayout = useCallback(() => {
    try {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector<HTMLElement>('.pill-label');
        const white = pill.querySelector<HTMLElement>('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    } catch (err) {
      console.warn('PillNav layout calculation caught non-fatal exception:', err);
    }
  }, [ease]);

  // Handle initial entrance animation ONLY ONCE
  useEffect(() => {
    try {
      if (initialLoadAnimation && !hasAnimatedMountRef.current) {
        hasAnimatedMountRef.current = true;
        const logoEl = logoRef.current;
        const navItemsEl = navItemsRef.current;

        if (logoEl) {
          gsap.fromTo(
            logoEl,
            { scale: 0.7, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.5)' }
          );
        }

        if (navItemsEl) {
          gsap.fromTo(
            navItemsEl,
            { opacity: 0, y: -8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              ease,
              onComplete: calculateLayout
            }
          );
        }
      }
    } catch (err) {
      console.warn('PillNav entrance animation non-fatal:', err);
    }
  }, [initialLoadAnimation, ease, calculateLayout]);

  // Reset GSAP references when items count changes
  useEffect(() => {
    tlRefs.current.forEach(tl => tl?.kill());
    activeTweenRefs.current.forEach(tw => tw?.kill());
    tlRefs.current = [];
    activeTweenRefs.current = [];
    circleRefs.current = [];
  }, [itemsKey]);

  // Layout calculations on mount, font load, or actual itemsKey change
  useEffect(() => {
    calculateLayout();
    const timer = setTimeout(calculateLayout, 100);

    const onResize = () => calculateLayout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(calculateLayout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 0.95 });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      tlRefs.current.forEach(tl => tl?.kill());
      activeTweenRefs.current.forEach(tw => tw?.kill());
      logoTweenRef.current?.kill();
    };
  }, [itemsKey, calculateLayout]);

  const handleEnter = (i: number, isActive: boolean) => {
    try {
      if (isActive) return;
      const tl = tlRefs.current[i];
      if (!tl) return;
      activeTweenRefs.current[i]?.kill();
      activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
        duration: 0.28,
        ease,
        overwrite: 'auto'
      });
    } catch (e) {
      console.warn('PillNav handleEnter non-fatal:', e);
    }
  };

  const handleLeave = (i: number, isActive: boolean) => {
    try {
      if (isActive) return;
      const tl = tlRefs.current[i];
      if (!tl) return;
      activeTweenRefs.current[i]?.kill();
      activeTweenRefs.current[i] = tl.tweenTo(0, {
        duration: 0.22,
        ease,
        overwrite: 'auto'
      });
    } catch (e) {
      console.warn('PillNav handleLeave non-fatal:', e);
    }
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll<HTMLElement>('.hamburger-line');
      if (lines.length >= 2) {
        if (newState) {
          gsap.to(lines[0], { rotation: 45, y: 3.5, duration: 0.25, ease });
          gsap.to(lines[1], { rotation: -45, y: -3.5, duration: 0.25, ease });
        } else {
          gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.25, ease });
          gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.25, ease });
        }
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: -10, scaleY: 0.95 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.25,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: -10,
          scaleY: 0.95,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    ['--base' as any]: baseColor,
    ['--pill-bg' as any]: pillColor,
    ['--hover-circle-bg' as any]: hoverCircleColor,
    ['--hover-text' as any]: hoveredPillTextColor,
    ['--pill-text' as any]: pillTextColor
  };

  return (
    <div className={`pill-nav-container ${className}`}>
      <nav className="pill-nav" aria-label="Primary Navigation" style={cssVars}>
        {/* Brand Logo Button */}
        <button
          type="button"
          className="pill-logo"
          aria-label="Home"
          onMouseEnter={handleLogoEnter}
          onClick={(e) => items[0]?.onClick?.(e)}
          ref={el => {
            logoRef.current = el;
          }}
        >
          <img src={logo} alt={logoAlt} ref={logoImgRef} />
        </button>

        {/* Desktop Nav Items */}
        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => {
              const isActive = activeHref === item.href;

              return (
                <li key={item.href || `item-${i}`} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className={`pill${isActive ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i, isActive)}
                    onMouseLeave={() => handleLeave(i, isActive)}
                    onClick={(e) => item.onClick?.(e)}
                  >
                    {!isActive && (
                      <span
                        className="hover-circle"
                        aria-hidden="true"
                        ref={el => {
                          circleRefs.current[i] = el;
                        }}
                      />
                    )}
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      {!isActive && (
                        <span className="pill-label-hover" aria-hidden="true">
                          {item.label}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      {/* Mobile Popover Drawer */}
      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list" role="menu">
          {items.map((item, i) => {
            const isActive = activeHref === item.href;

            return (
              <li key={item.href || `mobile-item-${i}`} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={`mobile-menu-link${isActive ? ' is-active' : ''}`}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    item.onClick?.(e);
                  }}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="text-xs tracking-wider opacity-80 uppercase">Active</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});

export default PillNav;
