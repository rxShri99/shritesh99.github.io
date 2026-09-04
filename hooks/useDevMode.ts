'use client';

import { useSyncExternalStore } from 'react';
import { NEXT_PUBLIC_DEV_MODE_KEY, DEV_MODE_MODIFIER_KEYS } from '@/constants';

// Module-level shared state. Every `useDevMode()` call reads through the same
// store, so consumers that mount at different times (e.g. Ring inside the R3F
// Canvas's Suspense boundary) can't drift out of sync with the top-level page
// — subscribers that mount after a toggle receive the current value from
// getSnapshot immediately, without a stale-state race.
let devModeValue = false;
const listeners = new Set<() => void>();
let keyboardBound = false;

function bindKeyboard() {
  if (keyboardBound || typeof window === 'undefined') return;
  keyboardBound = true;
  window.addEventListener('keydown', (event) => {
    const hasModifiers = DEV_MODE_MODIFIER_KEYS.some((key) =>
      key === 'meta'
        ? event.metaKey
        : key === 'ctrl'
          ? event.ctrlKey
          : key === 'shift'
            ? event.shiftKey
            : false
    );
    if (hasModifiers && event.key === NEXT_PUBLIC_DEV_MODE_KEY.toLowerCase()) {
      event.preventDefault();
      devModeValue = !devModeValue;
      listeners.forEach((l) => l());
    }
  });
}

function subscribe(listener: () => void) {
  bindKeyboard();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return devModeValue;
}

// Server render always reports off — dev mode is a client-side keyboard toggle.
function getServerSnapshot() {
  return false;
}

export function useDevMode() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
