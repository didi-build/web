"use client";

import { Button } from "@/components/ui/Button";
import { siteContent } from "@/content/site";
import { DEFAULT_HI_COUNTRY_CODE, HI_COUNTRY_DIAL_CODES } from "@/lib/hi/exchange/country-codes";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { postHiDetails, postHiExchange } from "./hi-exchange-api";
import { useFocusTrap } from "./useFocusTrap";

type SheetStep = "exchange" | "details";

type FieldKey = "name" | "email" | "phone" | "jobTitle" | "company" | "note";

type HiExchangeSheetProps = {
  open: boolean;
  initialStep: SheetStep;
  firstName: string;
  leadToken: string;
  onClose: () => void;
  onExchangeSuccess: (firstName: string, token: string) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function firstNameFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "there";
  }
  return trimmed.split(/\s+/)[0] ?? "there";
}

function HiFloatingField({
  id,
  label,
  optionalHint,
  error,
  errorId,
  children,
  focused,
  invalid,
}: {
  id: string;
  label: string;
  optionalHint?: string;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
  focused: boolean;
  invalid: boolean;
}) {
  const labelColor = focused ? "text-accent-text" : invalid ? "text-error" : "text-ink-muted";
  const border = focused
    ? "border-accent shadow-[0_0_0_1px_var(--accent)]"
    : invalid
      ? "border-error"
      : "border-transparent";
  const bg = focused ? "bg-surface" : "bg-surface-2";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={`flex cursor-text flex-col gap-0.5 rounded-md border px-4 py-2.5 transition-colors ${border} ${bg}`}
      >
        <span
          className={`flex items-baseline gap-1.5 text-[13px] font-medium leading-snug ${labelColor}`}
        >
          {label}
          {optionalHint && <span className="font-normal text-ink-muted">{optionalHint}</span>}
        </span>
        {children}
      </label>
      {error && (
        <p id={errorId} className="m-0 flex gap-1.5 text-sm font-medium text-error">
          <span aria-hidden>!</span>
          {error}
        </p>
      )}
    </div>
  );
}

const fieldInputClass =
  "m-0 w-full min-w-0 border-0 bg-transparent p-0 text-[17px] leading-snug text-ink outline-none";

