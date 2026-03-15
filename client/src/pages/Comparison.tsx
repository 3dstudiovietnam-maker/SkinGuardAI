/* DermIQ Comparison - Before/After Slider View */
import { useParams, Link } from "wouter";
import { useSkinStore } from "@/contexts/SkinStore";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

export default function Comparison() {
  const { id } = useParams<{ id: string }>();
  const { getMole } = useSkinStore();
  const mole = getMole(id || "");

  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Set initial indices when mole loads
  useState(() => {
    if (mole && mole.photos.length >= 2) {
      setLeftIdx(0);
      setRightIdx(mole.photos.length - 1);
    }
  });

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  if (!mole) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-2xl font-bold mb-3">Mole Not Found</h1>
        <Link href="/dashboard"><Button className="bg-primary">Back to Dashboard</Button></Link>
      </div>
    );
  }

  if (mole.photos.length < 2) {
    return (
      <div className="container py-20 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="font-heading text-2xl font-bold mb-3">Need More Photos</h1>
          <p className="text-muted-foreground mb-6">You need at least 2 photos to compare changes. Take another photo of "{mole.name}" to use the comparison tool.</p>
          <Link href={`/capture/${encodeURIComponent(mole.region)}`}>
            <Button className="bg-primary">Take Another Photo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const leftPhoto = mole.photos[leftIdx];
  const rightPhoto = mole.photos[rightIdx];

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/mole/${mole.id}`}>
          <button className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold">Compare Photos</h1>
          <p className="text-sm text-muted-foreground">{mole.name} &middot; {mole.region}</p>
        </div>
      </div>

      {/* Photo Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Before (Older)</label>
          <select
            value={leftIdx}
            onChange={e => setLeftIdx(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
          >
            {mole.photos.map((p, i) => (
              <option key={p.id} value={i}>
                {new Date(p.timestamp).toLocaleDateString()} {i === 0 ? "(First)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">After (Newer)</label>
          <select
            value={rightIdx}
            onChange={e => setRightIdx(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
          >
            {mole.photos.map((p, i) => (
              <option key={p.id} value={i}>
                {new Date(p.timestamp).toLocaleDateString()} {i === mole.photos.length - 1 ? "(Latest)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Slider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-black aspect-square cursor-col-resize select-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseDown={() => { isDragging.current = true; }}
        onMouseUp={() => { isDragging.current = false; }}
        onMouseLeave={() => { isDragging.current = false; }}
        onTouchStart={() => { isDragging.current = true; }}
        onTouchEnd={() => { isDragging.current = false; }}
      >
        {/* Right (After) image - full background */}
        <img
          src={rightPhoto.dataUrl}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Left (Before) image - clipped */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={leftPhoto.dataUrl}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: `${containerRef.current?.offsetWidth || 600}px` }}
          />
        </div>
        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <ChevronLeft className="w-3 h-3 text-gray-600" />
            <ChevronRight className="w-3 h-3 text-gray-600" />
          </div>
        </div>
        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          Before
        </div>
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          After
        </div>
      </motion.div>

      {/* Date Info */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-card rounded-xl border border-border/60 p-3 text-center">
          <p className="text-xs text-muted-foreground">Before</p>
          <p className="text-sm font-semibold">{new Date(leftPhoto.timestamp).toLocaleDateString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/60 p-3 text-center">
          <p className="text-xs text-muted-foreground">After</p>
          <p className="text-sm font-semibold">{new Date(rightPhoto.timestamp).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Side by Side */}
      <div className="mt-6">
        <h3 className="font-heading font-semibold mb-3">Side by Side</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl overflow-hidden bg-muted aspect-square">
            <img src={leftPhoto.dataUrl} alt="Before" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-xl overflow-hidden bg-muted aspect-square">
            <img src={rightPhoto.dataUrl} alt="After" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
