# Raw output: Claude Code, unedited

> Generated on 2026-11-14 with Claude Code 2.1.317 in headless mode (`claude -p`), run from an empty folder so it saw ONLY the prompt below, not this repository.
> Input: [prompt.md](prompt.md) with [acceptance-criteria.md](acceptance-criteria.md) pasted in.
> The test cases below are kept exactly as generated (this header is the only addition). The review is in [../ai-assisted-testing.md](../ai-assisted-testing.md).

---

- **TC-01: Clicking a product name opens its details page**
  - AC: 1
  - Type: Positive
  - Preconditions: Shopper is logged in and on the products list.
  - Steps:
    1. Note the name, description, price and image of any product.
    2. Click the product's name.
  - Expected result: That product's details page opens. It shows that product, not a different one.

- **TC-02: Clicking a product image opens its details page**
  - AC: 1
  - Type: Positive
  - Preconditions: Shopper is logged in and on the products list.
  - Steps:
    1. Note the details of any product.
    2. Click the product's image.
  - Expected result: That product's details page opens and shows the same product.

- **TC-03: Every product in the list opens its own details page**
  - AC: 1
  - Type: Positive
  - Preconditions: Shopper is logged in and on the products list.
  - Steps:
    1. For each product in the list (including the first and last), click its name and check the page that opens.
    2. Click "Back to products".
    3. Repeat the steps using the image.
  - Expected result: Every product opens its own page. No two products open the same page, and no product opens a different product's page.

- **TC-04: Correct product opens after the list is sorted**
  - AC: 1
  - Type: Edge
  - Preconditions: Shopper is logged in and on the products list.
  - Steps:
    1. Change the sort order (e.g. by price, high to low, or name Z–A).
    2. Click the name of the first product, then go back and click the image of the last product.
  - Expected result: Each click opens the product that was clicked. A product is not chosen by its position from before the sort.

- **TC-05: Clicking the list's "Add to cart" button does not open the details page**
  - AC: 1
  - Type: Negative
  - Preconditions: Shopper is logged in and on the products list.
  - Steps:
    1. Click "Add to cart" on a product in the list.
  - Expected result: The shopper stays on the products list. The product is added and the badge goes up by one. No details page opens.

- **TC-06: Details page shows name, description, price and image matching the list**
  - AC: 2
  - Type: Positive
  - Preconditions: Shopper is logged in and on the products list.
  - Steps:
    1. Record the name, description, price and image of a product in the list.
    2. Open its details page.
    3. Compare all four fields.
  - Expected result: Name, description, price and image are all shown, and each one exactly matches what the list shows (same text, same image).

- **TC-07: Data matches for every product**
  - AC: 2
  - Type: Positive
  - Preconditions: Shopper is logged in.
  - Steps:
    1. Repeat TC-06 for every product in the catalog.
  - Expected result: Every product's details page matches its list entry. No fields are mixed up between products.

- **TC-08: Price format is identical on list and details page**
  - AC: 2
  - Type: Edge
  - Preconditions: Shopper is logged in. The catalog includes prices with cents (e.g. 7.99), round prices (e.g. 50.00 or 15.00), and the lowest and highest prices.
  - Steps:
    1. Open the details page for each of these products.
    2. Compare the currency symbol, decimal places and separators with the list.
  - Expected result: Prices are shown exactly as on the list (e.g. "$15.99", not "15.99" or "$15.9"). Round prices keep both decimal places.

- **TC-09: Long text and special characters are shown in full**
  - AC: 2
  - Type: Edge
  - Preconditions: Shopper is logged in. The catalog has a product with the longest name or description, or with special characters (quotes, apostrophes, parentheses, dots).
  - Steps:
    1. Open that product's details page.
  - Expected result: Name and description match the list character for character. They are not cut off, garbled or HTML-escaped (for example, no `&quot;`), and the layout does not break.

- **TC-10: Image on the details page is the right image and loads**
  - AC: 2
  - Type: Edge
  - Preconditions: Shopper is logged in.
  - Steps:
    1. Open several details pages.
    2. Inspect each image (what it shows, its alt text and its source).
  - Expected result: Each image loads, is not a broken-image placeholder, and is the same picture as that product's list image. No product shows a generic or another product's image.