export function HiExchangeSheet({
  open,
  initialStep,
  firstName,
  leadToken,
  onClose,
  onExchangeSuccess,
}: HiExchangeSheetProps) {
  const copy = siteContent.hi.exchangeSheet;
  const formId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const [step, setStep] = useState<SheetStep>(initialStep);
  const [closing, setClosing] = useState(false);
  const [triedExchange, setTriedExchange] = useState(false);
  const [focusField, setFocusField] = useState<FieldKey | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_HI_COUNTRY_CODE);
  const [honeypot, setHoneypot] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");
  const [token, setToken] = useState(leadToken);
  const [exchangePending, setExchangePending] = useState(false);
  const [detailsPending, setDetailsPending] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [detailsSaved, setDetailsSaved] = useState(false);
  const dragRef = useRef<{
    panel: HTMLDivElement;
    scrim: HTMLElement | null;
    y0: number;
    dy: number;
    h: number;
    active: boolean;
  } | null>(null);

  useFocusTrap(dialogRef, open && !closing);

  useEffect(() => {
    if (open) {
      setStep(initialStep);
      setClosing(false);
      setServerError(undefined);
      setDetailsSaved(false);
      setToken(leadToken);
    }
  }, [open, initialStep, leadToken]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const exchangeErrors = (() => {
    if (!triedExchange) {
      return {} as Partial<Record<"name" | "email", string>>;
    }
    const errors: Partial<Record<"name" | "email", string>> = {};
    if (!name.trim()) {
      errors.name = copy.errors.nameRequired;
    }
    if (!email.trim()) {
      errors.email = copy.errors.emailRequired;
    } else if (!emailPattern.test(email.trim())) {
      errors.email = copy.errors.emailInvalid;
    }
    return errors;
  })();

  const handleClose = useCallback(() => {
    if (closing) {
      return;
    }
    setClosing(true);
    window.setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300);
  }, [closing, onClose]);

  const onDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (closing || !dialogRef.current) {
      return;
    }
    if (event.button > 0 || (event.target as HTMLElement).closest("button")) {
      return;
    }
    const panel = dialogRef.current;
    const scrim = panel.parentElement?.querySelector("[data-hi-scrim]") as HTMLElement | null;
    dragRef.current = {
      panel,
      scrim,
      y0: event.clientY,
      dy: 0,
      h: panel.offsetHeight,
      active: false,
    };
    const onMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }
      let dy = moveEvent.clientY - drag.y0;
      if (!drag.active) {
        if (Math.abs(dy) < 3) {
          return;
        }
        drag.active = true;
        drag.panel.style.animation = "none";
        if (drag.scrim) {
          drag.scrim.style.animation = "none";
        }
      }
      if (dy < 0) {
        dy = -Math.min(28, Math.pow(-dy, 0.65));
      }
      drag.dy = dy;
      drag.panel.style.transform = `translateY(${dy}px)`;
      if (drag.scrim) {
        drag.scrim.style.opacity = String(Math.max(0, 1 - Math.max(0, dy) / drag.h));
      }
      moveEvent.preventDefault();
    };
    const onEnd = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag?.active) {
        return;
      }
      if (drag.dy > drag.h * 0.32) {
        drag.panel.style.transform = "translateY(100%)";
        if (drag.scrim) {
          drag.scrim.style.opacity = "0";
        }
        handleClose();
      } else {
        drag.panel.style.transition = "transform 0.42s cubic-bezier(0.2, 1.35, 0.4, 1)";
        drag.panel.style.transform = "translateY(0)";
        if (drag.scrim) {
          drag.scrim.style.transition = "opacity 0.25s ease-out";
          drag.scrim.style.opacity = "1";
        }
        window.setTimeout(() => {
          drag.panel.style.transition = "";
          if (drag.scrim) {
            drag.scrim.style.transition = "";
          }
        }, 450);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  };

  const runExchange = async (turnstile: string) => {
    setExchangePending(true);
    setServerError(undefined);
    const result = await postHiExchange({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      countryCode,
      turnstileToken: turnstile,
      website: honeypot,
    });
    setExchangePending(false);
    turnstileRef.current?.reset();

    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    if (!result.token) {
      handleClose();
      return;
    }
    const nextFirstName = firstNameFromName(name);
    setToken(result.token);
    onExchangeSuccess(nextFirstName, result.token);
    setStep("details");
  };

  const onSubmitExchange = async (event: React.FormEvent) => {
    event.preventDefault();
    setTriedExchange(true);
    if (exchangeErrors.name || exchangeErrors.email) {
      return;
    }
    if (!siteKey) {
      setServerError(siteContent.a11y.turnstileNotConfigured);
      return;
    }
    if (!turnstileToken) {
      turnstileRef.current?.execute();
      return;
    }
    await runExchange(turnstileToken);
  };

  const onSubmitDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    setDetailsPending(true);
    setServerError(undefined);
    const result = await postHiDetails({
      token,
      jobTitle: jobTitle.trim() || undefined,
      company: company.trim() || undefined,
      note: note.trim() || undefined,
    });
    setDetailsPending(false);
    if (!result.ok) {
      setServerError(result.message);
      return;
    }
    setDetailsSaved(true);
    window.setTimeout(() => handleClose(), 900);
  };

  if (!open) {
    return null;
  }

  const detailsTitle = copy.detailsTitle.replace("{firstName}", firstName || "there");

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-end pt-6">
      <button
        type="button"
        aria-label={copy.closeLabel}
        data-hi-scrim
        className={`absolute inset-0 border-0 bg-[oklch(0.12_0.02_150/0.6)] ${closing ? "animate-hi-scrim-out" : "animate-hi-scrim-in"}`}
        onClick={handleClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hi-sheet-title"
        className={`relative box-border max-h-full w-full max-w-[520px] overflow-y-auto overscroll-contain rounded-t-3xl bg-bg text-ink ${closing ? "animate-hi-sheet-out" : "animate-hi-sheet-in"}`}
      >
        <div className="mx-auto flex max-w-[420px] flex-col gap-2 px-6 pb-7">
          <div
            className="sticky top-0 z-[2] -mx-6 touch-none cursor-grab bg-bg px-6 select-none active:cursor-grabbing"
            onPointerDown={onDragStart}
          >
            <div aria-hidden className="flex justify-center pb-0.5 pt-2.5">
              <span className="block h-[5px] w-10 rounded-pill bg-line-strong" />
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <h1
                id="hi-sheet-title"
                className="m-0 min-w-0 text-balance text-xl font-semibold leading-tight tracking-tight"
              >
                {step === "exchange" ? copy.exchangeTitle : detailsTitle}
              </h1>
              <button
                type="button"
                aria-label={copy.closeLabel}
                onClick={handleClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border-0 bg-transparent text-ink hover:bg-surface-2"
              >
                <svg
                  aria-hidden
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          <div aria-live="polite" className="sr-only">
            {serverError}
          </div>

          {serverError && (
            <p role="alert" className="m-0 text-[15px] font-medium text-error">
              {serverError}
            </p>
          )}

          {step === "exchange" ? (
            <form
              onSubmit={onSubmitExchange}
              noValidate
              aria-label={copy.exchangeFormAriaLabel}
              className="flex flex-col gap-5"
            >
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="pointer-events-none absolute h-0 w-0 opacity-0"
              />

              <div className="flex flex-col gap-3">
                <HiFloatingField
                  id={`${formId}-name`}
                  label={copy.nameLabel}
                  focused={focusField === "name"}
                  invalid={Boolean(exchangeErrors.name)}
                  error={exchangeErrors.name}
                  errorId={`${formId}-name-error`}
                >
                  <input
                    id={`${formId}-name`}
                    className={fieldInputClass}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onFocus={() => setFocusField("name")}
                    onBlur={() => setFocusField(null)}
                    autoComplete="name"
                    aria-invalid={Boolean(exchangeErrors.name)}
                    aria-describedby={exchangeErrors.name ? `${formId}-name-error` : undefined}
                    disabled={exchangePending}
                  />
                </HiFloatingField>

                <HiFloatingField
                  id={`${formId}-email`}
                  label={copy.emailLabel}
                  focused={focusField === "email"}
                  invalid={Boolean(exchangeErrors.email)}
                  error={exchangeErrors.email}
                  errorId={`${formId}-email-error`}
                >
                  <input
                    id={`${formId}-email`}
                    type="email"
                    inputMode="email"
                    className={fieldInputClass}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onFocus={() => setFocusField("email")}
                    onBlur={() => setFocusField(null)}
                    autoComplete="email"
                    aria-invalid={Boolean(exchangeErrors.email)}
                    aria-describedby={exchangeErrors.email ? `${formId}-email-error` : undefined}
                    disabled={exchangePending}
                  />
                </HiFloatingField>

                <HiFloatingField
                  id={`${formId}-phone`}
                  label={copy.phoneLabel}
                  optionalHint={copy.phoneOptional}
                  focused={focusField === "phone"}
                  invalid={false}
                >
                  <div className="flex items-center gap-2.5">
                    <select
                      aria-label={copy.countryCodeAriaLabel}
                      value={countryCode}
                      onChange={(event) => setCountryCode(event.target.value)}
                      onFocus={() => setFocusField("phone")}
                      onBlur={() => setFocusField(null)}
                      disabled={exchangePending}
                      className="shrink-0 cursor-pointer border-0 bg-transparent pr-1 text-[17px] font-medium text-ink outline-none"
                    >
                      {HI_COUNTRY_DIAL_CODES.map((entry) => (
                        <option key={entry.code} value={entry.code}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                    <input
                      id={`${formId}-phone`}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      className={fieldInputClass}
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      onFocus={() => setFocusField("phone")}
                      onBlur={() => setFocusField(null)}
                      disabled={exchangePending}
                    />
                  </div>
                </HiFloatingField>
              </div>

              {siteKey && (
                <Turnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  onSuccess={(value) => {
                    setTurnstileToken(value);
                    if (triedExchange && !exchangeErrors.name && !exchangeErrors.email) {
                      void runExchange(value);
                    }
                  }}
                  onExpire={() => setTurnstileToken("")}
                  options={{ theme: "auto", size: "invisible" }}
                />
              )}

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={exchangePending}
                  className={`min-h-14 w-full ${exchangePending ? "opacity-70" : ""}`}
                >
                  {exchangePending ? copy.pendingExchange : copy.submitExchange}
                </Button>
                <p className="m-0 text-center text-sm leading-snug text-ink-muted">
                  {copy.consent}
                </p>
              </div>
            </form>
          ) : (
            <form
              onSubmit={onSubmitDetails}
              aria-label={copy.detailsFormAriaLabel}
              className="flex flex-col gap-5"
            >
              <p className="m-0 text-[17px] leading-relaxed text-ink-muted text-pretty">
                {copy.detailsIntro}
              </p>
              {detailsSaved && (
                <p role="status" className="m-0 font-medium text-accent-text">
                  {copy.detailsSaved}
                </p>
              )}
              <div className="flex flex-col gap-3">
                <HiFloatingField
                  id={`${formId}-job`}
                  label={copy.jobTitleLabel}
                  focused={focusField === "jobTitle"}
                  invalid={false}
                >
                  <input
                    id={`${formId}-job`}
                    className={fieldInputClass}
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    onFocus={() => setFocusField("jobTitle")}
                    onBlur={() => setFocusField(null)}
                    autoComplete="organization-title"
                    disabled={detailsPending}
                  />
                </HiFloatingField>
                <HiFloatingField
                  id={`${formId}-company`}
                  label={copy.companyLabel}
                  focused={focusField === "company"}
                  invalid={false}
                >
                  <input
                    id={`${formId}-company`}
                    className={fieldInputClass}
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    onFocus={() => setFocusField("company")}
                    onBlur={() => setFocusField(null)}
                    autoComplete="organization"
                    disabled={detailsPending}
                  />
                </HiFloatingField>
                <HiFloatingField
                  id={`${formId}-note`}
                  label={copy.noteLabel}
                  focused={focusField === "note"}
                  invalid={false}
                >
                  <textarea
                    id={`${formId}-note`}
                    rows={3}
                    placeholder={copy.notePlaceholder}
                    className={`${fieldInputClass} resize-none`}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    onFocus={() => setFocusField("note")}
                    onBlur={() => setFocusField(null)}
                    disabled={detailsPending}
                  />
                </HiFloatingField>
              </div>
              <Button
                type="submit"
                disabled={detailsPending}
                className={`min-h-14 w-full ${detailsPending ? "opacity-70" : ""}`}
              >
                {detailsPending ? copy.pendingDetails : copy.submitDetails}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
