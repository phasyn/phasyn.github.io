// Lint gate (pnpm lint): typed typescript-eslint, React (ESLint React and the React team's hooks rules), JSX
// accessibility and DOM injection sinks. Warnings fail the run (--max-warnings 0).
import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['build/', '.react-router/', 'public/']),
  { linterOptions: { reportUnusedDisableDirectives: 'error', reportUnusedInlineConfigs: 'error' } },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      eslintReact.configs['strict-type-checked'],
      reactHooks.configs.flat.recommended,
      jsxA11y.configs.strict,
      noUnsanitized.configs.recommended,
    ],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
  },
  {
    // Plain JavaScript: this file and the social-card renderer (Node, plus page.evaluate callbacks that run in Chrome).
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended, noUnsanitized.configs.recommended],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
