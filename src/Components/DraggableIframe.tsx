import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpLeft } from "lucide-react";
import TopMenu from "./TopMenu.tsx";
import clsx from "clsx";
import { getSessionForUrl } from "../Utils/partition.ts";

interface IDraggableWebviewProps {
  initialModel: IAppModel;
  onChange: (data: IAppModel) => void;
  onDelete: (id: string) => void;
  onResize?: (data: IAppModel) => void;
  className?: string;
}

export const DraggableIframe: React.FC<IDraggableWebviewProps> = memo(
  ({ initialModel, onChange, onDelete, onResize, className }) => {
    // Extract all properties from initialModel
    const {
      id,
      content,
      position,
      dimensions,
      zIndex: initialZIndex,
      user_agent,
    } = initialModel;

    // UI states
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isResizing, setIsResizing] = useState<boolean>(false);

    // DOM refs
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Interaction tracking refs
    const dragOffset = useRef<Position>({ x: 0, y: 0 });
    const resizeStart = useRef<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

    // Handle mouse down for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
      const targetElement = e.target as HTMLElement;
      const isWindowControlsClicked = targetElement.closest("button");

      if (containerRef.current && !isWindowControlsClicked) {
        e.preventDefault();
        e.stopPropagation();

        const rect = containerRef.current.getBoundingClientRect();
        dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };

        setIsDragging(true);
        onChange({
          ...initialModel,
          zIndex: 1,
        });
      }
    };

    // Mouse move handler
    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging) return;

        e.preventDefault();

        // Get window dimensions
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate new position
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;

        // Constrain position within window boundaries
        newX = Math.max(0, Math.min(newX, windowWidth - dimensions.width));
        newY = Math.max(0, Math.min(newY, windowHeight - dimensions.height));

        // Update position state
        onChange({
          ...initialModel,
          position: { x: newX, y: newY },
        });
      },
      [isDragging, dimensions.width, dimensions.height, initialModel, onChange],
    );

    // Resize handler
    const handleResizeMove = useCallback(
      (e: MouseEvent) => {
        if (!isResizing) return;

        e.preventDefault();

        // Calculate width and height change
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;

        // Free resize with minimum sizes
        const newWidth = Math.max(320, resizeStart.current.width + deltaX);
        const newHeight = Math.max(180, resizeStart.current.height + deltaY);

        // Update size state
        onChange({
          ...initialModel,
          dimensions: { width: newWidth, height: newHeight },
        });
      },
      [isResizing, initialModel, onChange],
    );

    // Handle mouse up for both dragging and resizing
    const handleMouseUp = useCallback(() => {
      if (isDragging) {
        setIsDragging(false);

        // Reset zIndex if not dragging or resizing
        if (!isResizing) {
          onChange({
            ...initialModel,
            zIndex: initialZIndex,
          });
        }

        // Notify parent of position change
        onChange({
          ...initialModel,
          position,
          zIndex: initialZIndex,
        });
      }

      if (isResizing) {
        setIsResizing(false);

        // Reset zIndex if not dragging
        if (!isDragging) {
          onChange({
            ...initialModel,
            zIndex: initialZIndex,
          });
        }

        // Notify parent of size change
        if (onResize) {
          onResize({
            ...initialModel,
            dimensions,
            zIndex: initialZIndex,
          });
        }
      }
    }, [
      isDragging,
      isResizing,
      onChange,
      onResize,
      position,
      dimensions,
      initialZIndex,
      initialModel,
    ]);

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(id);
    };

    // Handle resize start
    const handleResizeStart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      onChange({
        ...initialModel,
        zIndex: 50,
      });

      // Store initial mouse position and element size
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        width: dimensions.width,
        height: dimensions.height,
      };
    };

    // Set up event listeners for dragging and resizing
    useEffect(() => {
      const moveHandler = isDragging
        ? handleMouseMove
        : isResizing
          ? handleResizeMove
          : null;

      if (moveHandler) {
        window.addEventListener("mousemove", moveHandler);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseleave", handleMouseUp);

        document.body.style.cursor = isDragging ? "grabbing" : "nwse-resize";

        // Show overlay when dragging or resizing to prevent iframe from capturing events
        if (overlayRef.current) {
          overlayRef.current.style.display = "block";
        }
      } else {
        document.body.style.cursor = "";

        // Hide overlay when not dragging or resizing
        if (overlayRef.current) {
          overlayRef.current.style.display = "none";
        }
      }

      return () => {
        if (moveHandler) {
          window.removeEventListener("mousemove", moveHandler);
          window.removeEventListener("mouseup", handleMouseUp);
          window.removeEventListener("mouseleave", handleMouseUp);
        }
        document.body.style.cursor = "";
      };
    }, [
      isDragging,
      isResizing,
      handleMouseMove,
      handleResizeMove,
      handleMouseUp,
    ]);

    return (
      <div
        ref={containerRef}
        className={clsx(
          "absolute group rounded-2xl !overflow-hidden",
          className,
        )}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: initialZIndex, // Use initialZIndex here for consistency
        }}
      >
        <div className="relative w-full h-full">
          {/* Non-interactive header for dragging */}
          <div
            className="absolute top-0 left-0 w-fit h-10 bg-transparent cursor-grab z-20"
            onMouseDown={handleMouseDown}
          />

          {/* The iframe */}
          {window?.electronAPI ? (
            <webview
              ref={iframeRef as React.RefObject<HTMLElement>} // Add type casting since webview isn't a standard HTML element
              src={content}
              id={`webview-${id}`}
              className="w-full h-full rounded-lg"
              style={{
                borderRadius: "10px",
                pointerEvents: isDragging || isResizing ? "none" : "auto",
              }}
              useragent={
                user_agent ||
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
              }
              allowFullScreen
              partition={getSessionForUrl(content)}
            />
          ) : (
            <iframe
              ref={iframeRef}
              src={content}
              id={`webview-${id}`}
              className="w-full h-full rounded-lg"
              style={{
                pointerEvents: isDragging || isResizing ? "none" : "auto",
              }}
            />
          )}

          {/* Overlay div to prevent iframe from capturing events during drag/resize */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-transparent z-30"
            style={{ display: "none" }}
          />

          {/* Controls that appear on hover - using group-hover */}
          <TopMenu
            handleDelete={handleDelete}
            handleMouseDown={handleMouseDown}
            zIndex={40}
            className="opacity-0 group-hover:opacity-100"
          />

          {/* Resize handle - using group-hover */}
          <div
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onMouseDown={handleResizeStart}
          >
            <ArrowUpLeft
              size={16}
              className="absolute bottom-1 right-1 text-[var(--color-candy-blueberry)]"
            />
          </div>
        </div>
      </div>
    );
  },
  (prev, curr) => {
    return (
      prev.initialModel.position.x === curr.initialModel.position.x &&
      prev.initialModel.position.y === curr.initialModel.position.y &&
      prev.initialModel.dimensions.width ===
        curr.initialModel.dimensions.width &&
      prev.initialModel.dimensions.height ===
        curr.initialModel.dimensions.height &&
      prev.initialModel.zIndex === curr.initialModel.zIndex &&
      prev.initialModel?.user_agent === curr.initialModel?.user_agent
    );
  },
);
