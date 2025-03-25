// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require("electron-builder");

module.exports = defineConfig({
  appId: "com.kozmonot.taulu",
  productName: "Taulu",
  directories: {
    output: "release",
    buildResources: "resources",
  },
  files: ["dist/**/*", "electron/**/*", "images/**/*"],
  extraResource: ["./dist", "./images"],
  mac: {
    category: "public.app-category.utilities",
    target: ["dmg", "zip"],
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist",
  },
  win: {
    target: ["nsis"],
  },
  linux: {
    target: ["AppImage", "deb"],
    category: "Utility",
  },
});
