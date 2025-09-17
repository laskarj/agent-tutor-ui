import React, { useEffect, useRef } from 'react';

type Props = {
  audioEl?: HTMLAudioElement | null;
  width?: number;
  height?: number;
  colors?: string[];
  backgroundColor?: string;
};

const AgentSpectrum: React.FC<Props> = ({
  audioEl,
  width = 120,
  height = 120,
  colors = ['#4A90E2', '#7B68EE', '#E6A8E6'],
  backgroundColor = 'transparent',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioEl) return;

    // Hi-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Prefer captureStream to avoid MediaElementSourceNode one-per-element limitation
    const capture: any = (audioEl as any).captureStream || (audioEl as any).mozCaptureStream;
    if (!capture) return; // no-op if unsupported

    const mediaStream: MediaStream = capture.call(audioEl);
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const src = ctx.createMediaStreamSource(mediaStream);
    src.connect(analyser);

    ctxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = src as unknown as MediaElementAudioSourceNode; // type shim; it's a MediaStreamAudioSourceNode

    const g = canvas.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Liquid radial blob parameters
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 4;
    const base = radius * 0.75; // base radius for primary blob
    const amp = radius * 0.35; // amplitude of deformation
    const points = 72;
    const smoothA: number[] = Array(points).fill(base);
    const smoothB: number[] = Array(points).fill(base * 0.9);

    const makeGradient = () => {
      const grad = g.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
      const stops = colors.length;
      colors.forEach((c, i) => grad.addColorStop(i / Math.max(1, stops - 1), c));
      return grad;
    };
    const gradientA = makeGradient();
    const gradientB = makeGradient();

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const drawBlob = (radii: number[], fill: CanvasGradient, alpha = 0.55, strokeAlpha = 0.25) => {
      // Compute polar points
      const pts: [number, number][] = [];
      for (let i = 0; i < points; i++) {
        const ang = (i / points) * Math.PI * 2;
        const rr = radii[i];
        pts.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]);
      }
      // Draw smooth closed curve via quadratic curves between midpoints
      g.beginPath();
      for (let i = 0; i < points; i++) {
        const cur = pts[i];
        const next = pts[(i + 1) % points];
        const mid = [(cur[0] + next[0]) / 2, (cur[1] + next[1]) / 2];
        if (i === 0) g.moveTo(mid[0], mid[1]);
        g.quadraticCurveTo(cur[0], cur[1], mid[0], mid[1]);
      }
      g.closePath();
      g.fillStyle = fill;
      g.globalAlpha = alpha;
      g.fill();
      g.globalAlpha = 1;
      g.strokeStyle = `rgba(255,255,255,${strokeAlpha})`;
      g.lineWidth = 1.5;
      g.stroke();
    };

    const t0 = performance.now();
    const draw = () => {
      const t = (performance.now() - t0) / 1000; // seconds
      analyser.getByteTimeDomainData(dataArray);
      g.clearRect(0, 0, width, height);
      if (backgroundColor && backgroundColor !== 'transparent') {
        g.fillStyle = backgroundColor;
        g.fillRect(0, 0, width, height);
      }
      // Circular background ring
      g.beginPath();
      g.arc(cx, cy, radius, 0, Math.PI * 2);
      g.strokeStyle = 'rgba(255,255,255,0.25)';
      g.lineWidth = 2;
      g.stroke();

      // Update smoothed radii based on waveform with two phases for gooey layers
      const step = Math.floor(dataArray.length / points);
      for (let i = 0; i < points; i++) {
        const idxA = (i * step) % dataArray.length;
        const idxB = ((i * step) + Math.floor(step / 2)) % dataArray.length;
        const vA = (dataArray[idxA] - 128) / 128; // -1..1
        const vB = (dataArray[idxB] - 128) / 128;
        const wobbleA = Math.sin(t * 1.2 + i * 0.18) * 0.12;
        const wobbleB = Math.cos(t * 0.9 + i * 0.23 + 1.3) * 0.18;
        const targetA = base + amp * (vA + wobbleA);
        const targetB = base * 0.9 + amp * 0.6 * (vB + wobbleB);
        smoothA[i] = lerp(smoothA[i], targetA, 0.15);
        smoothB[i] = lerp(smoothB[i], targetB, 0.12);
      }

      // Back layer (softer, larger alpha lower)
      drawBlob(smoothB, gradientB, 0.35, 0.15);
      // Front layer (brighter)
      drawBlob(smoothA, gradientA, 0.6, 0.25);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { (sourceRef.current as any)?.disconnect?.(); } catch {}
      try { analyser.disconnect(); } catch {}
      try { ctx.close(); } catch {}
      analyserRef.current = null;
      sourceRef.current = null;
      ctxRef.current = null;
    };
  }, [audioEl, colors, backgroundColor, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', borderRadius: '9999px', boxShadow: '0 0 20px rgba(255,255,255,0.15)' }}
    />
  );
};

export default AgentSpectrum;
