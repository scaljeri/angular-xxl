module.exports = function(config) {
  config.set({
    files: ['test/*.ts'],
    testRunner: "mocha",
    mutator: "typescript",
    transpilers: ["typescript"],
    reporter: ["html", "clear-text", "progress"],
    testFramework: "mocha",
    coverageAnalysis: "off",
    tsconfigFile: "tsconfig.json",
    mutate: ["src/*.ts"]
  });
};
