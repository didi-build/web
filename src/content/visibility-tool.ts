export const visibilityToolContent = {
  meta: {
    title: "Website visibility check (preview)",
    description: "Internal preview of the Didi Build website visibility checker.",
  },
  page: {
    eyebrow: "Preview tool",
    headline: "Check how findable your website is",
    intro:
      "Enter your business website. We will scan a few public signals search engines and AI assistants look for, then suggest fixes in plain language.",
    urlLabel: "Website URL",
    urlPlaceholder: "yourbusiness.com",
    submit: "Run check",
    running: "Checking your site…",
    spamProtectionLabel: "Spam protection",
    turnstileRequired: "Please complete the spam check.",
    invalidUrl: "Enter a valid website URL, like yourbusiness.com.",
    errors: {
      generic: "Something went wrong. Please try again in a moment.",
      unreachable: "We could not reach that website. Check the URL and try again.",
      rateLimited: "You have checked this URL recently. Please wait a few minutes.",
      turnstile: "Spam verification failed. Please try again.",
      service: "The checker is temporarily unavailable.",
    },
    report: {
      scoreLabel: "Visibility score",
      summaryHeading: "Summary",
      fixesHeading: "Top fixes",
      findingsHeading: "What we checked",
      statusLabels: {
        pass: "Good",
        warn: "Could improve",
        fail: "Needs attention",
        unknown: "Could not verify",
      },
      whyHeading: "Why it matters",
    },
  },
} as const;
