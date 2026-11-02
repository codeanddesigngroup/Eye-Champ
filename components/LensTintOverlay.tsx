"use client";

import { useEffect, useRef, useState } from "react";

type Region = { pixels: number[]; area: number; centerX: number };

export default function LensTintOverlay({ src, detailSrc, color, strength = 0.8 }: { src: string; detailSrc?: string; color: string; strength?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = async () => {
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
        let detailData: Uint8ClampedArray | null = null;
        if (detailSrc) {
          const detailImage = new window.Image();
          detailImage.crossOrigin = "anonymous";
          await new Promise<void>((resolve) => {
            detailImage.onload = () => resolve();
            detailImage.onerror = () => resolve();
            detailImage.src = detailSrc;
          });
          if (detailImage.naturalWidth) {
            const detailCanvas = document.createElement("canvas");
            detailCanvas.width = width;
            detailCanvas.height = height;
            const detailContext = detailCanvas.getContext("2d", { willReadFrequently: true });
            detailContext?.drawImage(detailImage, 0, 0, width, height);
            detailData = detailContext?.getImageData(0, 0, width, height).data ?? null;
          }
        }
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
        if (!left || !right) return;

        let red: number;
        let green: number;
        let blue: number;
        if (color === "original" && detailData) {
          const lensPixels = [...left.pixels, ...right.pixels];
          const totals = lensPixels.reduce((sum, index) => {
            const offset = index * 4;
            sum[0] += detailData![offset];
            sum[1] += detailData![offset + 1];
            sum[2] += detailData![offset + 2];
            return sum;
          }, [0, 0, 0]);
          red = totals[0] / lensPixels.length;
          green = totals[1] / lensPixels.length;
          blue = totals[2] / lensPixels.length;
        } else {
          const colorCanvas = document.createElement("canvas");
          colorCanvas.width = colorCanvas.height = 1;
          const colorContext = colorCanvas.getContext("2d");
          if (!colorContext) return;
          colorContext.fillStyle = color;
          colorContext.fillRect(0, 0, 1, 1);
          [red, green, blue] = colorContext.getImageData(0, 0, 1, 1).data;
        }
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) return;
        const overlay = context.createImageData(width, height);
        const tintOpacity = Math.max(0, Math.min(1, strength));
        // Render the selected tint against a white lens base. The canvas must
        // be opaque inside the lens openings; otherwise the product photo's
        // original dark lenses bleed through and turn light colors grey.
        const compositeChannel = (channel: number) => Math.round(
          255 * (1 - tintOpacity) + channel * tintOpacity,
        );
        const compositeRed = compositeChannel(red);
        const compositeGreen = compositeChannel(green);
        const compositeBlue = compositeChannel(blue);
        for (const region of [left, right]) {
          const averageLuminance = detailData
            ? region.pixels.reduce((sum, index) => {
                const offset = index * 4;
                return sum + detailData![offset] * 0.2126 + detailData![offset + 1] * 0.7152 + detailData![offset + 2] * 0.0722;
              }, 0) / region.pixels.length
            : 255;
          for (const index of region.pixels) {
            const offset = index * 4;
            const sourceLuminance = detailData
              ? detailData[offset] * 0.2126 + detailData[offset + 1] * 0.7152 + detailData[offset + 2] * 0.0722
              : averageLuminance;
            // Preserve the original product's temple/reflection detail without
            // allowing its dark lens base to muddy the selected tint.
            // Convert the product's internal lens/temple variation into a
            // subtle blackish shadow instead of a light grey reflection.
            const detail = -Math.min(72, Math.abs(sourceLuminance - averageLuminance) * 0.65);
            overlay.data[offset] = Math.max(0, Math.min(255, compositeRed + detail));
            overlay.data[offset + 1] = Math.max(0, Math.min(255, compositeGreen + detail));
            overlay.data[offset + 2] = Math.max(0, Math.min(255, compositeBlue + detail));
            overlay.data[offset + 3] = 255;
          }
        }
        context.putImageData(overlay, 0, 0);
        if (!cancelled) setReady(true);
      } catch {}
    };
    image.onerror = () => {};
    image.src = src;
    return () => { cancelled = true; image.onload = null; image.onerror = null; };
  }, [src, detailSrc, color, strength]);

  return <canvas ref={canvasRef} className="frame-lens-tint" style={{ visibility: ready ? "visible" : "hidden" }} aria-hidden="true" />;
}
