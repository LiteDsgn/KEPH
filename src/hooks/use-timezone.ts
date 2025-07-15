'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase';
import {
  isToday,
  isOverdue,
  getCurrentDateInTimezone,
  formatDateInTimezone,
  getStartOfDayInTimezone,
  getEndOfDayInTimezone,
  getNextOccurrenceInTimezone,
  convertToUTC,
  getTimezoneDisplayName
} from '@/lib/timezone';

interface UserTimezoneSettings {
  timezone: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  time_format: '12h' | '24h';
}

export function useTimezone() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserTimezoneSettings>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTimezoneSettings();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchTimezoneSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('timezone, date_format, time_format')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching timezone settings:', error);
        return;
      }

      if (data) {
        setSettings({
          timezone: data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
          date_format: data.date_format ?? 'MM/DD/YYYY',
          time_format: data.time_format ?? '12h',
        });
      }
    } catch (error) {
      console.error('Error fetching timezone settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Timezone-aware utility functions
  const isDateToday = (date: Date): boolean => {
    return isToday(date, settings.timezone);
  };

  const isDateOverdue = (dueDate: Date): boolean => {
    return isOverdue(dueDate, settings.timezone);
  };

  const getCurrentDate = (): Date => {
    return getCurrentDateInTimezone(settings.timezone);
  };

  const formatDate = (date: Date, includeTime: boolean = false): string => {
    if (includeTime) {
      return formatDateInTimezone(date, settings.timezone, settings.date_format, settings.time_format);
    }
    
    const dateInTimezone = new Date(date.toLocaleString('en-US', { timeZone: settings.timezone }));
    const year = dateInTimezone.getFullYear();
    const month = String(dateInTimezone.getMonth() + 1).padStart(2, '0');
    const day = String(dateInTimezone.getDate()).padStart(2, '0');
    
    switch (settings.date_format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${month}/${day}/${year}`;
    }
  };

  const getStartOfDay = (date: Date): Date => {
    return getStartOfDayInTimezone(date, settings.timezone);
  };

  const getEndOfDay = (date: Date): Date => {
    return getEndOfDayInTimezone(date, settings.timezone);
  };

  const getNextOccurrence = (hour: number, minute: number): Date => {
    return getNextOccurrenceInTimezone(hour, minute, settings.timezone);
  };

  const toUTC = (date: Date): Date => {
    return convertToUTC(date, settings.timezone);
  };

  const getTimezoneDisplay = (): string => {
    return getTimezoneDisplayName(settings.timezone);
  };

  // Get the user's midnight time for task transitions
  const getUserMidnight = (): Date => {
    return getNextOccurrence(0, 0); // Next occurrence of midnight
  };

  // Check if it's a new day since last check (useful for task transitions)
  const isNewDay = (lastCheckDate: Date): boolean => {
    const lastCheckInTimezone = new Date(lastCheckDate.toLocaleString('en-US', { timeZone: settings.timezone }));
    const nowInTimezone = getCurrentDate();
    
    return (
      lastCheckInTimezone.getDate() !== nowInTimezone.getDate() ||
      lastCheckInTimezone.getMonth() !== nowInTimezone.getMonth() ||
      lastCheckInTimezone.getFullYear() !== nowInTimezone.getFullYear()
    );
  };

  // Get relative time description (e.g., "Today", "Tomorrow", "Yesterday")
  const getRelativeTimeDescription = (date: Date): string => {
    const dateInTimezone = new Date(date.toLocaleString('en-US', { timeZone: settings.timezone }));
    const nowInTimezone = getCurrentDate();
    
    const diffInDays = Math.floor(
      (dateInTimezone.getTime() - nowInTimezone.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays === -1) return 'Yesterday';
    if (diffInDays > 1 && diffInDays <= 7) return `In ${diffInDays} days`;
    if (diffInDays < -1 && diffInDays >= -7) return `${Math.abs(diffInDays)} days ago`;
    
    return formatDate(date);
  };

  return {
    settings,
    isLoading,
    timezone: settings.timezone,
    dateFormat: settings.date_format,
    timeFormat: settings.time_format,
    
    // Utility functions
    isDateToday,
    isDateOverdue,
    getCurrentDate,
    formatDate,
    getStartOfDay,
    getEndOfDay,
    getNextOccurrence,
    toUTC,
    getTimezoneDisplay,
    getUserMidnight,
    isNewDay,
    getRelativeTimeDescription,
    
    // Refresh settings (useful after settings update)
    refreshSettings: fetchTimezoneSettings,
  };
}