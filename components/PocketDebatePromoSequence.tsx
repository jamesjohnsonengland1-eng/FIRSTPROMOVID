"use client";

/**
 * PocketDebatePromoSequence — no video dependency
 *
 * SCENE 1  Search bar types "Where are global arguments settled?"
 * SCENE 2  Pocket Debate UI reveal — Convene a Chamber → live debate chamber
 */

import React, { useEffect, useRef, useState, useCallback } from "react";

const SEARCH_QUERY = "Where are global arguments settled?";
const MOTION_TEXT  = "This House Believes That Democracy Cannot Survive Without Open Debate";
const PHASES       = ["Opening", "Rebuttal", "Closing", "Verdict"];

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
function inject(id: string, css: string) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id; s.textContent = css;
  document.head.appendChild(s);
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

:root {
  --ink:      #0F172A;
  --ink2:     #1E293B;
  --parch:    #FDFBF7;
  --parch2:   #F5F2EC;
  --amber:    #B45309;
  --amber-lt: #F59E0B;
  --rule:     #CBD5E1;
  --muted-ink:rgba(15,23,42,.46);
}

.pd {
  position:relative; width:100%; aspect-ratio:16/9;
  max-width:1920px; margin:0 auto;
  background:var(--ink); overflow:hidden;
  font-family:'Inter','Helvetica Neue',sans-serif; user-select:none;
  -webkit-font-smoothing:antialiased;
}

/* ── IDLE ── */
.pd-idle {
  position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:1.5vw; background:var(--ink);
}
.pd-idle-mark {
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(40px,7vw,128px); font-weight:600;
  color:var(--parch); line-height:1;
}
.pd-idle-mark b { color:var(--amber); }
.pd-idle-word {
  font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(10px,1.3vw,25px); color:rgba(253,251,247,.5);
  letter-spacing:.22em; text-transform:uppercase;
}
.pd-idle-rule { width:clamp(20px,3vw,56px); height:1px; background:rgba(203,213,225,.12); }
.pd-idle-sub  { font-size:clamp(6px,.6vw,11px); letter-spacing:.4em; color:rgba(253,251,247,.18); text-transform:uppercase; }
.pd-start {
  margin-top:2vw; padding:.65vw 2.8vw;
  border:1px solid rgba(253,251,247,.17); background:transparent;
  color:var(--parch); font-family:'Inter',sans-serif;
  font-size:clamp(7px,.68vw,12px); letter-spacing:.34em; text-transform:uppercase;
  cursor:pointer; transition:border-color .25s,color .25s;
}
.pd-start:hover { border-color:var(--amber); color:var(--amber-lt); }

/* ── SCENE 1 — search ── */
.pd-s1 {
  position:absolute; inset:0; background:var(--ink);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2vw;
}

/* subtle radial glow behind search */
.pd-s1::before {
  content:''; position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(ellipse 60% 40% at 50% 50%, rgba(180,83,9,.07) 0%, transparent 70%);
}

.pd-s1-eye {
  font-size:clamp(7px,.58vw,10px); letter-spacing:.44em; text-transform:uppercase;
  color:rgba(253,251,247,.22); position:relative;
  opacity:0; transform:translateY(-8px);
  transition:opacity .5s .3s, transform .5s .3s;
}
.pd-s1-eye.in { opacity:1; transform:none; }

.pd-sw {
  position:relative; width:min(600px,52vw);
  opacity:0; transform:translateY(16px) scale(.97);
  transition:opacity .55s .5s, transform .55s .5s cubic-bezier(.16,1,.3,1);
}
.pd-sw.in { opacity:1; transform:none; }

