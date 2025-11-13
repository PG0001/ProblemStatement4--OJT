module.exports = {
  plugins: {
    // Tailwind's PostCSS plugin was moved to the `@tailwindcss/postcss` package.
    // Use the new package name so PostCSS can locate the plugin when building.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
