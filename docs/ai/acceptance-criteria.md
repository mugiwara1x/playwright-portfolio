# Story: Product details page

**As a** logged-in shopper
**I want** to open a product's own page
**So that** I can read about it and add it to my cart from there

## Acceptance criteria

1. From the products list, clicking a product's **name** or its **image** opens that product's details page.
2. The details page shows the product's **name, description, price and image**, matching what the products list shows for it.
3. The shopper can **add** the product to the cart from the details page. The button then reads "Remove" and the cart badge count goes up by one.
4. The shopper can **remove** the product from the details page. The button then reads "Add to cart" and the badge count goes down by one.
5. "**Back to products**" returns to the products list, and the cart keeps its contents.
6. Opening the details page for a product that **does not exist** shows an "item not found" message instead of a product.
7. A shopper who is **not logged in** cannot open a details page and is sent to the login page with an error.
