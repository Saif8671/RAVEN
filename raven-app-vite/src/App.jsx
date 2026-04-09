import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #131314;
    --bg2:       #1c1b1c;
    --bg3:       #0e0e0f;
    --surface:   #201f20;
    --surface2:  #2a2a2b;
    --surface3:  #353436;
    --border:    transparent;
    --border2:   rgba(73, 69, 79, 0.15); /* Ghost border */
    --accent:    #d0bcff;
    --accent2:   #e9ddff;
    --accent-dark: #37265e;
    --gold:      #e8ddff;
    --teal:      #c0a7ff;
    --blue:      #665590;
    --threat:    #ffb4ab;
    --text:      #e5e2e3;
    --text2:     #cac4d0;
    --text3:     #948f9a;
    --font-head: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'DM Mono', monospace;
    --glow:      0 24px 48px rgba(208, 188, 255, 0.06);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 16px; /* slightly larger for readability */
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* ── NOISE OVERLAY ─────────────────────── */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.02;
    pointer-events: none;
    z-index: 9999;
  }

  /* ── NAV ───────────────────────────────── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 48px;
    background: rgba(19, 19, 20, 0.7);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border2);
  }
  .nav-logo {
    font-family: var(--font-head);
    font-size: 22px; font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--text);
    display: flex; align-items: center; gap: 10px;
    cursor: pointer;
  }
  .nav-logo-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-link {
    font-family: var(--font-body); font-size: 14px; font-weight: 500;
    color: var(--text2); cursor: pointer; border: none; background: none;
    transition: color 0.2s;
  }
  .nav-link:hover { color: var(--text); }
  .nav-cta {
    font-family: var(--font-body); font-size: 14px; font-weight: 600;
    padding: 10px 24px; border: 1px solid var(--border2);
    color: var(--accent); background: rgba(208, 188, 255, 0.05); cursor: pointer;
    border-radius: 4px; transition: all 0.2s;
  }
  .nav-cta:hover { background: rgba(208, 188, 255, 0.1); border-color: var(--accent); }

  /* ── HERO ──────────────────────────────── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
    padding: 160px 80px 100px;
    position: relative; overflow: hidden;
  }
  .hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(208,188,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(208,188,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
  }
  .hero-glow {
    position: absolute; top: -100px; right: -100px;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(208,188,255,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow {
    font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.15em;
    color: var(--accent); text-transform: uppercase;
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 32px;
  }
  .hero-eyebrow::before {
    content: ''; display: block;
    width: 48px; height: 1px; background: var(--accent);
  }
  .hero-title {
    font-family: var(--font-head);
    font-size: clamp(48px, 7vw, 96px);
    font-weight: 800; line-height: 0.95;
    letter-spacing: -0.04em;
    max-width: 800px;
    margin-bottom: 32px;
  }
  .hero-title span { color: var(--accent); }
  .hero-sub {
    font-size: 18px; color: var(--text2); max-width: 560px;
    line-height: 1.6; margin-bottom: 56px; font-weight: 300;
  }
  .hero-actions { display: flex; gap: 20px; align-items: center; }
  .btn-primary {
    font-family: var(--font-head); font-size: 16px; font-weight: 600;
    letter-spacing: 0.02em; padding: 18px 40px;
    background: linear-gradient(135deg, var(--accent2), var(--accent)); 
    color: var(--accent-dark); border: none;
    cursor: pointer; border-radius: 4px;
    transition: all 0.3s; position: relative; overflow: hidden;
    box-shadow: 0 4px 15px rgba(208, 188, 255, 0.15);
  }
  .btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transform: translateX(-100%); transition: transform 0.6s ease;
  }
  .btn-primary:hover::after { transform: translateX(100%); }
  .btn-primary:hover { box-shadow: 0 8px 30px rgba(208, 188, 255, 0.25); transform: translateY(-2px); }
  
  .btn-ghost {
    font-family: var(--font-body); font-size: 14px; font-weight: 500;
    padding: 17px 32px; border: 1px solid var(--border2);
    color: var(--accent); background: transparent; cursor: pointer;
    border-radius: 4px; transition: all 0.3s;
  }
  .btn-ghost:hover { border-color: var(--accent); background: rgba(208,188,255,0.05); }

  .hero-stats {
    display: flex; gap: 64px; margin-top: 100px;
    padding-top: 48px; border-top: 1px solid var(--border2);
  }
  .hero-stat-num {
    font-family: var(--font-head); font-size: 36px; font-weight: 700;
    color: var(--text);
  }
  .hero-stat-num span { color: var(--accent); }
  .hero-stat-label {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: 0.1em; color: var(--text3);
    text-transform: uppercase; margin-top: 4px;
  }

  /* ── TICKER ────────────────────────────── */
  .ticker {
    background: var(--surface);
    border-top: 1px solid var(--border2);
    border-bottom: 1px solid var(--border2);
    padding: 16px 0; overflow: hidden;
    display: flex;
  }
  .ticker-track {
    display: flex; gap: 80px; white-space: nowrap;
    animation: ticker 32s linear infinite;
  }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .ticker-item {
    font-family: var(--font-mono); font-size: 13px;
    letter-spacing: 0.1em; color: var(--text3);
    display: flex; align-items: center; gap: 16px;
  }
  .ticker-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }

  /* ── FEATURES ──────────────────────────── */
  .section { padding: 120px 80px; background: var(--bg); }
  .section-label {
    font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.15em;
    color: var(--accent); text-transform: uppercase; margin-bottom: 24px;
  }
  .section-title {
    font-family: var(--font-head); font-size: clamp(36px, 5vw, 64px);
    font-weight: 700; line-height: 1.05; margin-bottom: 80px; max-width: 700px;
  }
  .features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
  }
  .feature-card {
    background: var(--surface2); padding: 48px 40px;
    border-top: 1px solid var(--border2);
    border-radius: 8px;
    transition: all 0.3s;
    cursor: default;
  }
  .feature-card:hover { 
    background: var(--surface3);
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }
  .feature-icon {
    width: 48px; height: 48px; margin-bottom: 32px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--border2); border-radius: 6px;
    font-size: 20px; color: var(--accent);
    background: rgba(208, 188, 255, 0.05);
  }
  .feature-num {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: 0.15em; color: var(--text3); margin-bottom: 16px;
  }
  .feature-title {
    font-family: var(--font-head); font-size: 20px; font-weight: 600;
    margin-bottom: 16px; color: var(--text);
  }
  .feature-desc { font-size: 15px; color: var(--text2); line-height: 1.6; }

  /* ── SCAN PAGE ─────────────────────────── */
  .scan-page {
    min-height: 100vh; padding: 160px 80px 80px;
    display: flex; flex-direction: column; align-items: center;
    background: var(--bg2);
  }
  .scan-header { text-align: center; margin-bottom: 80px; }
  .scan-form-wrap {
    width: 100%; max-width: 680px;
    background: rgba(42, 42, 43, 0.6); /* surface_container_high with opacity */
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-top: 1px solid var(--border2);
    padding: 56px 48px; border-radius: 8px;
    position: relative;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  }
  .form-group { margin-bottom: 28px; }
  .form-label {
    font-family: var(--font-head); font-size: 13px; font-weight: 600;
    color: var(--text2); display: block; margin-bottom: 12px;
  }
  .form-input {
    width: 100%; padding: 16px 20px;
    background: var(--bg3); border: none; border-bottom: 1px solid var(--border2);
    color: var(--text); font-family: var(--font-mono); font-size: 15px;
    border-radius: 4px 4px 0 0; outline: none; transition: all 0.2s;
  }
  .form-input:focus { border-bottom-color: var(--accent); background: rgba(208, 188, 255, 0.03); }
  .form-input::placeholder { color: var(--text3); }

  /* ── SCANNING ANIMATION ─────────────────── */
  .scanning-wrap {
    width: 100%; max-width: 680px;
    background: rgba(42, 42, 43, 0.8);
    backdrop-filter: blur(32px);
    border-top: 1px solid var(--border2);
    padding: 64px 48px; border-radius: 12px; text-align: center;
    box-shadow: 0 0 60px rgba(208, 188, 255, 0.05);
  }
  .scan-radar {
    width: 140px; height: 140px; margin: 0 auto 48px;
    position: relative; display: flex; align-items: center; justify-content: center;
  }
  .scan-ring {
    position: absolute; border-radius: 50%;
    border: 1px solid var(--accent); opacity: 0;
    animation: scanring 2.4s ease-out infinite;
  }
  .scan-ring:nth-child(1) { inset: 0; }
  .scan-ring:nth-child(2) { inset: 20px; animation-delay: 0.6s; }
  .scan-ring:nth-child(3) { inset: 40px; animation-delay: 1.2s; }
  @keyframes scanring {
    0%{opacity:0;transform:scale(0.6)} 40%{opacity:0.3} 100%{opacity:0;transform:scale(1.2)}
  }
  .scan-dot {
    width: 12px; height: 12px; border-radius: 50%;
    background: var(--accent); box-shadow: 0 0 20px var(--accent);
    z-index: 1; animation: pulse 1.2s ease-in-out infinite;
  }
  .scan-agents { margin-top: 40px; text-align: left; }
  .scan-agent {
    display: flex; align-items: center; gap: 16px;
    padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
    font-family: var(--font-mono); font-size: 13px;
  }
  .scan-agent:last-child { border-bottom: none; }
  .agent-status {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }
  .agent-status.done { background: var(--teal); box-shadow: 0 0 10px var(--teal); }
  .agent-status.active { background: var(--accent); box-shadow: 0 0 12px var(--accent); animation: pulse 1s infinite; }
  .agent-status.pending { background: var(--text3); }
  .agent-name { flex: 1; color: var(--text2); }
  .agent-name.done { color: var(--text); }
  .agent-tag {
    font-size: 11px; letter-spacing: 0.05em; padding: 4px 10px;
    border-radius: 4px; font-weight: 500;
    text-transform: uppercase;
  }
  .agent-tag.done { background: rgba(192,167,255,0.1); color: var(--teal); }
  .agent-tag.active { background: rgba(208,188,255,0.15); color: var(--accent); }
  .agent-tag.pending { background: rgba(255,255,255,0.03); color: var(--text3); }

  /* ── RESULTS ───────────────────────────── */
  .results-page { min-height: 100vh; padding: 140px 80px 100px; background: var(--bg); }
  .results-top {
    display: grid; grid-template-columns: 320px 1fr; gap: 40px; margin-bottom: 60px;
  }
  .score-card {
    background: var(--surface2);
    border-top: 1px solid var(--border2);
    padding: 48px 40px; border-radius: 8px; text-align: center;
    position: relative; overflow: hidden;
  }
  .score-card::before {
    content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
  }
  .score-card.critical::before { background: var(--threat); }
  .score-card.high::before { background: var(--gold); }
  .score-card.medium::before { background: var(--accent); }
  .score-card.low::before { background: var(--teal); }
  
  .score-label {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.15em;
    color: var(--text3); text-transform: uppercase; margin-bottom: 20px;
  }
  .score-number {
    font-family: var(--font-head); font-size: 100px; font-weight: 800;
    line-height: 0.9; margin-bottom: 12px; letter-spacing: -0.04em;
  }
  .score-number.critical { color: var(--threat); text-shadow: 0 0 20px rgba(255,180,171,0.2); }
  .score-number.high { color: var(--gold); text-shadow: 0 0 20px rgba(232,221,255,0.2); }
  .score-number.medium { color: var(--accent); text-shadow: 0 0 20px rgba(208,188,255,0.2); }
  .score-number.low { color: var(--teal); }
  
  .score-level {
    font-family: var(--font-head); font-size: 16px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 40px;
  }
  .score-breakdown { display: flex; flex-direction: column; gap: 12px; text-align: left; }
  .score-row {
    display: flex; justify-content: space-between; align-items: center;
    font-family: var(--font-mono); font-size: 13px;
    padding: 10px 16px; background: rgba(0,0,0,0.2); border-radius: 4px;
  }
  .score-row-label { color: var(--text2); }
  .score-row-val { font-weight: 600; font-size: 14px; }
  .score-row-val.critical { color: var(--threat); }
  .score-row-val.high { color: var(--gold); }
  .score-row-val.medium { color: var(--accent); }
  .score-row-val.low { color: var(--teal); }
  
  .summary-card {
    background: var(--surface2);
    border-top: 1px solid var(--border2);
    padding: 56px 48px; border-radius: 8px;
  }
  .summary-title {
    font-family: var(--font-head); font-size: 28px; font-weight: 700;
    margin-bottom: 16px; color: var(--text); letter-spacing: -0.02em;
  }
  .summary-text { color: var(--text2); line-height: 1.7; margin-bottom: 40px; font-size: 16px; }
  .findings-list { display: flex; flex-direction: column; gap: 32px; } /* Increased gap, no dividers */
  
  .finding-card {
    background: var(--surface2);
    border-radius: 8px; overflow: hidden;
    border-top: 1px solid var(--border2);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .finding-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,0.3); }
  .finding-header {
    display: flex; align-items: center; gap: 20px;
    padding: 24px 32px; cursor: pointer;
    background: var(--surface3);
  }
  .sev-badge {
    font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: 0.05em;
    padding: 6px 12px; border-radius: 4px; flex-shrink: 0; text-transform: uppercase;
  }
  .sev-badge.Critical { background: rgba(255,180,171,0.1); color: var(--threat); border: 1px solid rgba(255,180,171,0.2); }
  .sev-badge.High     { background: rgba(232,221,255,0.1); color: var(--gold); border: 1px solid rgba(232,221,255,0.2); }
  .sev-badge.Medium   { background: rgba(208,188,255,0.1); color: var(--accent); border: 1px solid rgba(208,188,255,0.2); }
  .sev-badge.Low      { background: rgba(192,167,255,0.1); color: var(--teal); border: 1px solid rgba(192,167,255,0.2); }
  
  .finding-title { flex: 1; font-family: var(--font-head); font-size: 18px; font-weight: 600; }
  .finding-chevron {
    font-size: 14px; color: var(--text3); transition: transform 0.3s;
  }
  .finding-chevron.open { transform: rotate(180deg); }
  .finding-body {
    padding: 0 32px 32px; 
    background: var(--surface2);
  }
  .finding-plain {
    padding: 24px; background: rgba(0,0,0,0.2); border-radius: 6px;
    color: var(--text2); font-size: 15px; line-height: 1.7;
    margin-bottom: 24px; margin-top: 24px;
    border-left: 4px solid var(--accent);
  }
  .fix-title {
    font-family: var(--font-mono); font-size: 12px; font-weight: 500; letter-spacing: 0.1em;
    color: var(--accent); text-transform: uppercase; margin-bottom: 16px;
  }
  .fix-steps { display: flex; flex-direction: column; gap: 12px; }
  .fix-step {
    display: flex; gap: 16px; font-size: 15px; color: var(--text2);
    line-height: 1.6;
  }
  .fix-step-num {
    font-family: var(--font-mono); font-size: 12px;
    color: var(--accent); flex-shrink: 0; padding-top: 3px;
    min-width: 28px;
  }

  /* ── INCIDENT PAGE ─────────────────────── */
  .incident-page { min-height: 100vh; padding: 160px 80px 100px; background: var(--bg2); }
  .incident-header { margin-bottom: 80px; }
  .incident-warning {
    display: inline-flex; align-items: center; gap: 12px;
    background: rgba(255,180,171,0.1); border-left: 4px solid var(--threat);
    padding: 16px 24px; border-radius: 4px; margin-bottom: 40px;
    font-family: var(--font-mono); font-size: 13px; color: var(--threat);
    letter-spacing: 0.05em; font-weight: 500;
  }
  .incident-form-wrap {
    max-width: 680px;
    background: var(--surface2); border-top: 2px solid var(--threat);
    padding: 56px 48px; border-radius: 8px;
    position: relative; box-shadow: 0 24px 60px rgba(0,0,0,0.3);
  }
  .playbook-wrap {
    max-width: 800px;
    background: var(--surface2); border-top: 1px solid var(--border2);
    padding: 64px 56px; border-radius: 8px;
  }
  .playbook-title {
    font-family: var(--font-head); font-size: 32px; font-weight: 700;
    margin-bottom: 12px; letter-spacing: -0.02em;
  }
  .playbook-sub {
    font-family: var(--font-mono); font-size: 13px; color: var(--text3);
    letter-spacing: 0.05em; margin-bottom: 48px;
  }
  .playbook-steps { display: flex; flex-direction: column; gap: 32px; }
  .playbook-step {
    display: grid; grid-template-columns: 60px 1fr;
    gap: 32px; align-items: start;
    position: relative;
  }
  .playbook-step-time {
    font-family: var(--font-mono); font-size: 12px; font-weight: 600;
    color: var(--threat); letter-spacing: 0.05em;
    padding-top: 4px;
  }
  .playbook-step-title {
    font-family: var(--font-head); font-size: 18px; font-weight: 600;
    margin-bottom: 8px; color: var(--text);
  }
  .playbook-step-desc { font-size: 15px; color: var(--text2); line-height: 1.7; }
  .playbook-connector {
    position: absolute; left: 30px; top: 32px; bottom: -32px;
    width: 1px; background: rgba(255,255,255,0.05); /* very subtle */
  }

  /* ── FOOTER ────────────────────────────── */
  .footer {
    background: #0e0e0f; /* surface_container_lowest */
    padding: 64px 80px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-logo {
    font-family: var(--font-head); font-size: 22px; font-weight: 800;
    letter-spacing: -0.04em; color: var(--text);
  }
  .footer-text {
    font-family: var(--font-mono); font-size: 12px;
    color: var(--text3); letter-spacing: 0.1em;
  }

  /* ── TRANSITIONS ───────────────────────── */
  .page-enter {
    animation: fadein 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes fadein { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  /* ── BREACH BANNER ─────────────────────── */
  .breach-banner {
    background: rgba(255,180,171,0.08); border-left: 4px solid var(--threat);
    padding: 24px 32px; border-radius: 4px; margin-bottom: 32px;
    display: flex; align-items: flex-start; gap: 20px;
  }
  .breach-icon { font-size: 24px; flex-shrink: 0; }
  .breach-text { font-size: 15px; color: var(--text2); line-height: 1.6; }
  .breach-text strong { color: var(--threat); font-weight: 600; }
`;

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_REPORT = {
  business_name: "Coastal Brew Co.",
  website_url: "https://coastalbrew.co",
  scan_date: new Date().toISOString(),
  risk_score: 38,
  risk_level: "High",
  total_issues: 7,
  critical_count: 1,
  high_count: 3,
  medium_count: 2,
  low_count: 1,
  breach_detected: true,
  breach_details: "Your business email domain was found in 2 known data breaches from 2022 and 2023. This means some of your employees' login details may have been exposed. Attackers could use these to access your email, payment systems, or cloud accounts.",
  summary_message: "RAVEN found 7 security issues on your business — 1 critical and 3 high priority. The good news: all of these are fixable, usually in under an hour each. Start with the DMARC issue — it's the one most likely to be used against you right now.",
  findings: [
    {
      id: "EMAIL-001",
      category: "Email Security",
      severity: "Critical",
      plain_english: "Anyone on the internet can send emails pretending to be you. There's no 'seal' on your email address — so phishing attacks can look exactly like they came from you, tricking your customers and suppliers.",
      fix_steps: [
        "Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)",
        "Go to 'DNS Settings' or 'DNS Management' for your domain",
        "Add a new TXT record with Name/Host: _dmarc and Value: v=DMARC1; p=quarantine; rua=mailto:you@yourdomain.com",
        "Save the record and wait 24–48 hours for it to take effect",
        "Use mail-tester.com to verify it's working"
      ],
      time_estimate: "About 15 minutes"
    },
    {
      id: "WEB-001",
      category: "Web Security",
      severity: "High",
      plain_english: "Your website is missing a security layer that prevents hackers from injecting malicious scripts into your pages. This could let attackers steal your visitors' data or redirect them to a fake version of your site.",
      fix_steps: [
        "Contact your website developer or hosting provider (e.g. Shopify, WordPress, Wix)",
        "Ask them to add a Content-Security-Policy (CSP) header to your website",
        "If using WordPress, install a plugin like 'Headers and Methods Allowed HTTP' and set the CSP header",
        "Test the fix at securityheaders.com"
      ],
      time_estimate: "30 minutes with a developer"
    },
    {
      id: "WEB-002",
      category: "Web Security",
      severity: "High",
      plain_english: "Your website doesn't enforce strict HTTPS connections. Visitors on public WiFi (cafes, airports) could have their connection quietly intercepted by an attacker sitting nearby.",
      fix_steps: [
        "Log into your hosting control panel (cPanel, Plesk, or your host's dashboard)",
        "Find 'SSL/TLS' settings",
        "Enable 'Force HTTPS' or 'HTTP to HTTPS Redirect'",
        "If using Cloudflare, go to SSL/TLS → Edge Certificates → turn on 'Always Use HTTPS'"
      ],
      time_estimate: "About 10 minutes"
    },
    {
      id: "EMAIL-002",
      category: "Email Security",
      severity: "High",
      plain_english: "Your email domain is missing an SPF record, which means email servers can't verify your emails are genuine. This makes it very easy for scammers to impersonate your business in emails.",
      fix_steps: [
        "Log in to your domain registrar DNS settings",
        "Add a new TXT record with Name/Host: @ (or your domain name)",
        "Set Value to: v=spf1 include:_spf.google.com ~all (if using Gmail) or ask your email provider for the right value",
        "Save the record"
      ],
      time_estimate: "10 minutes"
    },
    {
      id: "WEB-003",
      category: "Web Security",
      severity: "Medium",
      plain_english: "Your website's admin login page (/admin) is publicly accessible. This gives attackers a direct door to try to break in to the backend of your site.",
      fix_steps: [
        "If using WordPress, install the 'WPS Hide Login' plugin to change /wp-admin to a secret URL",
        "Or contact your developer to password-protect the admin folder in your hosting settings",
        "Enable two-factor authentication (2FA) on your admin account"
      ],
      time_estimate: "20 minutes"
    },
    {
      id: "EMAIL-003",
      category: "Email Security",
      severity: "Medium",
      plain_english: "Your email is missing a DKIM signature — a digital stamp that proves your emails weren't tampered with in transit. Without it, your emails may land in spam or get modified by attackers.",
      fix_steps: [
        "Log into your email provider (Google Workspace, Microsoft 365, etc.)",
        "Find the DKIM settings — in Google Workspace: Apps → Gmail → Authenticate Email",
        "Generate a DKIM key and add the provided TXT record to your domain's DNS",
        "Click 'Start Authentication'"
      ],
      time_estimate: "About 20 minutes"
    },
    {
      id: "WEB-004",
      category: "Web Security",
      severity: "Low",
      plain_english: "Your website could do a better job of hiding what software it uses under the hood. This information can help attackers figure out which specific vulnerabilities to try.",
      fix_steps: [
        "Ask your hosting provider or developer to set X-Powered-By and Server headers to empty or a generic value",
        "In WordPress, install the 'WP Hardening' plugin which handles this automatically"
      ],
      time_estimate: "15 minutes with a developer"
    }
  ]
};

const PLAYBOOK_STEPS = [
  { time: "0–5 min", title: "Don't panic — isolate first", desc: "Disconnect the affected device from WiFi and unplug the ethernet cable. Do not turn it off — this preserves forensic evidence." },
  { time: "5–15 min", title: "Change all critical passwords", desc: "From a different, clean device: change your email, banking, domain registrar, and hosting passwords immediately. Enable 2FA on everything." },
  { time: "15–25 min", title: "Notify your bank", desc: "Call your business bank and flag a potential breach. Ask them to monitor for suspicious transactions and temporarily freeze outgoing transfers if needed." },
  { time: "25–35 min", title: "Check for unauthorised access", desc: "Review your email sent folder and login history. In Google Workspace or Microsoft 365, check the admin panel for sign-ins from unknown locations." },
  { time: "35–50 min", title: "Preserve evidence", desc: "Take screenshots of anything suspicious. Write down the timeline of what happened. You may need this for your insurance provider or police report." },
  { time: "50–60 min", title: "Notify and report", desc: "If customer data was exposed, you are legally required to notify affected customers. Contact your local cybercrime authority (in India: cybercrime.gov.in)." }
];

// ─── COMPONENTS ────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => setPage("home")}>
        <div className="nav-logo-dot" />
        RAVEN
      </div>
      <div className="nav-links">
        <button className="nav-link" onClick={() => setPage("home")}>Home</button>
        <button className="nav-link" onClick={() => setPage("scan")}>Scan</button>
        <button className="nav-link" onClick={() => setPage("incident")}>Incident Response</button>
        <button className="nav-cta" onClick={() => setPage("scan")}>Scan Your Business Free</button>
      </div>
    </nav>
  );
}

function Ticker() {
  const items = [
    "80% of small businesses had a cyberattack in 2025",
    "One attack every 11 seconds globally",
    "$120,000 average breach cost for SMBs",
    "41% of SMB attacks were AI-powered",
    "3.4 billion phishing emails sent daily",
    "95% of breaches caused by human error",
    "80% of small businesses have no security policy",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span className="ticker-item" key={i}>
            <span className="ticker-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function HomePage({ setPage }) {
  const features = [
    { icon: "🔍", num: "01", title: "Vulnerability Scanner", desc: "Checks HTTPS, SSL certificates, security headers, and exposed admin pages across your entire web presence." },
    { icon: "📧", num: "02", title: "Email Security Check", desc: "Validates your SPF, DKIM, and DMARC records so attackers can't impersonate your business via email." },
    { icon: "💀", num: "03", title: "Breach Detection", desc: "Checks if your business email domain appears in known data breach databases, in seconds." },
    { icon: "📊", num: "04", title: "Risk Score 0–100", desc: "One clear number tells you exactly how secure your business is, with Critical / High / Medium / Low tags." },
    { icon: "📝", num: "05", title: "Plain English Report", desc: "Every technical finding rewritten in language a shopkeeper can understand and act on immediately." },
    { icon: "🚨", num: "06", title: "Incident Playbook", desc: "If you think you've been hacked, RAVEN generates a 60-minute action checklist specific to your business type." },
  ];

  return (
    <div className="page-enter">
      {/* HERO */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-eyebrow">AI Cybersecurity for Small Business</div>
        <h1 className="hero-title">
          Your silent<br /><span>guardian.</span><br />Always watching.
        </h1>
        <p className="hero-sub">
          RAVEN scans your website, email domain, and breach history in seconds —
          then tells you exactly what to fix, in plain English.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => setPage("scan")}>
            Scan Your Business Free →
          </button>
          <button className="btn-ghost" onClick={() => setPage("results")}>
            View Sample Report
          </button>
        </div>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">80<span>%</span></div>
            <div className="hero-stat-label">of SMBs attacked in 2025</div>
          </div>
          <div>
            <div className="hero-stat-num">$<span>120K</span></div>
            <div className="hero-stat-label">average breach cost</div>
          </div>
          <div>
            <div className="hero-stat-num">11<span>s</span></div>
            <div className="hero-stat-label">between attacks globally</div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <Ticker />

      {/* FEATURES */}
      <section className="section">
        <div className="section-label">What RAVEN does</div>
        <h2 className="section-title">Everything a security team does. Automated.</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.num}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-num">{f.num}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">RAVEN</div>
        <div className="footer-text">SUPERVITY CODEQUEST 2026 · FINAL ROUND · PROBLEM #05</div>
        <div className="footer-text">SAIF RAHMAN · JNTUH CSM</div>
      </footer>
    </div>
  );
}

function ScanPage({ setPage }) {
  const [step, setStep] = useState("form"); // form | scanning | done
  const [form, setForm] = useState({ business_name: "", website_url: "", email_domain: "", owner_email: "" });
  const [agentStates, setAgentStates] = useState([
    { name: "Input Classifier", status: "pending" },
    { name: "Web Vulnerability Scanner", status: "pending" },
    { name: "Email Security Agent", status: "pending" },
    { name: "Breach Detection Agent", status: "pending" },
    { name: "Risk Scorer", status: "pending" },
    { name: "Plain English Translator", status: "pending" },
    { name: "Fix Guide Generator", status: "pending" },
    { name: "Report Compiler & Dispatcher", status: "pending" },
  ]);

  const runScan = () => {
    if (!form.business_name || !form.website_url || !form.email_domain || !form.owner_email) return;
    setStep("scanning");
    const delays = [400, 1000, 1000, 1000, 2200, 3000, 3800, 4600];
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setAgentStates(prev => prev.map((a, idx) => ({
          ...a,
          status: idx < i ? "done" : idx === i ? "active" : "pending"
        })));
      }, delay);
    });
    setTimeout(() => {
      setAgentStates(prev => prev.map(a => ({ ...a, status: "done" })));
      setTimeout(() => setPage("results"), 600);
    }, 5400);
  };

  return (
    <div className="scan-page page-enter">
      <div className="scan-header">
        <div className="section-label">Security Audit</div>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 42, fontWeight: 800, marginBottom: 12 }}>
          Scan Your Business
        </h1>
        <p style={{ color: "var(--text2)", maxWidth: 460 }}>
          Enter your business details. RAVEN will run a full security audit in under 60 seconds.
        </p>
      </div>

      {step === "form" && (
        <div className="scan-form-wrap page-enter">
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input className="form-input" placeholder="Coastal Brew Co."
              value={form.business_name}
              onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Website URL</label>
            <input className="form-input" placeholder="https://yourbusiness.com"
              value={form.website_url}
              onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Domain</label>
            <input className="form-input" placeholder="yourbusiness.com"
              value={form.email_domain}
              onChange={e => setForm(f => ({ ...f, email_domain: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 36 }}>
            <label className="form-label">Owner Email (for report delivery)</label>
            <input className="form-input" placeholder="you@yourbusiness.com"
              value={form.owner_email}
              onChange={e => setForm(f => ({ ...f, owner_email: e.target.value }))} />
          </div>
          <button className="btn-primary" style={{ width: "100%" }} onClick={runScan}>
            Run Security Scan →
          </button>
          <p style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", marginTop: 16, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
            Free scan · No account needed · Report emailed instantly
          </p>
        </div>
      )}

      {step === "scanning" && (
        <div className="scanning-wrap page-enter">
          <div className="scan-radar">
            <div className="scan-ring" /><div className="scan-ring" /><div className="scan-ring" />
            <div className="scan-dot" />
          </div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
            Scanning {form.business_name || "your business"}...
          </div>
          <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>
            {form.website_url}
          </p>
          <div className="scan-agents">
            {agentStates.map((a, i) => (
              <div className="scan-agent" key={i}>
                <span className={`agent-status ${a.status}`} />
                <span className={`agent-name ${a.status === "done" ? "done" : ""}`}>{a.name}</span>
                <span className={`agent-tag ${a.status}`}>
                  {a.status === "done" ? "DONE" : a.status === "active" ? "RUNNING" : "WAITING"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FindingCard({ finding }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="finding-card">
      <div className="finding-header" onClick={() => setOpen(o => !o)}>
        <span className={`sev-badge ${finding.severity}`}>{finding.severity}</span>
        <span className="finding-title">{finding.plain_english.split(".")[0]}.</span>
        <span className={`finding-chevron ${open ? "open" : ""}`}>▼</span>
      </div>
      {open && (
        <div className="finding-body page-enter">
          <div className="finding-plain">{finding.plain_english}</div>
          <div className="fix-title">Fix Guide · {finding.time_estimate}</div>
          <div className="fix-steps">
            {finding.fix_steps.map((s, i) => (
              <div className="fix-step" key={i}>
                <span className="fix-step-num">0{i + 1}.</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsPage() {
  const r = MOCK_REPORT;
  const scoreClass = r.risk_level.toLowerCase();
  return (
    <div className="results-page page-enter">
      <div style={{ marginBottom: 48 }}>
        <div className="section-label">Security Report</div>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 38, fontWeight: 800, marginBottom: 8 }}>
          {r.business_name}
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text3)", letterSpacing: "0.08em" }}>
          SCANNED {new Date(r.scan_date).toDateString().toUpperCase()} · {r.website_url}
        </p>
      </div>

      <div className="results-top">
        <div className={`score-card ${scoreClass}`}>
          <div className="score-label">Risk Score</div>
          <div className={`score-number ${scoreClass}`}>{r.risk_score}</div>
          <div className="score-level" style={{ color: scoreClass === "high" ? "var(--accent)" : scoreClass === "critical" ? "#e24b4a" : scoreClass === "medium" ? "var(--gold)" : "var(--teal)" }}>
            {r.risk_level} Risk
          </div>
          <div className="score-breakdown">
            {r.critical_count > 0 && <div className="score-row"><span className="score-row-label">Critical</span><span className="score-row-val critical">{r.critical_count}</span></div>}
            {r.high_count > 0 && <div className="score-row"><span className="score-row-label">High</span><span className="score-row-val high">{r.high_count}</span></div>}
            {r.medium_count > 0 && <div className="score-row"><span className="score-row-label">Medium</span><span className="score-row-val medium">{r.medium_count}</span></div>}
            {r.low_count > 0 && <div className="score-row"><span className="score-row-label">Low</span><span className="score-row-val low">{r.low_count}</span></div>}
            <div className="score-row"><span className="score-row-label">Total</span><span className="score-row-val">{r.total_issues}</span></div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-title">What RAVEN found</div>
          <p className="summary-text">{r.summary_message}</p>
          {r.breach_detected && (
            <div className="breach-banner">
              <span className="breach-icon">⚠</span>
              <span className="breach-text">
                <strong>Data breach detected.</strong> {r.breach_details}
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-primary" style={{ fontSize: 13 }}>Download PDF Report</button>
            <button className="btn-ghost" style={{ fontSize: 12 }}>Schedule Weekly Scans</button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          All Findings & Fix Guides
        </h2>
        <p style={{ fontSize: 13, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
          Click any issue to expand the plain-English explanation and step-by-step fix
        </p>
      </div>
      <div className="findings-list">
        {r.findings.map(f => <FindingCard finding={f} key={f.id} />)}
      </div>

      <footer className="footer" style={{ marginTop: 60, padding: "48px 0" }}>
        <div className="footer-logo">RAVEN</div>
        <div className="footer-text">NEXT SCAN SCHEDULED: {new Date(Date.now() + 7 * 86400000).toDateString().toUpperCase()}</div>
      </footer>
    </div>
  );
}

function IncidentPage() {
  const [step, setStep] = useState("form");
  const [bizType, setBizType] = useState("");
  const types = ["Retail / Shop", "Restaurant / Café", "Service Business", "E-commerce", "Healthcare Clinic", "Other"];

  return (
    <div className="incident-page page-enter">
      <div className="incident-header">
        <div className="incident-warning">⚠ Emergency Incident Response</div>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 42, fontWeight: 800, marginBottom: 16 }}>
          Think you've been hacked?
        </h1>
        <p style={{ color: "var(--text2)", maxWidth: 520, lineHeight: 1.7 }}>
          Don't panic. RAVEN will generate a 60-minute action checklist specific to your business type — right now.
        </p>
      </div>

      {step === "form" && (
        <div className="incident-form-wrap page-enter">
          <div className="form-group" style={{ marginBottom: 32 }}>
            <label className="form-label">What type of business do you run?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
              {types.map(t => (
                <button key={t}
                  onClick={() => setBizType(t)}
                  style={{
                    padding: "14px 16px", border: `1px solid ${bizType === t ? "var(--accent)" : "var(--border2)"}`,
                    background: bizType === t ? "rgba(232,84,58,0.1)" : "var(--bg2)",
                    color: bizType === t ? "var(--accent)" : "var(--text2)",
                    fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.05em",
                    borderRadius: 3, cursor: "pointer", textAlign: "left", transition: "all 0.15s"
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 32 }}>
            <label className="form-label">Briefly describe what happened (optional)</label>
            <textarea className="form-input" rows={4}
              placeholder="e.g. I received a suspicious email and clicked a link. Now I can't log into my email account."
              style={{ resize: "vertical" }} />
          </div>
          <button className="btn-primary" style={{ width: "100%", background: "#e24b4a", borderColor: "#e24b4a" }}
            onClick={() => { if (bizType) setStep("playbook"); }}>
            Generate My 60-Minute Action Plan →
          </button>
        </div>
      )}

      {step === "playbook" && (
        <div className="playbook-wrap page-enter">
          <div className="playbook-title">Your 60-Minute Incident Response Plan</div>
          <div className="playbook-sub">
            GENERATED FOR: {bizType.toUpperCase()} · {new Date().toDateString().toUpperCase()}
          </div>
          <div className="playbook-steps">
            {PLAYBOOK_STEPS.map((s, i) => (
              <div key={i}>
                <div className="playbook-step">
                  <div className="playbook-step-time">{s.time}</div>
                  <div className="playbook-step-content">
                    <div className="playbook-step-title">{s.title}</div>
                    <div className="playbook-step-desc">{s.desc}</div>
                  </div>
                </div>
                {i < PLAYBOOK_STEPS.length - 1 && <div className="playbook-connector" />}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
            <button className="btn-primary">Download Action Plan PDF</button>
            <button className="btn-ghost" onClick={() => setStep("form")}>Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  return (
    <>
      <style>{CSS}</style>
      <Nav page={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "scan" && <ScanPage setPage={setPage} />}
      {page === "results" && <ResultsPage />}
      {page === "incident" && <IncidentPage />}
    </>
  );
}
