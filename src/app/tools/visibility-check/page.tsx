import type { Metadata } from "next";
import { VisibilityCheckClient } from "@/components/tools/visibility-check/VisibilityCheckClient";
import { visibilityToolContent } from "@/content/visibility-tool";

export const metadata: Metadata = {
  title: visibilityToolContent.meta.title,
  description: visibilityToolContent.meta.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function VisibilityCheckPage() {
  return (
    <main className="min-h-dvh bg-bg text-ink">
      <VisibilityCheckClient />
    </main>
  );
}
