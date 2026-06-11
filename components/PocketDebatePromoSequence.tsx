"use client";

/**
 * PocketDebatePromoSequence
 *
 * Full-screen 16:9 cinematic promo — screen-recordable.
 *
 * SCENE 1  (~4.7s)  — "The world is arguing"
 *   Play scene1_final.mp4. Flash bursts synced to visual cuts.
 *   No text labels.
 *
 * SCENE 2  (~5s)    — Sudden silence / search screen
 *   Dark navy, search bar fades in, types "Where are global arguments settled?",
 *   cursor blink, Enter flash, submits.
 *
 * SCENE 3  (~14s)   — Pocket Debate reveal
 *   Phone mockup rises. Inside:
 *   - P. Pocket Debate logo
 *   - Motion field types "This House Believes..."
 *   - "Initiate Discourse" button click
 *   - Debate chamber crossfades in:
 *       two debater cards (SJ Oxford PROPOSITION / MC Cambridge OPPOSITION)
 *       central Arbiter AI icon with pulse
 *       phase indicators stepping: Opening → Rebuttal → Closing → Verdict
 *       ELO badges, subtle amber accent
 *
 * Place /public/videos/scene1_final.mp4 in your Next.js project.
 */

import React, {
  useEffect, useRef, useState, useCallback,
} from "react";

// ─── constants ────────────────────────────────────────────────────────────────

// Flash cut-points (seconds) — visually timed to the 4 cuts in the video:
// 0.0  protest crowd
// 1.15 flare/smoke
// 2.3  neoclassical columns
// 3.45 gavel
const FLASH_TIMES = [0.0, 1.15, 2.3, 3.45];
const SCENE1_DURATION = 4.67;

const SEARCH_QUERY = "Where are global arguments settled?";
const MOTION_TEXT  = "This House Believes That Democracy Cannot Survive Without Open Debate";

const PHASES = ["Opening", "Rebuttal", "Closing", "Verdict"];

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
function inject(id: string, css: string) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id; s.textContent = css;
  document.head.appendChild(s);
}

// ─── styles ───────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

/* tokens */
:root {
  --ink:       #0F172A;
  --ink2:      #1E293B;
  --parch:     #FDFBF7;
  --parch2:    #F5F2EC;
  --amber:     #B45309;
  --amber-lt:  #F59E0B;
  --rule:      #CBD5E1;
  --rule-d:    rgba(203,213,225,.17);
  --muted:     rgba(253,251,247,.42);
  --muted-ink: rgba(15,23,42,.46);
}

/* root */
.pd {
  position:relative; width:100%; aspect-ratio:16/9;
  max-width:1920px; margin:0 auto;
  background:var(--ink); overflow:hidden;
  font-family:'Inter','Helvetica Neue',sans-serif;
  user-select:none; -webkit-font-smoothing:antialiased;
}

/* ─ idle ─ */
.pd-idle {
  position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:1.5vw; background:var(--ink);
}
.pd-idle-mark {
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(40px,7vw,128px); font-weight:600;
  color:var(--parch); line-height:1; letter-spacing:-.01em;
}
.pd-idle-mark b { color:var(--amber); font-weight:600; }
.pd-idle-word {
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(10px,1.3vw,25px); font-weight:400;
  color:rgba(253,251,247,.5); letter-spacing:.22em; text-transform:uppercase;
}
.pd-idle-rule { width:clamp(20px,3vw,56px); height:1px; background:rgba(203,213,225,.12); }
.pd-idle-sub {
  font-size:clamp(6px,.6vw,11px); letter-spacing:.4em;
  color:rgba(253,251,247,.18); text-transform:uppercase;
}
.pd-start {
  margin-top:2vw; padding:.65vw 2.8vw;
  border:1px solid rgba(253,251,247,.17); background:transparent;
  color:var(--parch); font-family:'Inter',sans-serif;
  font-size:clamp(7px,.68vw,12px); letter-spacing:.34em; text-transform:uppercase;
  cursor:pointer; transition:border-color .25s,color .25s;
}
.pd-start:hover { border-color:var(--amber); color:var(--amber-lt); }

