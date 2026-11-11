// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'apps-script/*'],
  },
  {
    // Falsos positivos conhecidos do React Compiler com valores compartilhados do Reanimated
    // (`sv.value = ...` e o jeito oficial de animar) e com sincronizacao de estado em efeitos.
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
