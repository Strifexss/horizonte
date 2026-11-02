// Regras que precisam do type checker ficam fora do eslint.config.js para o lint rápido não montar o programa TypeScript.
import defaultConfig from './eslint.config.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...defaultConfig,
    {
        files: ['resources/js/**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
        },
    },
];
