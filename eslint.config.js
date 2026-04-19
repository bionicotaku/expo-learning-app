// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/components/**",
      "src/constants/**",
      "src/hooks/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/components/themed-text",
              message: "Use the Editorial Paper theme primitives instead of the legacy ThemedText entrypoint.",
            },
            {
              name: "@/components/themed-view",
              message: "Use the Editorial Paper theme primitives instead of the legacy ThemedView entrypoint.",
            },
            {
              name: "@/constants/theme",
              message: "Legacy theme constants are frozen. Use shared/theme/editorial-paper instead.",
            },
            {
              name: "@/hooks/use-theme",
              message: "Legacy theme hooks are frozen. Use useEditorialPaperTheme instead.",
            },
          ],
        },
      ],
    },
  },
]);
