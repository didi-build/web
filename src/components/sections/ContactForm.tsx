"use client";

import { siteContent } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@marsidev/react-turnstile";
import { useEffect, useId, useRef, useState } from "react";

type FormValues = {
  name: string;
  email: string;
  businessName: string;
  website: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormValues | "turnstile", string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: FormValues, copy: typeof siteContent.contact.validation): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) {
    errors.name = copy.name;
  }
  if (!values.email.trim()) {
    errors.email = copy.emailRequired;
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = copy.emailInvalid;
  }
  if (!values.message.trim()) {
    errors.message = copy.message;
  }
  return errors;
}

export function ContactForm() {
  const { contact, sectionIds, a11y } = siteContent;
  const formId = useId();
  const statusRef = useRef<HTMLDivElement | null>(null);
  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    businessName: "",
    website: "",
    message: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState<string | undefined>();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  const errors = validate(values, contact.validation);
  const showError = (field: keyof FormValues) =>
    Boolean((submitted || touched[field]) && errors[field]);

  const invalidCount = submitted ? Object.keys(errors).length : 0;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setTurnstileError(undefined);

    const nextErrors = validate(values, contact.validation);
    if (!turnstileToken) {
      setTurnstileError(contact.validation.turnstile);
    }
    const firstInvalid = (["name", "email", "message"] as const).find((key) => nextErrors[key]);
    if (firstInvalid || !turnstileToken) {
      const el = document.getElementById(`${formId}-${firstInvalid ?? "turnstile"}`);
      el?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          businessName: values.businessName || undefined,
          website: values.website || undefined,
          turnstileToken,
        }),
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status === "success" || status === "error") {
      statusRef.current?.focus();
    }
  }, [status]);

  if (status === "success") {
    return (
      <div
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className="flex flex-col items-start gap-4 rounded-lg bg-accent-soft p-8 md:p-10"
      >
        <span
          aria-hidden
          className="grid h-12 w-12 place-items-center rounded-pill bg-accent text-[22px] font-bold text-accent-ink"
        >
          ✓
        </span>
        <p className="m-0 text-[clamp(1.4rem,1.1rem+1vw,1.75rem)] font-semibold leading-snug tracking-tight">
          {contact.success}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-2 min-h-12"
          onClick={() => {
            setValues({
              name: "",
              email: "",
              businessName: "",
              website: "",
              message: "",
            });
            setTouched({});
            setSubmitted(false);
            setTurnstileToken("");
            setStatus("idle");
          }}
        >
          {contact.sendAnother}
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-labelledby={`${sectionIds.contact}-heading`}
      className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-6 md:p-10"
    >
      {status === "error" && (
        <div
          ref={statusRef}
          role="alert"
          tabIndex={-1}
          className="flex gap-3 rounded-md border border-error bg-error-soft p-4"
        >
          <span
            aria-hidden
            className="grid h-6 w-6 shrink-0 place-items-center rounded-pill bg-error text-[15px] font-bold text-bg"
          >
            !
          </span>
          <div>
            <p className="m-0 font-semibold">{contact.errorTitle}</p>
            <p className="mb-0 mt-1 text-base text-ink">
              {contact.errorBodyPrefix}
              <a href={`mailto:${contact.email}`} className="font-semibold text-ink underline">
                {contact.email}
              </a>
              {contact.errorBodySuffix}
            </p>
          </div>
        </div>
      )}

      {invalidCount > 0 && status !== "error" && (
        <p role="alert" className="m-0 text-base font-semibold text-error">
          {invalidCount === 1
            ? contact.validation.oneField
            : contact.validation.manyFields(invalidCount)}
        </p>
      )}

      <p className="m-0 text-[15px] text-ink-muted">{contact.formNote}</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id={`${formId}-name`}
          label={contact.fields.name}
          value={values.name}
          onChange={(value) => setValues((v) => ({ ...v, name: value }))}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={showError("name") ? errors.name : undefined}
          required
          autoComplete="name"
        />
        <FormField
          id={`${formId}-email`}
          label={contact.fields.email}
          type="email"
          inputMode="email"
          value={values.email}
          onChange={(value) => setValues((v) => ({ ...v, email: value }))}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={showError("email") ? errors.email : undefined}
          required
          autoComplete="email"
          placeholder="you@yourbusiness.com"
        />
        <FormField
          id={`${formId}-business`}
          label={contact.fields.business}
          optionalLabel={contact.optional}
          value={values.businessName}
          onChange={(value) => setValues((v) => ({ ...v, businessName: value }))}
          onBlur={() => setTouched((t) => ({ ...t, businessName: true }))}
          autoComplete="organization"
        />
        <FormField
          id={`${formId}-website`}
          label={contact.fields.website}
          optionalLabel={contact.optional}
          value={values.website}
          onChange={(value) => setValues((v) => ({ ...v, website: value }))}
          onBlur={() => setTouched((t) => ({ ...t, website: true }))}
          inputMode="url"
          autoComplete="url"
          placeholder="yourbusiness.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${formId}-message`} className="text-base font-semibold">
          {contact.fields.message}
        </label>
        <p id={`${formId}-message-hint`} className="m-0 text-[15px] text-ink-muted">
          {contact.messageHint}
        </p>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={6}
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, message: true }))}
          aria-required
          aria-invalid={showError("message")}
          aria-describedby={
            showError("message")
              ? `${formId}-message-error ${formId}-message-hint`
              : `${formId}-message-hint`
          }
          placeholder={contact.messagePlaceholder}
          className={`min-h-[168px] w-full resize-y rounded-md border-[1.5px] bg-bg px-4 py-3.5 text-[17px] leading-relaxed text-ink focus:border-accent focus:shadow-[0_0_0_3px_var(--accent)] focus:outline-none ${
            showError("message") ? "border-error" : "border-line-strong"
          }`}
        />
        {showError("message") && (
          <p id={`${formId}-message-error`} className="m-0 text-[15px] font-medium text-error">
            {errors.message}
          </p>
        )}
      </div>

      <div
        id={`${formId}-turnstile`}
        role="group"
        tabIndex={-1}
        aria-label={a11y.spamProtectionLabel}
        className="max-w-full"
      >
        {siteKey ? (
          <Turnstile
            siteKey={siteKey}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
            options={{ theme: "auto", size: "flexible" }}
          />
        ) : (
          <p className="m-0 text-sm text-ink-muted">{a11y.turnstileNotConfigured}</p>
        )}
        {turnstileError && (
          <p className="m-0 mt-2 text-[15px] font-medium text-error">{turnstileError}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          disabled={status === "sending"}
          className={`min-h-14 ${status === "sending" ? "opacity-70" : ""}`}
        >
          {status === "sending"
            ? contact.sending
            : status === "error"
              ? contact.tryAgain
              : contact.submit}
        </Button>
        <p className="m-0 text-[15px] text-ink-muted">{contact.replyNote}</p>
      </div>
    </form>
  );
}

function FormField({
  id,
  label,
  optionalLabel,
  value,
  onChange,
  onBlur,
  error,
  required,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  optionalLabel?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  placeholder?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline gap-2 text-base font-semibold">
        {label}
        {optionalLabel ? (
          <span className="text-sm font-normal text-ink-muted">{optionalLabel}</span>
        ) : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-[52px] w-full rounded-md border-[1.5px] bg-bg px-4 text-[17px] text-ink focus:border-accent focus:shadow-[0_0_0_3px_var(--accent)] focus:outline-none ${
          error ? "border-error" : "border-line-strong"
        }`}
      />
      {error ? (
        <p id={errorId} className="m-0 text-[15px] font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
