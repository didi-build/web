export const siteContent = {
  brand: "Didi Build",
  bookingPath: "/book",
  meta: {
    title: "AI App Help for Founders | Lovable, Bolt, Base44 | Didi Build Toronto",
    description:
      "Built with Lovable, Bolt, Base44, Replit, or Cursor? I help founders get AI-built apps ready for real users. Technical advisor in Toronto (think fractional CTO). Book a free chat.",
    businessDescription:
      "Toronto software engineer and technical advisor for founders who built with AI (Lovable, Bolt, Base44, Replit, Cursor). Audits, builds, and migration off platforms like Base44. Free first chat, plain English.",
    keywords: [
      "Lovable developer",
      "Bolt app help",
      "Base44 developer",
      "migrate from Base44",
      "Cursor app",
      "Replit app",
      "make my AI app production ready",
      "fractional CTO Toronto",
      "technical advisor AI app",
      "AI app help Toronto",
      "AI MVP developer Toronto",
    ],
    ogHeadline: ["You built it.", "Let's make it ready", "for real users."],
    ogImageAlt: "Didi Build: You built it. Let's make it ready for real users.",
    siteUrl: "https://didi.build",
  },
  a11y: {
    skipToBooking: "Skip to booking",
    spamProtectionLabel: "Spam protection",
    turnstileNotConfigured: "Spam protection is not configured in this environment.",
    footerNavLabel: "Elsewhere",
    mainNavLabel: "Sections",
    mobileMenuLabel: "Menu",
    themeSwitchToLight: "Switch to light mode",
    themeSwitchToDark: "Switch to dark mode",
  },
  header: {
    cta: "Book a chat",
    mobileCta: "Book a free 30-min chat",
    nav: [
      { label: "What I do", sectionKey: "what" as const },
      { label: "How it works", sectionKey: "how" as const },
      { label: "Pricing", sectionKey: "pricing" as const },
      { label: "FAQ", sectionKey: "faq" as const },
    ],
  },
  hero: {
    intro: "Hi, I'm Didi.",
    introMuted: "A software engineer in Toronto.",
    headline: "You built it.",
    headlineAccent: "Let's make it ready for real users.",
    supporting:
      "Getting ready for more users, paying customers, or investors? I give founders who built with AI an experienced engineer's view of what their app needs to get there.",
    primaryCta: "Book a free 30-min chat",
    secondaryCta: "See how it works",
    badges: [
      { text: "Free first chat", emphasis: false },
      { text: "Plain English, no jargon", emphasis: false },
      { text: "20% off for founding clients", emphasis: true },
    ],
  },
  whatIDo: {
    eyebrow: "What I do",
    headline: "You bring the vision. I bring the engineering that carries it.",
    intro:
      "Most of my work is with founders who built fast on tools like Lovable, Bolt, Base44, Replit, or Cursor, and are getting ready for what's next.",
    examplesLabel: "Example services",
    founderCards: [
      {
        title: "Off Base44, onto your own code",
        body: "Move your app to GitHub and your own hosting, so you actually own it.",
      },
      {
        title: "Ready for real users",
        body: "Logins, security, backups, and monitoring, so it keeps up as people sign up.",
      },
      {
        title: "An audit before you scale",
        body: "A clear look at what's solid, what's risky, and the path forward.",
      },
      {
        title: "Ready for investors",
        body: "Investors will ask how your app is built and whether it can grow. As your technical advisor (think fractional CTO), I help you answer with confidence.",
      },
    ],
    closingPrefix: "Have something else in mind?",
    closingLink: "Let's talk.",
  },
  founder: {
    name: "Diadem (Didi) Shoukralla",
    jobTitle: "Software Engineer and Technical Advisor",
  },
  about: {
    eyebrow: "About me",
    headline: "I build with AI every day, just like you.",
    lead: "I'm Didi, an AI systems engineer in Toronto with a background in software engineering. I've shipped production software at startups and SaaS companies, and today I build my own AI systems the same way you built your app: with AI doing a lot of the work.",
    followUp:
      "The difference is knowing what happens after it works on your screen. That's the part I help founders with.",
    linksLead: "See what I'm building on",
    githubLinkLabel: "GitHub",
    portfolioLinkLabel: "portfolio",
    linkedinLinkLabel: "LinkedIn",
    linksMid: ", browse my",
    linksOr: ", or connect on",
    linksEnd: ".",
  },
  llms: {
    whoItIsFor:
      "Founders who built apps or tools with AI (Lovable, Bolt, Base44, Replit, Cursor, Claude, ChatGPT, Grok) and want an experienced engineer's view before more users, paying customers, or investors.",
    serviceArea:
      "Based in Toronto, Ontario. Remote work across Canada; in-person locally when it helps.",
  },
  faq: {
    eyebrow: "FAQ",
    headline: "Straight answers to common questions.",
    questionsLabel: "questions",
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    items: [
      {
        question: "How much does it cost?",
        answer:
          "The first 30-minute chat is free. System audits start at $375 and builds start at $500. Advisory and ongoing support are hourly or monthly, quoted after the audit. My first 5 clients get 20% off everything for 12 months. You always get a written quote before any work starts.",
      },
      {
        question: "I'm an expert in my field, not in software. Is this for me?",
        answer:
          "Yes, that's exactly who I work with. Some founders come from business and know their market inside out. Others are deep experts in their field and built the tool they wished existed. Either way, you bring the vision. I bring the technical side: what your app needs underneath, and how software products usually run day to day, like hosting, subscriptions, and support. All in plain English.",
      },
      {
        question: "Can you help me move my app off Base44?",
        answer:
          "Yes. Platforms like Base44 handle your hosting, database, and logins for you, so moving off means setting those up on infrastructure you own. I start with an audit to map what your app depends on, then give you a clear plan and a fixed price for the move.",
      },
      {
        question: "I built my app with Lovable, Bolt, Replit, or Cursor. Can you help?",
        answer:
          "Yes. The approach is the same: understand what you've built, find what's solid and what's risky, and get it ready for real users.",
      },
      {
        question: "Is my AI-built app secure?",
        answer:
          "That's one of the first things the audit checks. AI tools are great at getting something working, and things like access rules, protecting secret keys, and checking user input are easy to miss along the way. You'll get a clear picture of where you stand.",
      },
      {
        question: "Do I own my code?",
        answer:
          "Yes. Everything lives in your own accounts, like GitHub and your hosting, so you're never locked in to me or a platform.",
      },
      {
        question: "Do I need to understand the code?",
        answer:
          "No. I explain everything in plain English and hand off simple docs, so you know what you have and how it runs.",
      },
      {
        question: "Is my data safe?",
        answer:
          "You keep ownership of your accounts, code, and API keys. I build on your systems where possible, and we agree in writing how data is handled before any work starts. I don't resell your data or train public models on it.",
      },
      {
        question: "How long does a project take?",
        answer:
          "It depends on scope. The written plan we agree on includes a realistic timeline, and I keep you updated along the way.",
      },
      {
        question: "Do you only work in Toronto?",
        answer:
          "I'm based in Toronto and happy to meet locally. I also work with founders across Canada remotely.",
      },
      {
        question: "What if I'm not the right fit?",
        answer:
          "I'll tell you in the free chat. I'd rather say so upfront than sell you something you don't need.",
      },
    ],
  },
  howItWorks: {
    eyebrow: "How it works",
    headline: "Four steps, and you always know what comes next.",
    steps: [
      {
        title: "Free 30-min chat",
        body: "We talk about what you've built and where you want to take it. No prep needed. If I'm not the right fit, I'll tell you.",
      },
      {
        title: "System audit",
        body: "I review your app and give you a written summary: what's solid, what's risky, and what to do next.",
      },
      {
        title: "Build or advise",
        body: "A fixed-price project with a clear scope, or hourly guidance while you or your team build.",
      },
      {
        title: "Support",
        body: "Once it's running, choose a monthly plan or reach out as needed.",
      },
    ],
  },
  pricing: {
    eyebrow: "Services & pricing",
    headline: "Clear starting points.",
    intro:
      "Every project starts with a free chat. After the audit, you get a written quote for the work.",
    foundingCallout:
      "Founding client rates: 20% off everything for my first 5 clients, locked in for 12 months.",
    taxFootnote: "Prices before tax, plus HST where applicable.",
    tiers: [
      {
        name: "Free 30-min chat",
        note: "No prep, no obligation.",
        pricePrefix: "",
        price: "$0",
        priceSize: "large" as const,
      },
      {
        name: "System audit",
        note: "What's solid, what's risky, and the path forward.",
        pricePrefix: "from",
        price: "$375",
        priceSize: "large" as const,
      },
      {
        name: "Builds",
        note: "Fixed-price projects.",
        pricePrefix: "from",
        price: "$500",
        priceSize: "large" as const,
      },
      {
        name: "Advisory and ongoing support",
        note: "Quoted after the audit.",
        pricePrefix: "",
        price: "Hourly or monthly",
        priceSize: "medium" as const,
      },
    ],
  },
  contactEmail: "hello@didi.build",
  sectionIds: {
    how: "how-it-works",
    what: "what-i-do",
    pricing: "pricing",
    about: "about",
    faq: "faq",
  },
  hi: {
    pageTitle: "Hi, I'm Didi",
    headshotSrc: "/didi.png",
    headshotAlt: "Didi Shoukralla",
    greetingName: "I'm Didi",
    exchangeButton: "Exchange contact",
    bookLink: "or book a time directly",
    thanksMessage: "Thanks, {firstName}. Talk soon.",
    exchangeAriaLabel: "Exchange contacts",
    vcardPath: "/hi/contact.vcf",
    about: {
      title: "About me",
      intro:
        "I'm a software engineer in Toronto. I help founders who built their app with AI get it ready for real users, paying customers, or investors.",
      expandedParagraphs: [
        "I've shipped software at startups and on production teams, so I know what breaks once people actually show up.",
        "If you're building something, I'm happy to give you an honest, straight read during your free consultation.",
      ],
      consultationHighlight: "free consultation",
      showMore: "Show more",
      showLess: "Show less",
      whatIDoTitle: "What I do",
      chips: [
        "System audit",
        "Custom development",
        "Technical advisory",
        "Fractional CTO",
        "AI Integrations",
      ],
    },
    exchangeSheet: {
      exchangeTitle: "Let's stay in touch",
      detailsTitle: "Nice to meet you, {firstName} 👋",
      detailsIntro: "Add a few details to help me remember you.",
      nameLabel: "Full name",
      emailLabel: "Email",
      phoneLabel: "Phone",
      phoneOptional: "(optional)",
      countryCodeAriaLabel: "Country code",
      submitExchange: "Exchange contact",
      submitDetails: "Save details",
      consent: "I'll email you my contact card. No newsletter.",
      closeLabel: "Close",
      exchangeFormAriaLabel: "Exchange form",
      detailsFormAriaLabel: "Add details",
      notePlaceholder: "Where we met, what you're working on",
      jobTitleLabel: "Job title",
      companyLabel: "Company",
      noteLabel: "Note",
      pendingExchange: "Sending…",
      pendingDetails: "Saving…",
      detailsSaved: "Saved. Talk soon!",
      turnstileRequired: "Please complete the spam check.",
      exchangeNotSavedPrefix: "Your contact wasn't saved. Please email me at ",
      exchangeNotSavedEmail: "diadem@didi.build",
      exchangeNotSavedSuffix: " instead.",
      errors: {
        nameRequired: "Add your name so I know who you are.",
        emailRequired: "Add your email so I can reach you.",
        emailInvalid: "That email doesn't look quite right. Check for a typo?",
      },
    },
    followUpEmail: {
      subjectTemplate: "Great connecting with you, {firstName}",
      greetingTemplate: "Hi {firstName},",
      bodyParagraphs: [
        "Thanks for sharing your contact details with me.",
        "If you're building something with AI, I'd love to hear what you're working on.",
      ],
      attachmentLine: "My contact card is attached so you can save my details in one tap.",
      bookCtaLabel: "Book a time",
      closingLine: "Looking forward to staying in touch.",
    },
    contact: {
      name: {
        full: "Diadem (Didi) Shoukralla",
        family: "Shoukralla",
        given: "Diadem",
        nickname: "Didi",
      },
      org: "Didi Build",
      title: "Software Engineer and Technical Advisor",
      email: "diadem@didi.build",
      phone: "+1-647-716-7756",
      vcardNote: "Met at an event. Free 30-min consult.",
    },
  },
} as const;
