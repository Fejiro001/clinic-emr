import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist",
    "dist-electron",
    "node_modules",
    "electron-builder.json",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // {
  //   files: ["electron/**/*.ts"],
  //   extends: [js.configs.recommended, tseslint.configs.recommended],
  //   languageOptions: {
  //     ecmaVersion: 2020,
  //     globals: globals.node,
  //     parserOptions: {
  //       projectService: {
  //         allowDefaultProject: ["electron/**/*.ts"],
  //       },
  //       tsconfigRootDir: import.meta.dirname,
  //     },
  //   },
  // },
]);
