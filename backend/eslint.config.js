import globals from 'globals'
import tseslint from 'typescript-eslint'
import baseConfig from '../eslint.config.js'

export default tseslint.config([
    ...baseConfig,
    {
        files: ['**/*.{ts,js}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.node
        }
    }
])
