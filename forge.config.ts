import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";

import dotenv from "dotenv";

dotenv.config();

console.log("APPLE_ID set:", !!process.env.APPLE_ID);
console.log("APPLE_PASSWORD set:", !!process.env.APPLE_PASSWORD);
console.log("APPLE_TEAM_ID set:", !!process.env.APPLE_TEAM_ID);
console.log("APPLE_IDENTITY set:", !!process.env.APPLE_IDENTITY);

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    universal: true,
    icon: "./images/icon", // Make sure to add the proper extension per platform: .ico for Windows, .icns for macOS
    extraResource: ["./dist", "./images"], // Include both dist and images folders as resources
    nodeGypRebuild: true,
    osxSign: process.env.APPLE_ID
      ? {
          identity: process.env.APPLE_IDENTITY,
          entitlements: "build/entitlements.mac.plist",
          entitlementsInherit: "build/entitlements.mac.plist",
          hardenedRuntime: true,
          gatekeeperAssess: false,
        }
      : undefined,
    osxNotarize: process.env.APPLE_ID
      ? {
          appleId: process.env.APPLE_ID,
          appleIdPassword: process.env.APPLE_PASSWORD,
          teamId: process.env.APPLE_TEAM_ID,
        }
      : undefined,
  } as any,
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: "taulu",
      setupIcon: "./images/icon.ico",
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerDMG({
      icon: "./images/icon.icns",
      background: "./images/dmg-background.png",
    }),
    new MakerRpm({
      options: {
        productName: "Taulu",
        icon: "./images/icon.png",
      },
    }),
    new MakerDeb({
      options: {
        icon: "./images/icon.png",
      },
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
