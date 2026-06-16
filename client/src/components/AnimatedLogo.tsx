/**
 * AnimatedLogo – SkinGuard AI eye logo that reacts to AI risk level
 *
 * low    → wink + cyan sparkles + 👍
 * medium → slow squint / thinking + 🤔
 * high   → worried half-lid + horizontal shake + 👎
 */
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Shared AudioContext — reuse across calls, resume() unlocks autoplay policy
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!_audioCtx || _audioCtx.state === "closed") {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _audioCtx;
}

/** Play a funny sound for each risk level using Web Audio API */
async function playRiskSound(riskLevel: "low" | "medium" | "high") {
  try {
    const ctx = getAudioCtx();
    await ctx.resume(); // unlocks browser autoplay policy

    const play = (freq: number, startTime: number, duration: number, type: OscillatorType = "sine", gain = 0.18) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.connect(vol);
      vol.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      vol.gain.setValueAtTime(0, ctx.currentTime + startTime);
      vol.gain.linearRampToValueAtTime(gain, ctx.currentTime + startTime + 0.02);
      vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    if (riskLevel === "low") {
      play(523, 0.0,  0.18, "triangle", 0.20);
      play(659, 0.15, 0.18, "triangle", 0.20);
      play(784, 0.30, 0.18, "triangle", 0.20);
      play(1047,0.45, 0.35, "triangle", 0.22);
      play(2093,0.45, 0.20, "sine",     0.06);
    } else if (riskLevel === "medium") {
      play(440, 0.0,  0.25, "sine", 0.15);
      play(415, 0.22, 0.25, "sine", 0.15);
      play(440, 0.44, 0.25, "sine", 0.15);
      play(415, 0.66, 0.35, "sine", 0.10);
    } else {
      play(220, 0.0,  0.22, "sawtooth", 0.18);
      play(185, 0.25, 0.22, "sawtooth", 0.18);
      play(147, 0.50, 0.55, "sawtooth", 0.22);
      play(73,  0.50, 0.45, "sine",     0.20);
    }
  } catch {
    // AudioContext not supported – silently ignore
  }
}

type RiskLevel = "low" | "medium" | "high";

interface AnimatedLogoProps {
  riskLevel: RiskLevel;
  size?: number;
  className?: string;
}

const RISK = {
  low:    { glow: "#00ee44", emoji: "👍", emojiLabel: "Low risk" },
  medium: { glow: "#ffcc00", emoji: "🤔", emojiLabel: "Medium risk" },
  high:   { glow: "#ff1111", emoji: "👎", emojiLabel: "High risk" },
};

// Sparkle positions for "low" animation
const SPARKLES = [
  { x: 62,  y: 38, delay: 0 },
  { x: 138, y: 32, delay: 0.4 },
  { x: 100, y: 20, delay: 0.8 },
];

