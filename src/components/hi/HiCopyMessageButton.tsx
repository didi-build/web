"use client";

import { useCallback, useRef, useState } from "react";
import { formatEmailCopyText } from "@/lib/hi/mailto";

type HiCopyMessageButtonProps = {
  email: string;
  subject: string;
  body: string;
  copyLabel: string;
  copiedLabel: string;
};

export function HiCopyMessageButton({
  email,
  subject,
  body,
  copyLabel,
  copiedLabel,
}: HiCopyMessageButtonProps) {
  const [copied, setCopied] = useState(false);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyMessage = useCallback(async () => {
    const text = formatEmailCopyText(email, subject, body);
    let ok = false;

    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const ta = fallbackRef.current;
      if (ta) {
        ta.value = text;
        ta.select();
        try {
          ok = document.execCommand("copy");
        } catch {
          ok = false;
        }
      }
    }

    if (!ok) {
      return;
    }

    setCopied(true);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [email, subject, body]);

  return (
    <>
      <textarea
        ref={fallbackRef}
        readOnly
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none fixed opacity-0"
      />
      <button
        type="button"
        onClick={copyMessage}
        aria-live="polite"
        className="flex w-full min-h-12 items-center justify-center gap-2 border-0 border-t border-line bg-transparent px-4 text-[15px] font-semibold text-ink transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-accent"
      >
        {copied ? (
          <>
            <svg
              aria-hidden
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            <span className="animate-hi-copied">{copiedLabel}</span>
          </>
        ) : (
          <>
            <svg
              aria-hidden
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15V5a2 2 0 012-2h10" />
            </svg>
            <span>{copyLabel}</span>
          </>
        )}
      </button>
    </>
  );
}
