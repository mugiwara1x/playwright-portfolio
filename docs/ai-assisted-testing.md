# AI-assisted test design: generate, then review and trim

> **Review status: reviewed.** The keep/merge/cut decisions below were proposed during the
> session with Claude Code, then reviewed and accepted by me (Pablo). See [Sign-off](#sign-off).

This mirrors how I use LLM-generated test cases at work. The LLM is good at **breadth**: it
lists many cases fast, including edge cases I might not think of. It is bad at **judgement**:
it doesn't know the app, the existing suite or the cost of each test. So its output is a
**starting list to review, not a test plan**.

## The workflow

```
acceptance criteria ──► Claude Code (headless, no repo access) ──► 33 raw test cases
                                                                         │
             check unclear cases against the real app  ◄────────────────┤
                                                                         ▼
                                       review: keep / merge / cut, with a reason for each
                                                                         │
                                                                         ▼
                              tests/ui/product-details.spec.ts (20 tests from 10 test functions)
```

| Step                                                                                 | File                                                                    |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 1. A user story with 7 acceptance criteria, for a feature the suite didn't cover yet | [docs/ai/acceptance-criteria.md](ai/acceptance-criteria.md)             |
| 2. The prompt template (generic, no project knowledge)                               | [docs/ai/prompt.md](ai/prompt.md)                                       |
| 3. The raw output, **unedited**                                                      | [docs/ai/raw-output.md](ai/raw-output.md)                               |
| 4. The review (this document)                                                        | below                                                                   |
| 5. The resulting tests, tagged `@ai-reviewed`                                        | [tests/ui/product-details.spec.ts](../tests/ui/product-details.spec.ts) |

### How the cases were generated

The generator was deliberately given **only the acceptance criteria**. It ran from an empty
folder, so it couldn't read this repository. That's the realistic situation: generated cases
come from requirements, not from the code.

```powershell
# PowerShell, from an empty folder
$prompt = (Get-Content docs\ai\prompt.md -Raw).Replace('{{ACCEPTANCE_CRITERIA}}', (Get-Content docs\ai\acceptance-criteria.md -Raw))
$prompt | claude -p --output-format text
```

Claude Code 2.1.317, 2026-11-14. LLM output isn't deterministic, so running this again gives a
similar list but not the same one. That's why the raw output is committed.

## Review criteria

For every generated case I asked, in this order:

1. **Is it traceable to an acceptance criterion?** If not, it's scope creep. Cut it, or turn it into a question for the PO.
2. **Is the expected result a clear yes/no?** "Either X or Y happens" isn't a test oracle.
3. **Is it already covered**, by another generated case or by the existing suite?
4. **Are its preconditions true for this app?** LLMs invent data, for example prices this catalogue doesn't have.
5. **Is it worth its cost?** Runtime, flakiness and maintenance, compared with the risk it covers.
6. **Can several cases share one data-driven test?**

## Decisions

**Result: 33 generated → 22 covered (merged into 10 test functions, 20 test runs) → 11 cut.**

| TC  | Title (short)                           | Decision                              | Reason                                                                                                                                                                                                                                  |
| --- | --------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Click name opens details                | **Keep**, merged with 02              | One data-driven test: `via: 'name' \| 'image'`.                                                                                                                                                                                         |
| 02  | Click image opens details               | **Keep**, merged with 01              | As above.                                                                                                                                                                                                                               |
| 03  | Every product opens its own page        | **Keep (partly)**                     | Clicking 6 × 2 links adds little once 01/02 prove the link works. Covered more cheaply by opening each id by URL (6 fast tests).                                                                                                        |
| 04  | Correct product after sorting           | Cut                                   | Our locators find products by **name**, never by position, so this risk can't occur in our tests. Sorting has its own spec.                                                                                                             |
| 05  | List "Add to cart" doesn't open details | Cut                                   | Already covered by `cart.spec.ts` (adding stays on the list and updates the badge).                                                                                                                                                     |
| 06  | Details match the list                  | **Keep**, merged with 10              | Reads description and image from the list, then compares on the details page.                                                                                                                                                           |
| 07  | Data matches for every product          | **Keep**, merged into the per-id loop | Name, price and image alt for all 6 products.                                                                                                                                                                                           |
| 08  | Price format identical                  | **Keep (partly)**                     | Exact text `"$29.99"` is asserted for every product. Its precondition is **wrong**: the catalogue has no round prices like "$50.00". The AI invented them.                                                                              |
| 09  | Long text / special characters          | **Keep (partly)**                     | Already covered by the per-id loop: "Test.allTheThings() T-Shirt (Red)" has dots and parentheses.                                                                                                                                       |
| 10  | Image is right and loads                | **Keep**, merged with 06              | Compares the image `src` between list and details. A real risk here: saucedemo's `problem_user` shows wrong images.                                                                                                                     |
| 11  | Add with empty cart                     | **Keep**, merged with 17 and 20       | One add → remove round trip checks the button and badge both ways.                                                                                                                                                                      |
| 12  | Add when cart has items                 | **Keep**, merged with 21              | 21 starts with one item in the cart, so "goes up by one" is tested there.                                                                                                                                                               |
| 13  | Added item is really in the cart        | **Keep**, merged with 21              | 21 opens the cart and checks its contents.                                                                                                                                                                                              |
| 14  | Item in cart opens with "Remove"        | **Keep**, merged with 19              | Cart seeded through storage (hybrid helper), so no UI clicks are needed to set it up.                                                                                                                                                   |
| 15  | Rapid double-click                      | Cut                                   | Its expected result is "either it's added once, or it toggles back out": **not a clear oracle**. Fast clicking also tests the browser more than this AC.                                                                                |
| 16  | Survives a refresh                      | Cut                                   | Same storage mechanism already tested by "cart survives a page reload" in `cart.spec.ts`.                                                                                                                                               |
| 17  | Remove, only item in cart               | **Keep**, merged with 11              | See 11.                                                                                                                                                                                                                                 |
| 18  | Remove with other items                 | Cut                                   | Same behaviour as 14/19 (removing one of several).                                                                                                                                                                                      |
| 19  | Remove item added from the list         | **Keep**, merged with 14              | See 14.                                                                                                                                                                                                                                 |
| 20  | Toggle add/remove repeatedly            | **Keep (partly)**, merged with 11     | One full round trip covers it. Five toggles add runtime, not new risk.                                                                                                                                                                  |
| 21  | Back to products keeps cart             | **Keep**                              | Also absorbs 12 and 13.                                                                                                                                                                                                                 |
| 22  | Back after removing                     | Cut                                   | Combination of 19 and 21, which are both covered.                                                                                                                                                                                       |
| 23  | Back with empty cart                    | Cut                                   | Low risk. The empty-cart badge is covered elsewhere.                                                                                                                                                                                    |
| 24  | Browser back button                     | Cut, as a **question for the PO**     | Not in the AC (AC5 names the "Back to products" button). Worth asking whether it's a requirement.                                                                                                                                       |
| 25  | Several trips list ↔ details            | Cut                                   | A longer chain of 19 + 21. More steps, same risk, more flakiness.                                                                                                                                                                       |
| 26  | Unknown id shows "not found"            | **Keep**, merged with 27 and 28       | Data-driven over `6`, `-1`, `abc` and `9999`. Its expected result also said "no working Add to cart button", which **the AC doesn't say**. That became 29.                                                                              |
| 27  | Boundary ids                            | **Keep**, merged with 26              | `-1` and `6` sit just outside the valid range 0–5. 0 and 5 are in the per-id loop.                                                                                                                                                      |
| 28  | Invalid id formats                      | **Keep (partly)**                     | Kept `abc`, `-1` and **`1.5`**, which revealed a defect (below). Cut the huge number, `%20`, empty and `<script>`: they're the same code path for this AC, and script injection belongs in security testing, not a UI functional suite. |
| 29  | Add to cart on a "not found" page       | **Keep**                              | Revealed a defect (below).                                                                                                                                                                                                              |
| 30  | Logged-out direct URL                   | **Keep**, merged with 32              | Data-driven over a valid and an invalid id.                                                                                                                                                                                             |
| 31  | Back after logout                       | Cut                                   | Session ending on logout is already covered in `login.spec.ts`.                                                                                                                                                                         |
| 32  | Logged out + unknown id                 | **Keep**, merged with 30              | A good thought: the **login check must come before** "not found".                                                                                                                                                                       |
| 33  | Session lost on details page            | Cut                                   | Covered in spirit by 30. Simulating an expiry mid-test is slow and flaky for little extra signal.                                                                                                                                       |

## What the AI found that I would likely have skipped

Checking the generated edge cases against the live site turned up **two real defects**. Both
are kept as `test.fail()` tests: they pass while the defect exists, and turn red when it's fixed.

| Case  | Defect                                                                                                                                                                                    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-28 | `inventory-item.html?id=1.5` **silently opens product 1** (Bolt T-Shirt) instead of "item not found". The id is probably parsed with something like `parseInt`, which drops the decimals. |
| TC-29 | On the "item not found" page, **"Add to cart" still works**. The badge shows 1, localStorage holds `[99]`, but the cart page is empty. That's inconsistent state.                         |

## What the AI got wrong, or needed a human for

- **Volume.** 33 cases for 7 criteria. Implemented as written, that's 33 UI tests and several minutes of runtime for a single page.
- **Duplicates and overlaps.** Many cases were small variations of each other (11/17/20, 21/22/25) or already existed in the suite (05, 16, 31). The generator couldn't know the suite.
- **Invented facts.** TC-08 assumes round prices that don't exist. TC-26 adds a requirement ("no working Add to cart") that isn't in the AC.
- **Weak oracles.** TC-15's "either A or B" can't fail.
- **Scope creep.** TC-24 (browser back) and the security payloads in TC-28 go beyond the AC.

## Limitations of this example

- One feature and one run. It shows the workflow, not a measured productivity gain.
- The cases were generated by Claude and the first review pass was also done with Claude, as the coding assistant in my session. Having the same model family generate and review is a known blind spot. The human review is the part that matters, and it's why this document needs a sign-off.

## Sign-off

Decisions reviewed and accepted without changes by Pablo, 2026-11-14.

The resulting tests run in CI with the rest of the suite. To run only them:
`npx playwright test --grep @ai-reviewed`
