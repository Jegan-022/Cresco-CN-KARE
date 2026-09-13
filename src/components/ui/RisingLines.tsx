import React, { useEffect, useRef } from 'react';

export interface RisingLinesProps {
  linesColor?: string;
  horizonColor?: string;
  haloColor?: string;
  scale?: number;
  brightness?: number;
  circleScale?: number;
  riseSpeed?: number;
  riseScale?: number;
  riseIntensity?: number;
  flowSpeed?: number;
  flowDensity?: number;
  flowIntensity?: number;
  horizonHeight?: number; // 0 = exactly bottom edge, negative = below edge, positive = above edge
  horizonIntensity?: number;
  haloIntensity?: number;
  className?: string;
  interactive?: boolean;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  maxOpacity: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface LineBeam {
  x: number;
  y: number;
  length: number;
  speed: number;
  width: number;
  opacity: number;
  maxOpacity: number;
  fadeStart: number;
  hasCore: boolean;
}

export const RisingLines: React.FC<RisingLinesProps> = ({
  linesColor = '#06c8d9',
  horizonColor = '#0284c7',
  haloColor = '#38bdf8',
  scale = 3.5,
  brightness = 1.1,
  circleScale = 0.28,
  riseSpeed = 0.14,
  riseScale = 11.5,
  riseIntensity = 1.1,
  flowSpeed = 0.20,
  flowDensity = 4.5,
  flowIntensity = 0.75,
  horizonHeight = 0, // Rooted seamlessly at bottom edge
  horizonIntensity = 0.95,
  haloIntensity = 8.5,
  className = '',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const parseColor = (hex: string) => {
      let c = hex.replace('#', '');
      if (c.length === 3) {
        c = c.split('').map(x => x + x).join('');
      }
      const num = parseInt(c, 16) || 0;
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    };

    const linesRgb = parseColor(linesColor);
    const horizonRgb = parseColor(horizonColor);
    const haloRgb = parseColor(haloColor);

    const rgba = (c: { r: number; g: number; b: number }, a: number) => {
      return `rgba(${c.r}, ${c.g}, ${c.b}, ${Math.max(0, Math.min(1, a))})`;
    };

    let particles: Particle[] = [];
    let lines: LineBeam[] = [];

    const getHorizonY = () => {
      // Anchored at bottom edge with fine offset control
      return height - horizonHeight * (height * 0.1);
    };

    const initElements = () => {
      const densityMultiplier = (flowDensity / 4.0) * (width / 1200);
      const horizonY = getHorizonY();

      // Laser lines
      const lineCount = Math.floor(95 * densityMultiplier);
      lines = [];
      for (let i = 0; i < lineCount; i++) {
        const x = Math.random() * width;
        const length = (60 + Math.random() * 320) * (scale / 3.2);
        const y = horizonY - Math.random() * (height * 0.98);
        lines.push({
          x,
          y,
          length,
          speed: (0.8 + Math.random() * 2.5) * riseSpeed * (riseScale / 10),
          width: (0.75 + Math.random() * 2.2) * (scale / 3.5),
          opacity: Math.random() * 0.8,
          maxOpacity: (0.35 + Math.random() * 0.65) * riseIntensity * brightness,
          fadeStart: 0.15 + Math.random() * 0.45,
          hasCore: Math.random() > 0.35,
        });
      }

      // Floating glowing particles
      const particleCount = Math.floor(65 * densityMultiplier);
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: horizonY - Math.random() * (height * 0.98),
          radius: (1.2 + Math.random() * 3.8) * circleScale * (scale / 3.0),
          speed: (0.4 + Math.random() * 1.5) * riseSpeed * (riseScale / 10),
          opacity: Math.random() * 0.8,
          maxOpacity: (0.4 + Math.random() * 0.6) * flowIntensity * brightness,
          wobbleSpeed: 0.01 + Math.random() * 0.03 * flowSpeed * 4,
          wobbleAmp: 0.3 + Math.random() * 1.0,
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.02 + Math.random() * 0.05,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = canvas.width = rect?.width || window.innerWidth;
      height = canvas.height = rect?.height || window.innerHeight;
      initElements();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.666, 2.0);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const horizonY = getHorizonY();

      // ==========================================
      // 1. ATMOSPHERIC HORIZON GLOW (Soft, Natural, Volumetric)
      // ==========================================
      // Wide bottom ambient halo
      const haloWidth = width * 0.85;
      const haloHeight = height * 0.55 * (haloIntensity / 8.5);
      
      const ambientGrad = ctx.createRadialGradient(
        width / 2,
        horizonY,
        0,
        width / 2,
        horizonY,
        haloWidth / 2
      );
      ambientGrad.addColorStop(0, rgba(haloRgb, 0.42 * horizonIntensity * brightness));
      ambientGrad.addColorStop(0.25, rgba(horizonRgb, 0.22 * horizonIntensity * brightness));
      ambientGrad.addColorStop(0.55, rgba(linesRgb, 0.08 * horizonIntensity * brightness));
      ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.scale(1, haloHeight / (haloWidth / 2));
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, (horizonY - haloHeight) * ((haloWidth / 2) / haloHeight), width, haloHeight * 2 * ((haloWidth / 2) / haloHeight));
      ctx.restore();

      // Soft ground edge flare (diffuse glow emerging from bottom, NO sharp line!)
      const groundFlare = ctx.createLinearGradient(0, horizonY - 45, 0, horizonY + 10);
      groundFlare.addColorStop(0, 'rgba(0, 0, 0, 0)');
      groundFlare.addColorStop(0.6, rgba(haloRgb, 0.28 * horizonIntensity * brightness));
      groundFlare.addColorStop(0.9, rgba(horizonRgb, 0.55 * horizonIntensity * brightness));
      groundFlare.addColorStop(1, rgba(haloRgb, 0.75 * horizonIntensity * brightness));
      ctx.fillStyle = groundFlare;
      ctx.fillRect(0, horizonY - 45, width, 55);

      // Center laser horizon crest (soft glowing light band centered at bottom)
      const crestGrad = ctx.createRadialGradient(
        width / 2,
        horizonY,
        0,
        width / 2,
        horizonY,
        width * 0.4
      );
      crestGrad.addColorStop(0, rgba({ r: 230, g: 255, b: 255 }, 0.75 * horizonIntensity * brightness));
      crestGrad.addColorStop(0.3, rgba(haloRgb, 0.55 * horizonIntensity * brightness));
      crestGrad.addColorStop(0.7, rgba(linesRgb, 0.15 * horizonIntensity * brightness));
      crestGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.scale(1, 0.08); // Thin compressed flare
      ctx.fillStyle = crestGrad;
      ctx.fillRect(0, (horizonY - 15) / 0.08, width, 30 / 0.08);
      ctx.restore();

      // ==========================================
      // 2. ASCENDING VERTICAL LASER BEAMS
      // ==========================================
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        line.y -= line.speed * dt * 2.2;

        // Reset beam when passing top
        if (line.y + line.length < 0) {
          line.y = horizonY + Math.random() * 10;
          line.x = Math.random() * width;
          line.opacity = 0;
        }

        // Fade in from bottom, fade out towards upper sky
        const progress = Math.max(0, Math.min(1, (horizonY - line.y) / horizonY));
        if (progress < 0.1) {
          line.opacity = (progress / 0.1) * line.maxOpacity;
        } else if (progress > line.fadeStart) {
          const fadeProgress = (progress - line.fadeStart) / (1 - line.fadeStart);
          line.opacity = Math.max(0, (1 - fadeProgress) * line.maxOpacity);
        } else {
          line.opacity = line.maxOpacity;
        }

        if (line.opacity <= 0.01) continue;

        let drawX = line.x;
        if (interactive && mouseRef.current.active) {
          const dx = drawX - mouseRef.current.x;
          const dy = line.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const push = (1 - dist / 150) * 10;
            drawX += dx > 0 ? push : -push;
          }
        }

