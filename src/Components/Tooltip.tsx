import { JSX, ReactNode, useRef } from "react";

// Define the position type
type TooltipPosition = "top" | "right" | "bottom" | "left";

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: TooltipPosition; // Optional with default value
}

// Tooltip component that wraps around any element
export function Tooltip({
  text,
  children,
  position = "top",
}: TooltipProps): JSX.Element {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Get position-specific classes
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full mb-2 left-1/2";
      case "right":
        return "left-full ml-2 top-1/2";
      case "bottom":
        return "top-full mt-2 left-1/2";
      case "left":
        return "right-full mr-2 top-1/2";
      default:
        return "bottom-full mb-2 left-1/2";
    }
  };

  // Get arrow position classes
  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "left-1/2 top-full -ml-1 border-t-gray-800";
      case "right":
        return "right-full top-1/2 -mt-1 border-r-gray-800";
      case "bottom":
        return "left-1/2 bottom-full -ml-1 border-b-gray-800";
      case "left":
        return "left-full top-1/2 -mt-1 border-l-gray-800";
      default:
        return "left-1/2 top-full -ml-1 border-t-gray-800";
    }
  };

  // Get initial and final transforms based on position
  const getTransforms = () => {
    switch (position) {
      case "top":
        return {
          initial: "translate(-50%, 8px)",
          final: "translate(-50%, 0)",
        };
      case "right":
        return {
          initial: "translate(-8px, -50%)",
          final: "translate(0, -50%)",
        };
      case "bottom":
        return {
          initial: "translate(-50%, -8px)",
          final: "translate(-50%, 0)",
        };
      case "left":
        return {
          initial: "translate(8px, -50%)",
          final: "translate(0, -50%)",
        };
      default:
        return {
          initial: "translate(-50%, 8px)",
          final: "translate(-50%, 0)",
        };
    }
  };

  const transforms = getTransforms();

  const handleMouseEnter = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = "1";
      tooltipRef.current.style.visibility = "visible";
      tooltipRef.current.style.transform = transforms.final;
    }
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = "0";
      tooltipRef.current.style.visibility = "hidden";
      tooltipRef.current.style.transform = transforms.initial;
    }
  };

  return (
    <div
      className="relative group flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* The tooltip - always in DOM but initially hidden */}
      <div
        ref={tooltipRef}
        className={`absolute px-2 py-1 rounded bg-gray-800 text-white text-xs
                   whitespace-nowrap transition-all duration-200 ease-out pointer-events-none
                   ${getPositionClasses()}`}
        style={{
          opacity: 0,
          visibility: "hidden",
          transform: transforms.initial,
          willChange: "transform, opacity, visibility",
        }}
      >
        {text}
        {/* Tooltip arrow */}
        <div
          className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClasses()}`}
        ></div>
      </div>

      {/* The wrapped element */}
      {children}
    </div>
  );
}