/* ─ scene 1 ─ */
.pd-s1 { position:absolute; inset:0; background:#000; }
.pd-s1 video {
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
}
.pd-s1-ov {
  position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(150deg,rgba(15,23,42,.48),rgba(15,23,42,.32));
}
.pd-s1-vig {
  position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(ellipse at center,transparent 50%,rgba(15,23,42,.72) 100%);
}
.pd-fw {
  position:absolute; inset:0; pointer-events:none;
  background:rgba(255,255,255,.95); opacity:0; transition:opacity .03s;
}
.pd-fw.on { opacity:1; }
.pd-fa {
  position:absolute; inset:0; pointer-events:none;
  background:rgba(180,83,9,.5); opacity:0; transition:opacity .04s;
}
.pd-fa.on { opacity:1; }

/* ─ scene 2 ─ */
.pd-s2 {
  position:absolute; inset:0; background:var(--ink);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.8vw;
}
.pd-s2-eye {
  font-size:clamp(7px,.58vw,10px); letter-spacing:.44em; text-transform:uppercase;
  color:rgba(253,251,247,.22);
  opacity:0; transform:translateY(-8px);
  transition:opacity .5s .35s,transform .5s .35s;
}
.pd-s2-eye.in { opacity:1; transform:none; }

.pd-sw {
  position:relative; width:min(560px,50vw);
  opacity:0; transform:translateY(16px) scale(.97);
  transition:opacity .55s .52s,transform .55s .52s cubic-bezier(.16,1,.3,1);
}
.pd-sw.in { opacity:1; transform:none; }
.pd-sb {
  display:flex; align-items:center; gap:.7vw;
  border:1px solid rgba(203,213,225,.17); background:rgba(30,41,59,.55);
  padding:.85vw 1.1vw; backdrop-filter:blur(12px); box-sizing:border-box;
}
.pd-sico {
  flex-shrink:0; width:clamp(11px,.95vw,17px); height:clamp(11px,.95vw,17px);
  color:rgba(253,251,247,.34);
}
.pd-stxt {
  flex:1; font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(11px,1.05vw,20px); color:var(--parch); min-height:1.4em; line-height:1.4;
}
.pd-cur {
  display:inline-block; width:1.5px; height:.9em; background:var(--amber-lt);
  margin-left:1px; vertical-align:text-bottom;
  animation:blink .7s step-end infinite;
}
.pd-cur.still { animation:none; opacity:1; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

.pd-hint {
  font-size:clamp(6px,.5vw,9px); letter-spacing:.22em; text-align:right;
  color:rgba(253,251,247,.18); text-transform:uppercase;
  margin-top:.4vw; opacity:0; transition:opacity .4s;
}
.pd-hint.on { opacity:1; }
.pd-ring {
  position:absolute; inset:-4px; border:1px solid var(--amber);
  opacity:0; pointer-events:none; transition:opacity .1s;
}
.pd-ring.on { opacity:1; }

/* ─ scene 3 ─ */
.pd-s3 {
  position:absolute; inset:0; background:var(--ink);
  display:flex; align-items:center; justify-content:center; perspective:1500px;
}

/* phone mockup */
.pd-phone {
  position:relative; width:min(260px,22vw);
  background:var(--ink2);
  border:1px solid rgba(203,213,225,.18);
  border-radius:clamp(12px,1.5vw,26px);
  box-shadow:0 0 0 1px rgba(0,0,0,.12),
             0 40px 100px rgba(0,0,0,.82),
             0 0 120px rgba(180,83,9,.07);
  overflow:hidden;
  opacity:0; transform:translateY(80px) scale(.88) rotateX(10deg);
  transition:opacity .9s,transform .9s cubic-bezier(.16,1,.3,1);
  transform-style:preserve-3d;
}
.pd-phone.in { opacity:1; transform:none; }

/* phone notch */
.pd-notch {
  height:clamp(14px,1.5vw,26px); background:var(--ink);
  display:flex; align-items:center; justify-content:center;
  border-bottom:1px solid rgba(203,213,225,.08);
}
.pd-notch-pill {
  width:clamp(30px,3.5vw,60px); height:clamp(5px,.55vw,9px);
  background:rgba(255,255,255,.1); border-radius:99px;
}

/* phone screen */
.pd-screen {
  padding:clamp(10px,1.2vw,20px) clamp(10px,1.2vw,20px) clamp(8px,1vw,16px);
  display:flex; flex-direction:column; gap:clamp(8px,.9vw,16px);
  min-height:clamp(200px,22vw,380px);
  position:relative;
}

/* logo inside phone */
.pd-ph-logo {
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(9px,.9vw,16px); font-weight:600; color:var(--parch);
  letter-spacing:.08em; display:flex; align-items:center; gap:.3em;
  opacity:0; transition:opacity .5s .35s;
}
.pd-ph-logo.in { opacity:1; }
.pd-ph-logo span { color:var(--amber); }

/* motion input field in phone */
.pd-ph-motion {
  border-left:2px solid var(--amber); padding:.5vw .65vw;
  background:rgba(180,83,9,.06);
  opacity:0; transition:opacity .5s .6s;
}
.pd-ph-motion.in { opacity:1; }
.pd-ph-ml {
  font-size:clamp(5px,.48vw,8px); letter-spacing:.28em; text-transform:uppercase;
  color:var(--amber); margin-bottom:.22vw;
}
.pd-ph-mt {
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(8px,.85vw,15px); color:var(--parch); line-height:1.45;
}

/* initiate button */
.pd-ph-btn {
  align-self:flex-start;
  padding:.42vw 1.2vw; background:var(--amber);
  font-family:'Inter',sans-serif;
  font-size:clamp(6px,.58vw,10px); letter-spacing:.2em; text-transform:uppercase;
  color:var(--parch); border:none; cursor:default;
  opacity:0; transform:translateY(6px);
  transition:opacity .4s,transform .4s,background .08s;
}
.pd-ph-btn.in { opacity:1; transform:none; }
.pd-ph-btn.click { background:rgba(180,83,9,.28); }

/* ─ debate chamber (overlays phone screen) ─ */
.pd-chamber {
  position:absolute; inset:0;
  background:var(--parch2);
  display:flex; flex-direction:column;
  opacity:0; pointer-events:none; transition:opacity .7s;
}
.pd-chamber.in { opacity:1; pointer-events:auto; }

/* chamber header */
.pd-ch-head {
  padding:clamp(6px,.7vw,12px) clamp(8px,.9vw,15px) 0;
  display:flex; align-items:center; gap:.4vw;
  flex-shrink:0;
}
.pd-ch-back {
  font-size:clamp(5px,.48vw,8px); color:var(--amber);
  letter-spacing:.06em;
}
.pd-ch-title {
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(8px,.82vw,15px); font-weight:600; color:var(--ink);
}

/* chamber body */
.pd-ch-body {
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:space-between;
  padding:clamp(4px,.5vw,9px) clamp(8px,.9vw,15px) clamp(6px,.7vw,12px);
  overflow:hidden;
}

/* motion text in chamber */
.pd-ch-motion {
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(7px,.78vw,14px); font-weight:600;
  color:var(--ink); text-align:center; line-height:1.35;
  opacity:0; transform:translateY(5px);
  transition:opacity .5s .2s,transform .5s .2s;
}
.pd-chamber.in .pd-ch-motion { opacity:1; transform:none; }

/* timer */
.pd-ch-timer {
  display:flex; align-items:center; gap:.35vw;
  opacity:0; transition:opacity .4s .4s;
}
.pd-chamber.in .pd-ch-timer { opacity:1; }
.pd-ch-timer-icon {
  width:clamp(6px,.62vw,11px); height:clamp(6px,.62vw,11px);
  color:var(--amber);
}
.pd-ch-timer-val {
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(9px,.92vw,17px); font-weight:600; color:var(--ink); letter-spacing:.06em;
}
.pd-ch-timer-bar {
  width:clamp(24px,2.8vw,50px); height:2px; background:rgba(203,213,225,.5);
  position:relative; overflow:hidden;
}
.pd-ch-timer-fill {
  position:absolute; inset-block:0; left:0;
  background:var(--amber);
  animation:timerDrain 4s linear infinite;
}
@keyframes timerDrain { from{width:100%} to{width:0%} }

/* debaters row */
.pd-debs {
  display:flex; align-items:flex-start; justify-content:center;
  gap:clamp(8px,.9vw,16px); width:100%;
  opacity:0; transition:opacity .5s .45s;
}
.pd-chamber.in .pd-debs { opacity:1; }

.pd-deb { display:flex; flex-direction:column; align-items:center; gap:.22vw; }
.pd-avw { position:relative; }
.pd-av {
  width:clamp(24px,2.9vw,52px); height:clamp(24px,2.9vw,52px); border-radius:50%;
  background:var(--ink); border:2px solid transparent;
  display:flex; align-items:center; justify-content:center;
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(7px,.75vw,14px); font-weight:600; color:var(--parch);
}
.pd-av.sp {
  border-color:var(--amber);
  box-shadow:0 0 0 clamp(2px,.22vw,4px) rgba(180,83,9,.2);
}
.pd-av-ping {
  position:absolute; top:-1px; right:-1px;
  width:clamp(5px,.5vw,8px); height:clamp(5px,.5vw,8px);
  border-radius:50%; background:var(--amber); border:1px solid var(--parch2);
}
.pd-dn {
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(6px,.68vw,12px); font-weight:600; color:var(--ink);
}
.pd-di { font-size:clamp(5px,.46vw,8px); color:var(--muted-ink); }
.pd-dr {
  font-size:clamp(4px,.4vw,7px); letter-spacing:.2em; text-transform:uppercase;
  color:var(--muted-ink); border:1px solid rgba(203,213,225,.65);
  padding:.1vw .3vw; margin-top:.06vw;
}
.pd-elo {
  font-size:clamp(4px,.38vw,6px); letter-spacing:.16em;
  color:var(--amber); border:1px solid rgba(180,83,9,.28); padding:.08vw .28vw;
}

/* arbiter centre */
.pd-arb { display:flex; flex-direction:column; align-items:center; gap:.3vw; padding-top:.35vw; }
.pd-arb-ico {
  width:clamp(18px,2.2vw,40px); height:clamp(18px,2.2vw,40px); border-radius:50%;
  border:1px solid var(--rule); background:rgba(255,255,255,.65);
  display:flex; align-items:center; justify-content:center; position:relative;
}
.pd-arb-pulse {
  position:absolute; inset:-3px; border-radius:50%;
  border:1px solid rgba(180,83,9,.26);
  animation:pulse 2.2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.14);opacity:1} }