- **TC-11: Add to cart from details page with an empty cart**
  - AC: 3
  - Type: Positive
  - Preconditions: Shopper is logged in, the cart is empty (no badge shown), and the shopper is on a product's details page.
  - Steps:
    1. Click "Add to cart".
  - Expected result: The button changes to "Remove" and the cart badge appears showing 1.

- **TC-12: Add to cart from details page when the cart already has items**
  - AC: 3
  - Type: Positive
  - Preconditions: Shopper is logged in and has 2 other products in the cart (badge shows 2).
  - Steps:
    1. Open the details page of a product that is not in the cart.
    2. Click "Add to cart".
  - Expected result: The button reads "Remove" and the badge shows 3.

- **TC-13: Product added on details page is really in the cart**
  - AC: 3
  - Type: Positive
  - Preconditions: Shopper is logged in and the cart is empty.
  - Steps:
    1. Add a product from its details page.
    2. Open the cart.
  - Expected result: The cart contains exactly that product, with the same name and price, and a quantity of 1.

- **TC-14: Product already in the cart opens with a "Remove" button**
  - AC: 3, 4
  - Type: Edge
  - Preconditions: Shopper is logged in and has added a product from the products list (badge shows 1).
  - Steps:
    1. Open that product's details page.
  - Expected result: The button reads "Remove", not "Add to cart". The badge still shows 1; opening the page does not change it.

- **TC-15: Rapid repeated clicks on "Add to cart" add the product only once**
  - AC: 3
  - Type: Edge
  - Preconditions: Shopper is logged in, the cart is empty, and the shopper is on a product's details page.
  - Steps:
    1. Double-click (or click quickly several times) "Add to cart".
  - Expected result: The final state matches the number of clicks. Either the product is in the cart once (badge 1, button "Remove"), or it toggles back out with the badge hidden. The badge never shows 2 or more for a single product, and it never goes negative.

- **TC-16: Cart state on the details page survives a page refresh**
  - AC: 3
  - Type: Edge
  - Preconditions: Shopper is logged in and on a product's details page.
  - Steps:
    1. Click "Add to cart".
    2. Refresh the browser.
  - Expected result: The page reloads the same product. The button still reads "Remove" and the badge still shows the same count.

- **TC-17: Remove from the details page with only this item in the cart**
  - AC: 4
  - Type: Positive
  - Preconditions: Shopper is logged in and on a product's details page. That product is the only item in the cart (badge shows 1).
  - Steps:
    1. Click "Remove".
  - Expected result: The button reads "Add to cart" and the badge goes from 1 to 0. The badge is hidden, or shows the empty state the app uses elsewhere; it does not show "0" or a negative number unless the list page does too.

- **TC-18: Remove from the details page with other items in the cart**
  - AC: 4
  - Type: Positive
  - Preconditions: Shopper is logged in and has 3 products in the cart, including the product shown on the details page.
  - Steps:
    1. Click "Remove" on the details page.
    2. Open the cart.
  - Expected result: The button reads "Add to cart" and the badge shows 2. The cart holds the other 2 products, and only this one has been removed.

- **TC-19: Remove a product on the details page that was added from the list**
  - AC: 4
  - Type: Positive
  - Preconditions: Shopper is logged in and has added a product from the products list.
  - Steps:
    1. Open that product's details page.
    2. Click "Remove".
  - Expected result: The button reads "Add to cart", the badge goes down by one, and the product is no longer in the cart.

- **TC-20: Repeatedly toggling add and remove keeps the count correct**
  - AC: 3, 4
  - Type: Edge
  - Preconditions: Shopper is logged in, has 1 other item in the cart (badge 1), and is on a product's details page.
  - Steps:
    1. Click Add, then Remove, then Add, then Remove, then Add.
  - Expected result: After each click the button and badge are consistent: Add gives "Remove" with badge 2, Remove gives "Add to cart" with badge 1. Final state: "Remove" with badge 2.

- **TC-21: "Back to products" returns to the list with the cart preserved after adding**
  - AC: 5
  - Type: Positive
  - Preconditions: Shopper is logged in, has 1 item in the cart, and is on another product's details page.
  - Steps:
    1. Click "Add to cart" (badge shows 2).
    2. Click "Back to products".
  - Expected result: The products list is shown and the badge still shows 2. Both products show a "Remove" button in the list.

- **TC-22: "Back to products" after removing on the details page**
  - AC: 4, 5
  - Type: Positive
  - Preconditions: Shopper is logged in, has 2 items in the cart, and is on the details page of one of them.
  - Steps:
    1. Click "Remove".
    2. Click "Back to products".
  - Expected result: The list shows a badge of 1. The removed product shows "Add to cart" in the list and the other product shows "Remove".

