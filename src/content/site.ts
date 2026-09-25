export const siteContent = {
  brand: "Didi Build",
  meta: {
    title: "Didi Build | AI integration for small businesses",
    description:
      "Independent AI integration in Toronto. I learn how your business runs, then build tools that save time where it matters.",
  },
  a11y: {
    skipToContact: "Skip to contact form",
    spamProtectionLabel: "Spam protection",
    turnstileNotConfigured: "Spam protection is not configured in this environment.",
    footerNavLabel: "Elsewhere",
    themeSwitchToLight: "Switch to light mode",
    themeSwitchToDark: "Switch to dark mode",
  },
  header: {
    cta: "Book a chat",
  },
  hero: {
    eyebrow: "Independent AI integration · Toronto",
    // Pitch option A (active). B and C are kept for easy swaps.
    // B: "I build custom AI tools for small businesses: I start by learning how you work, then build whatever actually fits."
    // C: "I help businesses turn 'we should probably be using AI' into something that actually works for them."
    headline:
      "I help small businesses figure out where AI can actually save them time or make them money, then I build it.",
    supporting:
      "It starts with learning how your business runs today. Then we decide together if AI is worth it, and where.",
    primaryCta: "Book a free 30-min chat",
    secondaryCta: "See how it works",
  },
  whatIDo: {
    eyebrow: "What I do",
    headline: "I learn how you work first, then build what fits.",
    intro:
      "Every business runs a little differently, so I don't sell packages. Here are a few examples of what that has looked like.",
    examples: [
      {
        title: "Never lose a lead",
        body: "New inquiries from your website, email, or social messages get sorted, summarized, and followed up, even on your busiest days.",
      },
      {
        title: "Paperwork that reads itself",
        body: "Invoices, intake forms, and applications. The key details get pulled out and put where they belong, with no retyping.",
      },
      {
        title: "Answers from your own documents",
        body: "A private assistant that knows your policies, pricing, and procedures, so you and your team can simply ask.",
      },
      {
        title: "A calmer inbox",
        body: "Customer emails get sorted by what needs you first, with replies drafted in your voice for you to check and send.",
      },
    ],
    closingPrefix: "Have something else in mind?",
    closingLink: "Tell me about it.",
    exampleLabel: "Example",
  },
  howItWorks: {
    eyebrow: "How it works",
    headline: "Three steps, and you always know what comes next.",
    steps: [
      {
        title: "A free 30-minute chat",
        body: "We talk about how your business runs and where the time goes. No prep needed. If AI isn't a good fit, I'll tell you.",
      },
      {
        title: "A fixed-price, fixed-scope build",
        body: "Before any work starts, you get a written plan and one price. That's what you pay, so there are no surprise bills.",
      },
      {
        title: "Support, if you want it",
        body: "Once it is running, choose a simple monthly plan or pay only when you need something. Either works.",
      },
    ],
  },
  contact: {
    eyebrow: "Book a free 30-min chat",
    headline: "Tell me about your business.",
    intro:
      "What you do, and what's taking up more time than it should. I'll reply within 2 business days to find a time to talk.",
    emailLabel: "Prefer email?",
    email: "hello@didi.build",
    formNote: "All fields are required unless marked optional.",
    fields: {
      name: "Your name",
      email: "Email",
      business: "Business name",
      website: "Website",
      message: "What would you like help with?",
    },
    messageHint:
      "A few sentences is plenty. What does your business do, and what feels slow or repetitive?",
    messagePlaceholder:
      "e.g. We run a small bakery and spend hours every week answering the same catering questions by email.",
    optional: "(optional)",
    submit: "Send message",
    sending: "Sending…",
    tryAgain: "Try again",
    replyNote: "I reply within 2 business days.",
    success: "Thanks! I'll get back to you within 2 business days.",
    sendAnother: "Send another message",
    errorTitle: "Your message didn't send.",
    errorBodyPrefix:
      "Something went wrong on my end, and your text is still here. Please try again, or email me at ",
    errorBodySuffix: ".",
    validation: {
      name: "Please enter your name.",
      emailRequired: "Please enter your email so I can reply.",
      emailInvalid: "That email doesn't look quite right. Check for a typo?",
      message: "Tell me a little about what you'd like help with.",
      turnstile: "Please complete the spam check.",
      oneField: "One field needs a fix before sending.",
      manyFields: (count: number) => `${count} fields need a fix before sending.`,
    },
  },
  footer: {
    portfolio: { label: "Portfolio", href: "https://portfolio.didi.build" },
    github: {
      label: "GitHub",
      href: "https://github.com/DiademShoukralla/",
    },
    linkedin: {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/diadem-shoukralla/",
    },
  },
  sectionIds: {
    contact: "contact",
    how: "how-it-works",
    what: "what-i-do",
  },
} as const;
