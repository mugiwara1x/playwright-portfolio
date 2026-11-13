import path from 'node:path';
import { test as base } from './test';

/**
 * Where the auth setup project saves the logged-in browser state (cookies + localStorage).
 * The folder is gitignored: a saved session is a credential.
 */
export const STANDARD_USER_STATE = path.join(__dirname, '../../playwright/.auth/standard-user.json');

/**
 * The same `test` as './test' (all page-object fixtures included), but every browser context
 * starts from the saved session, so tests begin already logged in as standard_user.
 *
 * `storageState` is a built-in Playwright option fixture. Overriding it here means the `page`
 * fixture is created in a context that loads this file, instead of a blank one.
 */
export const test = base.extend({
  storageState: STANDARD_USER_STATE,
});

export { expect } from '@playwright/test';
