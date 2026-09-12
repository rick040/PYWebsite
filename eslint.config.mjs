import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescriptConfig from 'eslint-config-next/typescript'

/**
 * eslint-config-next 16 ships native flat config, so it is spread directly.
 * No FlatCompat wrapper.
 */
const config = [
  ...coreWebVitals,
  ...typescriptConfig,
  {
    rules: {
      // The brief forbids `any` and unchecked non-null assertions. These make
      // both a build failure rather than a review comment.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
]

export default config