        const bottomY = line.y + line.length;
        const topY = line.y;

        // Outer soft glow line
        const beamGlow = ctx.createLinearGradient(drawX, bottomY, drawX, topY);
        beamGlow.addColorStop(0, rgba(haloRgb, line.opacity * 0.95));
        beamGlow.addColorStop(0.3, rgba(linesRgb, line.opacity * 0.65));
        beamGlow.addColorStop(0.85, rgba(linesRgb, line.opacity * 0.15));
        beamGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.moveTo(drawX, bottomY);
        ctx.lineTo(drawX, topY);
        ctx.strokeStyle = beamGlow;
        ctx.lineWidth = line.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // High-energy core filament for intense laser feel
        if (line.hasCore && line.opacity > 0.25) {
          const coreGrad = ctx.createLinearGradient(drawX, bottomY, drawX, topY);
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${line.opacity * 0.85})`);
          coreGrad.addColorStop(0.4, rgba(haloRgb, line.opacity * 0.45));
          coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.beginPath();
          ctx.moveTo(drawX, bottomY);
          ctx.lineTo(drawX, topY + line.length * 0.3);
          ctx.strokeStyle = coreGrad;
          ctx.lineWidth = Math.max(0.5, line.width * 0.45);
          ctx.stroke();
        }
      }

      // ==========================================
      // 3. ASCENDING GLOWING PARTICLES
      // ==========================================
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y -= p.speed * dt * 1.8;
        p.phase += p.wobbleSpeed * dt;
        p.twinklePhase += p.twinkleSpeed * dt;
        const currentX = p.x + Math.sin(p.phase) * p.wobbleAmp * 12;

        // Reset particle when it reaches top
        if (p.y < -10) {
          p.y = horizonY - Math.random() * 10;
          p.x = Math.random() * width;
          p.opacity = 0;
        }

        // Fade in/out calculation
        const progress = Math.max(0, Math.min(1, (horizonY - p.y) / horizonY));
        let alpha = p.maxOpacity;
        if (progress < 0.12) {
          alpha = (progress / 0.12) * p.maxOpacity;
        } else if (progress > 0.75) {
          alpha = ((1 - progress) / 0.25) * p.maxOpacity;
        }

        // Gentle twinkle modulation
        alpha *= 0.8 + Math.sin(p.twinklePhase) * 0.2;

        if (alpha > 0.02) {
          // Soft radial glow aura
          const auraRadius = p.radius * 3.8;
          const aura = ctx.createRadialGradient(currentX, p.y, 0, currentX, p.y, auraRadius);
          aura.addColorStop(0, rgba(haloRgb, alpha * 0.85));
          aura.addColorStop(0.35, rgba(linesRgb, alpha * 0.45));
          aura.addColorStop(0.8, rgba(linesRgb, alpha * 0.08));
          aura.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.arc(currentX, p.y, auraRadius, 0, Math.PI * 2);
          ctx.fillStyle = aura;
          ctx.fill();

          // Bright crisp inner spark
          ctx.beginPath();
          ctx.arc(currentX, p.y, Math.max(0.6, p.radius * 0.65), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.15)})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    linesColor,
    horizonColor,
    haloColor,
    scale,
    brightness,
    circleScale,
    riseSpeed,
    riseScale,
    riseIntensity,
    flowSpeed,
    flowDensity,
    flowIntensity,
    horizonHeight,
    horizonIntensity,
    haloIntensity,
    interactive,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
};

export default RisingLines;
