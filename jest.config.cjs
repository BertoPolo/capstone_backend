module.exports = {
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)", "**/__tests__/**/*.cjs", "**/?(*.)+(spec|test).cjs"],
  extensionsToTreatAsEsm: [".jsx", ".ts", ".tsx"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
}
