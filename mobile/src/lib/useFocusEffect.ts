import { useEffect } from 'react';

/**
 * Lightweight stand-in so we don't need React Navigation for the first MVP.
 * Runs the callback once on mount (screen appears).
 */
export function useFocusEffect(effect: () => void | (() => void)): void {
  useEffect(() => {
    return effect();
  }, [effect]);
}
