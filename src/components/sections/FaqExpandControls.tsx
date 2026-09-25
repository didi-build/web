"use client";

import { FaqPlusIcon } from "@/components/sections/FaqPlusIcon";
import { siteContent } from "@/content/site";
import { useCallback, useEffect, useState } from "react";

type Props = {
  listId: string;
  questionCount: number;
};

export function FaqExpandControls({ listId, questionCount }: Props) {
  const { expandAll, collapseAll, questionsLabel } = siteContent.faq;
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
    <div className="flex items-center justify-between gap-4 border-b-2 border-ink pb-5">
      <p className="m-0 whitespace-nowrap text-[15px] font-semibold text-ink-muted">
        {questionCount} {questionsLabel}
      </p>
      <button
        type="button"
        aria-expanded={allExpanded}
        aria-controls={listId}
        onClick={onToggleAll}
        className="inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-pill border-[1.5px] border-ink bg-transparent px-[18px] text-[15px] font-semibold text-ink hover:bg-ink hover:text-bg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent"
      >
        <FaqPlusIcon minus={allExpanded} />
        {label}
      </button>
    </div>
  );
}