.pd-arb-ico svg { width:44%; height:44%; color:var(--ink2); }
.pd-arb-ph {
  font-size:clamp(4px,.44vw,8px); letter-spacing:.18em; text-transform:uppercase;
  color:var(--amber); text-align:center; max-width:clamp(44px,5vw,88px); line-height:1.3;
}
.pd-arb-sub { font-size:clamp(3px,.38vw,6px); letter-spacing:.14em; text-transform:uppercase; color:var(--muted-ink); }

/* phase pills */
.pd-phases {
  display:flex; gap:.35vw;
  opacity:0; transition:opacity .5s .6s;
}
.pd-chamber.in .pd-phases { opacity:1; }
.pd-phase {
  font-size:clamp(4px,.4vw,7px); letter-spacing:.2em; text-transform:uppercase;
  color:rgba(15,23,42,.3); border:1px solid rgba(203,213,225,.35);
  padding:.2vw .5vw; transition:color .35s,border-color .35s,background .35s;
}
.pd-phase.active { color:var(--ink); border-color:rgba(203,213,225,.8); }
.pd-phase.done { color:var(--amber); border-color:rgba(180,83,9,.3); }

/* arbiter strip */
.pd-arb-strip {
  display:flex; align-items:center; gap:.4vw;
  opacity:0; transition:opacity .5s .75s;
}
.pd-chamber.in .pd-arb-strip { opacity:1; }
.pd-arb-dot {
  width:clamp(3px,.32vw,5px); height:clamp(3px,.32vw,5px); border-radius:50%;
  background:var(--amber); animation:pulse 2s ease-in-out infinite;
}
.pd-arb-label { font-size:clamp(4px,.38vw,6px); letter-spacing:.26em; text-transform:uppercase; color:rgba(15,23,42,.32); }

