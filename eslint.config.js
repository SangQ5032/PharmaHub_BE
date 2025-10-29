// import eslintPluginImport from "eslint-plugin-import"
// import eslintPluginPrettier from "eslint-plugin-prettier"
// import eslintConfigPrettier from "eslint-config-prettier"

// export default {
//   files: ["**/*.js"],
//   languageOptions: {
//     ecmaVersion: 2021,
//     sourceType: "module",
//   },
//   env: {
//     node: true,
//     es2021: true,
//   },
//   plugins: {
//     import: eslintPluginImport,
//     prettier: eslintPluginPrettier,
//   },
//   rules: {
//     // --- Rules sẵn có của bạn ---
//     "import/no-unresolved": "error",
//     "no-undef": "error",
//     "no-unused-vars": "warn",
//     "no-console": "off",

//     // --- Thêm rule của Prettier ---
//     ...eslintConfigPrettier.rules,
//     "prettier/prettier": [
//       "error",
//       {
//         singleQuote: true,
//         semi: false,
//         trailingComma: "es5",
//         printWidth: 100,
//         tabWidth: 2,
//       },
//     ],
//   },
//   settings: {
//     "import/resolver": {
//       node: {
//         extensions: [".js"],
//       },
//     },
//   },
// }
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    files: ['**/*.js'],

    ignores: ['node_modules', 'dist', 'coverage', '.env'],

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },

    plugins: {
      import: eslintPluginImport,
      prettier: eslintPluginPrettier,
    },

    rules: {
      // --- Giữ các rule cũ ---
      'import/no-unresolved': 'error',
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'off',

      // --- Bổ sung rule prettier ---
      ...eslintConfigPrettier.rules,
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
          trailingComma: 'es5',
          printWidth: 100,
          tabWidth: 2,
        },
      ],
    },

    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js'],
        },
      },
    },
  },
]
