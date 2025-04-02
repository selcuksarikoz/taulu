import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  screen,
  session,
  Tray,
} from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { getImageForTray } from "./Utils/getImageForTray.ts";
import { SimpleStore } from "./Utils/storage.ts";

let tray;
let mainWindow: BrowserWindow;
let isVisible = true;

app.setAsDefaultProtocolClient("taulu");

const store = new SimpleStore({ name: "settings" });
const widgetStore = new SimpleStore({ name: "savedApps" });

// Properly handle paths for both development and production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reduce GPU acceleration flags that might cause issues
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("disable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");

async function createWindow() {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    let lastDisplayId = screen.getPrimaryDisplay().id;

    // Simplified window creation with more compatible settings
    mainWindow = new BrowserWindow({
      width: primaryDisplay.workAreaSize.width,
      height: primaryDisplay.workAreaSize.height,
      x: primaryDisplay.workArea.x,
      y: primaryDisplay.workArea.y,
      transparent: true,
      frame: false,
      resizable: false,
      center: true,
      maximizable: true,
      alwaysOnTop: true,
      backgroundColor: "#00000000",
      icon: path.join(__dirname, "../images/icon.png"),
      hasShadow: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        webviewTag: true,
      },
    });

    console.log("Initial window setup complete");

    if (process.env.NODE_ENV === "development") {
      await mainWindow.loadURL("http://localhost:3000");
      // mainWindow.webContents.openDevTools({ mode: "detach" });
    } else {
      // Use the proper file:// protocol and absolute path to index.html
      await mainWindow.loadFile("../dist/index.html");
    }

    mainWindow.on("hide", () => {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents
          .executeJavaScript(
            `
          document.body.style.opacity = '0';
          setTimeout(() => { document.body.style.opacity = '1'; }, 50);
        `,
          )
          .catch((err) => console.error("Error in hide event:", err));
      }
    });

    // Remove automation-revealing headers
    session.defaultSession.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        const headers = { ...details.requestHeaders };
        delete headers["Sec-Fetch-Mode"];
        delete headers["Sec-Fetch-Site"];
        delete headers["Sec-Fetch-User"];
        delete headers["Sec-Fetch-Dest"];
        delete headers["X-Electron-Version"];
        callback({ cancel: false, requestHeaders: headers });
      },
    );

    // app moved to another screen change the width height
    // Add event listener for display changes
    // Use a debounced approach to prevent loops
    let resizeTimeout: string | number | NodeJS.Timeout | undefined;

    mainWindow.on("moved", () => {
      // Clear any pending resize operations
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        // Get current window position
        const windowBounds = mainWindow.getBounds();
        const windowCenter = {
          x: windowBounds.x + windowBounds.width / 2,
          y: windowBounds.y + windowBounds.height / 2,
        };

        // Find which display the window is ACTUALLY on
        const currentDisplay = screen.getDisplayNearestPoint(windowCenter);

        // Only resize if we've actually changed displays
        if (currentDisplay.id !== lastDisplayId) {
          lastDisplayId = currentDisplay.id;

          // Set a flag to prevent event recursion
          const originalBounds = mainWindow.getBounds();
          const newBounds = currentDisplay.workArea;

          // Only set bounds if they actually need to change
          if (
            originalBounds.width !== newBounds.width ||
            originalBounds.height !== newBounds.height ||
            originalBounds.x !== newBounds.x ||
            originalBounds.y !== newBounds.y
          ) {
            mainWindow.setBounds(newBounds);
          }
        }

        resizeTimeout = undefined;
      }, 0); // Debounce time of 300ms
    });
  } catch (error) {
    console.error("Error creating window:", error);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on("ready", () => {
  try {
    createWindow();
  } catch (error) {
    console.error("Failed to create window on ready event:", error);
  }
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

setupIPC();

// Create or update tray icon
async function createTrayIcon(pictureUrl?: string) {
  try {
    let trayIcon;
    const iconPath = path.join(__dirname, "../../images/tray-icon.png");

    console.log(iconPath);

    if (pictureUrl) {
      // Get image from URL
      trayIcon = await getImageForTray(pictureUrl);

      // If failed to get image, use default
      if (!trayIcon) {
        trayIcon = nativeImage.createFromPath(iconPath);
      }
    } else {
      // Use default icon with proper path
      trayIcon = nativeImage.createFromPath(iconPath);
    }

    // Resize icon to appropriate size for tray (16x16 or 32x32 recommended)
    trayIcon = trayIcon.resize({ width: 16, height: 16 });

    // Create tray with icon
    tray = new Tray(trayIcon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Open app",
        click: () => displayApp(),
      },
      {
        label: "Quit App",
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setToolTip("This is my application.");
    tray.setContextMenu(contextMenu);

    return tray;
  } catch (error) {
    console.error("Error creating tray icon:", error);
    // Fallback to default icon with proper path
    tray = new Tray(path.join(__dirname, "../images/tray-icon.png"));
    return tray;
  }
}

app.whenReady().then(async () => {
  try {
    // Reduced GPU command line switches to avoid compatibility issues
    app.commandLine.appendSwitch("enable-gpu-rasterization");

    await createTrayIcon();

    try {
      globalShortcut.register("CommandOrControl+t", () => {
        if (isVisible) {
          isVisible = false;
          mainWindow.hide();
        } else {
          isVisible = true;
          mainWindow.show();
        }
      });

      globalShortcut.register("CommandOrControl+.", () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send("open-web-widget");
      });

      globalShortcut.register("Escape", () => {
        mainWindow.webContents.send("close-modals");
      });
    } catch (error) {
      console.error("Failed to register global shortcut:", error);
    }

    // return saved widgets
    ipcMain.handleOnce("get-widgets", (_event) => {
      return widgetStore.getAll();
    });

    // Check stored preferences and apply auto-start settings
    const autoStart = store.get("autoStart");
    if (autoStart === true) {
      if (process.platform === "darwin") {
        configureMacOSAutoStart(true);
      } else if (process.platform === "win32") {
        configureWindowsAutoStart(true);
      }
    }
  } catch (error) {
    console.error("Error in whenReady:", error);
  }
});

async function displayApp() {
  try {
    if (mainWindow && mainWindow.webContents) {
      await mainWindow.webContents.executeJavaScript(`
        document.body.style.opacity = '0';
        requestAnimationFrame(() => {
          document.body.style.opacity = '1';
        });
      `);

      if (!isVisible) {
        isVisible = true;
        mainWindow.show();
      }

      mainWindow.focus();
    } else {
      createWindow();
    }
  } catch (error) {
    console.error("Error in displayApp:", error);
    // Try to recreate the window if there was an error
    createWindow();
  }
}

// Configure macOS auto-start and background mode
async function configureMacOSAutoStart(enable: boolean) {
  try {
    app.setLoginItemSettings({
      openAtLogin: enable,
      openAsHidden: true, // Start in background
    });

    if (enable) {
      app.setActivationPolicy("accessory"); // App won't show in Dock
    } else {
      app.setActivationPolicy("regular"); // App shows in Dock
    }
  } catch (error) {
    console.error("Error configuring macOS auto-start:", error);
  }
}

// Configure Windows auto-start
async function configureWindowsAutoStart(enable: boolean) {
  try {
    app.setLoginItemSettings({
      openAtLogin: enable,
      // For Windows, you can also specify arguments to open minimized if needed
      args: ["--minimized"],
    });
  } catch (error) {
    console.error("Error configuring Windows auto-start:", error);
  }
}

// Set up IPC handlers for the renderer process
async function setupIPC() {
  // Get a preference value
  ipcMain.handle("get-preference", (_event, key) => {
    return store.get(key);
  });

  // Save a preference value
  ipcMain.handle("save-preference", async (_event, key, value) => {
    store.set(key, value);
    return true;
  });

  // save and get widgets
  ipcMain.handle("create-widget", async (_event, key, value) => {
    widgetStore.set(key, value);
    return true;
  });
  ipcMain.handle("delete-widget", async (_event, key) => {
    widgetStore.delete(key);
    return true;
  });

  // Set up auto-start and background mode
  ipcMain.handle("set-auto-start", (_event, enable) => {
    // Configure auto-start at login
    if (process.platform === "darwin") {
      // macOS
      configureMacOSAutoStart(enable);
    } else if (process.platform === "win32") {
      // Windows
      configureWindowsAutoStart(enable);
    }
    return true;
  });

  // Define any other IPC handlers here
  ipcMain.handle("hide-window", () => {
    isVisible = false;
    if (mainWindow) {
      // For macOS, hide instead of minimize for better UX
      if (process.platform === "darwin") {
        app.hide();
      } else {
        // For Windows/Linux, just hide the window
        mainWindow.hide();
      }
      return true;
    }
    return false;
  });

  ipcMain.handle("quit", () => {
    app.quit();
  });

  // Handle click-through behavior
  ipcMain.on("set-ignore-mouse-events", (_event, ignore, options) => {
    if (mainWindow) {
      mainWindow.setIgnoreMouseEvents(ignore, options);
    }
  });

  // Toggle always-on-top mode
  ipcMain.handle("set-always-on-top", (_event, flag) => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(flag);
      return true;
    }
    return false;
  });
}

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
