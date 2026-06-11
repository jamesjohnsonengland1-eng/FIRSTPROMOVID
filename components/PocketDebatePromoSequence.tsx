"use client";

/**
 * PocketDebatePromoSequence
 *
 * SCENE 1  Dark navy — search bar types "Where are global arguments settled?" → Enter
 * SCENE 2  Convene Chamber / motion form — motion types into field, Geopolitics pill highlights,
 *          Continue button clicks → transitions
 * SCENE 3  Live debate chamber — exact copy of UI screenshot:
 *          motion text already shown, two debater avatars, central AI moderator,
 *          bottom roadmap progressing
 */

import React, { useEffect, useRef, useState, useCallback } from "react";

const SEARCH_QUERY = "Where are global arguments settled?";
const MOTION_TEXT  = "This House Believes That Democracy Cannot Survive Without Open Debate";
const PHASES = [
  { label: "Opening",   icon: "⚡" },
  { label: "Rebuttal",  icon: "↩" },
  { label: "Closing",   icon: "✦" },
  { label: "Verdict",   icon: "⚖" },
];

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
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

:root {
  --ink:      #0F172A;
  --ink2:     #1E293B;
  --parch:    #FDFBF7;
  --parch2:   #F5F1E8;
  --parch3:   #EDE8DC;
  --amber:    #B45309;
  --amber-lt: #F59E0B;
  --amber-bg: #92400E;
  --rule:     #D4CEBC;
  --rule2:    #E8E3D6;
  --txt:      #1a1a2e;
  --txt2:     #4a4a6a;
  --txt3:     #8888aa;
}

/* ── ROOT ── */
.pd {
  position:relative; width:100%; aspect-ratio:16/9;
  max-width:1920px; margin:0 auto;
  background:var(--ink); overflow:hidden;
  font-family:'Inter','Helvetica Neue',sans-serif;
  user-select:none; -webkit-font-smoothing:antialiased;
}

/* ── IDLE ── */
.pd-idle {
  position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:1.4vw; background:var(--ink);
}
.pd-idle-mark { font-family:'EB Garamond',Georgia,serif; font-size:clamp(40px,7vw,120px); font-weight:600; color:var(--parch); line-height:1; }
.pd-idle-mark b { color:var(--amber-lt); }
.pd-idle-word { font-family:'EB Garamond',Georgia,serif; font-size:clamp(10px,1.2vw,22px); color:rgba(253,251,247,.45); letter-spacing:.22em; text-transform:uppercase; }
.pd-idle-rule { width:clamp(20px,3vw,50px); height:1px; background:rgba(203,213,225,.1); }
.pd-start { margin-top:1.8vw; padding:.6vw 2.6vw; border:1px solid rgba(253,251,247,.16); background:transparent; color:var(--parch); font-family:'Inter',sans-serif; font-size:clamp(7px,.68vw,12px); letter-spacing:.32em; text-transform:uppercase; cursor:pointer; transition:border-color .25s,color .25s; }
.pd-start:hover { border-color:var(--amber-lt); color:var(--amber-lt); }

/* ── SCENE 1 — search ── */
.pd-s1 { position:absolute; inset:0; background:var(--ink); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.8vw; }
.pd-s1::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 55% 35% at 50% 50%, rgba(180,83,9,.06) 0%, transparent 70%); pointer-events:none; }

