import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import {
  baseOpenGraphFields,
  baseTwitterCardFields,
  sharedOpenGraphDescription,
} from "@/lib/site-metadata";

const { hi, meta } = siteContent;

export function hiPageMetadata(): Metadata {
  const pageUrl = `${meta.siteUrl}/hi`;

  return {
    title: hi.pageTitle,
    description: sharedOpenGraphDescription,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: "/hi",
    },
    openGraph: {
      ...baseOpenGraphFields(),
      title: hi.pageTitle,
      url: pageUrl,
    },
    twitter: {
      ...baseTwitterCardFields(),
      title: hi.pageTitle,
    },
  };
}
