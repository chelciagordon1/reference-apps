module.exports = {
  testEnvironment: "jsdom",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "reports",
        outputName: "jest-junit.xml",
        ancestorSeparator: " › ",
        uniqueOutputName: "false",
        suiteNameTemplate: "{filepath}",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
  ],
  // moduleNameMapper: {
  //   "\\.(css)$": "<rootDir>/../../__mocks__/styleMock.ts",
  // },
};