.pd-sw { position:relative; width:min(580px,52vw); opacity:0; transform:translateY(14px) scale(.97); transition:opacity .55s .3s, transform .55s .3s cubic-bezier(.16,1,.3,1); }
.pd-sw.in { opacity:1; transform:none; }
.pd-sb { display:flex; align-items:center; gap:.7vw; border:1px solid rgba(203,213,225,.17); background:rgba(30,41,59,.55); padding:.9vw 1.2vw; backdrop-filter:blur(14px); box-sizing:border-box; }
.pd-sico { flex-shrink:0; width:clamp(12px,1vw,18px); height:clamp(12px,1vw,18px); color:rgba(253,251,247,.33); }
.pd-stxt { flex:1; font-family:'EB Garamond',Georgia,serif; font-size:clamp(12px,1.15vw,22px); color:var(--parch); min-height:1.4em; line-height:1.4; }
.pd-cur { display:inline-block; width:1.5px; height:.9em; background:var(--amber-lt); margin-left:1px; vertical-align:text-bottom; animation:blink .7s step-end infinite; }
.pd-cur.still { animation:none; opacity:1; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
.pd-ring { position:absolute; inset:-4px; border:1px solid var(--amber-lt); opacity:0; pointer-events:none; transition:opacity .1s; }
.pd-ring.on { opacity:1; }

/* grain + scan (shared) */
.pd-grain { position:absolute; inset:0; pointer-events:none; mix-blend-mode:overlay; opacity:.4; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"); }
.pd-scan { position:absolute; inset:0; pointer-events:none; background:repeating-linear-gradient(to bottom,transparent,transparent 3px,rgba(0,0,0,.018) 3px,rgba(0,0,0,.018) 4px); }

/* ── BROWSER SHELL (shared) ── */
.pd-browser {
  position:relative; width:min(860px,76vw);
  background:var(--parch2);
  border:1px solid rgba(180,160,120,.3);
  box-shadow:0 0 0 1px rgba(0,0,0,.05), 0 40px 100px rgba(0,0,0,.85), 0 0 120px rgba(180,83,9,.06);
  opacity:0; transform:translateY(60px) scale(.91) rotateX(7deg);
  transition:opacity .85s, transform .85s cubic-bezier(.16,1,.3,1);
  transform-style:preserve-3d;
}
.pd-browser.in { opacity:1; transform:none; }

.pd-chrome { height:clamp(26px,2.4vw,40px); background:var(--parch3); border-bottom:1px solid rgba(0,0,0,.08); display:flex; align-items:center; padding:0 .9vw; gap:.4vw; }
.pd-chrome-dot { width:clamp(5px,.5vw,8px); height:clamp(5px,.5vw,8px); border-radius:50%; background:rgba(15,23,42,.13); }
.pd-chrome-url { flex:1; margin:0 .7vw; height:clamp(12px,1.2vw,20px); background:rgba(255,255,255,.55); border-radius:3px; display:flex; align-items:center; padding:0 .5vw; }
.pd-chrome-url-txt { font-size:clamp(5px,.48vw,8px); color:rgba(15,23,42,.4); letter-spacing:.02em; }

/* ── PD APP LAYOUT ── */
.pd-app { display:flex; height:clamp(280px,30vw,520px); }

/* left sidebar — narrow icon nav */
.pd-nav { width:clamp(32px,3vw,52px); background:var(--parch2); border-right:1px solid var(--rule2); display:flex; flex-direction:column; align-items:center; padding:.7vw 0; gap:.8vw; flex-shrink:0; }
.pd-nav-logo { font-family:'EB Garamond',Georgia,serif; font-size:clamp(10px,.95vw,18px); font-weight:600; color:var(--ink); margin-bottom:.3vw; }
.pd-nav-logo span { color:var(--amber); }
.pd-nav-div { width:55%; height:1px; background:var(--rule); }
.pd-nav-ico { width:clamp(12px,1.2vw,20px); height:clamp(12px,1.2vw,20px); opacity:.35; }
.pd-nav-ico.active { opacity:.85; }

/* main content area */
.pd-content { flex:1; overflow:hidden; display:flex; }

/* ── SCENE 2 — Convene Chamber form ── */
.pd-convene-layout { display:flex; width:100%; height:100%; }

/* left panel — steps */
.pd-steps-panel { width:clamp(100px,14vw,220px); padding:1.2vw 1.4vw; flex-shrink:0; }
.pd-steps-title { font-family:'EB Garamond',Georgia,serif; font-size:clamp(11px,1.4vw,24px); font-weight:600; color:var(--txt); line-height:1.15; margin-bottom:1.2vw; }
.pd-step { display:flex; align-items:flex-start; gap:.5vw; margin-bottom:.8vw; }
.pd-step-num { width:clamp(14px,1.5vw,24px); height:clamp(14px,1.5vw,24px); border-radius:50%; border:1.5px solid var(--rule); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:clamp(6px,.6vw,10px); font-weight:600; color:var(--txt2); margin-top:.1vw; }
.pd-step-num.active { background:var(--ink); border-color:var(--ink); color:#fff; }
.pd-step-info {}
.pd-step-name { font-size:clamp(7px,.72vw,12px); font-weight:600; color:var(--txt); }
.pd-step-name.muted { color:var(--txt3); font-weight:400; }
.pd-step-sub { font-size:clamp(5px,.5vw,8px); color:var(--txt3); margin-top:.08vw; }

/* form panel */
.pd-form-panel { flex:1; padding:1.2vw 1.6vw; overflow:hidden; }
.pd-form-title { font-family:'EB Garamond',Georgia,serif; font-size:clamp(12px,1.4vw,24px); font-weight:600; color:var(--txt); margin-bottom:.2vw; }
.pd-form-sub { font-size:clamp(6px,.55vw,9px); color:var(--txt3); margin-bottom:.9vw; }

.pd-field-label { font-size:clamp(7px,.65vw,11px); font-weight:600; color:var(--txt); margin-bottom:.3vw; }
.pd-field-label span { color:var(--amber); }

.pd-input {
  width:100%; border:1.5px solid var(--rule); background:#fff;
  padding:.5vw .7vw; font-family:'EB Garamond',Georgia,serif;
  font-size:clamp(9px,.9vw,15px); color:var(--txt); box-sizing:border-box;
  outline:none; margin-bottom:.8vw;
}
.pd-input.focused { border-color:var(--ink); }
.pd-input-placeholder { color:rgba(30,30,60,.3); }

.pd-categories { display:flex; flex-wrap:wrap; gap:.35vw; margin-bottom:.9vw; }
.pd-cat-pill { font-size:clamp(5px,.52vw,9px); padding:.22vw .55vw; border:1px solid var(--rule); background:#fff; color:var(--txt2); border-radius:2px; cursor:default; transition:background .2s, border-color .2s, color .2s; }
.pd-cat-pill.selected { background:var(--ink); border-color:var(--ink); color:#fff; }

.pd-textarea { width:100%; border:1.5px solid var(--rule); background:#fff; padding:.5vw .7vw; font-family:'Inter',sans-serif; font-size:clamp(7px,.62vw,10px); color:var(--txt3); box-sizing:border-box; height:clamp(40px,5vw,80px); resize:none; outline:none; margin-bottom:.8vw; }
.pd-textarea.focused { border-color:var(--ink); }

.pd-continue-row { display:flex; justify-content:flex-end; }
.pd-continue-btn { background:var(--ink); color:#fff; padding:.45vw 1.4vw; font-family:'Inter',sans-serif; font-size:clamp(7px,.65vw,11px); font-weight:500; border:none; cursor:default; letter-spacing:.04em; transition:background .15s; }
.pd-continue-btn.clicked { background:rgba(15,23,42,.5); }

/* ── SCENE 3 — debate chamber ── */
.pd-chamber-layout { display:flex; width:100%; height:100%; }
.pd-chamber-nav { width:clamp(32px,3vw,52px); background:var(--parch2); border-right:1px solid var(--rule2); display:flex; flex-direction:column; align-items:center; padding:.7vw 0; gap:.8vw; flex-shrink:0; }

.pd-chamber-main { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:1vw 1.5vw .8vw; overflow:hidden; }

/* motion header */
.pd-ch-cat { font-size:clamp(5px,.52vw,9px); letter-spacing:.28em; text-transform:uppercase; color:var(--amber); margin-bottom:.3vw; opacity:0; transition:opacity .5s .1s; }
.pd-chamber-view.in .pd-ch-cat { opacity:1; }
.pd-ch-motion-text { font-family:'EB Garamond',Georgia,serif; font-size:clamp(11px,1.25vw,22px); font-weight:600; color:var(--txt); text-align:center; line-height:1.35; opacity:0; transition:opacity .6s .25s; }
.pd-chamber-view.in .pd-ch-motion-text { opacity:1; }

/* horizontal rule through debaters */
.pd-debs-row { display:flex; align-items:center; justify-content:center; width:100%; position:relative; gap:0; opacity:0; transition:opacity .55s .45s; }
.pd-chamber-view.in .pd-debs-row { opacity:1; }
.pd-debs-line { position:absolute; top:clamp(14px,1.8vw,32px); left:10%; right:10%; height:1px; background:var(--rule); z-index:0; }

.pd-deb-col { display:flex; flex-direction:column; align-items:center; gap:.28vw; z-index:1; width:clamp(70px,10vw,160px); }
.pd-av-wrap { position:relative; }
.pd-av {
  width:clamp(28px,3.8vw,68px); height:clamp(28px,3.8vw,68px); border-radius:50%;
  background:var(--ink); border:2.5px solid transparent;
  display:flex; align-items:center; justify-content:center;
  font-family:'EB Garamond',Georgia,serif; font-size:clamp(8px,1vw,18px); font-weight:600; color:#fff;
}
.pd-av.speaking { border-color:var(--amber-lt); box-shadow:0 0 0 clamp(2px,.25vw,4px) rgba(245,158,11,.22); }
.pd-av-badge { position:absolute; top:-2px; right:-2px; width:clamp(6px,.65vw,11px); height:clamp(6px,.65vw,11px); border-radius:50%; background:var(--amber-lt); border:1.5px solid var(--parch2); }

.pd-deb-name { font-family:'EB Garamond',Georgia,serif; font-size:clamp(7px,.75vw,13px); font-weight:600; color:var(--txt); }
.pd-deb-inst { font-size:clamp(5px,.5vw,8px); color:var(--txt3); }
.pd-deb-role { font-size:clamp(4px,.42vw,7px); letter-spacing:.2em; text-transform:uppercase; color:var(--txt3); border:1px solid var(--rule); padding:.1vw .35vw; }

/* AI moderator center */
.pd-ai-col { display:flex; flex-direction:column; align-items:center; gap:.3vw; z-index:1; width:clamp(60px,9vw,140px); padding-top:.4vw; }
.pd-ai-icon { width:clamp(22px,2.8vw,50px); height:clamp(22px,2.8vw,50px); border-radius:50%; background:rgba(255,255,255,.7); border:1px solid var(--rule); display:flex; align-items:center; justify-content:center; position:relative; }
.pd-ai-pulse { position:absolute; inset:-3px; border-radius:50%; border:1px solid rgba(180,83,9,.25); animation:aipulse 2.2s ease-in-out infinite; }
@keyframes aipulse { 0%,100%{transform:scale(1);opacity:.45} 50%{transform:scale(1.13);opacity:.9} }
.pd-ai-icon svg { width:45%; height:45%; color:var(--ink2); }
.pd-ai-phase { font-size:clamp(5px,.52vw,9px); letter-spacing:.16em; text-transform:uppercase; color:var(--amber); text-align:center; line-height:1.25; }
.pd-ai-label { font-size:clamp(4px,.4vw,7px); letter-spacing:.14em; text-transform:uppercase; color:var(--txt3); }

/* ── BOTTOM ROADMAP ── */
.pd-roadmap { width:100%; display:flex; align-items:center; justify-content:center; gap:0; opacity:0; transition:opacity .5s .65s; padding-bottom:.2vw; }
.pd-chamber-view.in .pd-roadmap { opacity:1; }

/* the roadmap is a row: icon — line — node — line — node — line — node — line — icon */
.pd-rm-wrap { display:flex; align-items:center; width:90%; }

.pd-rm-end-icon { width:clamp(14px,1.5vw,26px); height:clamp(14px,1.5vw,26px); border-radius:50%; border:1px solid var(--rule); background:var(--parch2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.pd-rm-end-icon svg { width:55%; height:55%; color:var(--txt3); }

.pd-rm-seg { flex:1; height:1.5px; background:var(--rule); transition:background .4s; }
.pd-rm-seg.done { background:var(--amber); }
.pd-rm-seg.active { background:linear-gradient(to right, var(--amber), var(--rule)); }

.pd-rm-node { width:clamp(20px,2.2vw,36px); height:clamp(20px,2.2vw,36px); border-radius:50%; border:1.5px solid var(--rule); background:var(--parch2); display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; transition:border-color .4s, background .4s, box-shadow .4s; }
.pd-rm-node.done { border-color:var(--amber); }
.pd-rm-node.active { border-color:var(--ink); background:var(--ink); box-shadow:0 0 0 3px rgba(15,23,42,.12); }
.pd-rm-node svg { width:50%; height:50%; }
.pd-rm-node.done svg { color:var(--amber); }
.pd-rm-node.active svg { color:#fff; }
.pd-rm-node.pending svg { color:var(--txt3); opacity:.4; }

/* node label below */
.pd-rm-node-wrap { display:flex; flex-direction:column; align-items:center; gap:.2vw; flex-shrink:0; }
.pd-rm-node-lbl { font-size:clamp(4px,.4vw,7px); letter-spacing:.12em; text-transform:uppercase; color:var(--txt3); white-space:nowrap; }
.pd-rm-node-lbl.active { color:var(--ink); font-weight:600; }
.pd-rm-node-lbl.done { color:var(--amber); }

/* arbiter strip */
.pd-arb-strip { display:flex; align-items:center; gap:.4vw; opacity:0; transition:opacity .5s .8s; }
.pd-chamber-view.in .pd-arb-strip { opacity:1; }
.pd-arb-dot { width:clamp(3px,.32vw,5px); height:clamp(3px,.32vw,5px); border-radius:50%; background:var(--amber); animation:aipulse 2s ease-in-out infinite; }
.pd-arb-lbl { font-size:clamp(4px,.4vw,7px); letter-spacing:.26em; text-transform:uppercase; color:var(--txt3); }

/* chamber view overlay */
.pd-chamber-view { position:absolute; inset:0; background:var(--parch2); display:flex; flex-direction:column; opacity:0; pointer-events:none; transition:opacity .7s; }
.pd-chamber-view.in { opacity:1; pointer-events:auto; }

/* ── REPLAY ── */
.pd-done { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(15,23,42,0); opacity:0; pointer-events:none; transition:background 1.2s 1s, opacity .7s .7s; }
.pd-done.in { opacity:1; background:rgba(15,23,42,.55); pointer-events:auto; }
.pd-replay { padding:.65vw 2.4vw; border:1px solid rgba(253,251,247,.2); background:transparent; color:var(--parch); font-family:'Inter',sans-serif; font-size:clamp(7px,.68vw,12px); letter-spacing:.34em; text-transform:uppercase; cursor:pointer; opacity:0; transform:translateY(10px); transition:opacity .5s 1.7s, transform .5s 1.7s, border-color .2s, color .2s; }
.pd-done.in .pd-replay { opacity:1; transform:none; }
.pd-replay:hover { border-color:var(--amber-lt); color:var(--amber-lt); }
`;

// ─── SVG icons ────────────────────────────────────────────────────────────────
const IconCross   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>;
const IconTrophy  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 21h8M12 17v4M7 4H4v5a4 4 0 004 4m9-9h3v5a4 4 0 01-4 4M7 13a5 5 0 005 5 5 5 0 005-5V4H7v9z"/></svg>;
const IconChat    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconPeople  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3a4 4 0 010 8M21 21v-2a4 4 0 00-3-3.87"/></svg>;
const IconBell    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IconUser    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IconStar    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconShield  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconBrain   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>;
const IconFlag    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const IconCheck   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>;
const IconMsg     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconGavel   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.5 3.5l6 6-3 3-6-6 3-3z"/><path d="M3.5 18.5l7-7"/><path d="M2 22l4-4"/><line x1="6" y1="18" x2="18" y2="6"/></svg>;
const IconLightning = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

// ─── Scene 1 ──────────────────────────────────────────────────────────────────
function Scene1({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [vis,   setVis]   = useState(false);
  const [typed, setTyped] = useState("");
  const [still, setStill] = useState(false);
  const [ring,  setRing]  = useState(false);
  const [gone,  setGone]  = useState(false);
  const dead = useRef(false);

  useEffect(() => {
    if (!active) { dead.current = true; setVis(false); setTyped(""); setStill(false); setRing(false); setGone(false); return; }
    dead.current = false;
    (async () => {
      await sleep(350); if (dead.current) return; setVis(true);
      await sleep(650); if (dead.current) return;
      for (let i = 1; i <= SEARCH_QUERY.length; i++) {
        if (dead.current) return;
        setTyped(SEARCH_QUERY.slice(0, i));
        await sleep(36 + Math.random() * 46);
      }
      setStill(true);
      await sleep(750);
      setRing(true); await sleep(140); setRing(false);
      await sleep(280); setGone(true);
      await sleep(480);
      if (!dead.current) { dead.current = true; onDone(); }
    })();
    return () => { dead.current = true; };
  }, [active, onDone]);

  if (!active) return null;
  return (
    <div className="pd-s1">
      <div className="pd-grain"/><div className="pd-scan"/>
      <div className={`pd-sw${vis ? " in" : ""}`} style={{ opacity: gone ? 0 : undefined, transition: gone ? "opacity .35s" : undefined }}>
        <div className="pd-sb">
          <svg className="pd-sico" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8.5" cy="8.5" r="5.5"/><line x1="13" y1="13" x2="17" y2="17"/>
          </svg>
          <div className="pd-stxt">
            {typed}
            {!gone && <span className={`pd-cur${still ? " still" : ""}`}/>}
          </div>
        </div>
        <div className={`pd-ring${ring ? " on" : ""}`}/>
      </div>
    </div>
  );
}

// ─── Scene 2 — Convene Chamber form ──────────────────────────────────────────
function Scene2({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [brIn,    setBr]    = useState(false);
  const [typed,   setTyped] = useState("");
  const [catSel,  setCat]   = useState("");
  const [btnClick,setBtn]   = useState(false);
  const dead = useRef(false);

  const CATS = ["Politics","Economics","Philosophy","Geopolitics","Geography","Religion","Law & Justice","AI & Technology","History","Morality & Ethics","Enterprise & Business","Science"];

  useEffect(() => {
    if (!active) { dead.current = true; setBr(false); setTyped(""); setCat(""); setBtn(false); return; }
    dead.current = false;
    (async () => {
      await sleep(200); if (dead.current) return; setBr(true);
      await sleep(700); if (dead.current) return;
      // type motion into field
      for (let i = 1; i <= MOTION_TEXT.length; i++) {
        if (dead.current) return;
        setTyped(MOTION_TEXT.slice(0, i));
        await sleep(16 + Math.random() * 12);
      }
      await sleep(400); if (dead.current) return;
      // highlight Geopolitics
      setCat("Geopolitics");
      await sleep(600); if (dead.current) return;
      // click continue
      setBtn(true);
      await sleep(300);
      if (!dead.current) { dead.current = true; onDone(); }
    })();
    return () => { dead.current = true; };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div style={{ position:"absolute", inset:0, background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", perspective:"1400px" }}>
      <div className="pd-grain"/><div className="pd-scan"/>
      <div className={`pd-browser${brIn ? " in" : ""}`}>
        <div className="pd-chrome">
          <div className="pd-chrome-dot"/><div className="pd-chrome-dot"/><div className="pd-chrome-dot"/>
          <div className="pd-chrome-url"><span className="pd-chrome-url-txt">pocketdebate.com/showdowns/create</span></div>
        </div>
        <div className="pd-app">
          {/* nav */}
          <div className="pd-nav">
            <div className="pd-nav-logo">P<span>.</span></div>
            <div className="pd-nav-div"/>
            <div className="pd-nav-ico active"><IconCross/></div>
            <div className="pd-nav-ico"><IconTrophy/></div>
            <div className="pd-nav-ico"><IconChat/></div>
            <div className="pd-nav-ico"><IconPeople/></div>
            <div style={{flex:1}}/>
            <div className="pd-nav-ico"><IconStar/></div>
            <div className="pd-nav-ico"><IconBell/></div>
            <div className="pd-nav-ico"><IconUser/></div>
          </div>
          {/* content */}
          <div className="pd-content">
            <div className="pd-convene-layout">
              {/* left steps */}
              <div className="pd-steps-panel">
                <div className="pd-steps-title">Convene{"\n"}Chamber</div>
                <div className="pd-step">
                  <div className="pd-step-num active">1</div>
                  <div className="pd-step-info">
                    <div className="pd-step-name">The Motion</div>
                    <div className="pd-step-sub">Topic details</div>
                  </div>
                </div>
                <div className="pd-step">
                  <div className="pd-step-num">2</div>
                  <div className="pd-step-info">
                    <div className="pd-step-name muted">Logistics</div>
                    <div className="pd-step-sub">Format & schedule</div>
                  </div>
                </div>
                <div className="pd-step">
                  <div className="pd-step-num">3</div>
                  <div className="pd-step-info">
                    <div className="pd-step-name muted">Access</div>
                    <div className="pd-step-sub">Rules & privacy</div>
                  </div>
                </div>
              </div>
              {/* form */}
              <div className="pd-form-panel">
                <div className="pd-form-title">The Motion</div>
                <div className="pd-form-sub">Define the core topic and context for your debate.</div>

                <div className="pd-field-label">Motion / Title <span>*</span></div>
                <div className="pd-input focused">
                  {typed || <span className="pd-input-placeholder">e.g., This House would implement a universal basic income</span>}
                  {typed.length < MOTION_TEXT.length && typed.length > 0 && <span className="pd-cur"/>}
                </div>

                <div className="pd-field-label">Academic Category <span>*</span></div>
                <div className="pd-categories">
                  {CATS.map(c => (
                    <div key={c} className={`pd-cat-pill${catSel===c?" selected":""}`}>{c}</div>
                  ))}
                </div>

                <div className="pd-field-label">Context & Briefing <span>*</span></div>
                <div className="pd-textarea">Provide background information, study guides, or specific parameters for delegates...</div>

                <div className="pd-continue-row">
                  <div className={`pd-continue-btn${btnClick?" clicked":""}`}>Continue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scene 3 — Debate Chamber ─────────────────────────────────────────────────
function Scene3({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [brIn,   setBr]    = useState(false);
  const [chamIn, setCham]  = useState(false);
  const [phase,  setPhase] = useState(0); // 0=Opening active
  const dead = useRef(false);

  useEffect(() => {
    if (!active) { dead.current = true; setBr(false); setCham(false); setPhase(0); return; }
    dead.current = false;
    (async () => {
      await sleep(200); if (dead.current) return; setBr(true);
      await sleep(600); if (dead.current) return; setCham(true);
      // step through phases
      for (let p = 1; p < 4; p++) {
        await sleep(900); if (dead.current) return; setPhase(p);
      }
      await sleep(1800);
      if (!dead.current) { dead.current = true; onDone(); }
    })();
    return () => { dead.current = true; };
  }, [active, onDone]);

  if (!active) return null;

  const phaseLabels = ["Opening", "Rebuttal", "Closing", "Verdict"];
  const currentPhaseLabel = phaseLabels[phase] ?? "Opening";

  // Roadmap nodes: lightning(start), msg(opening), reply(rebuttal), closing, flag(end), gavel(verdict)
  const nodes = [
    { icon: <IconLightning/>, label: "Start" },
    { icon: <IconMsg/>,       label: "Opening" },
    { icon: <IconMsg/>,       label: "Rebuttal" },
    { icon: <IconMsg/>,       label: "Closing" },
    { icon: <IconFlag/>,      label: "End" },
    { icon: <IconGavel/>,     label: "Verdict" },
  ];

  return (
    <div style={{ position:"absolute", inset:0, background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", perspective:"1400px" }}>
      <div className="pd-grain"/><div className="pd-scan"/>
      <div className={`pd-browser${brIn ? " in" : ""}`}>
        <div className="pd-chrome">
          <div className="pd-chrome-dot"/><div className="pd-chrome-dot"/><div className="pd-chrome-dot"/>
          <div className="pd-chrome-url"><span className="pd-chrome-url-txt">pocketdebate.com/chamber/live</span></div>
        </div>
        <div className="pd-app">
          {/* nav */}
          <div className="pd-chamber-nav">
            <div className="pd-nav-logo">P<span>.</span></div>
            <div className="pd-nav-div"/>
            <div className="pd-nav-ico active"><IconShield/></div>
            <div className="pd-nav-ico"><IconTrophy/></div>
            <div className="pd-nav-ico"><IconChat/></div>
            <div className="pd-nav-ico"><IconPeople/></div>
            <div style={{flex:1}}/>
            <div className="pd-nav-ico"><IconStar/></div>
            <div className="pd-nav-ico"><IconBell/></div>
            <div className="pd-nav-ico"><IconUser/></div>
          </div>

          {/* chamber content */}
          <div className="pd-content">
            <div className={`pd-chamber-view${chamIn?" in":""}`} style={{position:"relative"}}>
              <div className="pd-chrome" style={{flexShrink:0}}>
                <div className="pd-chrome-dot"/><div className="pd-chrome-dot"/><div className="pd-chrome-dot"/>
                <div className="pd-chrome-url"><span className="pd-chrome-url-txt">pocketdebate.com/chamber/live</span></div>
              </div>
              <div className="pd-chamber-main">

                {/* motion */}
                <div style={{textAlign:"center"}}>
                  <div className="pd-ch-cat">GEOPOLITICS · GOVERNANCE</div>
                  <div className="pd-ch-motion-text">&ldquo;{MOTION_TEXT}&rdquo;</div>
                </div>

                {/* debaters */}
                <div className="pd-debs-row">
                  <div className="pd-debs-line"/>
                  {/* proposition */}
                  <div className="pd-deb-col">
                    <div className="pd-av-wrap">
                      <div className="pd-av speaking">SJ</div>
                      <div className="pd-av-badge"/>
                    </div>
                    <div className="pd-deb-name">S. Jenkins</div>
                    <div className="pd-deb-inst">Oxford University</div>
                    <div className="pd-deb-role">PROPOSITION</div>
                  </div>

                  {/* AI moderator */}
                  <div className="pd-ai-col" style={{flex:1}}>
                    <div className="pd-ai-icon">
                      <div className="pd-ai-pulse"/>
                      <IconBrain/>
                    </div>
                    <div className="pd-ai-phase">{currentPhaseLabel}</div>
                    <div className="pd-ai-label">AI MODERATOR</div>
                  </div>

                  {/* opposition */}
                  <div className="pd-deb-col">
                    <div className="pd-av-wrap">
                      <div className="pd-av">MC</div>
                    </div>
                    <div className="pd-deb-name">M. Chen</div>
                    <div className="pd-deb-inst">Cambridge University</div>
                    <div className="pd-deb-role">OPPOSITION</div>
                  </div>
                </div>

                {/* roadmap */}
                <div className="pd-roadmap">
                  <div className="pd-rm-wrap">
                    {nodes.map((n, i) => {
                      const isLast = i === nodes.length - 1;
                      // phase 0 = opening (node 1), phase 1 = rebuttal (node 2), etc
                      const nodeActive = i === phase + 1;
                      const nodeDone   = i <= phase && i > 0;
                      const segDone    = i < phase + 1 && i < nodes.length - 1;
                      return (
                        <React.Fragment key={i}>
                          <div className="pd-rm-node-wrap">
                            <div className={`pd-rm-node${nodeActive?" active":nodeDone?" done":" pending"}`}>
                              {nodeDone ? <IconCheck/> : n.icon}
                            </div>
                          </div>
                          {!isLast && <div className={`pd-rm-seg${segDone?" done":""}`}/>}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* arbiter strip */}
                <div className="pd-arb-strip">
                  <div className="pd-arb-dot"/>
                  <div className="pd-arb-lbl">ARBITER AI — ADJUDICATING</div>
                </div>

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
          <button className="pd-start" onClick={start}>Play Sequence</button>
        </div>
      )}
      <Scene1 active={scene==="s1"} onDone={() => setScene("s2")}/>
      <Scene2 active={scene==="s2"} onDone={() => setScene("s3")}/>
      <Scene3 active={scene==="s3"} onDone={() => setDone(true)}/>
      <div className={`pd-done${done?" in":""}`}>
        <button className="pd-replay" onClick={replay}>Replay</button>
      </div>
      {scene !== "idle" && <div className="pd-grain" style={{zIndex:100}}/>}
    </div>
  );
}
