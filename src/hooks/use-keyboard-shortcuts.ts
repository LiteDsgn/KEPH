'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export interface UseKeyboardShortcutsProps {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: UseKeyboardShortcutsProps, enabled = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    const shortcutKey = event.code;
    const handler = shortcuts[shortcutKey];

    if (handler) {
      event.preventDefault();
      handler();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  return { shortcuts };
}

// Helper function to format shortcut display
export const formatShortcut = (shortcut: { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean; }): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.metaKey) parts.push('Cmd');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  
  // Format the key name
  let keyName = shortcut.key;
  if (keyName.startsWith('Key')) {
    keyName = keyName.replace('Key', '');
  } else if (keyName === 'Slash') {
    keyName = '/';
  } else if (keyName === 'Escape') {
    keyName = 'Esc';
  }
  
  parts.push(keyName);
  
  return parts.join(' + ');
}

// Common keyboard shortcuts for the application
export const KEYBOARD_SHORTCUTS = {
  ESCAPE: 'Escape',
  NEW_TASK: 'KeyN',
  TEXT_TO_TASK: 'KeyT',
  TRANSCRIPT_TO_TASK: 'KeyR',
  FOCUS_SEARCH: 'Slash',
  SHOW_HELP: 'KeyH'
} as const;