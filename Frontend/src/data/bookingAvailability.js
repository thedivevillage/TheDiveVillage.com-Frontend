/**
 * Manual Availability Configuration for Book Us Date Picker
 *
 * Edit this file to control date availability.
 *
 * Status Options:
 * - "available"   : Clickable, shows small green dot
 * - "limited"     : Clickable, shows small yellow/orange dot
 * - "unavailable" : Disabled/muted, shows small grey dot
 *
 * Format: "YYYY-MM-DD": "status"
 */

export const bookingAvailability = {
  // September 2026
  "2026-09-10": "available",
  "2026-09-11": "available",
  "2026-09-12": "available",
  "2026-09-13": "available",
  "2026-09-14": "available",
  "2026-09-15": "available",
  "2026-09-16": "available",
  "2026-09-17": "available",
  "2026-09-18": "available",
  "2026-09-19": "available",
  "2026-09-20": "available",
  "2026-09-21": "available",
  "2026-09-22": "available",
  "2026-09-23": "available",
  "2026-09-24": "available",
  "2026-09-25": "available",
  "2026-09-26": "available",
  "2026-09-27": "available",
  "2026-09-28": "available",
  "2026-09-29": "available",
  "2026-09-30": "available",

  // October 2026
  "2026-10-01": "available",
  "2026-10-02": "available",
  "2026-10-03": "available",
  "2026-10-04": "available",
  "2026-10-05": "available",
  "2026-10-06": "available",
  "2026-10-07": "available",
  "2026-10-08": "available",
  "2026-10-09": "available",
  "2026-10-10": "available",
  "2026-10-11": "available",
  "2026-10-12": "available",
  "2026-10-13": "available",
  "2026-10-14": "available",
  "2026-10-15": "available",
  "2026-10-16": "available",
  "2026-10-17": "available",
  "2026-10-18": "available",
  "2026-10-19": "available",
  "2026-10-20": "available",
  "2026-10-21": "available",
  "2026-10-22": "available",
  "2026-10-23": "available",
  "2026-10-24": "available",
  "2026-10-25": "available",
  "2026-10-26": "available",
  "2026-10-27": "available",
  "2026-10-28": "available",
  "2026-10-29": "available",
  "2026-10-30": "available",
  "2026-10-31": "available",

  // November 2026
  "2026-11-01": "available",
  "2026-11-02": "available",
  "2026-11-03": "available",
  "2026-11-04": "available",
  "2026-11-05": "available",
  "2026-11-10": "available",
  "2026-11-15": "available",
  "2026-11-20": "available",
  "2026-11-25": "available",

  // December 2026
  "2026-12-01": "available",
  "2026-12-05": "available",
  "2026-12-10": "available",
  "2026-12-15": "available",
  "2026-12-20": "available",
  "2026-12-25": "available",

  // 2027
  "2027-01-01": "available",
  "2027-01-15": "available",
  "2027-02-01": "available"
};

/**
 * Returns availability status for a given "YYYY-MM-DD" date string.
 * Defaults to "available" if not explicitly defined.
 */
export function getDateAvailability(dateStr) {
  const status = bookingAvailability[dateStr];
  if (status === "unavailable") {
    return "available";
  }
  return status || "available";
}
