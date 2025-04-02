import { JSX, memo, useEffect, useRef } from "react";
import { EyeOff, Globe, LayoutPanelTop, Plus, Settings } from "lucide-react";
import { DockItem } from "./DockItem.tsx";
import { useAuth } from "../Context/auth.tsx";
import { createUser, signInWithGoogle, supabase } from "../Utils/supabase.ts";

interface MacOSDockProps {
  onAddNewStickyNote: () => void;
  showWebSiteModal: () => void;
  showSettingsModal: () => void;
  showQuickbar: () => void;
  showUserModal: () => void;
}

export const MacOSDock = memo(
  ({
    onAddNewStickyNote,
    showWebSiteModal,
    showSettingsModal,
    showQuickbar,
    showUserModal,
  }: MacOSDockProps): JSX.Element => {
    const dockRef = useRef<HTMLDivElement>(null);

    const { user, setUser } = useAuth();

    // Handle mouse movement to show/hide dock directly with DOM manipulation
    useEffect(() => {
      setTimeout(() => {
        if (dockRef?.current) {
          dockRef.current.classList.add("translate-x-full");
          dockRef.current.classList.remove("translate-x-0");
        }
      }, 2000);

      window?.electronAPI?.ipcRenderer?.on(
        "auth-success",
        async ({ tokens, user }: { tokens: IToken; user: IGoogleUser }) => {
          if (user) {
            const supaUser = await signInWithGoogle(tokens.id_token!);
            const { data } = await supabase
              .from("users")
              .select("*")
              .eq("google_id", user.id)
              .single();

            setUser({ ...user, is_pro: data?.is_pro || false });

            console.log("USER", { ...user, is_pro: data?.is_pro || false });

            await createUser(
              { ...user, is_pro: data?.is_pro || false },
              supaUser.user.id,
            );
          }
        },
      );

      // window.addEventListener("mousemove", handleMouseMove);
      // return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [dockRef?.current]);

    async function handleAppVisibility() {
      if (window.electronAPI?.ipcRenderer) {
        await window.electronAPI.ipcRenderer.invoke("hide-window");
      }
    }

    async function handleAppQuit() {
      if (window.electronAPI?.ipcRenderer) {
        await window.electronAPI.ipcRenderer.invoke("quit");
      }
    }

    async function googleLogin() {
      if (window.electronAPI?.ipcRenderer) {
        await window.electronAPI.ipcRenderer.invoke("auth-start");
      }
    }

    return (
      <div className="fixed top-1/2 right-0 -translate-y-1/2 flex justify-center items-end z-50 group/dock">
        <div
          className={
            "rounded-full left-8 top-1/2 -translate-y-1/2 absolute w-1 h-[100px] bg-red-600/60 transition-colors opacity-100 group-hover/dock:opacity-0"
          }
        ></div>

        <div
          ref={dockRef}
          className="flex flex-col items-center justify-center gap-2 rounded-full px-1 py-1.5 pointer-events-auto
        bg-[var(--color-cloud-candy-strawberry-light)]/100 dark:bg-[var(--color-card)]
        hover:bg-[var(--color-cloud-candy-strawberry-light)] dark:hover:bg-[var(--color-card)] border
        border-[var(--color-cloud-candy-strawberry)]
        dark:border-[var(--color-border)] transition-all translate-x-0 group-hover/dock:translate-x-0 group-hover/dock:delay-500 ease-linear"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            WebkitTransform: "translateZ(0)",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          <DockItem
            icon={
              <Plus
                size={18}
                className="text-[var(--color-cloud-storm)] transition-colors dark:text-[var(--color-secondary)] dark:group-hover:text-cloud-storm group-hover:text-primary"
              />
            }
            onClick={onAddNewStickyNote}
            tooltip="Add Note"
          />

          <DockItem
            icon={
              <Globe
                size={18}
                className="text-[var(--color-cloud-storm)] transition-colors dark:text-[var(--color-secondary)] dark:group-hover:text-cloud-storm group-hover:text-primary"
              />
            }
            onClick={showWebSiteModal}
            tooltip="Add Website / CMD + ."
          />

          <DockItem
            icon={
              <LayoutPanelTop
                size={18}
                className="text-[var(--color-cloud-storm)] transition-colors dark:text-[var(--color-secondary)] dark:group-hover:text-cloud-storm group-hover:text-primary"
              />
            }
            onClick={showQuickbar}
            tooltip="Shortcuts"
          />

          <DockItem
            icon={
              <Settings
                size={18}
                className="text-[var(--color-cloud-storm)] transition-colors dark:text-[var(--color-secondary)] dark:group-hover:text-cloud-storm group-hover:text-primary"
              />
            }
            onClick={showSettingsModal}
            tooltip="Settings"
          />

          <DockItem
            icon={
              <EyeOff
                size={18}
                className="text-[var(--color-cloud-storm)] transition-colors dark:text-[var(--color-secondary)] dark:group-hover:text-cloud-storm group-hover:text-primary"
              />
            }
            onClick={() => handleAppVisibility()}
            tooltip="Hide / CMD+T"
          />

          <DockItem
            icon={
              <div
                className={"w-[18px] h-[18px] dark:text-red-300 text-red-500"}
              >
                <svg
                  fill="currentColor"
                  width="18px"
                  height="18px"
                  viewBox="0 0 32 32"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>standby</title>
                  <path d="M2.016 18.016q0 2.848 1.088 5.44t2.976 4.448 4.48 3.008 5.44 1.088 5.44-1.088 4.48-3.008 2.976-4.448 1.12-5.44q0-4.128-2.208-7.488t-5.792-5.088v4.608q1.856 1.408 2.912 3.488t1.088 4.48q0 2.72-1.344 5.024t-3.648 3.616-5.024 1.344q-2.016 0-3.872-0.8t-3.2-2.112-2.144-3.2-0.768-3.872q0-2.4 1.056-4.48t2.944-3.488v-4.608q-3.616 1.728-5.824 5.088t-2.176 7.488zM14.016 14.016q0 0.832 0.576 1.408t1.408 0.576 1.408-0.576 0.608-1.408v-12q0-0.832-0.608-1.408t-1.408-0.608-1.408 0.608-0.576 1.408v12z"></path>
                </svg>
              </div>
            }
            onClick={() => handleAppQuit()}
            tooltip="Quit"
          />
        </div>
      </div>
    );
  },
  () => {
    return true;
  },
);
