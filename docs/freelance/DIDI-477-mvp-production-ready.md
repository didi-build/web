# DIDI-477: AI-built MVPs to production-ready

Parent: [DIDI-477](https://linear.app/didi-build/issue/DIDI-477) (Freelance project).

## Strategy (two angles, one practice)

| Angle                          | Who                                 | What they need                                                            |
| ------------------------------ | ----------------------------------- | ------------------------------------------------------------------------- |
| **AI integration** (existing)  | Small businesses and early startups | Automation, document handling, in-product AI, fixed-scope builds          |
| **MVP production-ready** (new) | Low-tech AI visionaries             | Repo, deployment, security basics, maintainability, plain-English handoff |

Canonical wording lives in `src/content/positioning.ts`. User-facing site strings that must stay aligned are composed in `src/content/site.ts`.

## Sub-tasks

| ID         | Channel                                               | Owner       | Status       | Notes                                                                            |
| ---------- | ----------------------------------------------------- | ----------- | ------------ | -------------------------------------------------------------------------------- |
| DIDI-477-a | **didi.build** (`site.ts`, `llms.txt`, JSON-LD, meta) | Delegatable | Done in repo | Uses `positioning.ts`; run full CI before deploy                                 |
| DIDI-477-b | **LinkedIn company page** (About, services, tagline)  | Manual      | Todo         | Paste `mvpProductionReadyAngle.linkedInCompanyBlurb`; keep AI integration line   |
| DIDI-477-c | **Networking opener and pitch** (30s + 2 min)         | Manual      | Todo         | Use `networkingOpener`; add one real-estate-founder-style example if helpful     |
| DIDI-477-d | **Freelance game plan / first-client Linear tickets** | Manual      | Todo         | Add MVP path next to integration path; link DIDI-476 as proof point              |
| DIDI-477-e | **Offer structure: Production-Ready MVP package**     | Manual      | Todo         | Fixed-scope SOW from `productionReadyPackage` bullets; price TBD; Moxie template |
| DIDI-477-f | **Founder LinkedIn** (optional alignment)             | Manual      | Todo         | Headline/about should mention both angles briefly                                |
| DIDI-477-g | **Design export** (`design/web.dc.html`)              | Manual      | Todo         | Only if marketing wants design file parity; live site is driven by `site.ts`     |

## Production-Ready MVP package (offer skeleton)

Use for proposals; adjust scope per lead.

1. Code in a Git repo you own (GitHub or similar)
2. Deployment to a production host with a sane release path
3. Secrets, auth, and data handling reviewed for obvious risks
4. Basic monitoring and rollback so you are not flying blind
5. Plain-English handoff: what it does, how to deploy, who to call when something breaks

Discovery still starts with the free 30-minute chat; quote fixed price after scope is clear.

## Consistency checklist

Before closing DIDI-477, confirm each row in the sub-task table uses the same audience definition and does not replace the AI integration angle.

- [ ] didi.build hero / what I do / about / FAQ / contact mention MVP path where appropriate
- [ ] LinkedIn company About matches `linkedInCompanyBlurb`
- [ ] Networking script includes `networkingOpener`
- [ ] Linear freelance tickets describe both lead types
- [ ] Moxie (or draft) proposal lists `productionReadyPackage` items
