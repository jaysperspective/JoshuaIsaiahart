"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/* ============================================================
   URAENIS — an interactive 8-bit star field universe
   Rendered in the classic Game Boy DMG 4-shade green palette.
   Explore with arrow keys / WASD · click to wish on a star.
   ============================================================ */

// Game Boy "DMG" palette (the original 4 greens) + a deep void
const PAL = {
  void: "#08160c", // space
  dark: "#0f380f", // darkest green (UI ink)
  c1: "#306230", // dim star
  c2: "#8bac0f", // mid star
  c3: "#9bbc0f", // bright star / shooting star
};

const SCALE = 4; // device-pixels per "game pixel" → chunky 8-bit look

type Star = {
  x: number;
  y: number;
  layer: 0 | 1 | 2; // far / mid / near (parallax depth)
  phase: number;
  speed: number;
  cross: boolean; // draws as a + sparkle when bright
};

type Trail = { x: number; y: number };
type Shooter = { x: number; y: number; vx: number; vy: number; trail: Trail[]; len: number };
type Sparkle = { x: number; y: number; life: number; max: number };
type Dir = "up" | "down" | "left" | "right";

// The secret: ↑ ↓ ← → ↑ ↓ ← → reveals the worlds
const CODE: Dir[] = ["up", "down", "left", "right", "up", "down", "left", "right"];

// The 7 worlds (our solar system minus Earth — you're already out here).
// Sized roughly to scale; Saturn & Uranus keep their rings.
const PLANETS: {
  name: string;
  href: string;
  color: string;
  ring?: boolean;
  size?: number;
}[] = [
  { name: "MERCURY", href: "/about", color: PAL.c1, size: 0.58 },
  { name: "VENUS", href: "/work?tab=photography", color: PAL.c3, size: 0.82 },
  { name: "MARS", href: "/work?tab=videography", color: PAL.c1, size: 0.7 },
  { name: "JUPITER", href: "/work", color: PAL.c2, size: 1.2 },
  { name: "SATURN", href: "/", color: PAL.c3, size: 1.05, ring: true },
  { name: "URANUS", href: "/work?tab=photography", color: PAL.c2, size: 0.9, ring: true },
  { name: "NEPTUNE", href: "/about", color: PAL.c2, size: 0.88 },
];

