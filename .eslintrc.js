module.exports = {
  extends: [
    'eslint-config-alloy/react',
    'eslint-config-alloy/typescript',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
  },
  rules: {
    'indent': [
        'error',
        2,
        {
            SwitchCase: 1,
            flatTernaryExpressions: true
        }
    ],
    'no-case-declarations': 'off',
    'object-curly-spacing': [
      'error',
      'always',
      {
        arraysInObjects: true,
        objectsInObjects: true,
      }
    ],
    'no-return-await': 'off',
    'no-unused-vars': 'warn',
    'comma-dangle': ['error', 'always-multiline'],
    'function-paren-newline': 'off',
    'no-useless-constructor': 'off',
    'no-undefined': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-confusing-arrow': 'off',
    'no-param-reassign': 'off',
    'no-implicit-coercion': 'off',
    'guard-for-in': 'off',
    'spaced-comment': 'off',
    'complexity': 'off',

    // TypeScript
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        SwitchCase: 1,
        flatTernaryExpressions: true
      }
    ],
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/prefer-function-type': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    '@typescript-eslint/spaced-comment': 'off',
    '@typescript-eslint/no-var-requires': 'off',

    // React
    'react/jsx-indent': 'off',
    'react/jsx-indent-props': 'off',
    'react/jsx-closing-bracket-location': 'off',
    'react/sort-comp': 'off',
    'react/jsx-curly-newline': 'off',
  },
};
