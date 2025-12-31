/**
 * Formats a date string or Date object to DD/MM/YYYY format
 * @param date - The date to format
 * @returns Formatted date string (e.g., "31/12/2025") or "N/A" if invalid
 */
export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return "N/A";

  try {
    const d = new Date(date);

    // Check for invalid date
    if (isNaN(d.getTime())) return "N/A";

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

/**
 * Formats a date string or Date object to DD/MM/YYYY HH:MM format
 * @param date - The date to format
 * @returns Formatted date and time string or "N/A"
 */
export const formatDateTime = (
  date: string | Date | undefined | null
): string => {
  if (!date) return "N/A";

  try {
    const d = new Date(date);

    // Check for invalid date
    if (isNaN(d.getTime())) return "N/A";

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch (error) {
    console.error("Error formatting date time:", error);
    return "N/A";
  }
};
