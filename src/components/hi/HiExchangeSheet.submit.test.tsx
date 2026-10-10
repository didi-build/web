// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { forwardRef, useImperativeHandle } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { siteContent } from "@/content/site";
import { HiExchangeSheet } from "./HiExchangeSheet";
import { postHiExchange } from "./hi-exchange-api";

vi.mock("./hi-exchange-api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./hi-exchange-api")>();
  return {
    ...mod,
    postHiExchange: vi.fn(),
    postHiDetails: vi.fn(),
  };
});

const turnstileMock = {
  execute: vi.fn(),
  reset: vi.fn(),
  onSuccess: null as ((token: string) => void) | null,
  onError: null as (() => void) | null,
  onExpire: null as (() => void) | null,
};

vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: forwardRef(function MockTurnstile(
    props: {
      onSuccess: (token: string) => void;
      onError?: () => void;
      onExpire?: () => void;
    },
    ref,
  ) {
    turnstileMock.onSuccess = props.onSuccess;
    turnstileMock.onError = props.onError ?? null;
    turnstileMock.onExpire = props.onExpire ?? null;
    useImperativeHandle(ref, () => ({
      execute: turnstileMock.execute,
      reset: turnstileMock.reset,
    }));
    return null;
  }),
}));

vi.mock("./hi-sheet-motion", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./hi-sheet-motion")>();
  return {
    ...mod,
    prefersReducedMotion: () => true,
    runSheetCloseAnimation: ({ onComplete }: { onComplete: () => void }) => {
      onComplete();
      return () => {};
    },
  };
});

const networkMessage = siteContent.hi.exchangeSheet.networkErrorMessage;
const serverSnippet = "Your contact wasn";

function renderOpenSheet() {
  render(
    <HiExchangeSheet
      open
      initialStep="exchange"
      firstName="Alex"
      leadToken="test-token"
      onClose={() => {}}
      onExchangeSuccess={() => {}}
    />,
  );
}

function fillExchangeForm() {
  const dialog = screen.getByRole("dialog");
  fireEvent.change(dialog.querySelector('input[autocomplete="name"]') as HTMLInputElement, {
    target: { value: "Sam Example" },
  });
  fireEvent.change(dialog.querySelector('input[autocomplete="email"]') as HTMLInputElement, {
    target: { value: "sam@example.com" },
  });
}

function submitExchange() {
  fireEvent.click(screen.getByRole("button", { name: /Exchange contact/i }));
}

function alertText(): string {
  return screen.getByRole("alert").textContent ?? "";
}

describe("HiExchangeSheet exchange submit", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
    turnstileMock.execute.mockReset();
    turnstileMock.reset.mockReset();
    turnstileMock.onSuccess = null;
    turnstileMock.onError = null;
    turnstileMock.onExpire = null;
    vi.mocked(postHiExchange).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.useRealTimers();
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
      writable: true,
    });
  });

  it("waits for Turnstile without a spam check message, then auto-submits when the token arrives", async () => {
    vi.mocked(postHiExchange).mockResolvedValue({
      ok: true,
      token: "lead-token",
    });

    renderOpenSheet();
    fillExchangeForm();
    submitExchange();

    const pendingButton = screen.getByRole("button", { name: /Sending/i });
    expect(pendingButton.getAttribute("disabled")).not.toBeNull();
    expect(screen.queryByText(/spam check/i)).toBeNull();
    expect(turnstileMock.execute).toHaveBeenCalled();

    turnstileMock.onSuccess?.("turnstile-token");

    await waitFor(() => {
      expect(postHiExchange).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "sam@example.com",
          turnstileToken: "turnstile-token",
        }),
      );
    });
  });

  it("shows the network message when Turnstile onError fires while waiting", () => {
    renderOpenSheet();
    fillExchangeForm();
    submitExchange();

    act(() => {
      turnstileMock.onError?.();
    });

    expect(alertText()).toContain(networkMessage);
    expect(
      screen.getByRole("button", { name: /Exchange contact/i }).getAttribute("disabled"),
    ).toBeNull();
    const emailInput = screen
      .getByRole("dialog")
      .querySelector('input[autocomplete="email"]') as HTMLInputElement;
    expect(emailInput.value).toBe("sam@example.com");
  });

  it("shows the network message when the Turnstile token expires while waiting", () => {
    renderOpenSheet();
    fillExchangeForm();
    submitExchange();

    act(() => {
      turnstileMock.onExpire?.();
    });

    expect(alertText()).toContain(networkMessage);
    expect(
      screen.getByRole("button", { name: /Exchange contact/i }).getAttribute("disabled"),
    ).toBeNull();
  });

  it("shows the network message after 10 seconds without a Turnstile token", () => {
    vi.useFakeTimers();
    renderOpenSheet();
    fillExchangeForm();
    submitExchange();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(alertText()).toContain(networkMessage);
    expect(
      screen.getByRole("button", { name: /Exchange contact/i }).getAttribute("disabled"),
    ).toBeNull();
  });

  it("shows the network message on a network failure and keeps typed values", async () => {
    vi.mocked(postHiExchange).mockResolvedValue({ ok: false, kind: "network" });

    renderOpenSheet();
    fillExchangeForm();
    submitExchange();
    turnstileMock.onSuccess?.("turnstile-token");

    await waitFor(() => {
      expect(alertText()).toContain(networkMessage);
    });
    const emailInput = screen
      .getByRole("dialog")
      .querySelector('input[autocomplete="email"]') as HTMLInputElement;
    expect(emailInput.value).toBe("sam@example.com");
    expect(screen.queryByText(serverSnippet)).toBeNull();
  });

  it("shows the network message on timeout and abort failures", async () => {
    vi.mocked(postHiExchange).mockResolvedValue({ ok: false, kind: "timeout" });

    renderOpenSheet();
    fillExchangeForm();
    submitExchange();
    turnstileMock.onSuccess?.("turnstile-token");

    await waitFor(() => {
      expect(alertText()).toContain(networkMessage);
    });
  });

  it("shows the network message when navigator.onLine is false before sending", async () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });

    renderOpenSheet();
    fillExchangeForm();
    submitExchange();
    act(() => {
      turnstileMock.onSuccess?.("turnstile-token");
    });

    await waitFor(() => {
      expect(alertText()).toContain(networkMessage);
    });
    expect(postHiExchange).not.toHaveBeenCalled();
  });

  it("shows the default not-saved message for a 400 response", async () => {
    vi.mocked(postHiExchange).mockResolvedValue({
      ok: false,
      kind: "server",
      message: "bad request",
    });

    renderOpenSheet();
    fillExchangeForm();
    submitExchange();
    turnstileMock.onSuccess?.("turnstile-token");

    await waitFor(() => {
      expect(alertText()).toContain(serverSnippet);
    });
    expect(screen.getByRole("link", { name: /diadem@didi.build/i })).toBeTruthy();
  });

  it("shows the default not-saved message for a 500 response", async () => {
    vi.mocked(postHiExchange).mockResolvedValue({
      ok: false,
      kind: "server",
    });

    renderOpenSheet();
    fillExchangeForm();
    submitExchange();
    turnstileMock.onSuccess?.("turnstile-token");

    await waitFor(() => {
      expect(alertText()).toContain(serverSnippet);
    });
  });
});
