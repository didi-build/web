import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteContent } from "@/content/site";
import { baseOpenGraphFields, baseTwitterCardFields } from "@/lib/site-metadata";
import { THEME_STORAGE_KEY } from "@/lib/theme-storage-key";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
});

const { meta } = siteContent;

export const metadata: Metadata = {
  metadataBase: new URL(meta.siteUrl),
  title: meta.title,
  description: meta.description,
  keywords: [...meta.keywords],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    ...baseOpenGraphFields(),
    title: meta.title,
    url: meta.siteUrl,
  },
  twitter: {
    ...baseTwitterCardFields(),
    title: meta.title,
  },
};

const themeBootstrapScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className={`${figtree.variable}`}>
        <ThemeProvider>
          <a
            href={`#${siteContent.sectionIds.contact}`}
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-accent focus:px-4 focus:py-2.5 focus:text-accent-ink"
          >
            {siteContent.a11y.skipToBooking}
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