.pd-sb {
  display:flex; align-items:center; gap:.7vw;
  border:1px solid rgba(203,213,225,.18); background:rgba(30,41,59,.55);
  padding:.9vw 1.2vw; backdrop-filter:blur(14px); box-sizing:border-box;
}
.pd-sico { flex-shrink:0; width:clamp(12px,1vw,18px); height:clamp(12px,1vw,18px); color:rgba(253,251,247,.35); }
.pd-stxt {
  flex:1; font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(12px,1.15vw,22px); color:var(--parch);
  min-height:1.4em; line-height:1.4;
}
.pd-cur {
  display:inline-block; width:1.5px; height:.9em; background:var(--amber-lt);
  margin-left:1px; vertical-align:text-bottom;
  animation:blink .7s step-end infinite;
}
.pd-cur.still { animation:none; opacity:1; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

.pd-hint { font-size:clamp(6px,.5vw,9px); letter-spacing:.22em; text-align:right; color:rgba(253,251,247,.18); text-transform:uppercase; margin-top:.4vw; opacity:0; transition:opacity .4s; }
.pd-hint.on { opacity:1; }
.pd-ring { position:absolute; inset:-4px; border:1px solid var(--amber); opacity:0; pointer-events:none; transition:opacity .1s; }
.pd-ring.on { opacity:1; }

/* ── SCENE 2 — device reveal ── */
.pd-s2 {
  position:absolute; inset:0; background:var(--ink);
  display:flex; align-items:center; justify-content:center; perspective:1500px;
}

.pd-device {
  position:relative; width:min(780px,68vw);
  background:var(--parch2);
  border:1px solid rgba(203,213,225,.22);
  box-shadow:0 0 0 1px rgba(0,0,0,.06),
             0 40px 100px rgba(0,0,0,.82),
             0 0 160px rgba(180,83,9,.06);
  opacity:0; transform:translateY(72px) scale(.9) rotateX(8deg);
  transition:opacity .9s, transform .9s cubic-bezier(.16,1,.3,1);
  transform-style:preserve-3d;
}
.pd-device.in { opacity:1; transform:none; }

.pd-chrome {
  height:clamp(26px,2.5vw,42px); background:#E8E4DC;
  border-bottom:1px solid rgba(0,0,0,.09);
  display:flex; align-items:center; padding:0 .9vw; gap:.42vw;
}
.pd-dot { width:clamp(5px,.52vw,9px); height:clamp(5px,.52vw,9px); border-radius:50%; background:rgba(15,23,42,.14); }
.pd-url-bar { flex:1; margin:0 .7vw; height:clamp(13px,1.3vw,22px); background:rgba(255,255,255,.6); border-radius:2px; display:flex; align-items:center; padding:0 .5vw; }
.pd-url-txt { font-size:clamp(6px,.5vw,9px); color:rgba(15,23,42,.42); letter-spacing:.02em; }

.pd-layout { display:flex; height:clamp(260px,26vw,460px); }

.pd-sidebar {
  width:clamp(30px,3vw,52px); background:var(--ink);
  display:flex; flex-direction:column; align-items:center;
  padding:.8vw 0; gap:.85vw; flex-shrink:0;
}
.pd-sb-mark { font-family:'EB Garamond',Georgia,serif; font-size:clamp(9px,.9vw,17px); font-weight:600; color:var(--parch); }
.pd-sb-mark span { color:var(--amber); }
.pd-sb-div  { width:60%; height:1px; background:rgba(255,255,255,.08); }
.pd-sb-dot  { width:clamp(4px,.38vw,6px); height:clamp(4px,.38vw,6px); border-radius:50%; background:rgba(255,255,255,.18); }
.pd-sb-dot.on { background:var(--amber); }

.pd-main { flex:1; overflow:hidden; padding:1.3vw 1.5vw; display:flex; flex-direction:column; gap:1.1vw; }

/* convene card */
.pd-convene {
  background:#fff; border:1px solid rgba(203,213,225,.5); padding:1vw 1.1vw;
  opacity:0; transform:translateY(10px);
  transition:opacity .5s .4s, transform .5s .4s;
}
.pd-convene.in { opacity:1; transform:none; }
.pd-convene-h { font-family:'EB Garamond',Georgia,serif; font-size:clamp(11px,1.2vw,21px); font-weight:600; color:var(--ink); line-height:1.2; }
.pd-convene-sub { font-size:clamp(6px,.58vw,10px); color:var(--muted-ink); margin-top:.22vw; }
.pd-convene-btns { display:flex; gap:.65vw; margin-top:.75vw; }
.pd-btn-g { flex:1; border:1px solid rgba(203,213,225,.7); background:transparent; padding:.4vw .65vw; display:flex; flex-direction:column; gap:.18vw; }
.pd-btn-g-l { font-size:clamp(6px,.58vw,10px); color:var(--muted-ink); text-transform:uppercase; letter-spacing:.14em; }
.pd-btn-g-t { font-size:clamp(5px,.44vw,7px); color:rgba(15,23,42,.32); letter-spacing:.12em; text-transform:uppercase; }
.pd-btn-p { flex:1.2; background:var(--ink); display:flex; align-items:center; justify-content:space-between; padding:.4vw .75vw; }
.pd-btn-p-l { font-size:clamp(6px,.58vw,10px); color:var(--parch); letter-spacing:.12em; text-transform:uppercase; }
.pd-btn-p-t { font-size:clamp(4px,.42vw,7px); color:rgba(253,251,247,.48); letter-spacing:.1em; text-transform:uppercase; }
.pd-btn-arr { font-size:clamp(8px,.8vw,14px); color:rgba(253,251,247,.55); }

.pd-chambers-bar { display:flex; align-items:center; gap:.55vw; opacity:0; transition:opacity .5s .65s; }
.pd-chambers-bar.in { opacity:1; }
.pd-chambers-h { font-family:'EB Garamond',Georgia,serif; font-size:clamp(10px,.95vw,17px); font-weight:600; color:var(--ink); }
.pd-pills { display:flex; gap:.38vw; margin-left:auto; }
.pd-pill { font-size:clamp(5px,.48vw,8px); letter-spacing:.14em; text-transform:uppercase; padding:.22vw .55vw; border:1px solid rgba(203,213,225,.6); color:rgba(15,23,42,.5); background:transparent; }
.pd-pill.on { background:var(--ink); color:var(--parch); border-color:var(--ink); }

/* ── CHAMBER VIEW ── */
.pd-chamber-view {
  position:absolute; inset:0; background:var(--parch2);
  display:flex; flex-direction:column;
  opacity:0; pointer-events:none; transition:opacity .7s;
}
.pd-chamber-view.in { opacity:1; pointer-events:auto; }

.pd-ch-chrome { height:clamp(26px,2.5vw,42px); background:#E8E4DC; border-bottom:1px solid rgba(0,0,0,.09); display:flex; align-items:center; padding:0 .9vw; gap:.42vw; flex-shrink:0; }
.pd-ch-body { display:flex; flex:1; overflow:hidden; }
.pd-ch-sidebar { width:clamp(30px,3vw,52px); background:var(--ink); display:flex; flex-direction:column; align-items:center; padding:.8vw 0; gap:.85vw; flex-shrink:0; }
.pd-ch-main { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:1.2vw 2vw 1vw; }

.pd-ch-cat { font-size:clamp(6px,.5vw,9px); letter-spacing:.3em; text-transform:uppercase; color:var(--amber); margin-bottom:.38vw; opacity:0; transform:translateY(-6px); transition:opacity .5s .15s, transform .5s .15s; }
.pd-chamber-view.in .pd-ch-cat { opacity:1; transform:none; }

.pd-ch-motion { font-family:'EB Garamond',Georgia,serif; font-size:clamp(10px,1.3vw,23px); font-weight:600; color:var(--ink); text-align:center; line-height:1.38; max-width:82%; opacity:0; transform:translateY(6px); transition:opacity .6s .3s, transform .6s .3s; }
.pd-chamber-view.in .pd-ch-motion { opacity:1; transform:none; }

.pd-debs { display:flex; align-items:flex-start; justify-content:center; gap:clamp(16px,3vw,56px); width:100%; opacity:0; transition:opacity .55s .5s; }
.pd-chamber-view.in .pd-debs { opacity:1; }

.pd-deb { display:flex; flex-direction:column; align-items:center; gap:.22vw; }
.pd-avw { position:relative; }
.pd-av { width:clamp(28px,3.6vw,64px); height:clamp(28px,3.6vw,64px); border-radius:50%; background:var(--ink); border:2px solid transparent; display:flex; align-items:center; justify-content:center; font-family:'EB Garamond',Georgia,serif; font-size:clamp(8px,.95vw,17px); font-weight:600; color:var(--parch); }
.pd-av.sp { border-color:var(--amber); box-shadow:0 0 0 clamp(2px,.22vw,4px) rgba(180,83,9,.2); }
.pd-av-ping { position:absolute; top:-1px; right:-1px; width:clamp(5px,.5vw,8px); height:clamp(5px,.5vw,8px); border-radius:50%; background:var(--amber); border:1px solid var(--parch2); }
.pd-dn { font-family:'EB Garamond',Georgia,serif; font-size:clamp(6px,.68vw,12px); font-weight:600; color:var(--ink); }
.pd-di { font-size:clamp(5px,.46vw,8px); color:var(--muted-ink); }
.pd-dr { font-size:clamp(4px,.4vw,7px); letter-spacing:.2em; text-transform:uppercase; color:var(--muted-ink); border:1px solid rgba(203,213,225,.65); padding:.1vw .3vw; margin-top:.06vw; }
.pd-elo { font-size:clamp(4px,.38vw,6px); letter-spacing:.16em; color:var(--amber); border:1px solid rgba(180,83,9,.28); padding:.08vw .28vw; }

.pd-arb { display:flex; flex-direction:column; align-items:center; gap:.3vw; padding-top:.35vw; }
.pd-arb-ico { width:clamp(18px,2.2vw,40px); height:clamp(18px,2.2vw,40px); border-radius:50%; border:1px solid var(--rule); background:rgba(255,255,255,.65); display:flex; align-items:center; justify-content:center; position:relative; }
.pd-arb-pulse { position:absolute; inset:-3px; border-radius:50%; border:1px solid rgba(180,83,9,.26); animation:pulse 2.2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.14);opacity:1} }
.pd-arb-ico svg { width:44%; height:44%; color:var(--ink2); }
.pd-arb-ph { font-size:clamp(4px,.44vw,8px); letter-spacing:.18em; text-transform:uppercase; color:var(--amber); text-align:center; max-width:clamp(44px,5vw,88px); line-height:1.3; }
.pd-arb-sub { font-size:clamp(3px,.38vw,6px); letter-spacing:.14em; text-transform:uppercase; color:var(--muted-ink); }

