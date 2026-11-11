// Complementa o app.json.
// EXPO_BASE_URL e usado apenas no build do GitHub Pages (ex.: "/opio-estudios").
// Em desenvolvimento fica vazio e o site roda na raiz.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
