/**
 * Utility function to copy text to clipboard with proper fallback handling
 * @param text - Text to copy to clipboard
 * @param successMessage - Message to show on successful copy
 * @param errorMessage - Message to show on failed copy
 * @returns Promise<boolean> - Whether the copy operation was successful
 */
export async function copyToClipboard(
  text: string,
  successMessage: string = "Copied to clipboard!",
  errorMessage: string = "Failed to copy"
): Promise<boolean> {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");

    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    return successful;
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}

/**
 * Check if clipboard API is supported
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}

/**
 * Generate a shareable room link
 */
export function generateRoomLink(roomId: string): string {
  return `${window.location.origin}/room/${roomId}`;
}
