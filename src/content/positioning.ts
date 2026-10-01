/**
 * Canonical business positioning (DIDI-477). Source of truth for the
 * "AI-built MVP to production-ready" angle alongside AI integration work.
 * Site copy imports from here; manual channels (LinkedIn, networking) should
 * match these blocks. See docs/freelance/DIDI-477-mvp-production-ready.md.
 */
export const mvpProductionReadyAngle = {
  shortLabel: "AI-built MVPs, production-ready",
  oneLiner:
    "I turn AI-built MVPs into software you can deploy, trust, and grow, with plain-English docs so you know what you have.",
  audience:
    "Non-technical founders and small business owners who prototyped an app with AI tools (Claude, Bolt, Base44, and similar) but need engineering to get it into a repo, deployed, secured, and maintained.",
  problem:
    "AI makes a first version easy; shipping, security, scaling, and upkeep still need real engineering.",
  exampleTitle: "From AI prototype to production",
  exampleBody:
    "You built an MVP with AI tools but it is not on GitHub, not deployed, or not safe to show customers. I put it in a proper repo, ship it to a real host, tighten security basics, and leave you with plain-English docs.",
  productionReadyPackage: [
    "Code in a Git repo you own (GitHub or similar)",
    "Deployment to a production host with a sane release path",
    "Secrets, auth, and data handling reviewed for obvious risks",
    "Basic monitoring and rollback so you are not flying blind",
    "Plain-English handoff: what it does, how to deploy, who to call when something breaks",
  ],
  networkingOpener:
    "I help founders who built an MVP with AI tools but cannot deploy or explain how it works. I make it production-ready: repo, hosting, security basics, and docs, alongside the custom AI work I do for small businesses.",
  linkedInCompanyBlurb:
    "Didi Build helps small businesses and startups with custom AI integration, and helps non-technical founders turn AI-built MVPs into production-ready software: proper repos, deployment, security basics, and plain-English handoff.",
} as const;

export const aiIntegrationAngle = {
  shortLabel: "Custom AI for how you work",
  oneLiner:
    "I learn how your business runs, find where AI saves time or makes money, then build fixed-scope tools that fit.",
} as const;
