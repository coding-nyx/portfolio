# PR checklist — portfolio brief reconciliation

This replaces the previous `README_PR.md`, which claimed every requirement was met
and that all tests passed while the app crashed on load. What follows is the
actual state of this branch, including what is **not** verified.

Branch: `update-portfolio-733909976469830342` → base `main`.
This branch was rebuilt on top of `main` so it includes the merged #51 privacy and
dead-link fixes.

## The defect that mattered

`npm run build` and `npm run lint` both exited **0** while the application was
completely broken. `Projects.jsx` had an unterminated `styled` template literal,
which swallowed the following declarations, and it rendered `<TechTag>` and
`<Description>` without declaring either. Every page load landed on the error
boundary:

```
SYSTEM FAILURE
Details: ReferenceError: TechTag is not defined
```

That is the concrete reason a green build is not evidence of a working app here.
`tests/portfolio.regression.test.js` now fails against the pre-fix file and passes
against the repaired one.

## Requirement-by-requirement

| # | Requirement | State | Evidence |
|---|---|---|---|
| 1 | Clear, consistent introduction | Implemented | Hero states "iOS engineer at Zoho since May 2022…"; headline names the role and stack |
| 1 | Remove stale year counts everywhere | Implemented | Derived in `src/utils/tenure.js`; no `N+ years` in hero, `vfs.js`, `minimaxClient.js`, `VirtualShell.jsx` (test: *no surface hardcodes a year count*) |
| 1 | Preserve titles/dates | Implemented | `Member of Technical Staff`, `May 2022 - Present` unchanged (test: *professional name and contact details are preserved*) |
| 1 | Recruiter actions in first viewport | Implemented | LinkedIn / Resume / Email / Contact verified in-browser |
| 1 | Rename Professional/Informal/Contact-for-Fun | Implemented | Hero labels now LinkedIn, Resume, Email, Contact (test: *hero exposes recruiter actions*) |
| 1 | No mandatory boot animation | Implemented | `bootComplete` initialises `true`; boot remains an optional interaction |
| 2 | iOS work leads the hierarchy | Implemented | First project is the production iOS work (test: *the primary iOS project leads*) |
| 2 | Reachable case studies | Implemented | 4 projects carry case studies with problem/approach/scope/evidence/limitations; expansion verified in-browser with `aria-expanded` |
| 2 | Remove percentage skill bars | Implemented | Replaced by evidence lists; no `progressbar` remains (test: *skill groups replace percentage bars*) |
| 2 | Distinguish production/internal/personal | Implemented | Statuses: `Production work`, `Internal tooling`, `Active project`, `Prototype`, plus a `scope` line per card |
| 3 | Remove benchmark/demo claims | Implemented | Hardcoded 3.2s/2.5s/180MB/126MB panel and the "Verified across Zoho Mobile ecosystem modules" line removed; replaced with a qualitative description stating no figures are published |
| 3 | Label the Dynamic Island demo honestly | Implemented | Labelled "Browser physics illustration, not native SwiftUI" |
| 4 | Honest, working destinations | Implemented | FitPro demo (404) and Nexus repo (private, 404) actions removed with a visible reason; working repos still linked (test: *no dead or private destinations are published*) |
| 4 | Releases, not "Live", for the APK | Implemented | Labelled `Releases / Download APK` (test: *the APK destination is labelled as releases*) |
| 5 | Sharing metadata | Implemented | description, canonical, OG (type/title/description/url/image), Twitter card; test: *page has description, canonical and Open Graph metadata* |
| 5 | Meaningful content without JS | Partial | `<noscript>` block gives role, résumé links and contact. **Not** full prerendering of the React content. |
| 5 | No horizontal overflow at 360/390 | Implemented | Verified 360/390/768/1280/1440 in-browser, both themes: no overflow. **I introduced this bug first** (terminal input intrinsic width) and fixed it |
| 5 | Keyboard navigation / skip link | Verified | Skip link present and focusable; tab order reaches Ask Rook → LinkedIn → Resume → Email → Contact |
| 5 | Reduced motion | Partially verified | Emulated `prefers-reduced-motion: reduce`; no layout break. Did not measure animation suppression in detail |
| 5 | Assistant fallback data cleaned | Implemented | Year counts, percentages, `National Finalist`, top-10%, E2EE claims and dead links removed from `minimaxClient.js` |
| 6 | No invented testimonials | Implemented | `testimonialsData` is an empty array; component deleted; quotations and named attributions removed from client-delivered data (test: *named testimonials are removed*) |
| 6 | Participation retained | Implemented | Smart India Hackathon participation and the 10km obstacle race remain, without unverified distinctions (test: *participation is retained*) |
| 6 | Résumé PDFs preserved | Implemented | Both PDFs still served (HTTP 200) and linked; files untouched |
| 7 | Facts centralised | Implemented | `src/data/portfolio.js` is the single source; hero, projects, skills and terminal consume it |
| 7 | README accuracy | Implemented | Real clone URL, `npm ci`, real check commands, honest Playwright setup note |
| — | Regression coverage | Implemented | 23 tests, `node --test`, no new dependencies |

