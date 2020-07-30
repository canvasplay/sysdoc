var sysdoc = require("./index.js");

sysdoc.publish({
  files: ["fixtures/index.scss"],
  //files: ['parser/**/*.*'],
  outputPath: "docs/",
  templates: ["template/**/*.tpl", "custom/templates/**/*.tpl"],
  title: "System Docs",
  description: "Design System Documentation Generator",
  readme: "fixtures/readme.md",
  rootPath: "",
  customPaths: {
    test: "testing/custom/path/",
    examples: "test/examples/",
  },
  version: "1.0.0",
  ignorePackage: false,
  css: [
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "../template/styles/styles.css",
  ],
  js: [],
});