export default function UraenisClient({ fontClass }: { fontClass: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [showPlanets, setShowPlanets] = useState(false);
  const keysRef = useRef<Record<Dir, boolean>>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const seqRef = useRef<Dir[]>([]);

  // Record a direction press and check it against the secret code
  const registerDir = useCallback((dir: Dir) => {
    const seq = seqRef.current;
    seq.push(dir);
    if (seq.length > CODE.length) seq.shift();
    if (seq.length === CODE.length && CODE.every((d, i) => d === seq[i])) {
      setShowPlanets(true);
      seq.length = 0;
    }
  }, []);
  const registerDirRef = useRef(registerDir);
  registerDirRef.current = registerDir;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let gw = 0;
    let gh = 0;
    let stars: Star[] = [];
    const shooters: Shooter[] = [];
    const sparkles: Sparkle[] = [];

    // camera (world pan) + eased mouse parallax
    let camX = 0;
    let camY = 0;
    let velX = 0;
    let velY = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let parX = 0;
    let parY = 0;
    const keys = keysRef.current; // shared with the on-screen D-pad

    let frame = 0;
    let raf = 0;
    let nextShoot = 40;

    const depthFor = (l: number) => (l === 0 ? 0.25 : l === 1 ? 0.55 : 1);

    function genStars() {
      const area = gw * gh;
      const count = Math.min(440, Math.max(150, Math.floor(area / 320)));
      stars = [];
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        const layer: 0 | 1 | 2 = r < 0.5 ? 0 : r < 0.82 ? 1 : 2;
        stars.push({
          x: Math.random() * gw,
          y: Math.random() * gh,
          layer,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.6,
          cross: layer === 2 && Math.random() < 0.2,
        });
      }
    }

    function resize() {
      gw = Math.max(80, Math.floor(window.innerWidth / SCALE));
      gh = Math.max(80, Math.floor(window.innerHeight / SCALE));
      canvas!.width = gw;
      canvas!.height = gh;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx!.imageSmoothingEnabled = false;
      genStars();
    }

    function spawnShooter(fromX?: number, fromY?: number) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const speed = 2.3 + Math.random() * 2.4;
      const slope = 0.45 + Math.random() * 0.5;
      shooters.push({
        x: fromX ?? Math.random() * gw,
        y: fromY ?? -3,
        vx: dir * speed,
        vy: speed * slope,
        trail: [],
        len: 8 + Math.floor(Math.random() * 9),
      });
    }

    function spawnSparkle(gx: number, gy: number) {
      sparkles.push({ x: gx, y: gy, life: 16, max: 16 });
    }

    function px(value: number) {
      return Math.floor(value);
    }

    function update() {
      // eased camera from held keys
      const maxv = 3.0;
      let tx = 0;
      let ty = 0;
      if (keys.left) tx -= 1;
      if (keys.right) tx += 1;
      if (keys.up) ty -= 1;
      if (keys.down) ty += 1;
      velX += (tx * maxv - velX) * 0.12;
      velY += (ty * maxv - velY) * 0.12;
      camX += velX;
      camY += velY;

      // eased mouse parallax
      parX += ((mouseX - 0.5) * 18 - parX) * 0.05;
      parY += ((mouseY - 0.5) * 18 - parY) * 0.05;

      // shooting stars
      nextShoot -= 1;
      if (nextShoot <= 0) {
        spawnShooter();
        nextShoot = 80 + Math.floor(Math.random() * 170);
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.trail.unshift({ x: s.x, y: s.y });
        if (s.trail.length > s.len) s.trail.pop();
        s.x += s.vx;
        s.y += s.vy;
        if (s.y > gh + s.len || s.x < -s.len || s.x > gw + s.len) {
          shooters.splice(i, 1);
        }
      }

      // sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        sparkles[i].life -= 1;
        if (sparkles[i].life <= 0) sparkles.splice(i, 1);
      }
    }

    function render() {
      const c = ctx!;
      c.fillStyle = PAL.void;
      c.fillRect(0, 0, gw, gh);

      const cx = camX + parX;
      const cy = camY + parY;

      // stars (parallax + twinkle)
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        const d = depthFor(st.layer);
        let sx = st.x - cx * d;
        let sy = st.y - cy * d;
        sx = ((sx % gw) + gw) % gw;
        sy = ((sy % gh) + gh) % gh;

        const tw = Math.sin(frame * 0.05 * st.speed + st.phase);
        let color: string;
        if (st.layer === 0) color = tw > 0.3 ? PAL.c2 : PAL.c1;
        else if (st.layer === 1) color = tw > 0.5 ? PAL.c3 : tw > -0.2 ? PAL.c2 : PAL.c1;
        else color = tw > 0.2 ? PAL.c3 : PAL.c2;

        c.fillStyle = color;
        const ix = px(sx);
        const iy = px(sy);
        if (st.cross && tw > 0.6) {
          c.fillRect(ix, iy, 1, 1);
          c.fillRect(ix - 1, iy, 1, 1);
          c.fillRect(ix + 1, iy, 1, 1);
          c.fillRect(ix, iy - 1, 1, 1);
          c.fillRect(ix, iy + 1, 1, 1);
        } else {
          c.fillRect(ix, iy, 1, 1);
        }
      }

      // shooting stars (head bright → tail dim)
      for (let i = 0; i < shooters.length; i++) {
        const s = shooters[i];
        for (let t = 0; t < s.trail.length; t++) {
          const tp = s.trail[t];
          const f = t / s.len;
          c.fillStyle = f < 0.3 ? PAL.c3 : f < 0.6 ? PAL.c2 : PAL.c1;
          c.fillRect(px(tp.x), px(tp.y), 1, 1);
        }
        c.fillStyle = PAL.c3;
        c.fillRect(px(s.x), px(s.y), 1, 1);
        c.fillRect(px(s.x) + 1, px(s.y), 1, 1);
      }

      // wish sparkles (expanding +)
      for (let i = 0; i < sparkles.length; i++) {
        const sp = sparkles[i];
        const p = 1 - sp.life / sp.max;
        const r = Math.floor(p * 4);
        c.fillStyle = p < 0.4 ? PAL.c3 : p < 0.7 ? PAL.c2 : PAL.c1;
        const ix = px(sp.x);
        const iy = px(sp.y);
        c.fillRect(ix, iy, 1, 1);
        c.fillRect(ix - r, iy, 1, 1);
        c.fillRect(ix + r, iy, 1, 1);
        c.fillRect(ix, iy - r, 1, 1);
        c.fillRect(ix, iy + r, 1, 1);
      }
    }

    function loop() {
      frame += 1;
      update();
      render();
      raf = requestAnimationFrame(loop);
    }

    // ---- input handlers ----
    function onResize() {
      resize();
    }
    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    }
    function onPointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("a")) return; // let the EXIT link work
      spawnShooter();
      spawnSparkle(e.clientX / SCALE, e.clientY / SCALE);
    }
    function dirForKey(key: string): Dir | null {
      switch (key) {
        case "ArrowLeft":
        case "a":
        case "A":
          return "left";
        case "ArrowRight":
        case "d":
        case "D":
          return "right";
        case "ArrowUp":
        case "w":
        case "W":
          return "up";
        case "ArrowDown":
        case "s":
        case "S":
          return "down";
        default:
          return null;
      }
    }
    function setKey(e: KeyboardEvent, down: boolean) {
      if (e.key === " ") {
        e.preventDefault();
        if (down && !e.repeat) spawnShooter();
        return;
      }
      const dir = dirForKey(e.key);
      if (!dir) return;
      keys[dir] = down;
      e.preventDefault();
      // Only the physical D-pad (arrow keys) feeds the secret code
      if (down && !e.repeat && e.key.startsWith("Arrow")) {
        registerDirRef.current(dir);
      }
    }
    const onKeyDown = (e: KeyboardEvent) => setKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => setKey(e, false);

    resize();
    // a few shooters to greet you
    spawnShooter();
    spawnShooter(gw * 0.7, gh * 0.1);

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <main
      className={`${fontClass} fixed inset-0 overflow-hidden select-none`}
      style={{ background: PAL.void, color: PAL.c3, cursor: "crosshair" }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 block"
        style={{ imageRendering: "pixelated" }}
      />

      {/* HUD — bottom-center cluster, held clear of the bottom edge.
          Inline offsets are used because this project's global reset
          (* { padding: 0 }) overrides Tailwind padding/margin utilities. */}
      <div
        className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
        style={{ bottom: "clamp(56px, 8vh, 96px)", gap: "14px" }}
      >
        <p
          className="text-[10px] leading-none sm:text-xs"
          style={{ color: PAL.c3, textShadow: `2px 2px 0 ${PAL.dark}` }}
        >
          <span className="ura-blink">★</span> URAENIS
        </p>
        <Link
          href="/"
          className="pointer-events-auto text-[9px] leading-none sm:text-[10px] ura-btn"
          style={{
            color: PAL.c3,
            textShadow: `2px 2px 0 ${PAL.dark}`,
            border: `2px solid ${PAL.c1}`,
            padding: "8px 14px",
            borderRadius: 4,
          }}
        >
          ◀ EXIT
        </Link>
      </div>

      {/* Planets — revealed by the ↑↓←→↑↓←→ D-pad code; clickable worlds */}
      {showPlanets && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          style={{ gap: "28px" }}
        >
          <p
            className="ura-rise text-[10px] sm:text-xs"
            style={{ color: PAL.c3, textShadow: `2px 2px 0 ${PAL.dark}` }}
          >
            ✦ SELECT A WORLD ✦
          </p>
          <div
            className="flex flex-wrap items-end justify-center"
            style={{ gap: "clamp(20px, 4vw, 52px)", maxWidth: "92vw" }}
          >
            {PLANETS.map((p, i) => (
              <Link
                key={p.name}
                href={p.href}
                className="ura-planet ura-rise pointer-events-auto flex flex-col items-center"
                style={{ gap: "12px", textDecoration: "none", animationDelay: `${i * 70}ms` }}
              >
                <span
                  style={{
                    position: "relative",
                    display: "block",
                    width: `calc(clamp(46px, 7vw, 78px) * ${p.size ?? 1})`,
                    height: `calc(clamp(46px, 7vw, 78px) * ${p.size ?? 1})`,
                  }}
                >
                  {p.ring && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: "-24%",
                        top: "30%",
                        width: "148%",
                        height: "40%",
                        border: `3px solid ${PAL.c2}`,
                        borderRadius: "50%",
                        transform: "rotate(-18deg)",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: p.color,
                      border: `2px solid ${PAL.dark}`,
                      boxShadow: `inset 6px 6px 0 0 ${PAL.c3}55, inset -9px -9px 0 0 ${PAL.dark}99`,
                      imageRendering: "pixelated",
                    }}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "27%",
                      top: "30%",
                      width: "12%",
                      height: "12%",
                      borderRadius: "50%",
                      background: `${PAL.dark}99`,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "56%",
                      top: "58%",
                      width: "16%",
                      height: "16%",
                      borderRadius: "50%",
                      background: `${PAL.dark}77`,
                    }}
                  />
                </span>
                <span
                  className="ura-pname text-[8px] sm:text-[9px]"
                  style={{ color: PAL.c2, textShadow: `1px 1px 0 ${PAL.dark}` }}
                >
                  {p.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes uraBlink { 0%, 55% { opacity: 1 } 56%, 100% { opacity: 0 } }
        .ura-blink { animation: uraBlink 1s steps(1) infinite; }
        .ura-btn:hover { background: ${PAL.c3}; color: ${PAL.dark} !important; text-shadow: none !important; }
        @keyframes uraRise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
        .ura-rise { animation: uraRise 380ms ease both; }
        .ura-planet { transition: transform 140ms ease; }
        .ura-planet:hover { transform: translateY(-5px) scale(1.08); }
        .ura-planet:hover .ura-pname { color: ${PAL.c3} !important; }
      `}</style>
    </main>
  );
}
