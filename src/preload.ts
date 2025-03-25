// preload.js

import { contextBridge, ipcRenderer } from "electron";

// Expose IPC APIs to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  ipcRenderer: {
    // For invoke methods (that return promises)
    invoke: (channel: string, ...args: any[]) => {
      // List of allowed channels for invoke
      const validChannels = [
        "quit",
        "get-preference",
        "save-preference",
        "set-auto-start",
        "hide-window",
        "auth-start",
        "auth-refresh",
        "auth-logout",
        "set-always-on-top",
        "set-ignore-mouse-events",

        "get-widgets",
        "create-widget",
        "delete-widget",

        "clear-gpu",
      ];

      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }

      return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`));
    },

    on: (channel, listener) => {
      const validChannels = [
        "auth-refresh-failed",
        "auth-success",
        "open-web-widget",
        "close-modals",
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (_event, ...args) => listener(...args));
        return true;
      }

      return false;
    },

    // For send methods (fire and forget)
    send: (channel: string, ...args: any[]) => {
      // List of allowed channels for send
      const validSendChannels = ["set-ignore-mouse-events"];

      if (validSendChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args);
      }
    },
  },
});
