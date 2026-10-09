import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import HiPage from "@/app/hi/page";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { siteContent } from "@/content/site";

vi.mock("next/image", () => ({
  default: (props: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} />
  ),
}));

describe("HiPage booking link", () => {
  it("points at the shared booking path", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <HiPage />
      </ThemeProvider>,
    );
    expect(html).toContain(`href="${siteContent.bookingPath}"`);
    expect(html).toContain(siteContent.hi.bookLink);
    expect(html).toContain(siteContent.hi.exchangeButton);
    expect(html).toContain(siteContent.hi.about.title);
  });
});
