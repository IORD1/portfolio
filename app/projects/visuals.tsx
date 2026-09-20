import type { ReactNode } from 'react';

export const cardAnimClass: Record<string, string> = {
  ness: 'anim-ness',
  'smart-scheduler': 'anim-sched',
  'chat-lecs': 'anim-chat',
  'sort-alyzer': 'anim-sort',
  soundscrapper: 'anim-sound',
  shootit: 'anim-shoot',
};

export const mainVisuals: Record<string, ReactNode> = {
  ness: (
    <svg viewBox="0 0 400 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" className="ness-svg">
      <defs>
        <pattern id="g1" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a1a1a" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="220" fill="url(#g1)" />
      <circle className="ness-disc d1" cx="110" cy="100" r="62" fill="#1f1f1f" stroke="#2a2a2a" opacity="0.95" />
      <circle className="ness-disc d2" cx="230" cy="110" r="46" fill="#2a2a2a" stroke="#353535" opacity="0.9" />
      <circle className="ness-disc d3" cx="325" cy="85" r="40" fill="#151515" stroke="#2a2a2a" opacity="0.95" />
      <circle className="ness-dot d1" cx="110" cy="100" r="10" fill="none" stroke="#f2f2f2" strokeWidth="1" />
      <circle className="ness-dot d2" cx="230" cy="110" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
      <circle className="ness-dot d3" cx="325" cy="85" r="10" fill="none" stroke="#9a9a9a" strokeWidth="1" />
      <circle className="ness-radar d1" cx="110" cy="100" r="10" fill="none" stroke="#f2f2f2" strokeWidth="1" />
      <circle className="ness-radar d2" cx="230" cy="110" r="10" fill="none" stroke="#22c55e" strokeWidth="1" />
      <circle className="ness-radar d3" cx="325" cy="85" r="10" fill="none" stroke="#9a9a9a" strokeWidth="1" />
    </svg>
  ),

  'smart-scheduler': (
    <svg viewBox="0 0 200 180" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="180" fill="#0d0d0d" />
      <g fontFamily="Geist,sans-serif" fontSize="6.5" fill="#5a5a5a" letterSpacing="0.1em" textAnchor="middle">
        <text x="46" y="30">MON</text>
        <text x="74" y="30">TUE</text>
        <text x="102" y="30">WED</text>
        <text x="130" y="30">THU</text>
        <text x="158" y="30">FRI</text>
      </g>
      <g fontFamily="Geist,sans-serif" fontSize="6" fill="#3a3a3a" textAnchor="end">
        <text x="26" y="50">9</text>
        <text x="26" y="74">11</text>
        <text x="26" y="98">1</text>
        <text x="26" y="122">3</text>
        <text x="26" y="146">5</text>
      </g>
      <g stroke="#1a1a1a" strokeWidth="1">
        <line x1="32" y1="42" x2="172" y2="42" />
        <line x1="32" y1="66" x2="172" y2="66" />
        <line x1="32" y1="90" x2="172" y2="90" />
        <line x1="32" y1="114" x2="172" y2="114" />
        <line x1="32" y1="138" x2="172" y2="138" />
        <line x1="32" y1="162" x2="172" y2="162" />
        <line x1="32" y1="42" x2="32" y2="162" />
        <line x1="60" y1="42" x2="60" y2="162" />
        <line x1="88" y1="42" x2="88" y2="162" />
        <line x1="116" y1="42" x2="116" y2="162" />
        <line x1="144" y1="42" x2="144" y2="162" />
        <line x1="172" y1="42" x2="172" y2="162" />
      </g>
      <rect className="sched-row r1" x="34" y="44" width="24" height="44" rx="2" fill="#f2f2f2" />
      <rect className="sched-row r2" x="62" y="68" width="24" height="44" rx="2" fill="#1f1f1f" stroke="#2a2a2a" />
      <rect className="sched-row r3" x="90" y="44" width="24" height="68" rx="2" fill="#1f1f1f" stroke="#2a2a2a" />
      <rect className="sched-row r4" x="118" y="92" width="24" height="44" rx="2" fill="#f2f2f2" />
      <rect x="146" y="44" width="24" height="30" rx="2" fill="#1f1f1f" stroke="#2a2a2a" />
      <g>
        <line x1="32" y1="104" x2="172" y2="104" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle className="sched-sparkle" cx="32" cy="104" r="2.5" fill="#22c55e" />
      </g>
    </svg>
  ),

  'chat-lecs': (
    <svg viewBox="0 0 200 180" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="180" fill="#0d0d0d" />
      <g transform="translate(36 18)">
        <rect width="128" height="144" rx="5" fill="#101010" stroke="#242424" />
        <rect className="chat-msg m1" x="12" y="14" width="78" height="22" rx="3" fill="none" stroke="#2a2a2a" />
        <rect x="18" y="22" width="58" height="2" rx="1" fill="#3a3a3a" />
        <rect x="18" y="28" width="44" height="2" rx="1" fill="#2a2a2a" />
        <rect className="chat-msg m2" x="38" y="46" width="80" height="38" rx="3" fill="#f2f2f2" />
        <rect x="44" y="54" width="62" height="2" rx="1" fill="#0d0d0d" />
        <rect x="44" y="60" width="68" height="2" rx="1" fill="#2a2a2a" />
        <rect x="44" y="66" width="48" height="2" rx="1" fill="#2a2a2a" />
        <rect x="44" y="72" width="58" height="2" rx="1" fill="#2a2a2a" />
        <rect x="38" y="90" width="34" height="10" rx="1" fill="none" stroke="#22c55e" opacity="0.7" />
        <text x="42" y="97" fontFamily="Geist,sans-serif" fontSize="6" fill="#22c55e" letterSpacing="0.08em">P.12</text>
        <rect x="12" y="118" width="104" height="16" rx="2" fill="#1a1a1a" stroke="#262626" />
        <circle className="chat-dot" cx="108" cy="126" r="3.5" fill="#22c55e" />
      </g>
    </svg>
  ),

  'sort-alyzer': (
    <svg viewBox="0 0 400 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#0d0d0d" />
      <g transform="translate(40,40)" className="sort-bars">
        <rect className="sb sb1" x="0" y="100" width="20" height="40" rx="4" fill="#2a2a2a" />
        <rect className="sb sb2" x="28" y="70" width="20" height="70" rx="4" fill="#2a2a2a" />
        <rect className="sb sb3" x="56" y="50" width="20" height="90" rx="4" fill="#2a2a2a" />
        <rect className="sb sb4" x="84" y="30" width="20" height="110" rx="4" fill="#2a2a2a" />
        <rect className="sb sb5" x="112" y="20" width="20" height="120" rx="4" fill="#f2f2f2" />
        <rect className="sb sb6" x="140" y="40" width="20" height="100" rx="4" fill="#2a2a2a" />
        <rect className="sb sb7" x="168" y="60" width="20" height="80" rx="4" fill="#2a2a2a" />
        <rect className="sb sb8" x="196" y="80" width="20" height="60" rx="4" fill="#2a2a2a" />
        <rect className="sb sb9" x="224" y="55" width="20" height="85" rx="4" fill="#2a2a2a" />
        <rect className="sb sb10" x="252" y="35" width="20" height="105" rx="4" fill="#2a2a2a" />
        <rect className="sb sb11" x="280" y="75" width="20" height="65" rx="4" fill="#2a2a2a" />
        <rect className="sb sb12" x="308" y="95" width="20" height="45" rx="4" fill="#2a2a2a" />
      </g>
    </svg>
  ),

  soundscrapper: (
    <svg viewBox="0 0 300 180" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="180" fill="#0d0d0d" />
      <g transform="translate(30,60)">
        <rect x="0" y="20" width="4" height="40" rx="2" fill="#2a2a2a" />
        <rect x="10" y="10" width="4" height="60" rx="2" fill="#2a2a2a" />
        <rect x="20" y="0" width="4" height="80" rx="2" fill="#f2f2f2" />
        <rect x="30" y="15" width="4" height="50" rx="2" fill="#2a2a2a" />
        <rect x="40" y="5" width="4" height="70" rx="2" fill="#f2f2f2" />
        <rect x="50" y="20" width="4" height="40" rx="2" fill="#2a2a2a" />
        <rect x="60" y="10" width="4" height="60" rx="2" fill="#2a2a2a" />
        <rect x="70" y="0" width="4" height="80" rx="2" fill="#f2f2f2" />
        <rect x="80" y="18" width="4" height="45" rx="2" fill="#2a2a2a" />
        <rect x="90" y="8" width="4" height="65" rx="2" fill="#2a2a2a" />
        <rect x="100" y="25" width="4" height="30" rx="2" fill="#2a2a2a" />
        <rect x="110" y="12" width="4" height="55" rx="2" fill="#f2f2f2" />
        <rect x="120" y="5" width="4" height="70" rx="2" fill="#2a2a2a" />
        <rect x="130" y="20" width="4" height="40" rx="2" fill="#2a2a2a" />
        <rect x="140" y="10" width="4" height="60" rx="2" fill="#2a2a2a" />
        <rect x="150" y="0" width="4" height="80" rx="2" fill="#f2f2f2" />
        <rect x="160" y="15" width="4" height="50" rx="2" fill="#2a2a2a" />
        <rect x="170" y="5" width="4" height="70" rx="2" fill="#2a2a2a" />
        <rect x="180" y="20" width="4" height="40" rx="2" fill="#2a2a2a" />
        <rect x="190" y="10" width="4" height="60" rx="2" fill="#f2f2f2" />
        <rect x="200" y="0" width="4" height="80" rx="2" fill="#2a2a2a" />
        <rect x="210" y="18" width="4" height="45" rx="2" fill="#2a2a2a" />
        <rect x="220" y="8" width="4" height="65" rx="2" fill="#2a2a2a" />
        <rect x="230" y="25" width="4" height="30" rx="2" fill="#f2f2f2" />
      </g>
    </svg>
  ),

  shootit: (
    <svg viewBox="0 0 300 180" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="180" fill="#0a0a12" />
      <g className="stars">
        <circle cx="40" cy="40" r="1" fill="#fff" />
        <circle cx="80" cy="120" r="1" fill="#fff" />
        <circle cx="220" cy="60" r="1" fill="#fff" />
        <circle cx="260" cy="140" r="1" fill="#fff" />
        <circle cx="140" cy="30" r="1" fill="#fff" />
        <circle cx="180" cy="150" r="1" fill="#fff" />
      </g>
      <path className="ship" d="M150 110 L140 130 L150 125 L160 130 Z" fill="#f2f2f2" />
      <circle className="ast a1" cx="90" cy="60" r="12" fill="#2a2a2a" />
      <circle className="ast a2" cx="220" cy="110" r="8" fill="#2a2a2a" />
      <rect className="bullet" x="148" y="90" width="4" height="10" rx="1" fill="#f2f2f2" />
    </svg>
  ),
};

export const miniVisuals: Record<string, ReactNode> = {
  animephile: (
    <svg viewBox="0 0 260 160" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="260" height="160" fill="#0d0d0d" />
      <circle cx="130" cy="80" r="42" fill="none" stroke="#2a2a2a" strokeWidth="1" />
      <circle cx="130" cy="80" r="28" fill="none" stroke="#353535" strokeWidth="1" />
      <rect x="110" y="60" width="40" height="40" rx="8" fill="#1f1f1f" stroke="#2a2a2a" />
      <circle cx="122" cy="75" r="2.5" fill="#f2f2f2" />
      <circle cx="138" cy="75" r="2.5" fill="#f2f2f2" />
      <path d="M122 88 Q130 93 138 88" stroke="#f2f2f2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="40" y="130" width="40" height="3" rx="1.5" fill="#2a2a2a" />
      <rect x="90" y="130" width="60" height="3" rx="1.5" fill="#f2f2f2" />
      <rect x="160" y="130" width="35" height="3" rx="1.5" fill="#2a2a2a" />
    </svg>
  ),

  'genre-predictor': (
    <svg viewBox="0 0 260 160" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="260" height="160" fill="#0d0d0d" />
      <g stroke="#1a1a1a" strokeWidth="1">
        <line x1="0" y1="40" x2="260" y2="40" />
        <line x1="0" y1="80" x2="260" y2="80" />
        <line x1="0" y1="120" x2="260" y2="120" />
      </g>
      <path d="M20 110 L50 95 L80 100 L110 70 L140 78 L170 45 L200 55 L240 35" stroke="#f2f2f2" strokeWidth="1.5" fill="none" />
      <circle cx="110" cy="70" r="3" fill="#f2f2f2" />
      <circle cx="170" cy="45" r="3" fill="#f2f2f2" />
      <circle cx="50" cy="95" r="3" fill="#2a2a2a" stroke="#444" />
      <circle cx="140" cy="78" r="3" fill="#2a2a2a" stroke="#444" />
      <text x="20" y="140" fontFamily="Geist" fontSize="9" fill="#5a5a5a" letterSpacing="0.1em">SVM · 87%</text>
    </svg>
  ),

  'sleep-state': (
    <svg viewBox="0 0 260 160" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="260" height="160" fill="#0d0d0d" />
      <g stroke="#1a1a1a" strokeWidth="1">
        <line x1="30" y1="48" x2="248" y2="48" />
        <line x1="30" y1="72" x2="248" y2="72" />
        <line x1="30" y1="96" x2="248" y2="96" />
        <line x1="30" y1="120" x2="248" y2="120" />
      </g>
      <g fontFamily="Geist, sans-serif" fontSize="7" fill="#5a5a5a" letterSpacing="0.1em" textAnchor="end">
        <text x="24" y="51">WAKE</text>
        <text x="24" y="75">REM</text>
        <text x="24" y="99">LIGHT</text>
        <text x="24" y="123">DEEP</text>
      </g>
      <path
        d="M30 48 L54 48 L54 96 L84 96 L84 120 L110 120 L110 96 L136 96 L136 72 L162 72 L162 120 L186 120 L186 96 L214 96 L214 72 L240 72 L240 48"
        fill="none"
        stroke="#f2f2f2"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
      <g>
        <circle cx="148" cy="72" r="2.5" fill="#22c55e" />
        <circle cx="227" cy="72" r="2.5" fill="#22c55e" />
      </g>
      <g fontFamily="Geist, sans-serif" fontSize="7" fill="#3a3a3a" letterSpacing="0.1em" textAnchor="middle">
        <text x="54" y="140">22:00</text>
        <text x="135" y="140">02:00</text>
        <text x="215" y="140">06:00</text>
      </g>
    </svg>
  ),

  'job-portal': (
    <svg viewBox="0 0 260 160" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="260" height="160" fill="#0d0d0d" />
      <rect x="30" y="30" width="200" height="26" rx="4" fill="#1f1f1f" stroke="#2a2a2a" />
      <rect x="40" y="38" width="60" height="10" rx="2" fill="#f2f2f2" />
      <rect x="200" y="39" width="20" height="8" rx="2" fill="#2a2a2a" />
      <rect x="30" y="66" width="200" height="26" rx="4" fill="#151515" stroke="#2a2a2a" />
      <rect x="40" y="74" width="80" height="10" rx="2" fill="#9a9a9a" />
      <rect x="200" y="75" width="20" height="8" rx="2" fill="#2a2a2a" />
      <rect x="30" y="102" width="200" height="26" rx="4" fill="#151515" stroke="#2a2a2a" />
      <rect x="40" y="110" width="70" height="10" rx="2" fill="#9a9a9a" />
      <rect x="200" y="111" width="20" height="8" rx="2" fill="#2a2a2a" />
    </svg>
  ),

  'git-kitty': (
    <svg viewBox="0 0 260 160" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="260" height="160" fill="#0d0d0d" />
      <g transform="translate(130 82)">
        <path d="M-30 -10 L-30 20 Q-30 28 -22 28 L22 28 Q30 28 30 20 L30 -10 L20 -30 L15 -12 L-15 -12 L-20 -30 Z" fill="#1f1f1f" stroke="#2a2a2a" />
        <circle cx="-12" cy="2" r="3" fill="#f2f2f2" />
        <circle cx="12" cy="2" r="3" fill="#f2f2f2" />
        <path d="M-6 14 Q0 18 6 14" stroke="#f2f2f2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <line x1="-18" y1="8" x2="-10" y2="8" stroke="#353535" strokeWidth="1" />
        <line x1="10" y1="8" x2="18" y2="8" stroke="#353535" strokeWidth="1" />
      </g>
      <g transform="translate(40 130)">
        <rect x="0" y="0" width="8" height="8" rx="1" fill="#22c55e" />
        <rect x="12" y="0" width="8" height="8" rx="1" fill="#22c55e" opacity="0.6" />
        <rect x="24" y="0" width="8" height="8" rx="1" fill="#2a2a2a" />
        <rect x="36" y="0" width="8" height="8" rx="1" fill="#22c55e" />
        <rect x="48" y="0" width="8" height="8" rx="1" fill="#22c55e" opacity="0.3" />
      </g>
    </svg>
  ),

  'traffic-light': (
    <svg viewBox="0 0 260 160" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="260" height="160" fill="#0d0d0d" />
      <rect x="110" y="20" width="40" height="110" rx="6" fill="#151515" stroke="#2a2a2a" />
      <circle cx="130" cy="40" r="10" fill="#2a2a2a" />
      <circle cx="130" cy="70" r="10" fill="#2a2a2a" />
      <circle cx="130" cy="100" r="10" fill="#22c55e" />
      <circle cx="130" cy="100" r="14" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.5" />
      <line x1="0" y1="145" x2="260" y2="145" stroke="#2a2a2a" strokeDasharray="6 6" />
      <rect x="30" y="135" width="24" height="10" rx="1" fill="#1f1f1f" stroke="#2a2a2a" />
      <rect x="200" y="135" width="24" height="10" rx="1" fill="#1f1f1f" stroke="#2a2a2a" />
    </svg>
  ),

  'cordova-weather': (
    <svg viewBox="0 0 260 160" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="260" height="160" fill="#0d0d0d" />
      <text x="22" y="52" fontFamily="Geist, sans-serif" fontSize="34" fontWeight="500" fill="#f2f2f2" letterSpacing="-0.03em">28°</text>
      <text x="22" y="68" fontFamily="Geist, sans-serif" fontSize="8" fill="#5a5a5a" letterSpacing="0.16em">PUNE · CLEAR</text>
      <g>
        <polyline points="22,108 52,100 82,96 112,92 142,98 172,88 202,94 232,100" fill="none" stroke="#f2f2f2" strokeWidth="1.5" strokeLinejoin="round" />
        <polyline points="22,108 52,100 82,96 112,92 142,98 172,88 202,94 232,100 232,130 22,130" fill="#f2f2f2" fillOpacity="0.04" stroke="none" />
        <circle cx="112" cy="92" r="2.5" fill="#f2f2f2" />
        <circle cx="172" cy="88" r="2.5" fill="#22c55e" />
      </g>
      <g fontFamily="Geist, sans-serif" fontSize="6.5" fill="#3a3a3a" textAnchor="middle" letterSpacing="0.08em">
        <text x="22" y="145">M</text>
        <text x="52" y="145">T</text>
        <text x="82" y="145">W</text>
        <text x="112" y="145">T</text>
        <text x="142" y="145">F</text>
        <text x="172" y="145">S</text>
        <text x="202" y="145">S</text>
        <text x="232" y="145">M</text>
      </g>
      <g transform="translate(215 30)">
        <circle r="8" fill="none" stroke="#2a2a2a" strokeWidth="1" />
        <circle r="4.5" fill="#f2f2f2" />
      </g>
    </svg>
  ),
};
