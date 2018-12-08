module.exports = function(config) {
  config.set({
    files: ['test/*.ts', 'src/*.ts'],
    mutator: "typescript",
    packageManager: "yarn",
    reporters: ["html", "clear-text", "progress"],
    testRunner: "mocha",
    transpilers: ['babel'],
    testFramework: "mocha",
    coverageAnalysis: "off",
    tsconfigFile: "tsconfig.json",
    mutate: ["src/*.ts"],
    mochaOptions: {
        files: ['test/*.ts']
    }
  });
};