export function AnimatedLogo({ riskLevel, size = 150, className = "" }: AnimatedLogoProps) {
  const uid      = useId().replace(/:/g, "");   // unique SVG id prefix
  const lid      = useAnimation();              // eyelid rect
  const shake    = useAnimation();             // container shake for high
  const glow     = useAnimation();             // iris glow ring
  const prevRisk = useRef<string | null>(null); // track previous riskLevel
  const [showMsg] = useState(true); // always visible – never hide
  const { t } = useLanguage();

  useEffect(() => {
    // Always restart animations on riskLevel change
    lid.stop();
    shake.stop();
    glow.stop();
    shake.set({ x: 0 });

    // Sound only on first render or change
    if (prevRisk.current !== riskLevel) {
      prevRisk.current = riskLevel;
      playRiskSound(riskLevel);
    }

    if (riskLevel === "low") {
      // 4 quick flashes then continuous wink
      glow.start({
        opacity: [0, 1, 0, 1, 0, 1, 0, 1, 0.25],
        scale:   [1, 1.15, 1, 1.15, 1, 1.15, 1, 1.15, 1],
        transition: { duration: 1.2, times: [0, .06, .12, .19, .25, .31, .37, .44, 1], ease: "easeInOut" },
      }).then(() => {
        glow.start({
          opacity: [0.25, 0.8, 0.25],
          scale:   [1, 1.08, 1],
          transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
        });
      });
      lid.start({
        height: [0, 83, 83, 0],
        transition: { duration: 0.55, times: [0, 0.35, 0.65, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 2.8 },
      });
    } else if (riskLevel === "medium") {
      // 4 quick flashes then slow squint
      glow.start({
        opacity: [0, 1, 0, 1, 0, 1, 0, 1, 0.2],
        transition: { duration: 1.2, times: [0, .06, .12, .19, .25, .31, .37, .44, 1], ease: "easeInOut" },
      }).then(() => {
        glow.start({
          opacity: [0.2, 0.7, 0.2],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        });
      });
      lid.start({
        height: [0, 36, 36, 0],
        transition: { duration: 3.5, times: [0, 0.35, 0.65, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 },
      });
    } else {
      // 4 urgent flashes then worried shake
      glow.start({
        opacity: [0, 1, 0, 1, 0, 1, 0, 1, 0.15],
        transition: { duration: 1.0, times: [0, .06, .12, .19, .25, .31, .37, .44, 1], ease: "easeInOut" },
      }).then(() => {
        glow.start({
          opacity: [0.15, 0.65, 0.15],
          transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        });
      });
      lid.start({ height: 32, transition: { duration: 0.3 } });
      shake.start({
        x: [0, -7, 7, -7, 7, -4, 4, 0],
        transition: { duration: 0.55, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.2 },
      });
    }

    return () => {};
  }, [riskLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const cfg = RISK[riskLevel];

  // SVG viewBox: 200 × 230
  // Eye center: cx=100 cy=78  iris r=47
  const cx = 100, cy = 78, ir = 47;

  const msgKey = `aiMessages.${riskLevel}` as const;
  const msgText = t(msgKey);

  const handleClick = () => {
    playRiskSound(riskLevel); // replay sound on tap
  };

  return (
    <div
      className={`flex flex-col items-center select-none ${className}`}
      style={{ width: size, cursor: "pointer" }}
      onClick={handleClick}
      title="🔊 Tap to replay"
    >
      <motion.div animate={shake} style={{ width: size, height: (size * 230) / 200 }}>
        <svg
          viewBox="0 0 200 230"
          width={size}
          height={(size * 230) / 200}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`SkinGuard AI logo – ${cfg.emojiLabel}`}
        >
          <defs>
            {/* Eye-shape clip */}
            <clipPath id={`ec-${uid}`}>
              <path d="M 8,78 Q 52,22 100,22 Q 148,22 192,78 Q 148,134 100,134 Q 52,134 8,78 Z" />
            </clipPath>

            {/* Iris radial gradient */}
            <radialGradient id={`ig-${uid}`} cx="42%" cy="40%" r="58%">
              <stop offset="0%"   stopColor="#56d8ff" />
              <stop offset="30%"  stopColor="#0099dd" />
              <stop offset="70%"  stopColor="#0055aa" />
              <stop offset="100%" stopColor="#002266" />
            </radialGradient>

            {/* Glow filter */}
            <filter id={`gf-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Sparkle glow */}
            <filter id={`sf-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>

          {/* ── Outer dark eye-shadow frame ── */}
          <path
            d="M 0,78 Q 46,5 100,5 Q 154,5 200,78 Q 154,151 100,151 Q 46,151 0,78 Z"
            fill="#0b1a3a"
          />

          {/* ── Sclera (white of eye) ── */}
          <path
            d="M 8,78 Q 52,22 100,22 Q 148,22 192,78 Q 148,134 100,134 Q 52,134 8,78 Z"
            fill="#daeef6"
          />

          {/* ── Iris ── */}
          <circle cx={cx} cy={cy} r={ir} fill={`url(#ig-${uid})`} />

          {/* Iris ray lines */}
          {Array.from({ length: 28 }).map((_, i) => {
            const a = (i * (360 / 28) * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={cx + 18 * Math.cos(a)} y1={cy + 18 * Math.sin(a)}
                x2={cx + 45 * Math.cos(a)} y2={cy + 45 * Math.sin(a)}
                stroke="#0044aa"
                strokeWidth="0.9"
                opacity="0.45"
              />
            );
          })}

          {/* ── Pupil ── */}
          <circle cx={cx} cy={cy} r={21} fill="#071226" />

          {/* ── Crosshair ── */}
          <g stroke="white" strokeWidth="1.6" opacity="0.88" strokeLinecap="round">
            <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} />
            <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 14} />
            <circle cx={cx} cy={cy} r={7} fill="none" />
          </g>

          {/* ── Main reflection ── */}
          <ellipse cx={cx + 14} cy={cy - 14} rx={9} ry={6.5}
            fill="white" opacity="0.68"
            transform={`rotate(-20, ${cx + 14}, ${cy - 14})`}
          />
          {/* Small secondary reflection */}
          <ellipse cx={cx - 10} cy={cy + 12} rx={4} ry={2.5}
            fill="white" opacity="0.22"
          />

          {/* ── Glow ring (animated, risk-colour) ── */}
          <motion.circle
            cx={cx} cy={cy} r={ir + 3}
            fill="none"
            stroke={cfg.glow}
            strokeWidth="3"
            filter={`url(#gf-${uid})`}
            animate={glow}
            initial={{ opacity: 0.3, scale: 1 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* ── ANIMATED EYELID (clipped to eye shape) ── */}
          <g clipPath={`url(#ec-${uid})`}>
            <motion.rect
              x="8" y="22"
              width="184"
              height={0}
              fill="#0b1a3a"
              animate={lid}
            />
          </g>

          {/* ── Worried brows for HIGH risk ── */}
          {riskLevel === "high" && (
            <g stroke="#0b1a3a" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9">
              {/* Left brow – angles downward toward nose */}
              <path d="M 42,14 Q 60,8 76,16" />
              {/* Right brow – mirrors */}
              <path d="M 124,16 Q 140,8 158,14" />
            </g>
          )}

          {/* ── LOW RISK sparkle particles ── */}
          {riskLevel === "low" && SPARKLES.map((s, i) => (
            <motion.text
              key={i}
              x={s.x} y={s.y}
              textAnchor="middle"
              fontSize="14"
              initial={{ opacity: 0, y: s.y }}
              animate={{ opacity: [0, 1, 0], y: [s.y, s.y - 22] }}
              transition={{
                duration: 1.4,
                delay: s.delay,
                repeat: Infinity,
                repeatDelay: 2.2,
                ease: "easeOut",
              }}
            >
              ✨
            </motion.text>
          ))}

          {/* ── Logo text: "SkinGuard AI" ── */}
          <text
            x="100" y="176"
            textAnchor="middle"
            fontFamily="'Segoe UI', Arial, sans-serif"
            fontWeight="700"
            fontSize="15"
          >
            <tspan fill="#0d1b3e">SkinGuard </tspan>
            <tspan fill="#00b4d8">AI</tspan>
          </text>

          {/* ── Risk emoji ── */}
          <motion.text
            x="100" y="212"
            textAnchor="middle"
            fontSize="36"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
            style={{ transformOrigin: "100px 200px" }}
          >
            {cfg.emoji}
          </motion.text>
        </svg>
      </motion.div>

      {/* ── Animated risk message ── */}
      <AnimatePresence>
        {showMsg && (
          <motion.div
            key={riskLevel}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            style={{
              marginTop: 10,
              width: Math.max(size * 1.6, 200),
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1.4,
              color: cfg.glow,
              textShadow: `0 0 8px ${cfg.glow}55`,
              fontFamily: "'Segoe UI', Arial, sans-serif",
            }}
          >
            {msgText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
