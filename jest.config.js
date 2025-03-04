module.exports = {
    preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
    testMatch: [
      "**/__tests__/**/*.[jt]s?(x)",
      "**/?(*.)+(spec|test).[jt]s?(x)"
    ],
    transform: {
      "^.+\\.vue$": "vue-jest",
      "^.+\\js$": "babel-jest"
    },
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    testEnvironment: "jsdom",
    collectCoverage: true,
    collectCoverageFrom: [
      "src/**/*.{js,vue}",
      "!src/main.js",
      "!src/router/index.js",
      "!**/node_modules/**"
    ],
    coverageReporters: ["text", "lcov", "html"],
    globals: {
      'vue-jest': {
        babelConfig: true
      }
    }
  };