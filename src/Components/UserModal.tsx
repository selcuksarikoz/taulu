import { JSX, useEffect, useRef } from "react";
import { Check, Mail, Shield, User, X } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../Context/auth.tsx";

interface UserComponentProps {
  onClose: () => void;
  className?: string;
}

export function UserModal({
  onClose,
  className,
}: UserComponentProps): JSX.Element | null {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.opacity = "0";
      modalRef.current.style.transform = "translateY(20px)";

      requestAnimationFrame(() => {
        if (modalRef.current) {
          modalRef.current.style.opacity = "1";
          modalRef.current.style.transform = "translateY(0)";
        }
      });
    }
  }, []);

  const handleClose = () => {
    if (modalRef.current) {
      modalRef.current.style.opacity = "0";
      modalRef.current.style.transform = "translateY(20px)";

      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      onClose();
    }
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
            User Profile
          </h2>
          <button
            onClick={handleClose}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] dark:hover:text-[var(--color-text-primary)] transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-[var(--color-border)] dark:border-[var(--color-border)]">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={`${user.name}'s profile picture`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-primary)]">
                  <User
                    size={40}
                    className="text-[var(--color-text-tertiary)]"
                  />
                </div>
              )}
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
              {user.name}
            </h3>
            {user.is_pro && (
              <div className="mt-2 flex items-center px-3 py-1 bg-[var(--color-accent)]/10 text-white rounded-full text-sm font-medium">
                <Shield size={14} className="mr-1" />
                Pro User
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]">
                Email
              </div>
              <div className="flex items-center p-3 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)]">
                <Mail
                  size={18}
                  className="text-[var(--color-text-tertiary)] mr-2"
                />
                <span className="text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                  {user.email}
                </span>
                {user.verified_email && (
                  <span className="ml-auto flex items-center text-[var(--color-success)] text-sm">
                    <Check size={16} className="mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]">
                  First Name
                </div>
                <div className="p-3 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)] text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                  {user.given_name}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]">
                  Last Name
                </div>
                <div className="p-3 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border)] text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                  {user.family_name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-primary)] px-6 py-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)] flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-secondary)] transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
