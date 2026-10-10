import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HiExchangeFailureMessage } from "./HiExchangeFailureMessage";
import { siteContent } from "@/content/site";

describe("HiExchangeFailureMessage network variant", () => {
  it("renders the network retry message with role alert", () => {
    const html = renderToStaticMarkup(<HiExchangeFailureMessage variant="network" />);
    expect(html).toContain(siteContent.hi.exchangeSheet.networkErrorMessage);
    expect(html).toContain('role="alert"');
    expect(html).not.toContain("mailto:");
  });
});
