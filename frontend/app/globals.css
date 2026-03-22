@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;0,800;1,800&family=Be+Vietnam+Pro:wght@400;500;700;900&family=Noto+Sans+Devanagari:wght@400;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --accent: #FF9933;
  --accent-glow: 0 0 20px rgba(255, 153, 51, 0.35);
  --ok-glow: 0 0 20px rgba(34, 197, 94, 0.25);
  --bg: #12121f;
  --surface: #12121f;
  --surface-container: #1e1e2c;
}

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
  }

  body {
    background: #12121f;
    color: #e3e0f4;
    font-family: 'Be Vietnam Pro', 'Noto Sans Devanagari', system-ui, sans-serif;
  }

  *:focus-visible {
    outline: 2px solid #FF9933;
    outline-offset: 2px;
    border-radius: 4px;
  }

  button {
    font-family: inherit;
  }

  /* Material Symbols */
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 153, 51, 0.3);
    border-radius: 100px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 153, 51, 0.55);
  }
}

@layer components {
  /* Clay card — the signature Vangard surface treatment */
  .clay-card {
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  }

  /* Clay inset — for light-mode cards (landing page) */
  .clay-inset {
    box-shadow: inset 2px 2px 8px rgba(0,0,0,0.05), inset -2px -2px 8px rgba(255,255,255,0.8);
  }

  /* Pixel border — Hill Climb Racing retro accent */
  .pixel-border {
    box-shadow:
      2px 0 0 0 #000,
      -2px 0 0 0 #000,
      0 2px 0 0 #000,
      0 -2px 0 0 #000;
  }

  /* Pixel shadow for CTA buttons */
  .pixel-shadow-orange {
    box-shadow: 4px 4px 0px 0px #6d3a00;
  }
  .pixel-shadow-orange:active {
    box-shadow: none;
    transform: translateY(2px);
  }

  /* Starfield dot pattern — subtle depth for dark pages */
  .starfield {
    background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0);
    background-size: 24px 24px;
  }

  /* Racing-themed bottom nav elevated center button */
  .nav-race-btn {
    background: linear-gradient(180deg, #FB8C00, #E65100);
    box-shadow: 0 0 15px rgba(255,152,0,0.5);
  }
}

@layer utilities {
  .font-devanagari {
    font-family: 'Noto Sans Devanagari', system-ui, sans-serif;
  }

  .font-headline {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }

  .font-body {
    font-family: 'Be Vietnam Pro', system-ui, sans-serif;
  }

  .text-gradient-accent {
    background: linear-gradient(135deg, #FF9933 0%, #FFCC80 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .glow-accent {
    box-shadow: var(--accent-glow);
  }

  .glow-ok {
    box-shadow: var(--ok-glow);
  }

  .glass {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .border-gradient {
    border-image: linear-gradient(135deg, rgba(255,153,51,0.4), rgba(34,197,94,0.2)) 1;
  }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes pulseRing {
  0%   { transform: scale(1);    opacity: 0.6; }
  100% { transform: scale(1.75); opacity: 0; }
}

@keyframes borderPulse {
  0%, 100% { border-color: rgba(255,153,51,0.3); }
  50%       { border-color: rgba(255,153,51,0.7); }
}

@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes enginePulse {
  0%, 100% { box-shadow: 0 0 10px rgba(255,180,171,0.4); }
  50%       { box-shadow: 0 0 25px rgba(255,180,171,0.8); }
}