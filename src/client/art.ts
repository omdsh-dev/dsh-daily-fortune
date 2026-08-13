// Generated from assets/*.svg — do not edit by hand; edit the SVG files and regenerate.

/** fortune.svg — inline SVG markup (IDs namespaced with `dff`). */
export const FORTUNE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" role="img" ariaHidden="true">
  <title>签筒</title>
  <desc>Fortune tube linear icon</desc>
  <ellipse cx="12" cy="6.6" rx="4.4" ry="1.7"/>
  <path d="M7.6 6.6 L7.3 18.4 C7.3 19.5 8.1 20.3 9.3 20.3 L14.7 20.3 C15.9 20.3 16.7 19.5 16.7 18.4 L16.4 6.6"/>
  <path d="M8.6 6.4 L8.8 3.1 L10.1 1.7"/>
  <path d="M12 6.6 L12 2"/>
  <path d="M15.2 6.4 L15 3.3 L13.7 1.5"/>
</svg>
`

/** qian_slot.svg — inline SVG markup (IDs namespaced with `dfq`). */
export const QIAN_SLOT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" role="img" ariaHidden="true">
  <title>签筒</title>
  <desc>Ink-wash bamboo fortune-tube illustration with cinnabar-tipped sticks</desc>
  <defs>
    <linearGradient id="dfqtubeGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#4d4942"/>
      <stop offset="0.45" stopColor="#34312b"/>
      <stop offset="1" stopColor="#57524a"/>
    </linearGradient>
    <linearGradient id="dfqstickGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#efdfb8"/>
      <stop offset="0.5" stopColor="#ddc793"/>
      <stop offset="1" stopColor="#c9b179"/>
    </linearGradient>
    <linearGradient id="dfqredGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#d8452f"/>
      <stop offset="1" stopColor="#b02a1e"/>
    </linearGradient>
    <filter id="dfqsoft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
  </defs>

  <!-- ink wash backdrop -->
  <ellipse cx="80" cy="148" rx="72" ry="48" fill="#4a463e" opacity="0.10" filter="url(#dfqsoft)"/>

  <!-- ground shadow -->
  <ellipse cx="80" cy="172" rx="47" ry="6" fill="#1c1a16" opacity="0.32" filter="url(#dfqsoft)"/>

  <!-- tube body -->
  <path d="M46 58 C46 53.5 114 53.5 114 58 L115.6 146 C115.6 159.5 44.4 159.5 44.4 146 Z" fill="url(#dfqtubeGrad)"/>
  <!-- bamboo nodes -->
  <path d="M44.6 93 C60 90 100 90 115.4 93 L115.7 97.5 C100 95 60 95 44.3 97.5 Z" fill="#2b2822" opacity="0.55"/>
  <path d="M44.5 128 C60 125 100 125 115.5 128 L115.8 132.5 C100 130 60 130 44.2 132.5 Z" fill="#2b2822" opacity="0.55"/>
  <!-- cylinder shading -->
  <rect x="52" y="58" width="5.5" height="90" rx="2.75" fill="#ffffff" opacity="0.08"/>
  <rect x="105" y="58" width="6" height="90" rx="3" fill="#000000" opacity="0.16"/>

  <!-- tube mouth -->
  <ellipse cx="80" cy="58" rx="34" ry="9" fill="#6f695b"/>
  <ellipse cx="80" cy="58" rx="27" ry="6.5" fill="#211d18"/>

  <!-- sticks -->
  <g id="dfqstick">
    <path d="M-2.6 -16 L-2.8 64 L2.8 64 L2.6 -16 Z" fill="url(#dfqstickGrad)" stroke="#7c6d49" strokeWidth="0.7"/>
    <line x1="-2.7" y1="10" x2="2.7" y2="10" stroke="#8a7a55" strokeWidth="0.8"/>
    <path d="M-2.6 -42 C-2.6 -36 -2 -32 0 -30.4 C2 -32 2.6 -36 2.6 -42 L2.6 -16 L-2.6 -16 Z" fill="url(#dfqredGrad)" stroke="#9c241a" strokeWidth="0.7"/>
  </g>
  <use href="#dfqstick" transform="translate(60 56) rotate(-7)"/>
  <use href="#dfqstick" transform="translate(72 60) rotate(3)"/>
  <use href="#dfqstick" transform="translate(88 52) rotate(-3)"/>
  <use href="#dfqstick" transform="translate(100 62) rotate(9)"/>

  <!-- blank cinnabar seal, no text -->
  <rect x="99" y="144" width="12" height="12" rx="1.5" fill="#b8322a" opacity="0.88" transform="rotate(-4 105 150)"/>

  <!-- floating ink dots -->
  <circle cx="30" cy="60" r="2.2" fill="#38342d" opacity="0.7"/>
  <circle cx="132" cy="44" r="1.6" fill="#38342d" opacity="0.6"/>
</svg>
`