/* ─ grain / scan ─ */
.pd-grain {
  position:absolute; inset:0; pointer-events:none; mix-blend-mode:overlay; opacity:.48;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}
.pd-scan {
  position:absolute; inset:0; pointer-events:none;
  background:repeating-linear-gradient(to bottom,transparent,transparent 3px,rgba(0,0,0,.02) 3px,rgba(0,0,0,.02) 4px);
}

/* ─ replay ─ */
.pd-done {
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  background:rgba(15,23,42,0); opacity:0; pointer-events:none;
  transition:background 1.2s 1s,opacity .7s .7s;
}
.pd-done.in { opacity:1; background:rgba(15,23,42,.55); pointer-events:auto; }
.pd-replay {
  padding:.65vw 2.4vw; border:1px solid rgba(253,251,247,.2); background:transparent;
  color:var(--parch); font-family:'Inter',sans-serif;
  font-size:clamp(7px,.68vw,12px); letter-spacing:.34em; text-transform:uppercase;
  cursor:pointer; opacity:0; transform:translateY(10px);
  transition:opacity .5s 1.7s,transform .5s 1.7s,border-color .2s,color .2s;
}
.pd-done.in .pd-replay { opacity:1; transform:none; }
.pd-replay:hover { border-color:var(--amber); color:var(--amber-lt); }
`;

// ─── Scene 1 ──────────────────────────────────────────────────────────────────
function Scene1({ active, onDone }: { active: boolean; onDone: () => void }) {
  const vidRef        = useRef<HTMLVideoElement>(null);
  const [fw, setFW]   = useState(false);
  const [fa, setFA]   = useState(false);
  const rafRef        = useRef<number>(0);
  const fired         = useRef<Set<number>>(new Set());
  const dead          = useRef(false);

  const tick = useCallback(() => {
    if (dead.current) return;
    const v = vidRef.current;
    if (v) {
      const t = v.currentTime;
      FLASH_TIMES.forEach((ft, i) => {
        if (!fired.current.has(i) && t >= ft) {
          fired.current.add(i);
          if (i % 2 === 0) {
            setFW(true); setTimeout(() => setFW(false), 55);
          } else {
            setFA(true); setTimeout(() => setFA(false), 80);
          }
        }
      });
      if (t >= SCENE1_DURATION && !dead.current) {
        dead.current = true; onDone(); return;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [onDone]);

  useEffect(() => {
    if (!active) {
      dead.current = true;
      cancelAnimationFrame(rafRef.current);
      fired.current.clear();
      setFW(false); setFA(false);
      return;
    }
    dead.current = false;
    fired.current.clear();
    const v = vidRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    rafRef.current = requestAnimationFrame(tick);
    return () => { dead.current = true; cancelAnimationFrame(rafRef.current); };
  }, [active, tick]);

  if (!active) return null;
  return (
    <div className="pd-s1">
      <video ref={vidRef} src="/videos/scene1_final.mp4" muted playsInline preload="auto" />
      <div className="pd-s1-ov" /><div className="pd-s1-vig" />
      <div className="pd-grain" /><div className="pd-scan" />
      <div className={`pd-fw${fw ? " on" : ""}`} />
      <div className={`pd-fa${fa ? " on" : ""}`} />
    </div>
  );
}

// ─── Scene 2 ──────────────────────────────────────────────────────────────────
function Scene2({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [vis,   setVis]   = useState(false);
  const [typed, setTyped] = useState("");
  const [still, setStill] = useState(false);
  const [hint,  setHint]  = useState(false);
  const [ring,  setRing]  = useState(false);
  const [done,  setDone_] = useState(false);
  const dead = useRef(false);

  useEffect(() => {
    if (!active) {
      dead.current = true;
      setVis(false); setTyped(""); setStill(false); setHint(false); setRing(false); setDone_(false);
      return;
    }
    dead.current = false;
    (async () => {
      await sleep(480); if (dead.current) return; setVis(true);
      await sleep(600); if (dead.current) return;
      // type
      for (let i = 1; i <= SEARCH_QUERY.length; i++) {
        if (dead.current) return;
        setTyped(SEARCH_QUERY.slice(0, i));
        await sleep(36 + Math.random() * 44);
      }
      setStill(true); setHint(true);
      await sleep(820);
      // enter press
      setRing(true); await sleep(140); setRing(false);
      await sleep(240); setDone_(true);
      await sleep(460);
      if (!dead.current) { dead.current = true; onDone(); }
    })();
    return () => { dead.current = true; };
  }, [active, onDone]);

  if (!active) return null;
  return (
    <div className="pd-s2">
      <div className="pd-grain" /><div className="pd-scan" />
      <div className={`pd-s2-eye${vis ? " in" : ""}`}>THE QUESTION</div>
      <div className={`pd-sw${vis ? " in" : ""}`}>
        <div className="pd-sb">
          <svg className="pd-sico" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8.5" cy="8.5" r="5.5"/>
            <line x1="13" y1="13" x2="17" y2="17"/>
          </svg>
          <div className="pd-stxt">
            {typed}
            {!done && <span className={`pd-cur${still ? " still" : ""}`} />}
          </div>
        </div>
        <div className={`pd-hint${hint ? " on" : ""}`}>Press Enter</div>
        <div className={`pd-ring${ring ? " on" : ""}`} />
      </div>
    </div>
  );
}

// ─── Scene 3 ──────────────────────────────────────────────────────────────────
function Scene3({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [phoneIn,  setPhone]   = useState(false);
  const [logoIn,   setLogo]    = useState(false);
  const [motionIn, setMotion]  = useState(false);
  const [btnIn,    setBtn]     = useState(false);
  const [btnClick, setBtnClick]= useState(false);
  const [chamIn,   setCham]    = useState(false);
  const [mt,       setMT]      = useState("");
  const [phase,    setPhase]   = useState(-1); // -1 = none yet, 0-3 = active phase
  const [timer,    setTimer]   = useState("00:25");
  const dead = useRef(false);

  // Fake timer countdown
  useEffect(() => {
    if (!chamIn) return;
    let secs = 25;
    const id = setInterval(() => {
      secs = Math.max(0, secs - 1);
      const m = String(Math.floor(secs / 60)).padStart(2, "0");
      const s = String(secs % 60).padStart(2, "0");
      setTimer(`${m}:${s}`);
    }, 500);
    return () => clearInterval(id);
  }, [chamIn]);

  useEffect(() => {
    if (!active) {
      dead.current = true;
      setPhone(false); setLogo(false); setMotion(false);
      setBtn(false); setBtnClick(false); setCham(false);
      setMT(""); setPhase(-1); setTimer("00:25");
      return;
    }
    dead.current = false;
    (async () => {
      await sleep(240); if (dead.current) return; setPhone(true);
      await sleep(500); if (dead.current) return; setLogo(true);
      await sleep(380); if (dead.current) return; setMotion(true);
      // type motion
      for (let i = 1; i <= MOTION_TEXT.length; i++) {
        if (dead.current) return;
        setMT(MOTION_TEXT.slice(0, i));
        await sleep(18 + Math.random() * 14);
      }
      await sleep(340); if (dead.current) return; setBtn(true);
      await sleep(1100); if (dead.current) return;
      // click button
      setBtnClick(true); await sleep(120); if (dead.current) return;
      // chamber slides in
      setCham(true);
      await sleep(600); if (dead.current) return; setPhase(0);
      await sleep(700); if (dead.current) return; setPhase(1);
      await sleep(700); if (dead.current) return; setPhase(2);
      await sleep(700); if (dead.current) return; setPhase(3);
      await sleep(1600);
      if (!dead.current) { dead.current = true; onDone(); }
    })();
    return () => { dead.current = true; };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="pd-s3">
      <div className="pd-grain" /><div className="pd-scan" />
      <div className={`pd-phone${phoneIn ? " in" : ""}`}>
        <div className="pd-notch"><div className="pd-notch-pill" /></div>
        <div className="pd-screen">
          {/* logo */}
          <div className={`pd-ph-logo${logoIn ? " in" : ""}`}>
            P<span>.</span>&nbsp;Pocket Debate
          </div>

          {/* motion field */}
          <div className={`pd-ph-motion${motionIn ? " in" : ""}`}>
            <div className="pd-ph-ml">MOTION</div>
            <div className="pd-ph-mt">
              {mt}
              {mt.length < MOTION_TEXT.length && <span className="pd-cur" />}
            </div>
          </div>

          {/* initiate button */}
          <button className={`pd-ph-btn${btnIn ? " in" : ""}${btnClick ? " click" : ""}`}>
            Initiate Discourse
          </button>

          {/* debate chamber overlay */}
          <div className={`pd-chamber${chamIn ? " in" : ""}`}>
            {/* header */}
            <div className="pd-ch-head">
              <span className="pd-ch-back">← Chamber</span>
              <span className="pd-ch-title">Live Debate</span>
            </div>

            <div className="pd-ch-body">
              {/* motion */}
              <div className="pd-ch-motion">
                &ldquo;{MOTION_TEXT}&rdquo;
              </div>

              {/* timer */}
              <div className="pd-ch-timer">
                <svg className="pd-ch-timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>
                </svg>
                <span className="pd-ch-timer-val">{timer}</span>
                <div className="pd-ch-timer-bar"><div className="pd-ch-timer-fill" /></div>
              </div>

              {/* debaters */}
              <div className="pd-debs">
                {/* proposition */}
                <div className="pd-deb">
                  <div className="pd-avw">
                    <div className="pd-av sp">SJ</div>
                    <div className="pd-av-ping" />
                  </div>
                  <div className="pd-dn">S. Jenkins</div>
                  <div className="pd-di">Oxford University</div>
                  <div className="pd-dr">PROPOSITION</div>
                  <div className="pd-elo">ELO 1847</div>
                </div>

                {/* arbiter */}
                <div className="pd-arb">
                  <div className="pd-arb-ico">
                    <div className="pd-arb-pulse" />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z"/>
                      <line x1="9" y1="21" x2="15" y2="21"/>
                    </svg>
                  </div>
                  <div className="pd-arb-ph">
                    {phase === -1 ? "Ready" : PHASES[phase] ?? "Verdict"}
                  </div>
                  <div className="pd-arb-sub">ARBITER AI</div>
                </div>

                {/* opposition */}
                <div className="pd-deb">
                  <div className="pd-avw">
                    <div className="pd-av">MC</div>
                  </div>
                  <div className="pd-dn">M. Chen</div>
                  <div className="pd-di">Cambridge University</div>
                  <div className="pd-dr">OPPOSITION</div>
                  <div className="pd-elo">ELO 1792</div>
                </div>
              </div>

              {/* phase indicators */}
              <div className="pd-phases">
                {PHASES.map((p, i) => (
                  <div key={p} className={
                    `pd-phase${i === phase ? " active" : i < phase ? " done" : ""}`
                  }>{p}</div>
                ))}
              </div>

              {/* arbiter strip */}
              <div className="pd-arb-strip">
                <div className="pd-arb-dot" />
                <div className="pd-arb-label">ARBITER AI — ADJUDICATING</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
type Scene = "idle" | "s1" | "s2" | "s3";

export default function PocketDebatePromoSequence() {
  const [scene, setScene] = useState<Scene>("idle");
  const [done,  setDone]  = useState(false);

  useEffect(() => { inject("pd-css", CSS); }, []);

  const start = useCallback(() => {
    setDone(false); setScene("s1");
  }, []);

  const replay = useCallback(() => {
    setScene("idle"); setDone(false);
    requestAnimationFrame(() => requestAnimationFrame(start));
  }, [start]);

  return (
    <div className="pd">
      {scene === "idle" && (
        <div className="pd-idle">
          <div className="pd-idle-mark">P<b>.</b></div>
          <div className="pd-idle-word">Pocket Debate</div>
          <div className="pd-idle-rule" />
          <div className="pd-idle-sub">Where Arguments Are Settled</div>
          <button className="pd-start" onClick={start}>Play Sequence</button>
        </div>
      )}

      <Scene1 active={scene === "s1"} onDone={() => setScene("s2")} />
      <Scene2 active={scene === "s2"} onDone={() => setScene("s3")} />
      <Scene3 active={scene === "s3"} onDone={() => setDone(true)}  />

      <div className={`pd-done${done ? " in" : ""}`}>
        <button className="pd-replay" onClick={replay}>Replay</button>
      </div>

      {scene !== "idle" && <div className="pd-grain" style={{ zIndex: 100 }} />}
    </div>
  );
}
