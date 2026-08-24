const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/*", ".expo/*", "src/components/animated-icon*", "src/components/app-tabs*", "src/components/external-link.tsx", "src/components/hint-row.tsx", "src/components/themed-*.tsx", "src/components/web-badge.tsx", "src/hooks/*"] },
]);