## Checks actually executed on this branch

```
npm ci                      # 229 packages, exit 0
npm run lint                # exit 0
npm test                    # 23 tests, 23 pass, 0 fail
npm run build               # exit 0
npm run audit:bundle        # Bundle audit: CLEAN (exit 0)
```

Browser (Chromium, built bundle via `vite preview`): no `SYSTEM FAILURE`, no
console errors, no uncaught exceptions, case-study expansion works, both themes
render, no horizontal overflow at 360/390/768/1280/1440.

Link checks (HTTP, following redirects):

| Destination | Result | Action taken |
|---|---|---|
| `personal-trainer-mock.web.app` | 404 | demo action removed |
| `github.com/coding-nyx/nexus-react-native` | 404 (repo is private) | source action removed |
| `agent-agnes-ai.web.app` | 200, unverified shell | not presented as working |
| `personal-trainer`, `hermes-companion-app`, `hermes-companion-app/releases`, `a0090-meta`, `hermes-companion-web` | 200 | kept |
| `iamnyx.web.app/resume-modern.pdf`, `resume-cyberpunk.pdf` | 200 | kept |
| `linkedin.com/in/raj-kumar-s` | 999 (bot wall) | kept; not a broken link |

## Not done / unavailable — stated as unavailable, not passed

- **No CI checks exist on this repository** for pull requests. The only workflow
  is `firebase-hosting-merge.yml`, which runs on push to `main` only. This branch
  reports no check rollup; nothing here should be read as passing CI.
- **The Python `verification/*.py` scripts were restored but not executed.**
  Playwright is not installed on this host (`ModuleNotFoundError: No module named
  'playwright'`). They are restored, `verify_skills.py` is adapted to the new
  markup, and they are **unrun**.
- **Contact form and assistant delivery were not tested.** No real message or
  notification was sent to any recipient. Delivery remains an owner-side test.
- **The site was not deployed.** Production is untouched and unverified.
- **Résumé PDFs were not regenerated.** They still print a retired host in their
  header; there is no résumé source in this repository.
- **No performance measurement, Lighthouse run, contrast audit or screen-reader
  pass** was performed.

## Owner questions (no private data reproduced)

1. The public source repository for Nexus is private. Is there an intended public
   alternative, or should the project stay link-free?
2. `agent-agnes-ai.web.app` renders an HTML shell whose behaviour was not
   verified. Should it be published at all?
3. Does the agentic workflow have confirmed internal adoption or measured benefit
   that could be stated qualitatively? None is claimed here.
4. Which parts of the iOS component library and performance work were personally
   owned versus shared with the team? Not stated here.

## Compatibility and follow-up risks

- Removing the percentage skill bars is a visible content change. Anything
  downstream that scraped those numbers will see different values.
- `Projects.jsx` was rewritten; the project card DOM changed shape, so any
  external selector depending on the old markup needs review.
- No new dependency was added. `pnpm-lock.yaml` and `package-lock.json` both still
  exist and remain out of sync, which is pre-existing.