.pd-phases { display:flex; gap:.35vw; opacity:0; transition:opacity .5s .6s; }
.pd-chamber-view.in .pd-phases { opacity:1; }
.pd-phase { font-size:clamp(4px,.4vw,7px); letter-spacing:.2em; text-transform:uppercase; color:rgba(15,23,42,.3); border:1px solid rgba(203,213,225,.35); padding:.2vw .5vw; transition:color .35s,border-color .35s; }
.pd-phase.active { color:var(--ink); border-color:rgba(203,213,225,.8); }
.pd-phase.done   { color:var(--amber); border-color:rgba(180,83,9,.3); }

.pd-arb-strip { display:flex; align-items:center; gap:.4vw; opacity:0; transition:opacity .5s .75s; }
.pd-chamber-view.in .pd-arb-strip { opacity:1; }
.pd-arb-dot { width:clamp(3px,.32vw,5px); height:clamp(3px,.32vw,5px); border-radius:50%; background:var(--amber); animation:pulse 2s ease-in-out infinite; }
.pd-arb-label { font-size:clamp(4px,.38vw,6px); letter-spacing:.26em; text-transform:uppercase; color:rgba(15,23,42,.32); }

/* timer */
.pd-ch-timer { display:flex; align-items:center; gap:.35vw; opacity:0; transition:opacity .4s .4s; }
.pd-chamber-view.in .pd-ch-timer { opacity:1; }
.pd-ch-timer-ico { width:clamp(6px,.62vw,11px); height:clamp(6px,.62vw,11px); color:var(--amber); }
.pd-ch-timer-val { font-family:'EB Garamond',Georgia,serif; font-size:clamp(9px,.92vw,17px); font-weight:600; color:var(--ink); letter-spacing:.06em; }
.pd-ch-timer-bar { width:clamp(24px,2.8vw,50px); height:2px; background:rgba(203,213,225,.5); position:relative; overflow:hidden; }
.pd-ch-timer-fill { position:absolute; inset-block:0; left:0; background:var(--amber); animation:timerDrain 4s linear infinite; }
@keyframes timerDrain { from{width:100%} to{width:0%} }

