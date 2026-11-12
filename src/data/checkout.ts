export type CustomerInfo = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export const customer: CustomerInfo = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  postalCode: '11000',
};

// saucedemo charges a flat 8% tax on the item total.
export const TAX_RATE = 0.08;

// One row per required field: which field is left empty and the error the page should show.
export const missingFieldCases: { field: keyof CustomerInfo; error: string }[] = [
  { field: 'firstName', error: 'Error: First Name is required' },
  { field: 'lastName', error: 'Error: Last Name is required' },
  { field: 'postalCode', error: 'Error: Postal Code is required' },
];
