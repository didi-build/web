import { structuredDataJsonLd } from "@/lib/structured-data";

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: structuredDataJsonLd() }}
    />
  );
}
