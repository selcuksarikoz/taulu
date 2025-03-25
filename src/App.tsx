import { JSX, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./app.css";

import { MacOSDock } from "./Components/MacOSDock";
import { StickyNote } from "./Components/StickyNote.tsx";
import { DraggableIframe } from "./Components/DraggableIframe.tsx";
import { SettingsModal } from "./Components/SettingsModal.tsx";
import { AddWebsiteModal } from "./Components/AddWebSiteModal.tsx";
import { WebsiteSelectionModal } from "./Components/WebsiteSelectionModal.tsx";
import { UserModal } from "./Components/UserModal.tsx";
import { extractYouTubeVideoUrl } from "./Utils/embedYoutube.ts";
import { mapDimensions } from "./Utils/mapDimensions.ts";

function App(): JSX.Element {
  // Create refs for interactive elements
  const dockRef = useRef<HTMLDivElement>(null);

  const [isQuickbarOpen, setQuickbarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAddWebsiteOpen, setIsAddWebsiteOpen] = useState<boolean>(false);
  const [isUserModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [apps, setApps] = useState<IAppModel[]>([]);

  useLayoutEffect(() => {
    const loadPreferences = async () => {
      try {
        // Get settings from main process via the electronAPI bridge
        const isDarkMode = await window?.electronAPI?.ipcRenderer.invoke(
          "get-preference",
          "darkMode",
        );

        if (isDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };

    loadPreferences();
  }, []);

  function openWebSiteModal() {
    setIsAddWebsiteOpen(true);
  }

  function closeModals() {
    setQuickbarOpen(false);
    setIsSettingsOpen(false);
    setIsAddWebsiteOpen(false);
    setUserModalOpen(false);
  }

  useEffect(() => {
    const fetchIPC = async () => {
      // get all saved widgets
      try {
        const allWidgets =
          await window?.electronAPI?.ipcRenderer?.invoke("get-widgets");

        // create loop get key and value in allwidgets
        for (const [_, v] of Object.entries(allWidgets)) {
          const value = v as IAppModel;
          if (value.type === "webview") {
            setApps((prev) => [
              ...prev,
              {
                ...value,
              },
            ]);
          } else if (value.type === "note") {
            setApps((prev) => [
              ...prev,
              {
                ...value,
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch widgets:", error);
      }

      // Initially set window to always be on top
      window?.electronAPI?.ipcRenderer?.invoke("set-always-on-top", true);
      // IMPORTANT: Initially set to capture all clicks to ensure drock works
      window?.electronAPI?.ipcRenderer?.send("set-ignore-mouse-events", false);

      window?.electronAPI?.ipcRenderer?.on("open-web-widget", openWebSiteModal);
      window?.electronAPI?.ipcRenderer?.on("close-modals", closeModals);
    };

    fetchIPC();

    const handleMouseMove = (e: MouseEvent) => {
      // Get the element under cursor
      const target = e.target as HTMLElement;

      // Check if cursor is over dock or sponsored content
      const isDockArea = dockRef.current?.contains(target);

      // Also check for notes and iframes
      const isNoteArea = target.closest(".sticky-note") !== null;
      const isIframeArea = target.closest(".draggable-iframe") !== null;
      const isModalArea = target.closest(".modal") !== null;

      // Determine if we should capture clicks (any interactive UI element)
      const shouldCaptureClicks =
        isDockArea || isNoteArea || isIframeArea || isModalArea;

      // Use electron API to toggle click-through behavior
      if (window.electronAPI?.ipcRenderer) {
        // If over interactive elements, capture clicks
        // Otherwise, pass clicks through to apps underneath
        window.electronAPI.ipcRenderer.send(
          "set-ignore-mouse-events",
          !shouldCaptureClicks,
          { forward: true },
        );
      }
    };

    // Add event listener
    document.addEventListener("mousemove", handleMouseMove);

    // Clean up
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // website
  async function addWebSite(url: string, user_agent?: string) {
    const isYoutube = extractYouTubeVideoUrl(url);
    const { width, height } = mapDimensions(url);

    console.log(width, height);

    const id = Date.now().toString();

    const web: IAppModel = {
      id,
      dimensions: {
        width,
        height,
      },
      user_agent,
      type: "webview",
      content: isYoutube || url,
      zIndex: 1,
      color: "blueberry",
      fontSize: 16,
      position: {
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2 - 150,
      },
    };

    window?.electronAPI?.ipcRenderer.invoke("create-widget", id, web);

    setApps((prev) => [...prev.map((it) => ({ ...it, zIndex: 0 })), web]);
  }

  async function addNewNote() {
    const id = Date.now().toString();
    const note: IAppModel = {
      id,
      content: "",
      position: {
        x: window.innerWidth / 2 - 150,
        y: window.innerHeight / 2 - 150,
      },
      dimensions: {
        width: 300,
        height: 300,
      },
      zIndex: 0, // Start with zIndex 0
      color: "blueberry",
      fontSize: 16,
      type: "note",
    };

    // Set all existing notes to zIndex 0, and new note to zIndex 1
    setApps((prev) => {
      const updatedNotes = prev.map((existingNote) => ({
        ...existingNote,
        zIndex: 0,
      }));
      return [...updatedNotes, { ...note, zIndex: 1 }];
    });

    window?.electronAPI?.ipcRenderer.invoke("create-widget", id, note);
  }

  async function deleteWidget(id: string) {
    setApps((prev) => [...prev.filter((widget) => widget.id !== id)]);
    window?.electronAPI?.ipcRenderer.invoke("delete-widget", id);
  }

  async function updateWidget(model: IAppModel) {
    setApps((prev) => {
      return prev.map((widget) => {
        if (widget.id === model.id) {
          return { ...model, zIndex: 1 };
        } else {
          return { ...widget, zIndex: 0 };
        }
      });
    });
    window?.electronAPI?.ipcRenderer.invoke("create-widget", model.id, model);
  }

  return (
    <>
      {/* Content area containing notes and web frames */}
      <div>
        {apps?.map((app) => {
          if (app.type === "note") {
            return (
              <StickyNote
                key={app.id}
                initialModel={app}
                onDelete={deleteWidget}
                onChange={updateWidget}
                className="sticky-note"
              />
            );
          } else if (app.type === "webview") {
            return (
              <DraggableIframe
                key={app.id}
                initialModel={app}
                onDelete={deleteWidget}
                onChange={updateWidget}
                className="draggable-iframe"
              />
            );
          }
        })}
      </div>

      {/* MacOS Dock at the bottom */}
      <div ref={dockRef} className="h-[80px] w-fit bottom-0 absolute z-[1]">
        <MacOSDock
          onAddNewStickyNote={addNewNote}
          showWebSiteModal={() => setIsAddWebsiteOpen(true)}
          showSettingsModal={() => setIsSettingsOpen(true)}
          showQuickbar={() => setQuickbarOpen(true)}
          showUserModal={() => setUserModalOpen(true)}
        />
      </div>

      {/* Modals */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          className="modal"
        />
      )}

      {isAddWebsiteOpen && (
        <AddWebsiteModal
          onClose={() => setIsAddWebsiteOpen(false)}
          onAddWebsite={addWebSite}
          className="modal"
        />
      )}

      {isQuickbarOpen && (
        <WebsiteSelectionModal
          onClose={() => setQuickbarOpen(false)}
          onSelected={({ src, user_agent }) => addWebSite(src, user_agent)}
          className="modal"
        />
      )}

      {isUserModalOpen && (
        <UserModal onClose={() => setUserModalOpen(false)} className="modal" />
      )}
      {/*modals done*/}
    </>
  );
}

export default App;
