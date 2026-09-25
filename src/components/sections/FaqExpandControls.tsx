"use client";

import { siteContent } from "@/content/site";
import { useCallback, useEffect, useState } from "react";

type Props = {
  listId: string;
};

export function FaqExpandControls({ listId }: Props) {
  const { expandAll, collapseAll } = siteContent.faq;
  const [allExpanded, setAllExpanded] = useState(false);

  const syncFromDetails = useCallback(() => {
    const list = document.getElementById(listId);
    if (!list) return;
    const details = [...list.querySelectorAll<HTMLDetailsElement>("details")];
    if (details.length === 0) return;
    setAllExpanded(details.every((item) => item.open));
  }, [listId]);

  useEffect(() => {
    const list = document.getElementById(listId);
    if (!list) return;

    syncFromDetails();
    list.addEventListener("toggle", syncFromDetails, true);
    return () => list.removeEventListener("toggle", syncFromDetails, true);
  }, [listId, syncFromDetails]);

  const onToggleAll = () => {
    const list = document.getElementById(listId);
    if (!list) return;
    const details = [...list.querySelectorAll<HTMLDetailsElement>("details")];
    const shouldOpen = !allExpanded;
    for (const item of details) {
      item.open = shouldOpen;
    }
    setAllExpanded(shouldOpen);
  };

  const label = allExpanded ? collapseAll : expandAll;

  return (
    <button
      type="button"
      aria-controls={listId}
      onClick={onToggleAll}
      className="mt-[clamp(28px,4vw,44px)] mb-6 rounded-pill border border-line bg-surface px-4 py-2.5 text-[15px] font-semibold text-ink hover:bg-surface-2 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
    >
      {label}
    </button>
  );
}
