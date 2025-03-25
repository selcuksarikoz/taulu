import { JSX, useEffect, useRef, useState } from "react";
import { Moon, Sun, X } from "lucide-react";
import clsx from "clsx";

interface SettingsModalProps {
  onClose: () => void;
  className?: string;
}

export function SettingsModal({
  onClose,
  className,
}: SettingsModalProps): JSX.Element | null {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [autoStartOnLogin, setAutoStartOnLogin] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Apply dark mode class to body when the setting changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Check for saved preferences on initial load
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Get settings from main process via the electronAPI bridge
        const darkMode = await window?.electronAPI?.ipcRenderer.invoke(
          "get-preference",
          "darkMode",
        );
        const autoStart = await window?.electronAPI?.ipcRenderer.invoke(
          "get-preference",
          "autoStart",
        );

        setIsDarkMode(darkMode);
        setAutoStartOnLogin(autoStart);
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };

    loadPreferences();
  }, []);

  // Save settings when they change
  const saveSettings = async (key: string, value: boolean) => {
    try {
      // Save setting via the electronAPI bridge
      await window?.electronAPI?.ipcRenderer.invoke(
        "save-preference",
        key,
        value,
      );

      // If changing autoStart, update login items and background mode on macOS
      if (key === "autoStart") {
        // Configure app for auto-start and background mode on macOS
        await window?.electronAPI?.ipcRenderer.invoke("set-auto-start", value);
      }
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
    }
  };

  // Toggle handlers with persistence
  const handleDarkModeToggle = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    saveSettings("darkMode", newValue);
  };

  const handleAutoStartToggle = () => {
    const newValue = !autoStartOnLogin;
    setAutoStartOnLogin(newValue);
    saveSettings("autoStart", newValue);
  };

  // Modal kapatma işlemi
  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 bg-[var(--color-smoke-charcoal)]/60 bg-opacity-90 flex items-center justify-center z-9999",
        className,
      )}
    >
      <div
        ref={modalRef}
        className="bg-[var(--color-card)] dark:bg-[var(--color-bg-secondary)] rounded-lg max-w-md w-full overflow-hidden transition-all duration-300 ease-out"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] dark:border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
            Settings
          </h2>
          <button
            onClick={handleClose}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] dark:hover:text-[var(--color-text-primary)] transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dark/Light Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <Moon
                  size={20}
                  className="text-[var(--color-candy-blueberry)]"
                />
              ) : (
                <Sun size={20} className="text-[var(--color-candy-lemon)]" />
              )}
              <span className="text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={handleDarkModeToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--color-cloud-shadow)] dark:bg-[var(--color-smoke-deep)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--color-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-candy-blueberry)]"></div>
            </label>
          </div>

          {/* Auto Start on Login */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
              Auto Start on Login
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoStartOnLogin}
                onChange={handleAutoStartToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--color-cloud-shadow)] dark:bg-[var(--color-smoke-deep)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--color-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-candy-blueberry)]"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-primary)] px-6 py-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)] flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[var(--color-candy-blueberry)] text-white rounded-md hover:bg-[var(--color-primary)] dark:bg-[var(--color-primary)] dark:hover:bg-[var(--color-candy-blueberry)] transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
