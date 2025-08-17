import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import unusedImports from 'eslint-plugin-unused-imports'

export default tseslint.config([
    {
        ignores: ['**/dist/**', '**/node_modules/**']
    },
    {
        plugins: { 'unused-imports': unusedImports },
        files: ['**/*.{ts,tsx}'],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['**/dist/**', '*/dist/**', 'dist/**'],
                            message:
                                'Direct imports from dist directories are not allowed. Use proper package imports instead.'
                        },
                        {
                            group: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
                            message:
                                'Do not include file extensions in imports. TypeScript will resolve them automatically.'
                        }
                    ]
                }
            ],
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_'
                }
            ]
        }
    },
    // Prettier config to disable conflicting rules
    prettierConfig
])
