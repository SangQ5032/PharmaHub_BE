import eslintPluginImport from "eslint-plugin-import";

export default {
  files: ["**/*.js"],       // Áp dụng cho tất cả file JS trong project
  languageOptions: {
    ecmaVersion: 2021,
    sourceType: "module"
  },
  env: {
    node: true,             // Node.js globals: process, console, __dirname, ...
    es2021: true
  },
  plugins: {
    import: eslintPluginImport
  },
  rules: {
    "import/no-unresolved": "error",   // Import sai highlight đỏ
    "no-undef": "error",               // Biến chưa khai báo highlight đỏ
    "no-unused-vars": "warn",          // Biến khai báo nhưng không dùng -> cảnh báo
    "no-console": "off"                // Cho phép dùng console
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js"]
      }
    }
  }
};
