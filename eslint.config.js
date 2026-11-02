import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import typescript from 'typescript-eslint';

import quality from './eslint-rules/index.cjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
    js.configs.recommended,
    ...typescript.configs.recommended,
    {
        ...react.configs.flat.recommended,
        ...react.configs.flat['jsx-runtime'], // Required for React 17+
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        // Legado acima de 350 linhas fica em warn até zerar; ver docs/quality.md.
        files: ['resources/js/**/*.{ts,tsx}'],
        plugins: { quality },
        rules: {
            'quality/max-lines': ['warn', { ignore: ['resources/js/components/ui/sidebar.tsx'] }],
        },
    },
    {
        files: ['eslint-rules/**/*.cjs'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: { ...globals.node },
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['eslint-rules/**/*.mjs'],
        languageOptions: {
            globals: { ...globals.node },
        },
    },
    {
        ignores: ['vendor', 'node_modules', 'public', 'bootstrap/ssr', 'tailwind.config.js', '.agents', '.claude', '.cursor', 'graphify-out'],
    },
    prettier, // Turn off all rules that might conflict with Prettier
];
