const P = {
  pc: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  laptop: <><rect x="5" y="5" width="14" height="10" rx="1.5" /><path d="M2 19h20" /></>,
  mobile: <><rect x="7" y="2" width="10" height="20" rx="2.5" /><path d="M11 18h2" /></>,
  tv: <><rect x="2" y="5" width="20" height="13" rx="2" /><path d="M8 21h8M12 18v3" /></>,
  fridge: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M6 10h12M9 5v2M9 13v3" /></>,
  ac: <><rect x="2" y="4" width="20" height="8" rx="2" /><path d="M6 16c0 2 2 2 2 4M12 16c0 2 2 2 2 4M18 16c0 2 2 2 2 4" /></>,
  wm: <><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="14" r="4.5" /><path d="M8 6h.01M11 6h.01" /></>,
  printer: <><path d="M7 9V3h10v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M7 14h10v7H7z" /></>,
  other: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.2-.6-.6-2.2z" />,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  pin: <><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.7 7L3 21l2-5.2A8 8 0 1 1 21 12z" />,
  check: <path d="M5 12l5 5 9-10" />,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" /></>,
};
export default function Icon({ name, size = 28, className = "" }) {
  return (
    <svg className={"svgi " + className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {P[name] || P.other}
    </svg>
  );
}
