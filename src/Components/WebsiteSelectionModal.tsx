import { JSX, useLayoutEffect, useRef, useState } from "react";
import { Star, X } from "lucide-react";
import clsx from "clsx";
import { supabase } from "../Utils/supabase.ts";

export interface IWebSiteModel {
  id: string;
  title: string;
  src: string;
  icon: string;
  width?: number;
  height?: number;
  is_promoted: boolean;
  is_active: boolean;
  user_agent?: string;
  position?: { x: number; y: number };
}

interface WebsiteSelectionModalProps {
  onClose: () => void;
  onSelected: (website: IWebSiteModel) => void;
  className?: string;
}

export function WebsiteSelectionModal({
  onClose,
  onSelected,
  className,
}: WebsiteSelectionModalProps): JSX.Element | null {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [websites, setWebSites] = useState<IWebSiteModel[]>([]);
  const [filter, setFilter] = useState("");

  useLayoutEffect(() => {
    const fetchWebSites = async () => {
      const { data } = await supabase
        .from("websites")
        .select("*")
        .eq("is_active", true);

      if (data?.length) {
        setWebSites(data);
      }
    };

    fetchWebSites();
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleWebsiteClick = (website: IWebSiteModel) => {
    onSelected(website);
    handleClose();
  };

  // create useMemo and filter via filterValue
  const filteredWebsites = websites
    .filter((website) =>
      website.title.toLowerCase().includes(filter.toLowerCase()),
    )
    ?.sort((a, b) => {
      if (a.is_promoted && !b.is_promoted) return -1;
      if (!a.is_promoted && b.is_promoted) return 1;
      return a.title.localeCompare(b.title);
    });

  return (
    <div
      className={clsx(
        "fixed inset-0 bg-[var(--color-smoke-charcoal)]/60 bg-opacity-90 flex items-center justify-center z-9999",
        className,
      )}
    >
      <div
        ref={modalRef}
        className="bg-[var(--color-card)] dark:bg-[var(--color-bg-secondary)] rounded-lg max-w-3xl w-full overflow-hidden transition-all duration-300 ease-out"
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitTransform: "translateZ(0)",
          WebkitFontSmoothing: "antialiased",
          transition:
            "transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] dark:border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
            Select Website
          </h2>
          <button
            onClick={handleClose}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] dark:hover:text-[var(--color-text-primary)] transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Grid Layout */}
        <div className="flex flex-col gap-4 p-6">
          <input
            className={"bg-white rounded-md p-2 outline-none"}
            placeholder={"Filter"}
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-start min-h-[300px] max-h-[300px] overflow-y-auto">
            {filteredWebsites.map((website) => (
              <div
                key={website.id}
                onClick={() => handleWebsiteClick(website)}
                className="flex flex-col items-center p-4 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-primary)] transition-colors duration-200 cursor-pointer"
              >
                <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                  <img
                    src={website.icon}
                    alt={`${website.title} icon`}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-center text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                  {website.title}
                </span>
                {website.is_promoted && (
                  <span className="mt-1 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 text-white dark:text-white shadow-sm">
                    <Star size={12} className="text-white dark:text-white" />
                    Featured
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-primary)] px-6 py-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)] flex justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-secondary)] transition-colors duration-200"
          >
            Cancel
          </button>
          <div className="text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)] flex items-center">
            Click on a website icon to select
          </div>
        </div>
      </div>
    </div>
  );
}