/** qian_stick.svg — inline SVG markup (IDs namespaced with `dfs`). */
export const QIAN_STICK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 200" role="img" ariaHidden="true">
  <title>签枝</title>
  <desc>Single bamboo fortune stick with a cinnabar tip</desc>
  <defs>
    <linearGradient id="dfsstickGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#efdfb8"/>
      <stop offset="0.5" stopColor="#ddc793"/>
      <stop offset="1" stopColor="#c9b179"/>
    </linearGradient>
    <linearGradient id="dfsredGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#d8452f"/>
      <stop offset="1" stopColor="#b02a1e"/>
    </linearGradient>
  </defs>
  <!-- red tip -->
  <path d="M10.4 14 C10.4 9.6 11 6.8 12 5.4 C13 6.8 13.6 9.6 13.6 14 L13.6 34 L10.4 34 Z" fill="url(#dfsredGrad)" stroke="#9c241a" strokeWidth="0.9"/>
  <!-- body -->
  <path d="M10.4 34 L10.2 195 L13.8 195 L13.6 34 Z" fill="url(#dfsstickGrad)" stroke="#7c6d49" strokeWidth="0.9"/>
  <!-- bamboo nodes -->
  <path d="M10.3 72 C11.3 73.2 12.7 73.2 13.7 72" fill="none" stroke="#8a7a55" strokeWidth="1"/>
  <path d="M10.2 128 C11.3 129.2 12.7 129.2 13.8 128" fill="none" stroke="#8a7a55" strokeWidth="1"/>
  <!-- highlight -->
  <path d="M11 34 L11.2 195" stroke="#ffffff" strokeWidth="0.8" opacity="0.25"/>
</svg>
`

/** tarot_back.svg — inline SVG markup (IDs namespaced with `dft`). */
export const TAROT_BACK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 425" role="img" ariaHidden="true">
  <title>塔罗牌背</title>
  <desc>Symmetrical purple-and-gold tarot card back ornament, no text</desc>
  <defs>
    <linearGradient id="dftdeckGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2f1d58"/>
      <stop offset="1" stopColor="#180f35"/>
    </linearGradient>
    <radialGradient id="dftglow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#d4af37" stopOpacity="0.24"/>
      <stop offset="1" stopColor="#d4af37" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="dftstarGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#e9cc70"/>
      <stop offset="1" stopColor="#b8912f"/>
    </linearGradient>
  </defs>

  <!-- card base -->
  <rect x="6" y="6" width="238" height="413" rx="18" fill="url(#dftdeckGrad)" stroke="#d4af37" strokeWidth="1.6"/>
  <rect x="17" y="17" width="216" height="391" rx="12" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.9"/>

  <!-- corner scrollwork, drawn once at the top-left and reflected -->
  <g id="dftcorner">
    <path d="M17 78 L17 32 Q17 17 32 17 L78 17" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 78 Q30 78 37 64 Q41 54 35 49" fill="none" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M78 17 Q78 30 64 37 Q54 41 49 35" fill="none" stroke="#d4af37" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M60 42 Q69 31 77 25 Q67 37 60 42 Z" fill="#d4af37" opacity="0.8"/>
    <circle cx="35" cy="49" r="2.2" fill="#d4af37"/>
    <circle cx="49" cy="35" r="2.2" fill="#d4af37"/>
  </g>
  <use href="#dftcorner"/>
  <use href="#dftcorner" transform="rotate(90 125 212.5)"/>
  <use href="#dftcorner" transform="rotate(180 125 212.5)"/>
  <use href="#dftcorner" transform="rotate(270 125 212.5)"/>

  <!-- edge rosettes -->
  <path d="M125 24 l6.5 6.5 -6.5 6.5 -6.5 -6.5 Z" fill="none" stroke="#d4af37" strokeWidth="1.2"/>
  <path d="M125 388 l6.5 6.5 -6.5 6.5 -6.5 -6.5 Z" fill="none" stroke="#d4af37" strokeWidth="1.2"/>
  <path d="M33.5 212.5 l6.5 6.5 -6.5 6.5 -6.5 -6.5 Z" fill="none" stroke="#d4af37" strokeWidth="1.2"/>
  <path d="M216.5 212.5 l6.5 6.5 -6.5 6.5 -6.5 -6.5 Z" fill="none" stroke="#d4af37" strokeWidth="1.2"/>

  <!-- central eight-point star -->
  <circle cx="125" cy="212.5" r="72" fill="url(#dftglow)"/>
  <circle cx="125" cy="212.5" r="58" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.85"/>
  <rect x="84" y="171.5" width="82" height="82" fill="url(#dftstarGrad)" stroke="#8a6d1f" strokeWidth="1"/>
  <rect x="84" y="171.5" width="82" height="82" fill="url(#dftstarGrad)" stroke="#8a6d1f" strokeWidth="1" transform="rotate(45 125 212.5)"/>
  <circle cx="125" cy="212.5" r="27" fill="none" stroke="#d4af37" strokeWidth="1.4"/>
  <circle cx="125" cy="212.5" r="7" fill="url(#dftstarGrad)" stroke="#8a6d1f" strokeWidth="0.8"/>

  <!-- orbit dots -->
  <g fill="#d4af37">
    <circle cx="125" cy="154.5" r="2.6"/>
    <circle cx="183" cy="212.5" r="2.6"/>
    <circle cx="125" cy="270.5" r="2.6"/>
    <circle cx="67" cy="212.5" r="2.6"/>
    <circle cx="166" cy="171.5" r="2.6"/>
    <circle cx="166" cy="253.5" r="2.6"/>
    <circle cx="84" cy="253.5" r="2.6"/>
    <circle cx="84" cy="171.5" r="2.6"/>
  </g>
</svg>
`
