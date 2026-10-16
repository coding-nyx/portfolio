import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import architecture from './config/eslint/architecture.js';

export default defineConfig([
  globalIgnores([
    'dist',
    'src/vendor/**',
    'functions/lib/**',
    'verification/**',
    'src/components/prototypes/**',
    'src/styles/motionLab.css',
  ]),
  {
    files: ['**/*.{js,jsx,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { react, architecture },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/no-unstable-nested-components': 'error',
      'architecture/module-boundaries': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'framer-motion',
              importNames: ['motion'],
              message: 'Use m components under the shared LazyMotion provider.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'server/**/*.mjs',
      'scripts/**/*.mjs',
      'tests/**/*.{js,mjs}',
      'functions/**/*.mjs',
      'config/**/*.js',
      '*.{js,mjs}',
    ],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/app/**/*.{js,jsx}', 'src/features/**/*.{js,jsx}', 'src/shared/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'framer-motion',
              importNames: ['motion'],
              message: 'Use m components under the shared LazyMotion provider.',
            },
          ],
          patterns: [
            {
              group: ['firebase', 'firebase/*', '@emailjs/browser'],
              message: 'Integration SDKs belong in src/services, not UI modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['server/**/*.mjs'],
    plugins: { architecture },
    rules: { 'architecture/module-boundaries': 'error' },
  },
]);
