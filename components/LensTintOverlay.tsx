"use client";

import { useEffect, useRef, useState } from "react";

type Region = { pixels: number[]; area: number; centerX: number };

export default function LensTintOverlay({ src, color }: { src: string; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled || !canvasRef.current) return;
      try {
        const width = Math.min(image.naturalWidth, 900);
        const height = Math.max(1, Math.round(image.naturalHeight * width / image.naturalWidth));
        const source = document.createElement("canvas");
        source.width = width;
        source.height = height;
        const sourceContext = source.getContext("2d", { willReadFrequently: true });
        if (!sourceContext) return;
        sourceContext.drawImage(image, 0, 0, width, height);
        const data = sourceContext.getImageData(0, 0, width, height).data;
        const total = width * height;
        const visited = new Uint8Array(total);
        const regions: Region[] = [];
        const isOpening = (index: number) => {
          const offset = index * 4;
          return data[offset + 3] < 32 || (data[offset] > 210 && data[offset + 1] > 210 && data[offset + 2] > 210);
        };

        for (let start = 0; start < total; start++) {
          if (visited[start] || !isOpening(start)) continue;
          const pixels = [start];
          visited[start] = 1;
          let touchesEdge = false;
          let sumX = 0;
          let sumY = 0;
          for (let head = 0; head < pixels.length; head++) {
            const index = pixels[head];
            const x = index % width;
            const y = Math.floor(index / width);
            sumX += x;
            sumY += y;
            if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesEdge = true;
            const neighbors = [x > 0 ? index - 1 : -1, x < width - 1 ? index + 1 : -1, y > 0 ? index - width : -1, y < height - 1 ? index + width : -1];
            for (const neighbor of neighbors) {
              if (neighbor < 0 || visited[neighbor] || !isOpening(neighbor)) continue;
              visited[neighbor] = 1;
              pixels.push(neighbor);
            }
          }
          const centerY = sumY / pixels.length;
          if (!touchesEdge && pixels.length > total * .005 && pixels.length < total * .45 && centerY > height * .12 && centerY < height * .88) {
            regions.push({ pixels, area: pixels.length, centerX: sumX / pixels.length });
          }
        }

        const left = regions.filter(region => region.centerX < width / 2).sort((a, b) => b.area - a.area)[0];
        const right = regions.filter(region => region.centerX >= width / 2).sort((a, b) => b.area - a.area)[0];
        if (!left || !right) { setFallback(true); return; }

        const colorCanvas = document.createElement("canvas");
        colorCanvas.width = colorCanvas.height = 1;
        const colorContext = colorCanvas.getContext("2d");
        if (!colorContext) return;
        colorContext.fillStyle = color;
        colorContext.fillRect(0, 0, 1, 1);
        const [red, green, blue] = colorContext.getImageData(0, 0, 1, 1).data;
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) return;
        const overlay = context.createImageData(width, height);
        for (const region of [left, right]) {
          for (const index of region.pixels) {
            const offset = index * 4;
            overlay.data[offset] = red;
            overlay.data[offset + 1] = green;
            overlay.data[offset + 2] = blue;
            overlay.data[offset + 3] = 190;
          }
        }
        context.putImageData(overlay, 0, 0);
        if (!cancelled) setFallback(false);
      } catch {
        if (!cancelled) setFallback(true);
      }
    };
    image.onerror = () => { if (!cancelled) setFallback(true); };
    image.src = src;
    return () => { cancelled = true; image.onload = null; image.onerror = null; };
  }, [src, color]);

  return <>
    <canvas ref={canvasRef} className="frame-lens-tint" style={{ display: fallback ? "none" : undefined }} aria-hidden="true" />
    {fallback && <svg className="frame-lens-tint" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M14.2 17 C18.5 8.5 37.5 7.5 43.8 15.5 C46 18.5 46.5 23 46.2 29 L44.8 65 C44.3 79 38.4 88 27.8 88.7 C18.5 89.2 13.4 83.5 12.2 72 L10.7 31 C10.4 24 11.5 20 14.2 17 Z" fill={color} />
      <path d="M85.8 17 C81.5 8.5 62.5 7.5 56.2 15.5 C54 18.5 53.5 23 53.8 29 L55.2 65 C55.7 79 61.6 88 72.2 88.7 C81.5 89.2 86.6 83.5 87.8 72 L89 31 C89.3 24 88.5 20 85.8 17 Z" fill={color} />
    </svg>}
  </>;
}
