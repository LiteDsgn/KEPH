/**
 * Timezone utility functions for handling user-specific timezone operations
 */

/**
 * Get the start of day (midnight) for a given date in the user's timezone
 * @param date - The date to get the start of day for
 * @param timezone - The user's timezone (e.g., 'America/New_York')
 * @returns Date object representing midnight in the user's timezone
 */
export function getStartOfDayInTimezone(date: Date, timezone: string): Date {
  const dateString = date.toISOString().split('T')[0]; // Get YYYY-MM-DD
  const startOfDay = new Date(`${dateString}T00:00:00`);
  
  // Create a date in the user's timezone
  const userDate = new Date(startOfDay.toLocaleString('en-US', { timeZone: timezone }));
  const utcDate = new Date(startOfDay.toLocaleString('en-US', { timeZone: 'UTC' }));
  
  // Calculate the timezone offset
  const offset = utcDate.getTime() - userDate.getTime();
  
  return new Date(startOfDay.getTime() + offset);
}

/**
 * Get the end of day (23:59:59.999) for a given date in the user's timezone
 * @param date - The date to get the end of day for
 * @param timezone - The user's timezone
 * @returns Date object representing end of day in the user's timezone
 */
export function getEndOfDayInTimezone(date: Date, timezone: string): Date {
  const startOfDay = getStartOfDayInTimezone(date, timezone);
  return new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1); // Add 24 hours minus 1ms
}

/**
 * Check if a date is today in the user's timezone
 * @param date - The date to check
 * @param timezone - The user's timezone
 * @returns boolean indicating if the date is today
 */
export function isToday(date: Date, timezone: string): boolean {
  const today = new Date();
  const todayInTimezone = new Date(today.toLocaleString('en-US', { timeZone: timezone }));
  const dateInTimezone = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  
  return (
    todayInTimezone.getFullYear() === dateInTimezone.getFullYear() &&
    todayInTimezone.getMonth() === dateInTimezone.getMonth() &&
    todayInTimezone.getDate() === dateInTimezone.getDate()
  );
}

/**
 * Check if a date is overdue based on the user's timezone
 * @param dueDate - The due date to check
 * @param timezone - The user's timezone
 * @returns boolean indicating if the date is overdue
 */
export function isOverdue(dueDate: Date, timezone: string): boolean {
  const now = new Date();
  const endOfToday = getEndOfDayInTimezone(now, timezone);
  return dueDate < endOfToday;
}

/**
 * Get the current date in the user's timezone
 * @param timezone - The user's timezone
 * @returns Date object representing current date/time in user's timezone
 */
export function getCurrentDateInTimezone(timezone: string): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Format a date according to user's timezone and preferences
 * @param date - The date to format
 * @param timezone - The user's timezone
 * @param dateFormat - The user's preferred date format
 * @param timeFormat - The user's preferred time format
 * @returns Formatted date string
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'MM/DD/YYYY',
  timeFormat: '12h' | '24h' = '12h'
): string {
  const dateInTimezone = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  
  const year = dateInTimezone.getFullYear();
  const month = String(dateInTimezone.getMonth() + 1).padStart(2, '0');
  const day = String(dateInTimezone.getDate()).padStart(2, '0');
  
  let dateString: string;
  switch (dateFormat) {
    case 'DD/MM/YYYY':
      dateString = `${day}/${month}/${year}`;
      break;
    case 'YYYY-MM-DD':
      dateString = `${year}-${month}-${day}`;
      break;
    default:
      dateString = `${month}/${day}/${year}`;
  }
  
  if (timeFormat === '24h') {
    const hours = String(dateInTimezone.getHours()).padStart(2, '0');
    const minutes = String(dateInTimezone.getMinutes()).padStart(2, '0');
    return `${dateString} ${hours}:${minutes}`;
  } else {
    const hours = dateInTimezone.getHours();
    const minutes = String(dateInTimezone.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${dateString} ${displayHours}:${minutes} ${ampm}`;
  }
}

/**
 * Get the next occurrence of a specific time in the user's timezone
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param timezone - The user's timezone
 * @returns Date object for the next occurrence of that time
 */
export function getNextOccurrenceInTimezone(hour: number, minute: number, timezone: string): Date {
  const now = getCurrentDateInTimezone(timezone);
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  
  // If the time has already passed today, move to tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  
  return target;
}

/**
 * Convert a date from user's timezone to UTC
 * @param date - Date in user's timezone
 * @param timezone - The user's timezone
 * @returns Date object in UTC
 */
export function convertToUTC(date: Date, timezone: string): Date {
  const dateString = date.toISOString().split('T')[0];
  const timeString = date.toTimeString().split(' ')[0];
  const dateTimeString = `${dateString}T${timeString}`;
  
  // Create date assuming it's in the user's timezone
  const tempDate = new Date(dateTimeString);
  const userDate = new Date(tempDate.toLocaleString('en-US', { timeZone: timezone }));
  const utcDate = new Date(tempDate.toLocaleString('en-US', { timeZone: 'UTC' }));
  
  const offset = utcDate.getTime() - userDate.getTime();
  return new Date(tempDate.getTime() - offset);
}

/**
 * Get timezone display name
 * @param timezone - The timezone identifier
 * @returns Human-readable timezone name
 */
export function getTimezoneDisplayName(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;
    return timeZoneName || timezone;
  } catch (error) {
    return timezone;
  }
}