- **TC-23: "Back to products" with an empty cart**
  - AC: 5
  - Type: Edge
  - Preconditions: Shopper is logged in, the cart is empty, and the shopper is on a details page.
  - Steps:
    1. Click "Back to products".
  - Expected result: The products list is shown, no badge is shown, and every product shows "Add to cart".

- **TC-24: Browser back button behaves like "Back to products"**
  - AC: 5
  - Type: Edge
  - Preconditions: Shopper is logged in and has opened a details page from the list.
  - Steps:
    1. Add the product to the cart.
    2. Press the browser's back button.
  - Expected result: The products list is shown. The badge and the list's buttons reflect the product that was just added; the page does not show stale state.

- **TC-25: Cart contents survive several trips between the list and details pages**
  - AC: 5
  - Type: Edge
  - Preconditions: Shopper is logged in and the cart is empty.
  - Steps:
    1. Open product A's details page, add it, and go back.
    2. Open product B's details page, add it, and go back.
    3. Open product A's details page, remove it, and go back.
  - Expected result: The final badge shows 1. Only product B is in the cart and shows "Remove" in the list.

- **TC-26: A product ID that does not exist shows "item not found"**
  - AC: 6
  - Type: Negative
  - Preconditions: Shopper is logged in.
  - Steps:
    1. Change the details page URL to an ID that does not exist (e.g. 9999).
  - Expected result: An "item not found" message is shown. No real product's name, price, image or description is shown, and there is no working "Add to cart" button.

- **TC-27: Boundary IDs just outside the valid range**
  - AC: 6
  - Type: Edge
  - Preconditions: Shopper is logged in. The lowest and highest valid product IDs are known.
  - Steps:
    1. Open the details page for the lowest valid ID, then for the ID just below it.
    2. Open the details page for the highest valid ID, then for the ID just above it.
  - Expected result: The valid IDs show their products correctly. The IDs just outside the range show "item not found".

- **TC-28: Product IDs in invalid formats**
  - AC: 6
  - Type: Negative
  - Preconditions: Shopper is logged in.
  - Steps:
    1. Open the details page with each of these IDs in turn: `-1`, `abc`, an empty value, `1.5`, `99999999999999999999`, `%20`, and `<script>alert(1)</script>`.
  - Expected result: Each one shows "item not found", or is handled cleanly. There is no crash, blank page, stack trace or server error, no script runs, and no real product is shown (for example, `1.5` must not silently open product 1).

- **TC-29: Trying to add to the cart from a "not found" page**
  - AC: 6
  - Type: Negative
  - Preconditions: Shopper is logged in, has 1 item in the cart, and is on a "not found" details page.
  - Steps:
    1. Click "Add to cart" if it is shown.
    2. Click "Back to products".
  - Expected result: No item is added and the badge stays at 1. "Back to products" returns to the list with the cart unchanged.

- **TC-30: Logged-out shopper opens a details page URL directly**
  - AC: 7
  - Type: Negative
  - Preconditions: Shopper is not logged in (fresh session).
  - Steps:
    1. Go directly to the URL of a valid product's details page.
  - Expected result: The shopper is redirected to the login page and an error message says they must log in. No product details are shown, even briefly.

- **TC-31: Browser back after logging out does not show the details page**
  - AC: 7
  - Type: Negative
  - Preconditions: Shopper is logged in and on a details page.
  - Steps:
    1. Log out.
    2. Press the browser's back button, or paste the details page URL.
  - Expected result: The shopper is sent to the login page with an error. No cached product details can be used.

- **TC-32: Logged-out shopper opens the URL of a product that does not exist**
  - AC: 6, 7
  - Type: Edge
  - Preconditions: Shopper is not logged in.
  - Steps:
    1. Go directly to the details page URL with ID 9999.
  - Expected result: The shopper is redirected to the login page with an error, not to "item not found". The login check comes first.

- **TC-33: Session lost while on a details page**
  - AC: 7
  - Type: Edge
  - Preconditions: Shopper is logged in and on a details page.
  - Steps:
    1. Delete the session cookie or storage (or let the session expire).
    2. Refresh the page, or click "Add to cart".
  - Expected result: The shopper is sent to the login page with an error, and the cart is not changed.
