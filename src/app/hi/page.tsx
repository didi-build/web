import { HiPageClient } from "@/components/hi/HiPageClient";
import type { Metadata, ResolvingMetadata } from "next";
import { resolveHiPageMetadata } from "@/lib/hi/page-metadata";

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  return resolveHiPageMetadata(parent);
}

export default function HiPage() {
  return <HiPageClient />;
}
