import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HiExchangeFailureMessage } from "./HiExchangeFailureMessage";
import { siteContent } from "@/content/site";

describe("HiExchangeFailureMessage", () => {
  it("renders a mailto link for the fallback contact path", () => {
    const html = renderToStaticMarkup(<HiExchangeFailureMessage />);
    const email = siteContent.hi.exchangeSheet.exchangeNotSavedEmail;
    expect(html).toContain(`mailto:${email}`);
    expect(html).toContain("Your contact wasn");
    expect(html).toContain("t saved");
  });
});
