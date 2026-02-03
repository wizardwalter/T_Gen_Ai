"use client";

import Link from "next/link";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

function RobotIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="12" rx="3" />
      <path d="M12 7V3" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <path d="M8 16h8" />
    </svg>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const label = useMemo(() => {
    const name = session?.user?.name || session?.user?.email;
    return name ? `Signed in as ${name}` : "Not signed in";
  }, [session]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (!session?.user) {
    return null;
  }

  return (
    <div ref={menuRef} className="fixed right-4 top-4 z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-sky-500/70 hover:text-sky-200"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-sky-300">
          <RobotIcon />
        </span>
        <span className="max-w-[180px] truncate text-left">{label}</span>
      </button>
      {open && (
        <div className="mt-2 w-48 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 text-sm text-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur">
          <Link
            href="/profile"
            className="flex items-center justify-between rounded-xl px-3 py-2 transition hover:bg-slate-800/80"
          >
            <span>Profile</span>
            <span className="text-[10px] uppercase text-slate-500">View</span>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-rose-300 transition hover:bg-rose-500/10"
          >
            <span>Sign out</span>
            <span className="text-[10px] uppercase text-rose-400">Exit</span>
          </button>
        </div>
      )}
    </div>
  );
}

function WelcomeToast() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const status = (session?.user as { welcomeStatus?: string } | undefined)?.welcomeStatus;
    if (status === "new") {
      setMessage("Thanks for signing up!");
      setVisible(true);
    } else if (status === "back") {
      setMessage("Welcome back!");
      setVisible(true);
    }
    if (status) {
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
    return;
  }, [session]);

  if (!visible || !message) return null;

  return (
    <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 transform rounded-full border border-slate-700/70 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
      {message}
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WelcomeToast />
      <UserMenu />
      {children}
    </SessionProvider>
  );
}