/* grain + scan */
.pd-grain { position:absolute; inset:0; pointer-events:none; mix-blend-mode:overlay; opacity:.45; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"); }
.pd-scan { position:absolute; inset:0; pointer-events:none; background:repeating-linear-gradient(to bottom,transparent,transparent 3px,rgba(0,0,0,.02) 3px,rgba(0,0,0,.02) 4px); }

/* replay */
.pd-done { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(15,23,42,0); opacity:0; pointer-events:none; transition:background 1.2s 1s, opacity .7s .7s; }
.pd-done.in { opacity:1; background:rgba(15,23,42,.55); pointer-events:auto; }
.pd-replay { padding:.65vw 2.4vw; border:1px solid rgba(253,251,247,.2); background:transparent; color:var(--parch); font-family:'Inter',sans-serif; font-size:clamp(7px,.68vw,12px); letter-spacing:.34em; text-transform:uppercase; cursor:pointer; opacity:0; transform:translateY(10px); transition:opacity .5s 1.7s, transform .5s 1.7s, border-color .2s, color .2s; }
.pd-done.in .pd-replay { opacity:1; transform:none; }
.pd-replay:hover { border-color:var(--amber); color:var(--amber-lt); }
`;

// ─── Scene 1 — search ────────────────────────────────────────────────────────
function Scene1({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [vis,   setVis]   = useState(false);
  const [typed, setTyped] = useState("");
  const [still, setStill] = useState(false);
  const [hint,  setHint]  = useState(false);
  const [ring,  setRing]  = useState(false);
  const [gone,  setGone]  = useState(false);
  const dead = useRef(false);

  useEffect(() => {
    if (!active) {
      dead.current = true;
      setVis(false); setTyped(""); setStill(false); setHint(false); setRing(false); setGone(false);
      return;
    }
    dead.current = false;
    (async () => {
      await sleep(400); if (dead.current) return; setVis(true);
      await sleep(700); if (dead.current) return;
      for (let i = 1; i <= SEARCH_QUERY.length; i++) {
        if (dead.current) return;
        setTyped(SEARCH_QUERY.slice(0, i));
        await sleep(38 + Math.random() * 44);
      }
      setStill(true); setHint(true);
      await sleep(900);
      setRing(true); await sleep(150); setRing(false);
      await sleep(300); setGone(true);
      await sleep(500);
      if (!dead.current) { dead.current = true; onDone(); }
    })();
    return () => { dead.current = true; };
  }, [active, onDone]);

  if (!active) return null;
  return (
    <div className="pd-s1">
      <div className="pd-grain"/><div className="pd-scan"/>
      <div className={`pd-s1-eye${vis ? " in" : ""}`}>THE QUESTION</div>
      <div className={`pd-sw${vis ? " in" : ""}`} style={{ opacity: gone ? 0 : undefined, transition: gone ? "opacity .4s" : undefined }}>
        <div className="pd-sb">
          <svg className="pd-sico" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8.5" cy="8.5" r="5.5"/><line x1="13" y1="13" x2="17" y2="17"/>
          </svg>
          <div className="pd-stxt">
            {typed}
            {!gone && <span className={`pd-cur${still ? " still" : ""}`}/>}
          </div>
        </div>
        <div className={`pd-hint${hint ? " on" : ""}`}>Press Enter</div>
        <div className={`pd-ring${ring ? " on" : ""}`}/>
      </div>
    </div>
  );
}

// ─── Scene 2 — UI reveal ─────────────────────────────────────────────────────
function Scene2({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [devIn,  setDev]  = useState(false);
  const [convIn, setConv] = useState(false);
  const [barIn,  setBar]  = useState(false);
  const [chamIn, setCham] = useState(false);
  const [mt,     setMT]   = useState("");
  const [phase,  setPhase]= useState(-1);
  const [timer,  setTimer]= useState("00:25");
  const dead = useRef(false);

  useEffect(() => {
    if (!chamIn) return;
    let secs = 25;
    const id = setInterval(() => {
      secs = Math.max(0, secs - 1);
      setTimer(`${String(Math.floor(secs/60)).padStart(2,"0")}:${String(secs%60).padStart(2,"0")}`);
    }, 500);
    return () => clearInterval(id);
  }, [chamIn]);

  useEffect(() => {
    if (!active) {
      dead.current = true;
      setDev(false); setConv(false); setBar(false); setCham(false); setMT(""); setPhase(-1); setTimer("00:25");
      return;
    }
    dead.current = false;
    (async () => {
      await sleep(200); if (dead.current) return; setDev(true);
      await sleep(500); if (dead.current) return; setConv(true);
      await sleep(380); if (dead.current) return; setBar(true);
      await sleep(900); if (dead.current) return; setCham(true);
      for (let i = 1; i <= MOTION_TEXT.length; i++) {
        if (dead.current) return;
        setMT(MOTION_TEXT.slice(0, i));
        await sleep(18 + Math.random() * 14);
      }
      await sleep(350);
      for (let s = 0; s < 4; s++) {
        await sleep(680); if (dead.current) return; setPhase(s);
      }
      await sleep(1600);
      if (!dead.current) { dead.current = true; onDone(); }
    })();
    return () => { dead.current = true; };
  }, [active, onDone]);

  if (!active) return null;

  const phaseLabel = phase < 0 ? "Ready" : PHASES[phase] ?? "Concluded";

  return (
    <div className="pd-s2">
      <div className="pd-grain"/><div className="pd-scan"/>
      <div className={`pd-device${devIn ? " in" : ""}`}>
        <div className="pd-chrome">
          <div className="pd-dot"/><div className="pd-dot"/><div className="pd-dot"/>
          <div className="pd-url-bar"><span className="pd-url-txt">pocketdebate.com</span></div>
        </div>
        <div className="pd-layout">
          <div className="pd-sidebar">
            <div className="pd-sb-mark">P<span>.</span></div>
            <div className="pd-sb-div"/>
            {[true,false,false,false].map((a,i)=><div key={i} className={`pd-sb-dot${a?" on":""}`}/>)}
          </div>
          <div className="pd-main">
            <div className={`pd-convene${convIn?" in":""}`}>
              <div className="pd-convene-h">Convene a Chamber.</div>
              <div className="pd-convene-sub">Propose a motion, set the format, and open the floor to delegates from institutions around the globe.</div>
              <div className="pd-convene-btns">
                <div className="pd-btn-g">
                  <span className="pd-btn-g-l">Friendly Match</span>
                  <span className="pd-btn-g-t">COMING SOON</span>
                </div>
                <div className="pd-btn-p">
                  <div>
                    <div className="pd-btn-p-l">Official Chamber</div>
                    <div className="pd-btn-p-t">RANKED &amp; ADJUDICATED</div>
                  </div>
                  <span className="pd-btn-arr">→</span>
                </div>
              </div>
            </div>
            <div className={`pd-chambers-bar${barIn?" in":""}`}>
              <div className="pd-chambers-h">Active Chambers.</div>
              <div className="pd-pills">
                {["All","Live Now","Open","Saved"].map((p,i)=>(
                  <div key={p} className={`pd-pill${i===0?" on":""}`}>{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* chamber overlay */}
        <div className={`pd-chamber-view${chamIn?" in":""}`}>
          <div className="pd-ch-chrome">
            <div className="pd-dot"/><div className="pd-dot"/><div className="pd-dot"/>
            <div className="pd-url-bar"><span className="pd-url-txt">pocketdebate.com/chamber/live</span></div>
          </div>
          <div className="pd-ch-body">
            <div className="pd-ch-sidebar">
              <div className="pd-sb-mark">P<span>.</span></div>
              <div className="pd-sb-div"/>
              {[false,true,false,false].map((a,i)=><div key={i} className={`pd-sb-dot${a?" on":""}`}/>)}
            </div>
            <div className="pd-ch-main">
              <div style={{textAlign:"center"}}>
                <div className="pd-ch-cat">GEOPOLITICS · GOVERNANCE</div>
                <div className="pd-ch-motion">
                  &ldquo;{mt}
                  {mt.length < MOTION_TEXT.length && <span className="pd-cur"/>}
                  {mt.length === MOTION_TEXT.length && <>&rdquo;</>}
                </div>
              </div>

              <div className="pd-ch-timer">
                <svg className="pd-ch-timer-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>
                </svg>
                <span className="pd-ch-timer-val">{timer}</span>
                <div className="pd-ch-timer-bar"><div className="pd-ch-timer-fill"/></div>
              </div>

              <div className="pd-debs">
                <div className="pd-deb">
                  <div className="pd-avw">
                    <div className="pd-av sp">SJ</div>
                    <div className="pd-av-ping"/>
                  </div>
                  <div className="pd-dn">S. Jenkins</div>
                  <div className="pd-di">Oxford University</div>
                  <div className="pd-dr">PROPOSITION</div>
                  <div className="pd-elo">ELO 1847</div>
                </div>

                <div className="pd-arb">
                  <div className="pd-arb-ico">
                    <div className="pd-arb-pulse"/>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z"/>
                      <line x1="9" y1="21" x2="15" y2="21"/>
                    </svg>
                  </div>
                  <div className="pd-arb-ph">{phaseLabel}</div>
                  <div className="pd-arb-sub">ARBITER AI</div>
                </div>

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

              <div className="pd-phases">
                {PHASES.map((p,i)=>(
                  <div key={p} className={`pd-phase${i===phase?" active":i<phase?" done":""}`}>{p}</div>
                ))}
              </div>

              <div className="pd-arb-strip">
                <div className="pd-arb-dot"/>
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
type Scene = "idle" | "s1" | "s2";

export default function PocketDebatePromoSequence() {
  const [scene, setScene] = useState<Scene>("idle");
  const [done,  setDone]  = useState(false);

  useEffect(() => { inject("pd-css", CSS); }, []);

  const start  = useCallback(() => { setDone(false); setScene("s1"); }, []);
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
          <div className="pd-idle-rule"/>
          <div className="pd-idle-sub">Where Arguments Are Settled</div>
          <button className="pd-start" onClick={start}>Play Sequence</button>
        </div>
      )}
      <Scene1 active={scene==="s1"} onDone={() => setScene("s2")}/>
      <Scene2 active={scene==="s2"} onDone={() => setDone(true)}/>
      <div className={`pd-done${done?" in":""}`}>
        <button className="pd-replay" onClick={replay}>Replay</button>
      </div>
      {scene !== "idle" && <div className="pd-grain" style={{zIndex:100}}/>}
    </div>
  );
}
