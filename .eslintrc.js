module.exports = {
  extends: [
    'eslint-config-alloy/typescript-react',
  ],
  globals: {
  },
  rules: {
    // @fixable 一个缩进必须用两个空格替代
    'indent': [
        'off',
    ],
    'react/jsx-indent-props': 'off',
    'typescript/member-ordering': 'off',
    'object-curly-spacing': [
      'error',
      'always',
      {
        arraysInObjects: true,
        objectsInObjects: true,
      }
    ],
    'no-return-await': 'off',
    'react/jsx-closing-bracket-location': 'off',
  },
  parser: 'babel-eslint',
  plugins: ['typescript'],
};
