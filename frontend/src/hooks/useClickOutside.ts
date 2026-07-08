import { useEffect, type RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(ref: RefObject<T>, handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    function listener(event: MouseEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler, active]);
}
