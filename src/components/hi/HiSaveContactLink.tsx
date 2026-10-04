"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAndroidUserAgent } from "@/lib/hi/is-android-user-agent";

type HiSaveContactLinkProps = {
  href: string;
  className: string;
  label: string;
  androidSaveHint: string;
};

export function HiSaveContactLink({
  href,
  className,
  label,
  androidSaveHint,
}: HiSaveContactLinkProps) {
  const [showAndroidHint, setShowAndroidHint] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsAndroid(isAndroidUserAgent(navigator.userAgent));
  }, []);

  const onSaveClick = useCallback(() => {
    if (!isAndroid) {
      return;
    }
    setShowAndroidHint(true);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }
    hintTimerRef.current = setTimeout(() => setShowAndroidHint(false), 8000);
  }, [isAndroid]);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-1">
      <a href={href} className={className} onClick={onSaveClick}>
        {label}
      </a>
      <p
        aria-live="polite"
        role="status"
        className="m-0 min-h-0 text-center text-sm leading-snug text-ink-muted empty:min-h-0"
      >
        {showAndroidHint ? androidSaveHint : ""}
      </p>
    </div>
  );
}
