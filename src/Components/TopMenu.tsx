import { Hand, Trash } from "lucide-react";
import React, { useEffect, useRef } from "react";
import clsx from "clsx";

export default function TopMenu({
  handleDelete,
  handleMouseDown,
  zIndex,
  className,
}: {
  handleDelete: (e: React.MouseEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  zIndex: number;
  className?: string;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.style.transform = "translateY(20px)";
      menuRef.current.style.opacity = "0";

      requestAnimationFrame(() => {
        if (menuRef.current) {
          menuRef.current.style.transform = "translateY(0)";
          menuRef.current.style.opacity = "1";
        }
      });
    }
  }, []);

  return (
    <div
      className={clsx(
        "absolute bottom-1 transition-all w-fit left-1 flex justify-center items-end pointer-events-none",
        className,
      )}
      style={{
        zIndex: zIndex + 1, // Make sure it's above the note
      }}
    >
      <div
        ref={menuRef}
        className={`
          flex items-center justify-center
          rounded-2xl py-1.5 px-2
          pointer-events-auto shadow-md
          bg-[var(--color-cloud-candy-strawberry-light)] dark:bg-[var(--color-card)]
          hover:bg-[var(--color-cloud-candy-strawberry-light)] dark:hover:bg-[var(--color-card)]
          border border-[var(--color-cloud-candy-strawberry)] dark:border-[var(--color-border)]
          transition-all duration-300 ease-out
        `}
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
        <div className="flex items-center space-x-3">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full shadow-md
                       hover:bg-[var(--color-cloud-candy-strawberry)] dark:hover:bg-[var(--color-card)]
                       transition-colors duration-200"
            onClick={handleDelete}
          >
            <Trash
              size={18}
              className="text-[var(--color-candy-strawberry)] dark:text-[var(--color-danger)]"
            />
          </button>

          <div
            className="w-8 h-8 flex items-center justify-center rounded-full shadow-md
                      hover:bg-[var(--color-cloud-candy-mint)] dark:hover:bg-[var(--color-card)] cursor-grab drag-handle
                      transition-colors duration-200"
            onMouseDown={handleMouseDown}
          >
            <Hand
              size={18}
              className="text-[var(--color-candy-mint)] dark:text-[var(--color-secondary)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
