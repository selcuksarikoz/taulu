import React, { JSX, useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface AddWebsiteModalProps {
  onClose: () => void;
  onAddWebsite: (url: string) => void;
  className?: string;
}

export function AddWebsiteModal({
  onClose,
  onAddWebsite,
  className,
}: AddWebsiteModalProps): JSX.Element | null {
  const [url, setUrl] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef?.current) return;
    setTimeout(() => inputRef?.current?.focus(), 2000);
  }, [inputRef]);

  // URL validation
  const validateUrl = (input: string): boolean => {
    try {
      // Create URL object to validate
      new URL(input);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      return;
    }

    // Add http:// if protocol is missing
    let processedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      processedUrl = "https://" + url;
    }

    if (validateUrl(processedUrl)) {
      onAddWebsite(processedUrl);
      setUrl("");
      handleClose();
    }
  };

  return (
    <div
      className={clsx(
        "absolute inset-0 flex items-center justify-center z-9999",
        className,
      )}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="rounded-2xl max-w-2xl p-2 bg-cloud-candy-strawberry-light/80 dark:bg-card/80 shadow-lg w-full overflow-hidden"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Content */}
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            autoFocus
            id="website-url"
            type="url"
            placeholder="Add a website https://example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full p-2 outline-none  dark:text-white text-bg-secondary font-medium`}
          />
        </form>
      </div>
    </div>
  );
}
