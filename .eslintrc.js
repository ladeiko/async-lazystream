module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'google',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'prefer-spread': 'off',
    'prefer-rest-params': 'off',
    'max-len': ['error', {'code': 120}],
    'require-jsdoc': ['error', {
      'require': {
        'FunctionDeclaration': false,
        'MethodDefinition': false,
        'ClassDeclaration': false,
        'ArrowFunctionExpression': false,
        'FunctionExpression': false,
      },
    }],
  },
};
