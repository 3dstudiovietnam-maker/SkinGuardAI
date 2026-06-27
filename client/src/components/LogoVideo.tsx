import { useEffect, useRef } from "react";

/**
 * Renders the animated logo video onto a <canvas>, removing its near-white
 * background so the logo sits transparently on any nav background (works in
 * both light and dark themes). Same-origin video, so the canvas is not tainted.
 */
export default function LogoVideo({ src, className }: { src: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    let raf = 0;

    const draw = () => {
      if (video.readyState >= 2 && video.videoWidth) {
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = img.data;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            if (r > 236 && g > 236 && b > 236) {
              d[i + 3] = 0; // near-white background -> transparent
            } else if (r > 208 && g > 208 && b > 208) {
              d[i + 3] = Math.max(0, 255 - (r - 208) * 5); // soft edge
            }
          }
          ctx.putImageData(img, 0, 0);
        } catch {
          /* ignore (e.g. frame not ready) */
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const start = () => { video.play().catch(() => {}); draw(); };
    video.addEventListener("loadeddata", start);
    if (video.readyState >= 2) start();
    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadeddata", start);
    };
  }, [src]);

  return (
    <>
      <video ref={videoRef} src={src} autoPlay loop muted playsInline className="hidden" aria-hidden="true" />
      <canvas ref={canvasRef} className={className} />
    </>
  );
}
