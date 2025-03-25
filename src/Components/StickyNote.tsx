import React, { memo, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  ArrowDownWideNarrow,
  ArrowUpLeft,
  ArrowUpWideNarrow,
} from "lucide-react";
import { colorMap, StickyNoteColor } from "../Colors";
import TopMenu from "./TopMenu.tsx";

// Prop interface for our StickyNote component
interface StickyNoteProps {
  initialModel: IAppModel;
  onChange: (model: IAppModel) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export const StickyNote: React.FC<StickyNoteProps> = memo(
  ({ initialModel, onChange, onDelete, className }) => {
    // State derived from the model
    const [model, setModel] = useState<IAppModel>({ ...initialModel });

    // UI state
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

    // Refs for dragging and element
    const noteRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

    // Add refs to track state in event handlers
    const isDraggingRef = useRef(isDragging);
    const isResizingRef = useRef(isResizing);
    const modelRef = useRef(model);

    // Keep refs in sync with state
    useEffect(() => {
      isDraggingRef.current = isDragging;
      isResizingRef.current = isResizing;
      modelRef.current = model;
    }, [isDragging, isResizing, model]);

    // Keep local model in sync with incoming props
    useEffect(() => {
      setModel(initialModel);
    }, [initialModel]);

    // Update parent component when model changes
    const updateModel = (updates: Partial<IAppModel>) => {
      const updatedModel = { ...model, ...updates };
      setModel(updatedModel);
      if (onChange) {
        onChange(updatedModel);
      }
    };

    // Handle clicking on the note to bring it to front
    function handleNoteClick() {
      // Simply notify parent, let parent handle zIndex
      onChange(model);
    }

    // Handle mouse down for dragging
    async function handleMouseDown(e: React.MouseEvent) {
      if (noteRef.current) {
        setIsDragging(true);
        const rect = noteRef.current.getBoundingClientRect();
        dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        handleNoteClick();
        e.preventDefault(); // Prevent text selection during drag
      }
    }

    // Handle color change
    function handleColorChange(newColor: StickyNoteColor) {
      updateModel({ color: newColor });
      setIsColorPickerOpen(false);
    }

    // Handle color picker toggle
    function handleColorPickerToggle(e: React.MouseEvent) {
      e.stopPropagation();
      setIsColorPickerOpen(!isColorPickerOpen);
    }

    // Handle mouse down for resizing
    function handleResizeMouseDown(e: React.MouseEvent) {
      setIsResizing(true);
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        width: model.dimensions.width,
        height: model.dimensions.height,
      };
      e.stopPropagation();
      e.preventDefault();
    }

    // Handle content change
    function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      const newContent = e.target.value;
      updateModel({ content: newContent });
    }

    // Handle delete
    function handleDelete(e: React.MouseEvent) {
      e.stopPropagation();
      if (onDelete) {
        onDelete(model.id);
      }
    }

    // Handle color button click
    function handleColorButtonClick(e: React.MouseEvent, colorKey: string) {
      e.stopPropagation();
      handleColorChange(colorKey as StickyNoteColor);
    }

    // Handle font size increase
    function handleIncreaseFontSize(e: React.MouseEvent) {
      e.stopPropagation();
      const newFontSize = (model.fontSize || 0) + 2; // Increase by 2px
      updateModel({ fontSize: newFontSize });
    }

    // Handle font size decrease
    function handleDecreaseFontSize(e: React.MouseEvent) {
      e.stopPropagation();
      const newFontSize = Math.max((model.fontSize || 0) - 2, 8); // Decrease by 2px, minimum 8px
      updateModel({ fontSize: newFontSize });
    }

