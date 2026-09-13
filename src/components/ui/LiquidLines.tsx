import React, { useEffect, useRef, useMemo } from 'react';

export interface LiquidLinesProps {
  width?: number | string;
  height?: number | string;
  speed?: number;
  iterations?: number;
  waveFrequency?: number;
  depthStep?: number;
  lineThickness?: number;
  waveAmplitude?: number;
  lineColor?: string;
  lightBackground?: string;
  darkBackground?: string;
  brightness?: number;
  contrast?: number;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  opacity?: number;
  className?: string;
  interactive?: boolean;
}

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;
  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_speed;
  uniform int u_iterations;
  uniform float u_waveFrequency;
  uniform float u_depthStep;
  uniform float u_lineThickness;
  uniform float u_waveAmplitude;
  uniform vec3 u_lineColor;
  uniform vec3 u_bgColor;
  uniform float u_brightness;
  uniform float u_contrast;
  uniform vec2 u_offset;
  uniform float u_scale;
  uniform float u_opacity;
  uniform vec2 u_mouse;

  void main() {
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // Pattern scaling and user offsets
    st *= (1.0 / max(0.01, u_scale));
    st += u_offset;

    // Interactive mouse displacement ripple
    vec2 m = (u_mouse - 0.5) * 2.0;
    float mDist = length(st - m * 0.5);
    float mRipple = sin(mDist * 12.0 - u_time * 2.0) * exp(-mDist * 2.5) * 0.06;
    st += normalize(st - m * 0.5 + 0.001) * mRipple;

    // Fluid diagonal orientation (approx 42 degrees)
    float angle = 0.733;
    float cosA = cos(angle);
    float sinA = sin(angle);
    vec2 p = vec2(st.x * cosA - st.y * sinA, st.x * sinA + st.y * cosA);

    float t = u_time * u_speed;
    vec3 colAccum = vec3(0.0);

    // Iterative Raymarching of Fluid Beams
    for (int i = 0; i < 8; i++) {
      if (i >= u_iterations) break;
      float fi = float(i);
      float zDepth = 1.0 + fi * u_depthStep;

      // Organic fluid wave harmonics
      float freq = u_waveFrequency * 0.07;
      float wave = sin(p.x * freq + t + fi * 1.57) * (u_waveAmplitude * 0.16);
      wave += cos(p.x * (freq * 0.53) - t * 0.82 + fi * 2.31) * (u_waveAmplitude * 0.09);
      wave += sin((p.x + p.y) * 1.8 + t * 0.45) * 0.04;

      // Distance to stream line
      float centerOffset = (fi - float(u_iterations - 1) * 0.5) * 0.32;
      float dist = abs(p.y - wave - centerOffset);

      // Core illumination intensity with soft falloff
      float core = u_lineThickness / max(dist, 0.0006);
      float beam = pow(core, 1.28);

      // Chromatic liquid prism dispersion (subtle warm fringe on leading edge, cool on trailing)
      vec3 beamColor = u_lineColor;
      beamColor.r += sin(fi * 1.4 + t * 0.6) * 0.12 + 0.04;
      beamColor.g += 0.05;
      beamColor.b += cos(fi * 1.8 + t * 0.45) * 0.20 + 0.08;

      colAccum += beamColor * (beam / zDepth);
    }

    // Apply brightness and tone mapping
    vec3 result = colAccum * u_brightness;
    result = (result - 0.5) * u_contrast + 0.5;
    result = clamp(result, 0.0, 1.0);

    // Luminance blend over background
    float lum = dot(result, vec3(0.299, 0.587, 0.114));
    vec3 finalColor = mix(u_bgColor, result, clamp(lum * 1.8, 0.0, 1.0) * u_opacity);

    gl_FragColor = vec4(finalColor, u_opacity);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return [1, 1, 1];
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255
  ];
}

export const LiquidLines: React.FC<LiquidLinesProps> = ({
  width = '100%',
  height = '100%',
  speed = 0.4,
  iterations = 3,
  waveFrequency = 49,
  depthStep = 0.05,
  lineThickness = 0.009,
  waveAmplitude = 0.6,
  lineColor = '#06c8d9',
  lightBackground = '#ffffff',
  darkBackground = '#070D18',
  brightness = 2.5,
  contrast = 1.1,
  offsetX = 0,
  offsetY = 0,
  scale = 0.3,
  opacity = 1.0,
  className = '',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);

  const rgbLineColor = useMemo(() => hexToRgb(lineColor), [lineColor]);
  const rgbDarkBg = useMemo(() => hexToRgb(darkBackground), [darkBackground]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance' 
    });
    if (!gl) return;

    // Compile helper
    const createShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('LiquidLines Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('LiquidLines Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Full quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPositionLocation);
    gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uSpeed = gl.getUniformLocation(program, 'u_speed');
    const uIterations = gl.getUniformLocation(program, 'u_iterations');
    const uWaveFrequency = gl.getUniformLocation(program, 'u_waveFrequency');
    const uDepthStep = gl.getUniformLocation(program, 'u_depthStep');
    const uLineThickness = gl.getUniformLocation(program, 'u_lineThickness');
    const uWaveAmplitude = gl.getUniformLocation(program, 'u_waveAmplitude');
    const uLineColor = gl.getUniformLocation(program, 'u_lineColor');
    const uBgColor = gl.getUniformLocation(program, 'u_bgColor');
    const uBrightness = gl.getUniformLocation(program, 'u_brightness');
    const uContrast = gl.getUniformLocation(program, 'u_contrast');
    const uOffset = gl.getUniformLocation(program, 'u_offset');
    const uScale = gl.getUniformLocation(program, 'u_scale');
    const uOpacity = gl.getUniformLocation(program, 'u_opacity');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    // Resize handling
    let animationFrameId: number;
    let startTime = performance.now();

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Render loop
    const render = (time: number) => {
      const elapsed = (time - startTime) * 0.001;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uSpeed, speed);
      gl.uniform1i(uIterations, Math.min(iterations, 8));
      gl.uniform1f(uWaveFrequency, waveFrequency);
      gl.uniform1f(uDepthStep, depthStep);
      gl.uniform1f(uLineThickness, lineThickness);
      gl.uniform1f(uWaveAmplitude, waveAmplitude);
      gl.uniform3f(uLineColor, rgbLineColor[0], rgbLineColor[1], rgbLineColor[2]);
      gl.uniform3f(uBgColor, rgbDarkBg[0], rgbDarkBg[1], rgbDarkBg[2]);
      gl.uniform1f(uBrightness, brightness);
      gl.uniform1f(uContrast, contrast);
      gl.uniform2f(uOffset, offsetX, offsetY);
      gl.uniform1f(uScale, scale);
      gl.uniform1f(uOpacity, opacity);
      gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Mouse movement
    const onMouseMove = (e: MouseEvent) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouseRef.current = [x, y];
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      if (program) {
        gl.deleteProgram(program);
      }
      if (vertShader) gl.deleteShader(vertShader);
      if (fragShader) gl.deleteShader(fragShader);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
    };
  }, [
    speed,
    iterations,
    waveFrequency,
    depthStep,
    lineThickness,
    waveAmplitude,
    rgbLineColor,
    rgbDarkBg,
    brightness,
    contrast,
    offsetX,
    offsetY,
    scale,
    opacity,
    interactive,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden w-full h-full ${className}`.trim()}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LiquidLines;
