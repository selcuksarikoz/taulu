import React, { JSX } from "react";
import { Tooltip } from "./Tooltip.tsx";
import clsx from "clsx";

interface DockItemProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  className?: string;
}

// Dock item component with hover animation
export function DockItem({
  icon,
  onClick,
  tooltip,
  className,
}: DockItemProps): JSX.Element {
  return (
    <Tooltip text={tooltip} position={"left"}>
      <div
        className={clsx(
          "flex items-center justify-center cursor-pointer button-animation p-2 rounded-full shadow-sm hover:shadow-md transition-all group",
          className,
        )}
        onClick={onClick}
      >
        {icon}
      </div>
    </Tooltip>
  );
}