    // Set up event listeners for dragging and resizing
    useEffect(() => {
      function handleMouseMove(e: MouseEvent) {
        // Use requestAnimationFrame for smoother animations
        requestAnimationFrame(() => {
          if (isDraggingRef.current && noteRef.current) {
            // Get window dimensions
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Calculate new position
            let newX = e.clientX - dragOffset.current.x;
            let newY = e.clientY - dragOffset.current.y;

            // Constrain position within window boundaries
            // Left boundary
            newX = Math.max(0, newX);
            // Top boundary
            newY = Math.max(0, newY);
            // Right boundary (consider note width)
            newX = Math.min(
              newX,
              windowWidth - modelRef.current.dimensions.width,
            );
            // Bottom boundary (consider note height)
            newY = Math.min(
              newY,
              windowHeight - modelRef.current.dimensions.height,
            );

            updateModel({
              position: { x: newX, y: newY },
            });
          } else if (isResizingRef.current) {
            const deltaWidth = e.clientX - resizeStart.current.x;
            const deltaHeight = e.clientY - resizeStart.current.y;

            // Calculate new dimensions
            const newWidth = Math.max(
              resizeStart.current.width + deltaWidth,
              100,
            ); // Minimum width
            const newHeight = Math.max(
              resizeStart.current.height + deltaHeight,
              100,
            ); // Minimum height

            // Ensure note stays within window when resizing
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Calculate maximum width based on current position
            const maxWidth = windowWidth - modelRef.current.position.x;
            const maxHeight = windowHeight - modelRef.current.position.y;

            // Apply constraints
            const constrainedWidth = Math.min(newWidth, maxWidth);
            const constrainedHeight = Math.min(newHeight, maxHeight);

            updateModel({
              dimensions: {
                width: constrainedWidth,
                height: constrainedHeight,
              },
            });
          }
        });
      }

      function handleMouseUp() {
        if (isDraggingRef.current || isResizingRef.current) {
          setIsDragging(false);
          setIsResizing(false);
        }
      }

      // Only add event listeners when needed
      if (isDragging || isResizing) {
        document.addEventListener("mousemove", handleMouseMove, {
          passive: false,
        });
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mouseleave", handleMouseUp);

        // Set cursor based on operation
        if (isDragging) {
          document.body.style.cursor = "grabbing";
        } else if (isResizing) {
          document.body.style.cursor = "nwse-resize";
        }
      }

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mouseleave", handleMouseUp);

        // Reset cursor
        document.body.style.cursor = "";
      };
    }, [isDragging, isResizing]);

    // Get color classes
    const { bg } = colorMap[model.color];

    return (
      <div
        ref={noteRef}
        className={clsx(
          `fixed flex flex-col rounded-2xl group shadow-md ${bg} dark:opacity-100 ${isDragging ? "cursor-grabbing" : ""}`,
          className,
        )}
        style={{
          zIndex: model.zIndex,
          left: `${model.position.x}px`,
          top: `${model.position.y}px`,
          width: `${model.dimensions.width}px`,
          height: `${model.dimensions.height}px`,
        }}
        onClick={handleNoteClick}
      >
        {/* Dock-style bar that appears on hover - using group-hover instead of conditional rendering */}
        <TopMenu
          handleDelete={handleDelete}
          handleMouseDown={handleMouseDown}
          zIndex={model.zIndex}
          className="opacity-0 group-hover:opacity-100"
        />

        {/* Note Header */}
        <div className="px-3 py-2 flex items-center justify-between">
          {/* Color Picker Button */}
          <div className="relative">
            <button
              className={`w-4 h-4 rounded-full border border-gray-300 shadow ${colorMap[model.color].colorClass}`}
              onClick={handleColorPickerToggle}
              aria-label="Change note color"
            />

            {/* Color Picker Dropdown */}
            {isColorPickerOpen && (
              <div
                className="absolute top-6 left-0 bg-white dark:bg-gray-800 rounded-lg p-2 flex gap-1 flex-wrap w-32"
                style={{ zIndex: model.zIndex + 2 }} // Make sure it's above everything
              >
                {Object.keys(colorMap).map((c) => (
                  <button
                    key={c}
                    className={`w-6 h-6 rounded-full ${colorMap[c as StickyNoteColor].colorClass}`}
                    onClick={(e) => handleColorButtonClick(e, c)}
                    aria-label={`Select ${c} color`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 items-center">
            {/* Font size controls */}
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
              onClick={handleDecreaseFontSize}
              aria-label="Decrease font size"
            >
              <ArrowDownWideNarrow size={16} />
            </button>
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
              onClick={handleIncreaseFontSize}
              aria-label="Increase font size"
            >
              <ArrowUpWideNarrow size={16} />
            </button>
          </div>
        </div>

        {/* Note Content */}
        <textarea
          className="flex-1 w-full px-4 py-2 bg-transparent resize-none focus:outline-none text-gray-800 dark:text-gray-800 placeholder-gray-500"
          value={model.content}
          onChange={handleContentChange}
          placeholder="Type your note here..."
          style={{
            cursor: "text",
            fontSize: `${model.fontSize}px`, // Apply the font size
          }}
        />

        {/* Resize handle - using group-hover instead of conditional rendering */}
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ zIndex: model.zIndex + 1 }}
          onMouseDown={handleResizeMouseDown}
        >
          <ArrowUpLeft
            size={16}
            className="absolute bottom-1 right-1 text-[var(--color-candy-blueberry)]"
          />
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
      prev.initialModel.color === curr.initialModel.color &&
      prev.initialModel.content === curr.initialModel.content &&
      prev.initialModel.fontSize === curr.initialModel.fontSize
    );
  },
);
