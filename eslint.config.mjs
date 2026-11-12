import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    // Playwright-specific rules only for test files, e.g. "no missing await on expect".
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
  },

  {
    // Catches forgotten `await` on Playwright calls, the most common Playwright bug.
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },

  // Must be last: turns off any ESLint rule that would fight with Prettier's formatting.
  prettier,
);
