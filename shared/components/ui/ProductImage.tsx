import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { FiImage } from "react-icons/fi";

// Global cache of URLs that have been fully loaded — survives remounts
const loadedImages = new Set<string>();
// Track URLs that failed to load
const failedImages = new Set<string>();

// Keep loaded Image objects alive so we can draw them to canvas instantly
const imageObjects = new Map<string, HTMLImageElement>();

// Prefetch an image URL so it's ready before the component mounts
export function prefetchImage(url: string): Promise<void> {
  if (loadedImages.has(url)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      loadedImages.add(url);
      imageObjects.set(url, img);
      resolve();
    };
    img.onerror = () => {
      failedImages.add(url);
      resolve();
    };
    img.src = url;
  });
}

// For backwards compat with any code referencing the old export
export const prefetchedImages = loadedImages;

const ErrorPlaceholder = ({ style }: { style: React.CSSProperties }) => (
  <div
    style={{
      ...style,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f1f5f9",
    }}
  >
    <FiImage size={28} color="#cbd5e1" />
  </div>
);

interface ProductImageProps {
  source: string;
  style?: React.CSSProperties;
  alt?: string;
}

const ProductImage = React.memo(({
  source,
  style = {},
  alt = "Product image",
}: ProductImageProps) => {
  // If this URL already failed, show placeholder immediately
  if (failedImages.has(source)) {
    return <ErrorPlaceholder style={style} />;
  }

  // Ensure we have both a loadedImages entry AND an Image object for canvas drawing
  if (!imageObjects.has(source)) {
    const probe = new window.Image();
    probe.src = source;
    if (probe.complete && probe.naturalWidth > 0) {
      loadedImages.add(source);
      imageObjects.set(source, probe);
    }
  }

  const alreadyCached = loadedImages.has(source);
  const [loaded, setLoaded] = useState(alreadyCached);
  const [error, setError] = useState(false);
  const hasAnimated = useRef(alreadyCached);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = (canvas: HTMLCanvasElement) => {
    const cachedImg = imageObjects.get(source);
    if (!cachedImg || !cachedImg.complete) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // object-fit: contain
    const scale = Math.min(
      rect.width / cachedImg.naturalWidth,
      rect.height / cachedImg.naturalHeight
    );
    const drawW = cachedImg.naturalWidth * scale;
    const drawH = cachedImg.naturalHeight * scale;
    const x = (rect.width - drawW) / 2;
    const y = (rect.height - drawH) / 2;

    ctx.drawImage(cachedImg, x, y, drawW, drawH);
  };

  // Draw cached image to canvas BEFORE the browser paints — no blank frame.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasAnimated.current) return;
    drawCanvas(canvas);
  }, [source, loaded]);

  // Redraw canvas when it becomes visible (e.g. parent goes from height:0 to auto)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasAnimated.current) return;

    const observer = new ResizeObserver(() => {
      drawCanvas(canvas);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [source, loaded]);

  useEffect(() => {
    if (failedImages.has(source)) {
      setError(true);
      setLoaded(true);
      return;
    }
    if (loadedImages.has(source)) {
      setLoaded(true);
      hasAnimated.current = true;
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      loadedImages.add(source);
      imageObjects.set(source, img);
      setLoaded(true);
    };
    img.onerror = () => {
      failedImages.add(source);
      setError(true);
      setLoaded(true);
    };
    img.src = source;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [source]);

  if (error) {
    return <ErrorPlaceholder style={style} />;
  }

  // Cached images: canvas drawn synchronously before paint via useLayoutEffect
  if (hasAnimated.current) {
    return (
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        style={style}
      />
    );
  }

  return (
    <div style={{ position: "relative", ...style }}>
      {!loaded && (
        <div
          className="image-skeleton"
          style={{ ...style, position: "absolute", top: 0, left: 0 }}
        />
      )}
      <img
        src={source}
        alt={alt}
        decoding="sync"
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          objectFit: "contain",
        }}
        onLoad={(e) => {
          loadedImages.add(source);
          hasAnimated.current = true;
          imageObjects.set(source, e.currentTarget);
          setLoaded(true);
        }}
        onError={() => {
          failedImages.add(source);
          setError(true);
        }}
      />
    </div>
  );
});

export default ProductImage;
