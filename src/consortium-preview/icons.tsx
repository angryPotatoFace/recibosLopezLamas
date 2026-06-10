import type { ReactNode } from "react";

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0d4960] text-white">
      {children}
    </span>
  );
}

export function ReceiptIcon() {
  return (
    <IconFrame>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5" />
        <path d="M10 12h5M10 16h5" />
      </svg>
    </IconFrame>
  );
}

export function CalendarIcon() {
  return (
    <IconFrame>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    </IconFrame>
  );
}

export function BuildingIcon() {
  return (
    <IconFrame>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
        <path d="M4 20V7l8-3 8 3v13" />
        <path d="M9 10h1M14 10h1M9 14h1M14 14h1M11 20v-3h2v3" />
      </svg>
    </IconFrame>
  );
}

export function UserIcon() {
  return (
    <IconFrame>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
      </svg>
    </IconFrame>
  );
}

export function HomeIcon() {
  return (
    <IconFrame>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
        <path d="M3 10.5 12 4l9 6.5" />
        <path d="M6 9.5V20h12V9.5" />
      </svg>
    </IconFrame>
  );
}

export function WalletIcon() {
  return (
    <IconFrame>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
        <path d="M4 7h14a2 2 0 0 1 2 2v8H6a2 2 0 0 1-2-2z" />
        <path d="M4 7V6a2 2 0 0 1 2-2h11" />
        <path d="M16 12h4" />
      </svg>
    </IconFrame>
  );
}

export function FolderIcon() {
  return (
    <IconFrame>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
        <path d="M3 19V7h6l2 2h10v10z" />
      </svg>
    </IconFrame>
  );
}

export function ShieldIcon() {
  return (
    <IconFrame>
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <path d="M12 3 5 6v6c0 4 2.5 7 7 9 4.5-2 7-5 7-9V6z" />
        <path d="m9.5 12 1.8 1.8 3.7-4" />
      </svg>
    </IconFrame>
  );
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="M5 4h3l2 5-2 1.5a16 16 0 0 0 5.5 5.5L15 14l5 2v3a2 2 0 0 1-2 2c-7.7 0-14-6.3-14-14a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}
