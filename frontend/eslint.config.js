import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/dist/**', '*/dist/**', 'dist/**'],
              message: 'Direct imports from dist directories are not allowed. Use proper package imports instead.',
            },
            {
              group: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
              message: 'Do not include file extensions in imports. TypeScript will resolve them automatically.',
            },
          ],
        },
      ],
    },
  },
])
