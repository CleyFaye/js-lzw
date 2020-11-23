const {readFileSync} = require("fs");
const loadGruntTasks = require("load-grunt-tasks");
const tscConfig = require("./tsconfig.json");

const BUILD_DIR = tscConfig.compilerOptions.outDir;
const LICENSE_FILE = "LICENSE.header";

const getLicenseJs = () => [
  "/*!",
  " * @preserve",
  " * @license",
  ...readFileSync(LICENSE_FILE, "utf8")
    .trim()
    .split("\n")
    .map(line => ` * ${line}`),
  " */",
].join("\n");

module.exports = grunt => {
  loadGruntTasks(grunt);
  grunt.initConfig({
    clean: {
      "build": [
        BUILD_DIR,
        "*.tsbuildinfo",
        "**/*.cache",
      ],
    },
    ts: {"build": {tsconfig: "./tsconfig.json"}},
    usebanner: {
      "build": {
        options: {banner: getLicenseJs()},
        files: [
          {
            expand: true,
            cwd: BUILD_DIR,
            src: ["**/*.js"],
          },
        ],
      },
    },
  });

  grunt.registerTask(
    "build",
    "Build the library for release",
    [
      "ts:build",
      "usebanner:build",
    ],
  );
  grunt.registerTask(
    "default",
    "build",
  );
};
