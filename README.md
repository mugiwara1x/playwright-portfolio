# Playwright + TypeScript test automation portfolio

> **This is a learning and portfolio project.** My production automation experience is with
> WebdriverIO, Cypress, Cucumber and TypeScript. I built this repository to learn Playwright
> properly and to show working examples of the patterns it's known for. I have not used
> Playwright in production.
>
> It tests **public practice sites only**: [saucedemo.com](https://www.saucedemo.com) (UI) and
> [restful-booker](https://restful-booker.herokuapp.com) (API), using their published demo accounts.

## What's in it

| Area                         | What it shows                                                                                                                      | Where                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Page Object Model**        | Page classes expose locators and actions; tests own the assertions. A shared header is a component (composition, not inheritance). | [src/pages](src/pages)                                                                   |
| **Custom fixtures**          | Page objects injected into tests; logged-in and logged-out variants chosen by import.                                              | [src/fixtures](src/fixtures)                                                             |
| **Auth with `storageState`** | A setup project logs in once per run and saves the session. Specs start already logged in, with no login screen.                   | [tests/auth.setup.ts](tests/auth.setup.ts), [src/fixtures/auth.ts](src/fixtures/auth.ts) |
| **UI tests**                 | Login (incl. data-driven negatives), inventory sorting, cart, checkout with computed totals, product details, a visual snapshot.   | [tests/ui](tests/ui)                                                                     |
| **API tests**                | restful-booker CRUD, auth and negative cases, with zod schema validation and a worker-scoped token fixture with cleanup.           | [tests/api](tests/api), [src/api](src/api), [src/schemas](src/schemas)                   |
| **Hybrid tests**             | State seeded below the UI, then verified through it, and the reverse.                                                              | [tests/hybrid](tests/hybrid)                                                             |
| **Test data**                | Kept out of specs: users, products, checkout cases, a booking builder.                                                             | [src/data](src/data)                                                                     |
| **CI**                       | GitHub Actions: static checks, 2 shards, one merged HTML report, traces on failure.                                                | [.github/workflows](.github/workflows)                                                   |
| **AI-assisted test design**  | Claude Code generated 33 cases from acceptance criteria; I reviewed and trimmed them to 20 tests. It found 2 real defects.         | [docs/ai-assisted-testing.md](docs/ai-assisted-testing.md)                               |

**60 tests** in total: 46 UI, 11 API and 3 hybrid, plus 2 setup steps. The whole suite runs in about 15 seconds locally.

## Quick start

Requires Node.js 20+ (built with Node 24). Commands work in PowerShell, Git Bash or any Unix shell.

```bash
npm ci
npx playwright install chromium
npm test
```

### Scripts

| Command                                       | What it does                                                   |
| --------------------------------------------- | -------------------------------------------------------------- |
| `npm test`                                    | Run everything headless                                        |
| `npm run test:headed`                         | Run with a visible browser                                     |
| `npm run test:ui`                             | Playwright UI mode: watch mode plus a time-travel trace viewer |
| `npm run test:debug`                          | Step through with the Playwright Inspector                     |
| `npm run report`                              | Open the last HTML report                                      |
| `npm run typecheck` / `lint` / `format:check` | Static checks (the same ones CI runs first)                    |

Useful filters:

```bash
npx playwright test --project=api          # API tests only, no browser
npx playwright test tests/ui/cart.spec.ts  # one file
npx playwright test --grep @ai-reviewed    # the AI-assisted tests
```

## Project structure

```
src/
  pages/          Page objects (+ components/Header.ts)
  fixtures/       test.ts (page objects), auth.ts (logged-in), api.ts (API clients + token)
  api/            BookingClient: the API equivalent of a page object
  schemas/        zod schemas: runtime contract checks + TypeScript types
  data/           Test data and builders
  utils/          env settings, price helpers, cart storage helpers
tests/
  auth.setup.ts   Logs in once per run and saves sessions to playwright/.auth/ (gitignored)
  ui/  api/  hybrid/
docs/             AI-assisted test design write-up and its raw inputs/outputs
```

The [Playwright config](playwright.config.ts) has three projects: `setup`, `chromium` (depends on `setup`) and `api` (no browser, independent of saucedemo).

## Design decisions

- **Page objects don't assert.** They return locators and perform actions. That's what lets the same `LoginPage` serve both the happy path and the four negative-login tests.
- **Products are found by their visible name**, using `locator.filter({ has })`, not by generated ids like `add-to-cart-sauce-labs-backpack`.
- **Only web-first assertions on the UI.** Expected values come from test data, not from the page. Sorting by price asserts prices, not names, because two products cost the same and their order isn't defined.
- **Every API test creates its own data** with a unique name, so tests run in parallel against a shared public API without colliding. A fixture deletes what each test created.
- **The API client never asserts.** Tests check status and body, because restful-booker reports failures oddly (see below) and a status-only check would pass wrongly.
- **Known defects are kept visible with `test.fail()`.** These tests pass while the bug exists and turn red when it's fixed.

## Notes about the systems under test

**saucedemo has no backend API.** The cart lives in `localStorage`. So the "hybrid" tests seed and read that storage directly instead of calling an API. With a real backend, the same tests would use `request.post(...)`. The coupling to the storage format is guarded by a test that checks the format the real UI writes. See [src/utils/cartStorage.ts](src/utils/cartStorage.ts).

**restful-booker's status codes are unusual,** and the tests assert its real behaviour with comments:

| Call                    | Returns                              | Typical REST API |
| ----------------------- | ------------------------------------ | ---------------- |
| Create booking          | 200                                  | 201              |
| Delete booking          | 201                                  | 200 / 204        |
| Wrong credentials       | 200 + `{"reason":"Bad credentials"}` | 401              |
| Missing required fields | 500                                  | 400              |

It's also a **shared sandbox that resets its data**, so a booking can occasionally disappear mid-test. CI retries absorb that. Read-backs check the status before parsing, so a real failure says "expected 200, received 404".

**Known defects found (kept as `test.fail()`):**

- `problem_user`: sorting has no effect (a deliberate saucedemo bug)
- Product details `?id=1.5` opens product 1 instead of "item not found"
- "Add to cart" on the not-found page: the badge shows 1, but the cart is empty

## CI

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on every push and pull request:

```
static-checks ──► test (shard 1/2 ║ shard 2/2) ──► merge-reports
```

- **static-checks:** typecheck, ESLint, Prettier. No browsers, so it fails fast.
- **test:** the suite split across 2 machines. Each one uploads a blob report, and on failure its traces and screenshots.
- **merge-reports:** combines the shards into one `playwright-report` artifact. Open it and click a failed test to see its trace. Traces are recorded on the first retry.

At this suite size, sharding costs more in setup than it saves. It's included to show the technique, which pays off once a suite runs for minutes.

### Visual baselines are per OS

Font rendering differs between Windows and Linux, so a screenshot baseline from a Windows laptop can't be compared on CI's Linux runners. The committed baseline is `*-chromium-win32.png`. To add the Linux one:

1. Run the **Update Linux visual baselines** workflow manually (Actions tab).
2. Download the `linux-snapshots` artifact and look at the image.
3. Commit it next to the Windows one, in `tests/ui/visual.spec.ts-snapshots/`.

Until then, the visual test fails on CI. A baseline is never approved automatically.

## How this was built

I built this with Claude Code as a pair-programming tutor. For each piece, I asked for the concept first, related it to WebdriverIO and Cypress, and answered check questions before moving on. Commits are co-authored accordingly. [docs/ai-assisted-testing.md](docs/ai-assisted-testing.md) is a separate, deliberate example of using an LLM for test design.

## Possible next steps

- Firefox and WebKit projects
- Cucumber-style BDD on top of the existing page objects (`playwright-bdd`)
- Accessibility checks with `@axe-core/playwright`
- A target that has both a UI and an API, so the hybrid tests can use real API setup
