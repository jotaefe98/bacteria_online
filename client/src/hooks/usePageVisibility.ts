import { useEffect, useRef } from "react";

interface UsePageVisibilityOptions {
  onVisibilityChange?: (isVisible: boolean) => void;
  onHidden?: () => void;
  onVisible?: () => void;
}

/**
 * Hook to detect when the page becomes hidden/visible
 * Useful for handling phone lock/unlock, tab switching, etc.
 */
export function usePageVisibility({
  onVisibilityChange,
  onHidden,
  onVisible,
}: UsePageVisibilityOptions = {}) {
  const isVisible = useRef<boolean>(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      isVisible.current = visible;

      onVisibilityChange?.(visible);

      if (visible) {
        onVisible?.();
      } else {
        onHidden?.();
      }
    };

    // Listen for visibility change events
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also listen for focus/blur events as fallback
    window.addEventListener("focus", () => {
      if (!isVisible.current) {
        isVisible.current = true;
        onVisibilityChange?.(true);
        onVisible?.();
      }
    });

    window.addEventListener("blur", () => {
      if (isVisible.current) {
        isVisible.current = false;
        onVisibilityChange?.(false);
        onHidden?.();
      }
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      window.removeEventListener("blur", handleVisibilityChange);
    };
  }, [onVisibilityChange, onHidden, onVisible]);

  return isVisible.current;
}
