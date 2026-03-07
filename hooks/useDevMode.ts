'use client';

import { useEffect, useState } from 'react';
import { NEXT_PUBLIC_DEV_MODE_KEY, DEV_MODE_MODIFIER_KEYS } from '@/constants';

export function useDevMode() {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle dev mode with configured modifier keys + key
      const hasModifiers = DEV_MODE_MODIFIER_KEYS.some(key => 
        key === 'meta' ? event.metaKey : 
        key === 'ctrl' ? event.ctrlKey : 
        key === 'shift' ? event.shiftKey : false
      );
      
      if (hasModifiers && event.key === NEXT_PUBLIC_DEV_MODE_KEY.toLowerCase()) {
        event.preventDefault();
        setIsDevMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return isDevMode;
}
