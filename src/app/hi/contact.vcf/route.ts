import { siteContent } from "@/content/site";
import { buildVCard } from "@/lib/hi/vcard";

export function GET() {
  const body = buildVCard(siteContent.hi.contact, siteContent.meta.siteUrl);

  return new Response(body, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'inline; filename="Didi-Shoukralla.vcf"',
    },
  });
}
