import eslintPluginImport from 'eslint-plugin-import'
// import eslintPluginPrettier from 'eslint-plugin-prettier'
// import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    files: ['**/*.js'],

    ignores: ['node_modules', 'dist', 'coverage', '.env'],

    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },

    plugins: {
      import: eslintPluginImport,
      // prettier: eslintPluginPrettier,
    },

    rules: {
      // --- Giữ các rule cũ ---
      'import/no-unresolved': 'error',
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-console': 'off',

      // ❌ Xoá hoặc comment toàn bộ rule prettier bên dưới
      // 'prettier/prettier': [
      //   'error',
      //   {
      //     singleQuote: true,
      //     semi: false,
      //     trailingComma: 'es5',
      //     printWidth: 100,
      //     tabWidth: 2,
      //   },
      // ],
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
