import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const disabledReactRules = Object.fromEntries(
  [...coreWebVitals, ...nextTypescript]
    .flatMap((config) => Object.keys(config.rules || {}))
    .filter((rule) => rule.startsWith('react/'))
    .map((rule) => [rule, 'off']),
);

const disabledReactHooksRules = Object.fromEntries(
  [...coreWebVitals, ...nextTypescript]
    .flatMap((config) => Object.keys(config.rules || {}))
    .filter((rule) => rule.startsWith('react-hooks/'))
    .map((rule) => [rule, 'off']),
);

export default [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'eslint.config.mjs',
      'next-env.d.ts',
    ],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: disabledReactRules,
  },
  {
    rules: {
      ...disabledReactHooksRules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
